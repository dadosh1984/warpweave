import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { FileSystemUtils } from '../utils/file-system.js';
import { resolvePlanningDirName } from './planning-home.js';
import { serializeConfig } from './config-prompts.js';
import {
  makeStoreDiagnostic,
  type StoreDiagnostic,
} from './store/errors.js';

export const WARPWEAVE_ROOT_DIR = 'warpweave';
export const WARPWEAVE_CONFIG_YAML = 'warpweave/config.yaml';
export const WARPWEAVE_CONFIG_YML = 'warpweave/config.yml';
export const WARPWEAVE_SPECS_DIR = 'warpweave/specs';
export const WARPWEAVE_CHANGES_DIR = 'warpweave/changes';
export const WARPWEAVE_ARCHIVE_DIR = 'warpweave/changes/archive';
export const DEFAULT_WARPWEAVE_SCHEMA = 'spec-driven';
export const DIRECTORY_ANCHOR_FILE_NAME = '.gitkeep';

// Git cannot track empty directories, so setup anchors otherwise-empty
// conventional store directories for teammates who clone the repo later.
export const ANCHORED_WARPWEAVE_DIRS = [WARPWEAVE_SPECS_DIR, WARPWEAVE_ARCHIVE_DIR] as const;

/**
 * Relative planning-directory paths for a store root, honoring legacy
 * `warpweave/` installs: new installs use `warpweave/`, but roots that already
 * carry a planning directory under the legacy name keep working under it.
 */
export function planningRelativePaths(storeRoot: string) {
  const dir = resolvePlanningDirName(storeRoot);
  return {
    root: dir,
    configYaml: `${dir}/config.yaml`,
    configYml: `${dir}/config.yml`,
    specs: `${dir}/specs`,
    changes: `${dir}/changes`,
    archive: `${dir}/changes/archive`,
  };
}

type PathKind = 'missing' | 'directory' | 'file' | 'other';

export interface CreatedPathLedgerEntry {
  relativePath: string;
  absolutePath: string;
  kind: 'directory' | 'file';
}

export interface WarpweaveRootInspection {
  present: boolean | null;
  config: {
    present: boolean | null;
    path?: string;
  };
  specs: {
    present: boolean | null;
  };
  changes: {
    present: boolean | null;
  };
  archive: {
    present: boolean | null;
  };
  healthy: boolean;
  diagnostics: StoreDiagnostic[];
}

export interface EnsureWarpweaveRootResult {
  inspection: WarpweaveRootInspection;
  createdArtifacts: string[];
  createdPaths: CreatedPathLedgerEntry[];
}

async function pathKind(targetPath: string): Promise<PathKind> {
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) return 'directory';
    if (stat.isFile()) return 'file';
    return 'other';
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return 'missing';
    }

    throw error;
  }
}

function relativeArtifact(relativePath: string, kind: CreatedPathLedgerEntry['kind']): string {
  const normalized = FileSystemUtils.toPosixPath(relativePath);
  return kind === 'directory' ? `${normalized}/` : normalized;
}

function unresolvedInspection(): WarpweaveRootInspection {
  return {
    present: null,
    config: { present: null },
    specs: { present: null },
    changes: { present: null },
    archive: { present: null },
    healthy: false,
    diagnostics: [],
  };
}

function missingDirectoryDiagnostic(
  code: string,
  message: string,
  target: string
): StoreDiagnostic {
  return makeStoreDiagnostic('error', code, message, { target });
}

type OptionalPlanningDirectoryKey = 'specs' | 'changes' | 'archive';

async function inspectOptionalPlanningDirectory(
  inspection: WarpweaveRootInspection,
  storeRoot: string,
  key: OptionalPlanningDirectoryKey,
  relativePath: string,
  notDirectoryCode: string,
  target: string
): Promise<PathKind> {
  const kind = await pathKind(path.join(storeRoot, relativePath));
  inspection[key] = { present: kind === 'directory' };
  if (kind === 'directory' || kind === 'missing') return kind;

  inspection.diagnostics.push(missingDirectoryDiagnostic(
    notDirectoryCode,
    `${relativePath}/ exists but is not a directory.`,
    target
  ));
  return kind;
}

export async function inspectWarpweaveRoot(storeRoot: string): Promise<WarpweaveRootInspection> {
  const rootKind = await pathKind(storeRoot);
  const inspection = unresolvedInspection();

  if (rootKind === 'missing') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'warpweave_store_root_missing',
      'Store root does not exist.',
      'store.root'
    ));
    return inspection;
  }

  if (rootKind !== 'directory') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'warpweave_store_root_not_directory',
      'Store root is not a directory.',
      'store.root'
    ));
    return inspection;
  }

  const rel = planningRelativePaths(storeRoot);
  const warpweavePath = path.join(storeRoot, rel.root);
  const warpweaveKind = await pathKind(warpweavePath);
  inspection.present = warpweaveKind === 'directory';

  if (warpweaveKind === 'missing') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'warpweave_root_missing',
      `Missing ${rel.root}/ directory.`,
      'warpweave.root'
    ));
    return inspection;
  }

  if (warpweaveKind !== 'directory') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'warpweave_root_not_directory',
      `${rel.root}/ exists but is not a directory.`,
      'warpweave.root'
    ));
    return inspection;
  }

  const configYamlKind = await pathKind(path.join(storeRoot, rel.configYaml));
  const configYmlKind = await pathKind(path.join(storeRoot, rel.configYml));
  if (configYamlKind === 'file') {
    inspection.config = { present: true, path: rel.configYaml };
  } else if (configYmlKind === 'file') {
    inspection.config = { present: true, path: rel.configYml };
  } else {
    inspection.config = { present: false };
    if (configYamlKind !== 'missing' || configYmlKind !== 'missing') {
      inspection.diagnostics.push(missingDirectoryDiagnostic(
        'warpweave_config_not_file',
        'Warpweave config path exists but is not a file.',
        'warpweave.config'
      ));
    } else {
      inspection.diagnostics.push(missingDirectoryDiagnostic(
        'warpweave_config_missing',
        `Missing ${rel.root}/config.yaml or ${rel.root}/config.yml.`,
        'warpweave.config'
      ));
    }
  }

  await inspectOptionalPlanningDirectory(
    inspection,
    storeRoot,
    'specs',
    rel.specs,
    'warpweave_specs_not_directory',
    'warpweave.specs'
  );
  const changesKind = await inspectOptionalPlanningDirectory(
    inspection,
    storeRoot,
    'changes',
    rel.changes,
    'warpweave_changes_not_directory',
    'warpweave.changes'
  );
  if (changesKind === 'directory') {
    await inspectOptionalPlanningDirectory(
      inspection,
      storeRoot,
      'archive',
      rel.archive,
      'warpweave_archive_not_directory',
      'warpweave.archive'
    );
  } else {
    inspection.archive = { present: false };
  }

  inspection.healthy =
    inspection.present === true &&
    inspection.config.present === true &&
    inspection.diagnostics.length === 0;

  return inspection;
}

async function ensureDirectory(
  storeRoot: string,
  relativePath: string,
  ledger: CreatedPathLedgerEntry[]
): Promise<void> {
  const absolutePath = path.join(storeRoot, relativePath);
  const kind = await pathKind(absolutePath);

  if (kind === 'directory') return;
  if (kind !== 'missing') {
    throw new Error(`${relativePath}/ exists but is not a directory.`);
  }

  await fs.mkdir(absolutePath, { recursive: true });
  ledger.push({
    relativePath: relativeArtifact(relativePath, 'directory'),
    absolutePath,
    kind: 'directory',
  });
}

async function ensureDefaultConfig(
  storeRoot: string,
  ledger: CreatedPathLedgerEntry[]
): Promise<void> {
  const rel = planningRelativePaths(storeRoot);
  const configYamlPath = path.join(storeRoot, rel.configYaml);
  const configYmlPath = path.join(storeRoot, rel.configYml);
  const yamlKind = await pathKind(configYamlPath);
  const ymlKind = await pathKind(configYmlPath);

  if (yamlKind === 'file' || ymlKind === 'file') return;
  if (yamlKind !== 'missing' || ymlKind !== 'missing') {
    throw new Error('Warpweave config path exists but is not a file.');
  }

  await FileSystemUtils.writeFile(
    configYamlPath,
    serializeConfig({ schema: DEFAULT_WARPWEAVE_SCHEMA })
  );
  ledger.push({
    relativePath: relativeArtifact(rel.configYaml, 'file'),
    absolutePath: configYamlPath,
    kind: 'file',
  });
}

async function ensureDirectoryAnchor(
  storeRoot: string,
  relativeDir: string,
  ledger: CreatedPathLedgerEntry[]
): Promise<void> {
  const directory = path.join(storeRoot, relativeDir);
  if ((await fs.readdir(directory)).length > 0) return;

  const relativePath = `${relativeDir}/${DIRECTORY_ANCHOR_FILE_NAME}`;
  const absolutePath = path.join(directory, DIRECTORY_ANCHOR_FILE_NAME);
  await fs.writeFile(absolutePath, '', 'utf-8');
  ledger.push({
    relativePath: relativeArtifact(relativePath, 'file'),
    absolutePath,
    kind: 'file',
  });
}

export interface EnsureWarpweaveRootOptions {
  anchorEmptyDirectories?: boolean;
}

export async function ensureWarpweaveRoot(
  storeRoot: string,
  options: EnsureWarpweaveRootOptions = {}
): Promise<EnsureWarpweaveRootResult> {
  const ledger: CreatedPathLedgerEntry[] = [];
  const rootKind = await pathKind(storeRoot);

  if (rootKind === 'missing') {
    await fs.mkdir(storeRoot, { recursive: true });
  } else if (rootKind !== 'directory') {
    throw new Error('Store root is not a directory.');
  }

  const rel = planningRelativePaths(storeRoot);
  await ensureDirectory(storeRoot, rel.root, ledger);
  await ensureDirectory(storeRoot, rel.specs, ledger);
  await ensureDirectory(storeRoot, rel.changes, ledger);
  await ensureDirectory(storeRoot, rel.archive, ledger);
  await ensureDefaultConfig(storeRoot, ledger);

  if (options.anchorEmptyDirectories) {
    for (const relativeDir of ANCHORED_WARPWEAVE_DIRS) {
      await ensureDirectoryAnchor(storeRoot, relativeDir, ledger);
    }
  }

  return {
    inspection: await inspectWarpweaveRoot(storeRoot),
    createdArtifacts: ledger.map((entry) => entry.relativePath),
    createdPaths: ledger,
  };
}

export async function rollbackCreatedPaths(entries: CreatedPathLedgerEntry[]): Promise<void> {
  for (const entry of [...entries].reverse()) {
    if (entry.kind === 'file') {
      await fs.rm(entry.absolutePath, { force: true }).catch(() => undefined);
    } else {
      await fs.rmdir(entry.absolutePath).catch(() => undefined);
    }
  }
}
