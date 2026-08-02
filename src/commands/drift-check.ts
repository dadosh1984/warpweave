/**
 * `warpweave drift-check` — run a spec/code drift check against a change's
 * delta spec files. Outputs each spec scenario with a mechanical first-pass
 * compliance status; the agent (via the drift-detection skill) refines the
 * signal semantically before acting on it.
 */

import chalk from 'chalk';
import path from 'path';
import { Command, Option } from 'commander';

import {
  resolveRootForCommand,
  toPlanningHome,
  withStoreFlag,
  type ResolvedWarpweaveRoot,
} from '../core/root-selection.js';
import { getChangeDir } from '../core/planning-home.js';
import { getAvailableChanges, validateChangeExists } from '../commands/workflow/shared.js';
import { discoverSpecFiles } from '../utils/spec-discovery.js';
import { extractSpecScenarios, classifyScenario, type DriftFinding } from '../core/drift-check.js';
import { emitFailure, printJson } from './shared-output.js';
import { isInteractive } from '../utils/interactive.js';
import { COMMON_FLAGS } from '../core/completions/shared-flags.js';
import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';

const FAILURE_PAYLOAD = { findings: [], root: null };

export interface DriftCheckOptions {
  change?: string;
  store?: string;
  storePath?: string;
  json?: boolean;
  noInteractive?: boolean;
}

async function resolveChangeName(
  options: DriftCheckOptions,
  root: ResolvedWarpweaveRoot
): Promise<string> {
  const newChangeHint = withStoreFlag(root, 'warpweave new change <name>');
  if (options.change) {
    return validateChangeExists(options.change, root.path, root.changesDir, { newChangeHint });
  }

  const available = await getAvailableChanges(root.path, root.changesDir);
  if (available.length === 0) {
    throw new Error(`No active changes. Create one with: ${newChangeHint}`);
  }
  if (available.length === 1) {
    return available[0];
  }
  if (isInteractive({ noInteractive: options.noInteractive })) {
    const { select } = await import('@inquirer/prompts');
    return select({
      message: 'Select a change to check:',
      choices: available.map((change) => ({ name: change, value: change })),
    });
  }
  throw new Error(`No change specified. Available changes:\n  ${available.join('\n  ')}`);
}

function printHumanReport(changeName: string, findings: DriftFinding[]): void {
  const compliant = findings.filter((f) => f.status === 'compliant');
  const issues = findings.filter((f) => f.status !== 'compliant');

  console.log(`## Drift Check: ${changeName}`);
  console.log('');
  console.log(`### Compliant (${compliant.length})`);
  if (compliant.length === 0) {
    console.log('  (none)');
  } else {
    for (const finding of compliant) {
      console.log(`  - ${finding.scenario} ${chalk.green('✓ Compliant')}`);
    }
  }
  console.log('');
  console.log(`### Issues (${issues.length})`);
  if (issues.length === 0) {
    console.log('  (none)');
    return;
  }
  for (const finding of issues) {
    const label = finding.status === 'missing' ? chalk.red('Missing') : chalk.yellow('Drifted');
    console.log(`  - ${finding.scenario} ${label} — ${finding.file}:${finding.line}`);
    console.log(`    expected: ${finding.expected}`);
    console.log(`    actual: ${finding.actual ?? '(behavior not found in code)'}`);
  }
}

export async function driftCheckCommand(options: DriftCheckOptions): Promise<void> {
  try {
    const root = await resolveRootForCommand(options ?? {}, {
      json: options.json,
      failurePayload: FAILURE_PAYLOAD,
    });
    if (!root) {
      return;
    }

    const planningHome = toPlanningHome(root);
    const changeName = await resolveChangeName(options, root);
    const changeDir = getChangeDir(planningHome, changeName);
    const specRoot = path.join(changeDir, 'specs');

    const discovered = await discoverSpecFiles(specRoot);
    const specFiles = discovered.map((entry) => entry.specFile);

    if (specFiles.length === 0) {
      if (options.json) {
        printJson([]);
        return;
      }
      console.log('No specs to check against');
      return;
    }

    const scenarios = await extractSpecScenarios(specFiles);
    const findings: DriftFinding[] = [];
    for (const scenario of scenarios) {
      findings.push(await classifyScenario(scenario, root.path));
    }

    if (options.json) {
      printJson(findings);
      return;
    }
    printHumanReport(changeName, findings);
  } catch (error) {
    emitFailure(options.json, FAILURE_PAYLOAD, error, 'drift_check_failed');
  }
}

export function registerDriftCheckCommand(program: Command): void {
  const description =
    COMMAND_REGISTRY.find((entry) => entry.name === 'drift-check')?.description ??
    'Check whether implemented code has drifted from approved specifications';

  program
    .command('drift-check')
    .description(description)
    .option('--change <id>', 'Change name to check')
    .option('--json', 'Output as JSON array of drift findings')
    .option('--no-interactive', 'Disable interactive prompts')
    .option('--store <id>', COMMON_FLAGS.store.description)
    .addOption(
      new Option('--store-path <path>', 'Removed; register the store and use --store').hideHelp()
    )
    .action(async (options: DriftCheckOptions) => {
      await driftCheckCommand(options ?? {});
    });
}
