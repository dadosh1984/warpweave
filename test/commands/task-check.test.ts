import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { runCLI } from '../helpers/run-cli.js';
import { createOpenSpecRoot } from '../helpers/openspec-fixtures.js';
import { cleanupTempPath } from '../helpers/temp-cleanup.js';

describe('warpweave task-check CLI', () => {
  let tempDir: string;
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    tempDir = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'taskcheck-')));
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

  function writeChange(changeName: string, tasksBody: string): string {
    const changeDir = path.join(tempDir, 'warpweave', 'changes', changeName);
    fs.mkdirSync(changeDir, { recursive: true });
    fs.writeFileSync(path.join(changeDir, '.warpweave.yaml'), 'schema: spec-driven\n');
    fs.writeFileSync(path.join(changeDir, 'tasks.md'), tasksBody, 'utf-8');
    return changeDir;
  }

  it('extracts and runs a passing verify command (exit 0)', async () => {
    writeChange(
      'demo',
      [
        '- [ ] 1.1 Add feature',
        '  - **Verify**: `node -e "process.exit(0)"`',
        '',
      ].join('\n')
    );

    const result = await runCLI(['task-check', '1.1', '--change', 'demo', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.verifyCommand).toContain('process.exit(0)');
    expect(payload.passed).toBe(true);
    expect(payload.exitCode).toBe(0);
  });

  it('blocks (exit 1) when the verify command fails', async () => {
    writeChange(
      'demo',
      [
        '- [ ] 1.1 Add feature',
        '  - **Verify**: `node -e "process.exit(1)"`',
        '',
      ].join('\n')
    );

    const result = await runCLI(['task-check', '1.1', '--change', 'demo', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.passed).toBe(false);
    expect(payload.exitCode).toBe(1);
  });

  it('reports no verify command and does not block when the task lacks **Verify:**', async () => {
    writeChange('demo', '- [ ] 1.1 Plain task\n- [x] 1.2 Done task\n');

    const result = await runCLI(['task-check', '1.1', '--change', 'demo', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.verifyCommand).toBeNull();
    expect(payload.passed).toBe(false);
    expect(payload.ran).toBe(false);
  });

  it('falls back to the first pending task when no reference is given', async () => {
    writeChange(
      'demo',
      [
        '- [x] 1.1 Done task',
        '  - **Verify**: `node -e "process.exit(0)"`',
        '- [ ] 1.2 Pending task',
        '  - **Verify**: `node -e "process.exit(2)"`',
        '',
      ].join('\n')
    );

    const result = await runCLI(['task-check', '--change', 'demo', '--json'], {
      cwd: tempDir,
      env,
    });
    expect(result.exitCode).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.task).toBe('2');
  });
});
