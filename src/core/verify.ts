/**
 * Verify Core
 *
 * A mechanical first pass for verify-change: reuses the drift-check machinery
 * (`extractSpecScenarios` + `classifyScenario`) but runs it over a change's
 * whole delta-spec set against the project source, instead of a per-task diff.
 * This surfaces a spec requirement with zero code evidence (`missing`) even
 * when no single task's diff touched the relevant file — the exact hole the
 * auto-trigger-token-budget regression slipped through. The agent refines the
 * signal semantically before acting on it (as drift-check does for tasks).
 */
import path from 'node:path';
import { promises as fs } from 'node:fs';

import {
  extractSpecScenarios,
  classifyScenario,
  type DriftScenario,
  type DriftFinding,
} from './drift-check.js';
import { discoverSpecFiles } from '../utils/spec-discovery.js';

export interface VerifyResult {
  scenarios: DriftScenario[];
  /** One finding per scenario, classified against the project source. */
  findings: DriftFinding[];
  /** Number of scenarios with no matching source evidence. */
  missingCount: number;
}

/**
 * Run the mechanical verify pass for a change: gather its delta-spec files,
 * extract every scenario, and classify each against the project source.
 * Returns the scenarios and their findings; `missing` scenarios are the ones
 * with zero matching source evidence and are surfaced first-class.
 */
export async function verifyChangeSpecs(
  changeDir: string,
  projectRoot: string
): Promise<VerifyResult> {
  const specRoot = path.join(changeDir, 'specs');
  const discovered = await discoverSpecFiles(specRoot);
  const specFiles = discovered.map((entry) => entry.specFile);

  const scenarios = await extractSpecScenarios(specFiles);
  const findings: DriftFinding[] = [];
  for (const scenario of scenarios) {
    findings.push(await classifyScenario(scenario, projectRoot));
  }

  const missingCount = findings.filter((f) => f.status === 'missing').length;
  return { scenarios, findings, missingCount };
}

/** Read a change's delta-spec files (used by verify tooling / templates). */
export async function readDeltaSpecFiles(changeDir: string): Promise<string[]> {
  const specRoot = path.join(changeDir, 'specs');
  const discovered = await discoverSpecFiles(specRoot);
  return discovered.map((entry) => entry.specFile);
}

/** Read the delta-spec content for a change (fails open on unreadable files). */
export async function readDeltaSpecContents(changeDir: string): Promise<string[]> {
  const files = await readDeltaSpecFiles(changeDir);
  const contents: string[] = [];
  for (const file of files) {
    try {
      contents.push(await fs.readFile(file, 'utf-8'));
    } catch {
      // Unreadable delta spec — skip, consistent with drift-check.
    }
  }
  return contents;
}
