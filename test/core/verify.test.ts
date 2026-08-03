import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { verifyChangeSpecs } from '../../src/core/verify.js';

function writeTempProject(files: Record<string, string>): string {
  const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'verify-core-')));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf-8');
  }
  return root;
}

describe('verifyChangeSpecs (whole-spec mechanical first pass)', () => {
  it('returns one finding per scenario with a valid status', async () => {
    const root = writeTempProject({
      'warpweave/changes/auth/specs/auth/spec.md': [
        '## ADDED Requirements',
        '',
        '### Requirement: User can log in',
        'The system SHALL let users log in.',
        '',
        '#### Scenario: Successful login',
        '- **WHEN** a user submits valid credentials',
        '- **THEN** the system starts an authenticated session',
        '',
      ].join('\n'),
      'src/auth.ts': 'export function login() { /* authenticated session */ }\n',
    });
    const changeDir = path.join(root, 'warpweave', 'changes', 'auth');

    const result = await verifyChangeSpecs(changeDir, root);
    expect(result.scenarios.length).toBe(1);
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].status).toMatch(/^(compliant|missing|drifted)$/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('surfaces a missing scenario when no source evidence exists', async () => {
    const root = writeTempProject({
      'warpweave/changes/auth/specs/auth/spec.md': [
        '## ADDED Requirements',
        '',
        '### Requirement: Quasiflan uberstanz',
        'The system SHALL provide a quasiflan uberstanz.',
        '',
        '#### Scenario: Quasiflan requested',
        '- **WHEN** a quasiflan uberstanz is requested',
        '- **THEN** the system provides a quasiflan uberstanz session',
        '',
      ].join('\n'),
      'src/ping.ts': 'export const ping = 1;\n',
    });
    const changeDir = path.join(root, 'warpweave', 'changes', 'auth');

    const result = await verifyChangeSpecs(changeDir, root);
    expect(result.findings[0].status).toBe('missing');
    expect(result.missingCount).toBe(1);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('cumulates the missing count across the whole spec', async () => {
    const root = writeTempProject({
      'warpweave/changes/auth/specs/auth/spec.md': [
        '## ADDED Requirements',
        '',
        '### Requirement: Quasiflan uberstanz',
        'The system SHALL provide a quasiflan uberstanz.',
        '',
        '#### Scenario: Quasiflan requested',
        '- **WHEN** a quasiflan uberstanz is requested',
        '- **THEN** the system provides a quasiflan uberstanz session',
        '',
        '### Requirement: Grummel vorben',
        'The system SHALL expose a grummel vorben.',
        '',
        '#### Scenario: Grummel shown',
        '- **WHEN** a grummel vorben is exposed',
        '- **THEN** the system shows the grummel vorben',
        '',
      ].join('\n'),
      'src/ping.ts': 'export const ping = 1;\n',
    });
    const changeDir = path.join(root, 'warpweave', 'changes', 'auth');

    const result = await verifyChangeSpecs(changeDir, root);
    expect(result.findings.length).toBe(2);
    expect(result.missingCount).toBe(2);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
