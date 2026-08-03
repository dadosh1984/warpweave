import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { runCLI } from '../../helpers/run-cli.js';
import { createOpenSpecRoot } from '../../helpers/openspec-fixtures.js';
import { cleanupTempPath } from '../../helpers/temp-cleanup.js';
import {
  extractSpecScenarios,
  type DriftFinding,
} from '../../../src/core/drift-check.js';

function writeSpec(dir: string, specId: string, body: string): string {
  const specDir = path.join(dir, 'specs', specId);
  fs.mkdirSync(specDir, { recursive: true });
  const specFile = path.join(specDir, 'spec.md');
  fs.writeFileSync(specFile, body);
  return specFile;
}

describe('drift-check scenario extraction', () => {
  it('extracts each scenario with file, line, requirement, and expected behavior', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-extract-'));
    const specFile = writeSpec(
      dir,
      'auth',
      [
        '## Purpose',
        '',
        'Lets users authenticate with a username and password.',
        '',
        '## ADDED Requirements',
        '',
        '### Requirement: User can log in',
        'The system SHALL let users log in with credentials.',
        '',
        '#### Scenario: Successful login',
        '- **WHEN** a user submits valid credentials',
        '- **THEN** the system starts an authenticated session',
        '',
        '#### Scenario: Failed login',
        '- **WHEN** a user submits invalid credentials',
        '- **THEN** the system shows an error',
        '',
      ].join('\n')
    );

    const findings = await extractSpecScenarios([specFile]);

    expect(findings).toHaveLength(2);
    expect(findings[0]).toMatchObject({
      file: specFile,
      line: 10,
      requirement: 'User can log in',
      scenario: 'Successful login',
      expected: expect.stringContaining('submits valid credentials'),
    });
    expect(findings[1]).toMatchObject({
      scenario: 'Failed login',
      line: 14,
      expected: expect.stringContaining('shows an error'),
    });
  });

  it('skips scenarios inside fenced code blocks', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-fence-'));
    const specFile = writeSpec(
      dir,
      'auth',
      [
        '## Purpose',
        '',
        'Lets users authenticate.',
        '',
        '## ADDED Requirements',
        '',
        '### Requirement: User can log in',
        'The system SHALL let users log in.',
        '',
        '#### Scenario: Real scenario',
        '- **WHEN** a user submits credentials',
        '- **THEN** the system starts a session',
        '',
        '```md',
        '#### Scenario: Fake fenced example',
        '- **WHEN** this is example text',
        '- **THEN** it must not be counted',
        '```',
        '',
      ].join('\n')
    );

    const findings = await extractSpecScenarios([specFile]);
    expect(findings).toHaveLength(1);
    expect(findings[0].scenario).toBe('Real scenario');
  });

  it('returns an empty list for a file with no scenarios', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-empty-'));
    const specFile = writeSpec(dir, 'auth', '## Purpose\n\nNo scenarios here.\n');
    const findings = await extractSpecScenarios([specFile]);
    expect(findings).toHaveLength(0);
  });
});

describe('warpweave drift-check CLI', () => {
  let tempDir: string;
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    tempDir = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'drift-cli-')));
    createOpenSpecRoot(tempDir);
    env = {
      XDG_DATA_HOME: path.join(tempDir, 'data'),
      XDG_CONFIG_HOME: path.join(tempDir, 'config'),
      OPEN_SPEC_INTERACTIVE: '0',
      WARPWEAVE_TELEMETRY: '0',
    };
  });

  afterEach(() => {
    cleanupTempPath(tempDir);
  });

  function mkdir(relativePath: string): string {
    const dir = path.join(tempDir, relativePath);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  it('outputs JSON findings with file, line, expected, and status fields', async () => {
    const changeDir = path.join(tempDir, 'warpweave', 'changes', 'demo-change');
    fs.mkdirSync(path.join(changeDir, 'specs', 'auth'), { recursive: true });
    fs.writeFileSync(path.join(changeDir, '.warpweave.yaml'), 'schema: spec-driven\n');
    fs.writeFileSync(
      path.join(changeDir, 'specs', 'auth', 'spec.md'),
      [
        '## Purpose',
        '',
        'Lets users authenticate.',
        '',
        '## ADDED Requirements',
        '',
        '### Requirement: User can log in',
        'The system SHALL let users log in.',
        '',
        '#### Scenario: Successful login',
        '- **WHEN** a user submits valid credentials',
        '- **THEN** the system starts an authenticated session',
        '',
      ].join('\n')
    );
    // A real code file carrying the scenario's distinctive term.
    const srcDir = mkdir('src');
    fs.writeFileSync(path.join(srcDir, 'auth.ts'), 'export function login() {\n  // authenticated session\n}\n');

    const result = await runCLI(['drift-check', '--change', 'demo-change', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.blocked).toBe(false);
    expect(Array.isArray(payload.findings)).toBe(true);
    const findings = payload.findings;
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      requirement: 'User can log in',
      scenario: 'Successful login',
      expected: expect.stringContaining('submits valid credentials'),
    });
    expect(typeof findings[0].file).toBe('string');
    expect(typeof findings[0].line).toBe('number');
    expect('status' in findings[0]).toBe(true);
  });

  it('lists available changes when run with no active change', async () => {
    const result = await runCLI(['drift-check'], { cwd: tempDir, env });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No active changes');
  });

  it('reports "no specs to check" for a change with no delta specs', async () => {
    const changeDir = path.join(tempDir, 'warpweave', 'changes', 'empty-change');
    fs.mkdirSync(changeDir, { recursive: true });
    fs.writeFileSync(path.join(changeDir, '.warpweave.yaml'), 'schema: spec-driven\n');

    const result = await runCLI(['drift-check', '--change', 'empty-change', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.blocked).toBe(false);
    expect(Array.isArray(payload.findings)).toBe(true);
    expect(payload.findings).toHaveLength(0);
  });

  it('blocks (exit 1) when a scenario is missing with zero source matches', async () => {
    const changeDir = path.join(tempDir, 'warpweave', 'changes', 'missing-change');
    fs.mkdirSync(path.join(changeDir, 'specs', 'auth'), { recursive: true });
    fs.writeFileSync(path.join(changeDir, '.warpweave.yaml'), 'schema: spec-driven\n');
    fs.writeFileSync(
      path.join(changeDir, 'specs', 'auth', 'spec.md'),
      [
        '## Purpose',
        '',
        'Lets users authenticate.',
        '',
        '## ADDED Requirements',
        '',
        '### Requirement: Quasiflan uberstanz',
        'The system SHALL provide a quasiflan uberstanz.',
        '',
        '#### Scenario: Quasiflan unavailable',
        '- **WHEN** a quasiflan uberstanz is requested',
        '- **THEN** the system provides a quasiflan uberstanz session',
        '',
      ].join('\n')
    );
    // No source file carries the invented terms, so every scenario term is missing.

    const result = await runCLI(['drift-check', '--change', 'missing-change', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.blocked).toBe(true);
    const missing = payload.findings.find((f: DriftFinding) => f.status === 'missing');
    expect(missing).toBeDefined();
  });

  it('reports missing findings without blocking when --no-fail-on-missing', async () => {
    const changeDir = path.join(tempDir, 'warpweave', 'changes', 'missing-change');
    fs.mkdirSync(path.join(changeDir, 'specs', 'auth'), { recursive: true });
    fs.writeFileSync(path.join(changeDir, '.warpweave.yaml'), 'schema: spec-driven\n');
    fs.writeFileSync(
      path.join(changeDir, 'specs', 'auth', 'spec.md'),
      [
        '## Purpose',
        '',
        'Lets users authenticate.',
        '',
        '## ADDED Requirements',
        '',
        '### Requirement: Quasiflan uberstanz',
        'The system SHALL provide a quasiflan uberstanz.',
        '',
        '#### Scenario: Quasiflan unavailable',
        '- **WHEN** a quasiflan uberstanz is requested',
        '- **THEN** the system provides a quasiflan uberstanz session',
        '',
      ].join('\n')
    );

    const result = await runCLI(
      ['drift-check', '--change', 'missing-change', '--json', '--no-fail-on-missing'],
      { cwd: tempDir, env }
    );
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.blocked).toBe(false);
    expect(payload.findings.some((f: DriftFinding) => f.status === 'missing')).toBe(true);
  });
});
