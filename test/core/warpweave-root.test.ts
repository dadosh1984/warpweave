import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  DEFAULT_WARPWEAVE_SCHEMA,
  ensureWarpweaveRoot,
  inspectWarpweaveRoot,
  rollbackCreatedPaths,
} from '../../src/core/index.js';

describe('Warpweave root helper', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-root-helper-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function createHealthyRoot(root: string, configName = 'config.yaml'): void {
    fs.mkdirSync(path.join(root, 'warpweave', 'specs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'warpweave', 'changes', 'archive'), { recursive: true });
    fs.writeFileSync(path.join(root, 'warpweave', configName), `schema: ${DEFAULT_WARPWEAVE_SCHEMA}\n`);
  }

  it('inspects a healthy root with config.yaml', async () => {
    const root = path.join(tempDir, 'store');
    createHealthyRoot(root);

    await expect(inspectWarpweaveRoot(root)).resolves.toEqual(expect.objectContaining({
      healthy: true,
      present: true,
      config: {
        present: true,
        path: 'warpweave/config.yaml',
      },
      diagnostics: [],
    }));
  });

  it('inspects a healthy root with config.yml', async () => {
    const root = path.join(tempDir, 'store');
    createHealthyRoot(root, 'config.yml');

    await expect(inspectWarpweaveRoot(root)).resolves.toEqual(expect.objectContaining({
      healthy: true,
      config: {
        present: true,
        path: 'warpweave/config.yml',
      },
    }));
  });

  it('reports missing root pieces without mutating files', async () => {
    const root = path.join(tempDir, 'store');
    fs.mkdirSync(path.join(root, 'warpweave', 'changes'), { recursive: true });

    const inspection = await inspectWarpweaveRoot(root);

    expect(inspection.healthy).toBe(false);
    expect(inspection.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'warpweave_config_missing',
    ]);
    expect(fs.existsSync(path.join(root, 'warpweave', 'changes', 'archive'))).toBe(false);
  });

  it('accepts roots before changes, applied specs, or archives exist', async () => {
    const root = path.join(tempDir, 'store');
    fs.mkdirSync(path.join(root, 'warpweave'), { recursive: true });
    fs.writeFileSync(path.join(root, 'warpweave', 'config.yaml'), `schema: ${DEFAULT_WARPWEAVE_SCHEMA}\n`);

    const inspection = await inspectWarpweaveRoot(root);

    expect(inspection).toEqual(expect.objectContaining({
      healthy: true,
      specs: { present: false },
      changes: { present: false },
      archive: { present: false },
      diagnostics: [],
    }));
  });

  it('reports malformed optional planning paths without throwing', async () => {
    const root = path.join(tempDir, 'store');
    fs.mkdirSync(path.join(root, 'warpweave'), { recursive: true });
    fs.writeFileSync(path.join(root, 'warpweave', 'config.yaml'), `schema: ${DEFAULT_WARPWEAVE_SCHEMA}\n`);
    fs.writeFileSync(path.join(root, 'warpweave', 'changes'), 'not a directory\n');

    const inspection = await inspectWarpweaveRoot(root);

    expect(inspection.healthy).toBe(false);
    expect(inspection.changes).toEqual({ present: false });
    expect(inspection.archive).toEqual({ present: false });
    expect(inspection.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'warpweave_changes_not_directory',
    ]);
  });

  it('ensures the default root shape and records created paths', async () => {
    const root = path.join(tempDir, 'store');

    const result = await ensureWarpweaveRoot(root);

    expect(result.createdArtifacts).toEqual([
      'warpweave/',
      'warpweave/specs/',
      'warpweave/changes/',
      'warpweave/changes/archive/',
      'warpweave/config.yaml',
    ]);
    expect(result.inspection.healthy).toBe(true);
    expect(fs.readFileSync(path.join(root, 'warpweave', 'config.yaml'), 'utf-8')).toContain(
      `schema: ${DEFAULT_WARPWEAVE_SCHEMA}`
    );
  });

  it('preserves existing config and user files', async () => {
    const root = path.join(tempDir, 'store');
    createHealthyRoot(root, 'config.yml');
    fs.writeFileSync(path.join(root, 'warpweave', 'specs', 'note.md'), 'keep me\n');

    const result = await ensureWarpweaveRoot(root);

    expect(result.createdArtifacts).toEqual([]);
    expect(fs.existsSync(path.join(root, 'warpweave', 'config.yaml'))).toBe(false);
    expect(fs.readFileSync(path.join(root, 'warpweave', 'config.yml'), 'utf-8')).toBe(
      `schema: ${DEFAULT_WARPWEAVE_SCHEMA}\n`
    );
    expect(fs.readFileSync(path.join(root, 'warpweave', 'specs', 'note.md'), 'utf-8')).toBe(
      'keep me\n'
    );
  });

  it('rolls back only ledger-created files and empty directories', async () => {
    const root = path.join(tempDir, 'store');
    const result = await ensureWarpweaveRoot(root);
    fs.writeFileSync(path.join(root, 'user.md'), 'mine\n');

    await rollbackCreatedPaths(result.createdPaths);

    expect(fs.existsSync(path.join(root, 'openspec'))).toBe(false);
    expect(fs.readFileSync(path.join(root, 'user.md'), 'utf-8')).toBe('mine\n');
  });
});
