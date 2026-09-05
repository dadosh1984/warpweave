/**
 * Shared artifact removal / legacy cleanup helpers.
 *
 * `core/init.ts` and `core/update.ts` both install and uninstall the same
 * skills, commands, and legacy artifacts; these helpers were previously
 * duplicated verbatim between them and can drift independently. Both surfaces
 * must behave identically when they remove artifacts.
 */
import * as fs from 'fs';
import path from 'path';
import ora from 'ora';

import { ALL_WORKFLOWS } from './profiles.js';
import { WORKFLOW_TO_SKILL_DIR } from './profile-sync-drift.js';
import { CommandAdapterRegistry } from './command-generation/index.js';
import {
  cleanupLegacyArtifacts,
  formatCleanupSummary,
  type LegacyDetectionResult,
} from './legacy-cleanup.js';

/**
 * Removes skill directories for workflows that are no longer selected in the
 * active profile. Omit `desiredWorkflows` to remove every mapped skill dir
 * (used when delivery changed to commands-only).
 * Returns the number of directories removed.
 */
export async function removeWorkflowSkillDirs(
  skillsDir: string,
  desiredWorkflows?: readonly (typeof ALL_WORKFLOWS)[number][]
): Promise<number> {
  const desiredSet = desiredWorkflows ? new Set(desiredWorkflows) : undefined;
  let removed = 0;

  for (const workflow of ALL_WORKFLOWS) {
    if (desiredSet?.has(workflow)) continue;
    const dirName = WORKFLOW_TO_SKILL_DIR[workflow];
    if (!dirName) continue;

    const skillDir = path.join(skillsDir, dirName);
    try {
      if (fs.existsSync(skillDir)) {
        await fs.promises.rm(skillDir, { recursive: true, force: true });
        removed++;
      }
    } catch {
      // Ignore errors
    }
  }

  return removed;
}

/**
 * Removes command files for workflows that are no longer selected in the
 * active profile. Omit `desiredWorkflows` to remove every mapped command file
 * (used when delivery changed to skills-only).
 * Returns the number of files removed.
 */
export async function removeWorkflowCommandFiles(
  projectPath: string,
  toolId: string,
  desiredWorkflows?: readonly (typeof ALL_WORKFLOWS)[number][]
): Promise<number> {
  const desiredSet = desiredWorkflows ? new Set(desiredWorkflows) : undefined;
  const adapter = CommandAdapterRegistry.get(toolId);
  if (!adapter) return 0;

  let removed = 0;

  for (const workflow of ALL_WORKFLOWS) {
    if (desiredSet?.has(workflow)) continue;
    const cmdPath = adapter.getFilePath(workflow);
    const fullPath = path.isAbsolute(cmdPath) ? cmdPath : path.join(projectPath, cmdPath);

    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        removed++;
      }
    } catch {
      // Ignore errors
    }
  }

  return removed;
}

/**
 * Runs legacy artifact cleanup behind a spinner. A cleanup failure stops the
 * spinner (fail) before propagating, so it can never keep spinning on the
 * user's terminal.
 */
export async function performLegacyCleanup(
  projectPath: string,
  detection: LegacyDetectionResult
): Promise<void> {
  const spinner = ora('Cleaning up legacy files...').start();

  let result: Awaited<ReturnType<typeof cleanupLegacyArtifacts>>;
  try {
    result = await cleanupLegacyArtifacts(projectPath, detection);
  } catch (error) {
    spinner.fail('Legacy cleanup failed');
    throw error;
  }

  spinner.succeed('Legacy files cleaned up');

  const summary = formatCleanupSummary(result);
  if (summary) {
    console.log();
    console.log(summary);
  }

  console.log();
}
