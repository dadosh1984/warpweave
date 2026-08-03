import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  checkSpecTemplateParity,
  checkInstalledSkillDrift,
  checkVersionSync,
} from '../../src/core/project-selfcheck.js';

function writeProject(files: Record<string, string>): string {
  const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'selfcheck-')));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf-8');
  }
  return root;
}

describe('project self-check bridges', () => {
  it('reports ok when the mapped anchor is present in the template', async () => {
    const root = writeProject({
      'src/core/templates/workflows/apply-change.ts': [
        'the apply flow SHALL skip or defer the advisory completion triggers near the ceiling',
        'Safety gates always run near the ceiling',
      ].join('\n'),
    });
    const result = await checkSpecTemplateParity(root);
    expect(result.ok).toBe(true);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports a finding when a mapped anchor is missing from the template', async () => {
    const root = writeProject({
      'src/core/templates/workflows/apply-change.ts': 'no gating text here\n',
    });
    const result = await checkSpecTemplateParity(root);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('missing');
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports distribution source drift when the installed copy is stale', async () => {
    const root = writeProject({
      'warpweave-scan/placeholder': '',
    });
    fs.mkdirSync(path.join(root, 'skills', 'warpweave-security-scan'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'skills', 'warpweave-security-scan', 'SKILL.md'),
      'Run a native scan. No semgrep required.\n',
      'utf-8'
    );
    // A stale installed copy that still requires semgrep.
    const installed = path.join(root, '.opencode', 'skills', 'warpweave-security-scan', 'SKILL.md');
    fs.mkdirSync(path.dirname(installed), { recursive: true });
    fs.writeFileSync(installed, 'Requires semgrep and Docker to scan.\n', 'utf-8');

    const result = await checkInstalledSkillDrift(root);
    expect(result.ok).toBe(false);
    expect(result.message.toLowerCase()).toContain('semgrep');
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports ok when source is native and no installed copy present (clean clone)', async () => {
    const root = writeProject({});
    fs.mkdirSync(path.join(root, 'skills', 'warpweave-security-scan'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'skills', 'warpweave-security-scan', 'SKILL.md'),
      'Run a native scan. No semgrep, Docker required.\n',
      'utf-8'
    );
    const result = await checkInstalledSkillDrift(root);
    expect(result.ok).toBe(true);
    expect(result.message).toContain('no installed copy');
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports matching pipeline and package versions as ok', async () => {
    const root = writeProject({
      'config/pipeline.yaml': 'pipeline:\n  version: "1.2.3"\n',
      'package.json': JSON.stringify({ version: '1.2.3' }),
    });
    const result = await checkVersionSync(root);
    expect(result.ok).toBe(true);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('reports a version mismatch finding', async () => {
    const root = writeProject({
      'config/pipeline.yaml': 'pipeline:\n  version: "1.2.3"\n',
      'package.json': JSON.stringify({ version: '2.0.0' }),
    });
    const result = await checkVersionSync(root);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('!=');
    fs.rmSync(root, { recursive: true, force: true });
  });
});
