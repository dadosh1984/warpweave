/**
 * Archive Hygiene
 *
 * Surfaced archive gaps that otherwise stay invisible: a fully completed
 * change that was never archived, and a change name present in both the active
 * `changes/` and `changes/archive/` (a stale leftover duplicate). Read-only;
 * reported by surfaces such as `warpweave doctor` — never repairs.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { PlanningHome } from './planning-home.js';
import { countTasksFromContent } from '../utils/task-progress.js';

export interface ArchiveHygieneFinding {
  kind: 'completed-unarchived' | 'stale-duplicate';
  change: string;
  /** Reminder / remediation hint. */
  message: string;
}

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

async function readOptional(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, 'utf-8');
  } catch {
    return null;
  }
}

/** True when the change has a tasks artifact with all tasks marked done. */
async function isCompletedUnarchived(changeDir: string): Promise<boolean> {
  for (const candidate of ['tasks.md', path.join('specs', 'tasks.md')]) {
    const content = await readOptional(path.join(changeDir, candidate));
    if (content !== null) {
      const { total, completed } = countTasksFromContent(content);
      return total > 0 && completed === total;
    }
  }
  return false;
}

/**
 * Find active changes whose tasks are all complete but which have not been
 * archived. A change with pending tasks, or with no tasks.md, is not flagged.
 */
export async function findCompletedUnarchived(planningHome: PlanningHome): Promise<ArchiveHygieneFinding[]> {
  const changesDir = planningHome.changesDir;
  let entries: string[];
  try {
    entries = await fs.readdir(changesDir);
  } catch {
    return [];
  }

  const findings: ArchiveHygieneFinding[] = [];
  for (const entry of entries) {
    if (entry === 'archive') {
      continue;
    }
    const changeDir = path.join(changesDir, entry);
    let stat;
    try {
      stat = await fs.stat(changeDir);
    } catch {
      continue;
    }
    if (!stat.isDirectory()) {
      continue;
    }
    if (await isCompletedUnarchived(changeDir)) {
      findings.push({
        kind: 'completed-unarchived',
        change: entry,
        message: `Change '${entry}' is fully complete but not archived. Run /ww:archive or 'warpweave archive ${entry}' to seal it.`,
      });
    }
  }
  return findings;
}

/**
 * Find change names present in both `changes/` and `changes/archive/` (the
 * archived name carries a date prefix; matching strips it). One is a leftover.
 */
export async function findStaleDuplicates(planningHome: PlanningHome): Promise<ArchiveHygieneFinding[]> {
  const changesDir = planningHome.changesDir;
  const archiveDir = path.join(changesDir, 'archive');

  const active = new Set<string>();
  try {
    for (const entry of await fs.readdir(changesDir)) {
      if (entry === 'archive') {
        continue;
      }
      const stat = await fs.stat(path.join(changesDir, entry)).catch(() => null);
      if (stat?.isDirectory()) {
        active.add(entry);
      }
    }
  } catch {
    return [];
  }

  const findings: ArchiveHygieneFinding[] = [];
  try {
    for (const entry of await fs.readdir(archiveDir)) {
      const base = entry.replace(DATE_PREFIX, '');
      if (active.has(base)) {
        const leftover = `changes/${base}`;
        findings.push({
          kind: 'stale-duplicate',
          change: base,
          message: `Change '${base}' exists in both ${leftover} and archive/${entry}. Reconcile the leftover ${leftover} copy (/ww:archive or manual removal).`,
        });
      }
    }
  } catch {
    // Archive dir absent — no duplicates possible.
  }
  return findings;
}

/** Run all archive-hygiene checks for a planning home. */
export async function runArchiveHygiene(planningHome: PlanningHome): Promise<ArchiveHygieneFinding[]> {
  const [completed, duplicates] = await Promise.all([
    findCompletedUnarchived(planningHome),
    findStaleDuplicates(planningHome),
  ]);
  return [...completed, ...duplicates];
}
