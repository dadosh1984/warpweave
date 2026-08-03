import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { findCompletedUnarchived, findStaleDuplicates } from '../../src/core/archive-hygiene.js';
import type { PlanningHome } from '../../src/core/planning-home.js';

function writeProject(files: Record<string, string>): PlanningHome {
  const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'archivehyg-')));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf-8');
  }
  return { root, changesDir: path.join(root, 'warpweave', 'changes'), schema: 'spec-driven' } as PlanningHome;
}

function cleanup(home: PlanningHome): void {
  fs.rmSync(home.root, { recursive: true, force: true });
}

describe('findCompletedUnarchived', () => {
  it('flags a change whose tasks are all done', async () => {
    const home = writeProject({
      'warpweave/changes/done/tasks.md': '- [x] 1.1 a\n- [x] 1.2 b\n',
    });
    const findings = await findCompletedUnarchived(home);
    expect(findings.some((f) => f.change === 'done' && f.kind === 'completed-unarchived')).toBe(true);
    cleanup(home);
  });

  it('does not flag a change with any pending task', async () => {
    const home = writeProject({
      'warpweave/changes/partial/tasks.md': '- [x] 1.1 a\n- [ ] 1.2 b\n',
    });
    const findings = await findCompletedUnarchived(home);
    expect(findings).toHaveLength(0);
    cleanup(home);
  });

  it('does not flag a change with no tasks.md', async () => {
    const home = writeProject({ 'warpweave/changes/notasks/proposal.md': '# x\n' });
    const findings = await findCompletedUnarchived(home);
    expect(findings).toHaveLength(0);
    cleanup(home);
  });
});

describe('findStaleDuplicates', () => {
  it('reports a name present in both changes/ and archive/ (date prefix stripped)', async () => {
    const home = writeProject({
      'warpweave/changes/dup/tasks.md': '- [x] 1.1 a\n',
      'warpweave/changes/archive/2026-08-02-dup/tasks.md': '- [x] 1.1 a\n',
    });
    const findings = await findStaleDuplicates(home);
    expect(findings.length).toBe(1);
    expect(findings[0].kind).toBe('stale-duplicate');
    expect(findings[0].change).toBe('dup');
    expect(findings[0].message).toContain('leftover');
    cleanup(home);
  });

  it('ignores changes that are only in archive/', async () => {
    const home = writeProject({
      'warpweave/changes/archive/2026-08-02-only/tasks.md': '- [x] 1.1 a\n',
    });
    const findings = await findStaleDuplicates(home);
    expect(findings).toHaveLength(0);
    cleanup(home);
  });
});
