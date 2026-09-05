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
} from '../core/root-selection.js';
import { getChangeDir } from '../core/planning-home.js';
import { resolveChangeName } from '../commands/workflow/shared.js';
import { discoverSpecFiles } from '../utils/spec-discovery.js';
import { extractSpecScenarios, classifyScenario, collectSourceTerms, type DriftFinding } from '../core/drift-check.js';
import { emitFailure, printJson } from './shared-output.js';
import { COMMON_FLAGS } from '../core/completions/shared-flags.js';
import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';

const FAILURE_PAYLOAD = { findings: [], root: null };

export interface DriftCheckOptions {
  change?: string;
  store?: string;
  storePath?: string;
  json?: boolean;
  noInteractive?: boolean;
  failOnMissing?: boolean;
}

function printHumanReport(changeName: string, findings: DriftFinding[], blocked: boolean): void {
  const compliant = findings.filter((f) => f.status === 'compliant');
  const issues = findings.filter((f) => f.status !== 'compliant');
  const missing = findings.filter((f) => f.status === 'missing');

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
  } else {
    for (const finding of issues) {
      const label = finding.status === 'missing' ? chalk.red('Missing') : chalk.yellow('Drifted');
      console.log(`  - ${finding.scenario} ${label} — ${finding.file}:${finding.line}`);
      console.log(`    expected: ${finding.expected}`);
      console.log(`    actual: ${finding.actual ?? '(behavior not found in code)'}`);
    }
  }
  if (blocked) {
    console.log('');
    console.log(chalk.red(`Blocked: ${missing.length} missing scenario(s). ` +
      'Fix the missing behavior, or pass --no-fail-on-missing to run report-only.'));
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
        printJson({ blocked: false, findings: [] });
        return;
      }
      console.log('No specs to check against');
      return;
    }

    const scenarios = await extractSpecScenarios(specFiles);
    const findings: DriftFinding[] = [];
    // One project walk for the whole batch, not one per scenario.
    const sourceTerms = await collectSourceTerms(root.path);
    for (const scenario of scenarios) {
      findings.push(await classifyScenario(scenario, root.path, sourceTerms));
    }

    const missingCount = findings.filter((f) => f.status === 'missing').length;
    const blocked = missingCount > 0 && options.failOnMissing !== false;

    if (options.json) {
      printJson({ blocked, findings });
      process.exitCode = blocked ? 1 : 0;
      return;
    }
    printHumanReport(changeName, findings, blocked);
    if (blocked) {
      process.exitCode = 1;
    }
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
    .option('--json', 'Output as JSON with a blocked flag and findings array')
    .option('--no-fail-on-missing', 'Report missing findings without failing (exit 0)')
    .option('--no-interactive', 'Disable interactive prompts')
    .option('--store <id>', COMMON_FLAGS.store.description)
    .addOption(
      new Option('--store-path <path>', 'Removed; register the store and use --store').hideHelp()
    )
    .action(async (options: DriftCheckOptions) => {
      await driftCheckCommand(options ?? {});
    });
}
