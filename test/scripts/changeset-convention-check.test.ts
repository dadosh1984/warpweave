import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const script = path.join(repoRoot, 'scripts', 'changeset-convention-check.js');

function run(files: Array<{ name: string; body: string }>): { status: number; stdout: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cscheck-'));
  const paths: string[] = [];
  for (const f of files) {
    const full = path.join(dir, f.name);
    fs.writeFileSync(full, f.body, 'utf-8');
    paths.push(full);
  }
  try {
    const stdout = execFileSync('node', [script], {
      env: { ...process.env, CHANGESET_FILES: paths.join('\n') },
      encoding: 'utf-8',
    });
    return { status: 0, stdout };
  } catch (error) {
    const e = error as { status?: number; stdout?: string };
    return { status: e.status ?? 1, stdout: e.stdout ?? '' };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const CHANGESET_TEMPLATE = (body: string): string => `---\n'warpweave': minor\n---\n\n${body}`;

describe('changeset-convention-check (advisory)', () => {
  it('warns when a changeset bundles multiple release-note bullets', () => {
    const { status, stdout } = run([
      { name: 'bundled.md', body: CHANGESET_TEMPLATE('- Add budget gating\n- Add security scan\n') },
    ]);
    expect(stdout).toContain('::warning');
    expect(stdout.toLowerCase()).toContain('bundle multiple unrelated features');
    expect(status).toBe(0);
  });

  it('does not warn for a single-feature changeset', () => {
    const { status, stdout } = run([
      { name: 'single.md', body: CHANGESET_TEMPLATE('Add budget gating for auto-triggers.\n') },
    ]);
    expect(stdout).not.toContain('::warning');
    expect(status).toBe(0);
  });

  it('exits 0 (advisory, never blocks) even when it warns', () => {
    const { status } = run([
      { name: 'bundled.md', body: CHANGESET_TEMPLATE('- Add budget gating\n- Add security scan\n') },
    ]);
    expect(status).toBe(0);
  });

  it('skips cleanly when there are no changed changesets', () => {
    const { status, stdout } = run([]);
    expect(stdout).toBe('');
    expect(status).toBe(0);
  });
});
