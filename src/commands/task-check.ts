/**
 * `warpweave task check` — extract and run a single task's `**Verify:**`
 * command from the change's tasks file, and exit non-zero when the command
 * fails (so the `[x]` mark cannot be accepted against a failing check).
 */
import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { Command } from 'commander';

import {
  resolveRootForCommand,
  toPlanningHome,
  withStoreFlag,
  type ResolvedWarpweaveRoot,
} from '../core/root-selection.js';
import { getChangeDir } from '../core/planning-home.js';
import { getAvailableChanges, validateChangeExists } from '../commands/workflow/shared.js';
import { parseTaskLines, type ParsedTask } from '../utils/task-progress.js';
import { emitFailure, printJson } from './shared-output.js';
import { isInteractive } from '../utils/interactive.js';
import { COMMAND_REGISTRY } from '../core/completions/command-registry.js';

const execFileAsync = promisify(execFile);

const FAILURE_PAYLOAD = { task: null, command: null, exitCode: null };

export interface TaskCheckOptions {
  change?: string;
  task?: string;
  json?: boolean;
  noInteractive?: boolean;
}

export interface TaskCheckResult {
  change: string;
  task: string;
  verifyCommand: string | null;
  ran: boolean;
  passed: boolean;
  exitCode: number | null;
  output: string | null;
}

/** Locate a tracked tasks.md under the change dir. */
async function findTasksFile(changeDir: string): Promise<string | null> {
  for (const candidate of ['tasks.md', path.join('specs', 'tasks.md')]) {
    const full = path.join(changeDir, candidate);
    try {
      await fs.access(full);
      return full;
    } catch {
      // try next
    }
  }
  return null;
}

/**
 * Resolve a task reference to a parsed task. Accepts a positional task number
 * (e.g. "1.2" or "3"), or falls back to the first pending task when omitted.
 */
async function resolveTask(
  tasksFile: string,
  reference: string | undefined
): Promise<{ task: ParsedTask; label: string }> {
  const content = await fs.readFile(tasksFile, 'utf-8');
  const tasks = parseTaskLines(content);
  if (tasks.length === 0) {
    throw new Error('No tasks found in tasks file');
  }

  if (reference) {
    const exact = tasks.find((t) => t.description.startsWith(`${reference} `) || t.description === reference);
    if (exact) {
      return { task: exact, label: reference };
    }
    const idx = parseInt(reference, 10);
    if (!Number.isNaN(idx) && idx >= 1 && idx <= tasks.length) {
      return { task: tasks[idx - 1], label: String(idx) };
    }
    throw new Error(`Task '${reference}' not found in ${tasksFile}`);
  }

  const first = tasks.find((t) => !t.done) ?? tasks[tasks.length - 1];
  const t = tasks.indexOf(first);
  return { task: first, label: String(t + 1) };
}

/** Execute the verify command in the project shell, returning its result. */
async function runVerifyCommand(command: string, cwd: string): Promise<{ exitCode: number; output: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(command, { cwd, shell: true });
    return { exitCode: 0, output: `${stdout}${stderr}`.trim() };
  } catch (error) {
    const e = error as { code?: number; stdout?: string; stderr?: string };
    return { exitCode: e.code ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}`.trim() };
  }
}

async function resolveChangeName(
  options: TaskCheckOptions,
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

function printHumanResult(changeName: string, result: TaskCheckResult): void {
  console.log(`## Task Verify Check: ${changeName}`);
  console.log(`Task: ${result.task}`);
  if (!result.verifyCommand) {
    console.log('⚠  No **Verify:** command on this task — nothing to run (not blocked).');
    return;
  }
  console.log(`Verify: ${result.verifyCommand}`);
  if (result.passed) {
    console.log(`✓ Passed (exit ${result.exitCode})`);
  } else {
    console.log(`✗ FAILED (exit ${result.exitCode})`);
    if (result.output) {
      console.log(result.output);
    }
    console.log('The task must NOT be marked [x] until this verify command passes.');
  }
}

export async function taskCheckCommand(options: TaskCheckOptions): Promise<void> {
  try {
    const root = await resolveRootForCommand({}, {
      json: options.json,
      failurePayload: FAILURE_PAYLOAD,
    });
    if (!root) {
      return;
    }

    const planningHome = toPlanningHome(root);
    const changeName = await resolveChangeName(options, root);
    const changeDir = getChangeDir(planningHome, changeName);
    const tasksFile = await findTasksFile(changeDir);
    if (!tasksFile) {
      throw new Error(`No tasks file found for change '${changeName}'`);
    }

    const { task, label } = await resolveTask(tasksFile, options.task);

    const result: TaskCheckResult = {
      change: changeName,
      task: label,
      verifyCommand: task.verifyCommand ?? null,
      ran: false,
      passed: false,
      exitCode: null,
      output: null,
    };

    if (task.verifyCommand) {
      const { exitCode, output } = await runVerifyCommand(task.verifyCommand, root.path);
      result.ran = true;
      result.passed = exitCode === 0;
      result.exitCode = exitCode;
      result.output = output;
    }

    if (options.json) {
      printJson(result);
    } else {
      printHumanResult(changeName, result);
    }
    if (task.verifyCommand && !result.passed) {
      process.exitCode = 1;
    }
  } catch (error) {
    emitFailure(options.json, FAILURE_PAYLOAD, error, 'task_check_failed');
  }
}

export function registerTaskCheckCommand(program: Command): void {
  const description =
    COMMAND_REGISTRY.find((entry) => entry.name === 'task-check')?.description ??
    'Extract and run a task verify command; exit non-zero on failure';

  program
    .command('task-check [task]')
    .description(description)
    .option('--change <id>', 'Change name to check')
    .option('--json', 'Output as JSON')
    .option('--no-interactive', 'Disable interactive prompts')
    .action(async (task: string | undefined, options: TaskCheckOptions) => {
      await taskCheckCommand({ ...(options ?? {}), task });
    });
}
