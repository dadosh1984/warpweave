/**
 * The relationship-data gather shared by doctor and context (4.1): one
 * registry snapshot, the health-mode reference index, and the root
 * inspection. Doctor layers its health-only inputs (store facts,
 * wrong-turn detection) on top.
 */
import * as path from 'node:path';

import { readRegistrySnapshot, type RegistrySnapshot } from '../core/store/registry.js';
import {
  readProjectConfig,
  resolveConfigFilePath,
  type ProjectConfig,
} from '../core/project-config.js';
import { assembleReferenceIndex, type ReferenceIndexEntry } from '../core/references.js';
import { inspectWarpweaveRoot, type WarpweaveRootInspection } from '../core/warpweave-root.js';
import { resolvePlanningDirName } from '../core/planning-home.js';
import type { ResolvedWarpweaveRoot } from '../core/root-selection.js';

export interface RelationshipData {
  registrySnapshot: RegistrySnapshot;
  projectConfig: ProjectConfig | null;
  storeConfigPath: string;
  referenceEntries: ReferenceIndexEntry[];
  rootInspection: WarpweaveRootInspection;
}

export async function gatherRelationshipData(
  root: ResolvedWarpweaveRoot
): Promise<RelationshipData> {
  const registrySnapshot = await readRegistrySnapshot();

  const projectConfig = readProjectConfig(root.path);
  const storeConfigPath =
    resolveConfigFilePath(root.path) ?? path.join(root.path, resolvePlanningDirName(root.path), 'config.yaml');

  const referenceEntries = await assembleReferenceIndex({
    references: projectConfig?.references ?? [],
    resolvedRoot: root,
    includeSpecs: false,
    registryEntries: registrySnapshot.entries,
  });

  const rootInspection = await inspectWarpweaveRoot(root.path);

  return {
    registrySnapshot,
    projectConfig,
    storeConfigPath,
    referenceEntries,
    rootInspection,
  };
}
