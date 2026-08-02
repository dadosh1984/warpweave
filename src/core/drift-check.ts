import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildCodeFenceMask } from './parsers/code-fence.js';

/**
 * Drift Check Core
 *
 * Mechanical first pass for the AI-driven drift check: parses a change's
 * delta spec files into per-scenario findings (file, line, requirement,
 * expected behavior) and classifies each as compliant / missing / drifted by
 * scanning the project source for the scenario's distinctive terms. The
 * agent refines this signal with semantic analysis before acting on it.
 */

export interface DriftScenario {
  file: string;
  line: number;
  requirement: string;
  scenario: string;
  expected: string;
}

export type DriftStatus = 'compliant' | 'missing' | 'drifted';

export interface DriftFinding extends DriftScenario {
  status: DriftStatus;
  /** Matched source evidence (the scenario terms found in the codebase). */
  actual: string | null;
}

const REQUIREMENT_HEADER = /^###\s*Requirement:\s*(.+)\s*$/i;
const SCENARIO_HEADER = /^####\s*Scenario:\s*(.+)\s*$/;
const SECTION_HEADER = /^##\s+/;

/**
 * Extracts every `#### Scenario:` block from the given spec files, together
 * with its containing requirement and the WHEN/THEN behavior text. Fenced
 * example blocks are ignored so a sample can never be mistaken for a real
 * scenario (agrees with the validator's countScenarios).
 */
export async function extractSpecScenarios(specFiles: string[]): Promise<DriftScenario[]> {
  const scenarios: DriftScenario[] = [];

  for (const file of specFiles) {
    let content: string;
    try {
      content = await fs.readFile(file, 'utf-8');
    } catch {
      // An unreadable spec file is not a drift finding; skip it.
      continue;
    }

    const lines = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
    const mask = buildCodeFenceMask(lines);
    let requirement = '';

    for (let i = 0; i < lines.length; i++) {
      if (mask[i]) {
        continue;
      }

      const reqMatch = lines[i].match(REQUIREMENT_HEADER);
      if (reqMatch) {
        requirement = reqMatch[1].trim();
        continue;
      }

      const scenMatch = lines[i].match(SCENARIO_HEADER);
      if (!scenMatch) {
        continue;
      }

      const scenario = scenMatch[1].trim();
      const expectedLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !mask[j]) {
        const line = lines[j];
        if (SECTION_HEADER.test(line) || REQUIREMENT_HEADER.test(line) || SCENARIO_HEADER.test(line)) {
          break;
        }
        const trimmed = line.replace(/^\s*[-*]\s*/, '').trim();
        if (trimmed) {
          expectedLines.push(trimmed);
        }
        j++;
      }

      scenarios.push({
        file,
        line: i + 1,
        requirement,
        scenario,
        expected: expectedLines.join(' '),
      });
    }
  }

  return scenarios;
}

const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.opencode',
  '.changeset',
  'coverage',
  'warpweave',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.rs',
  '.go',
  '.java',
  '.rb',
  '.php',
  '.cs',
  '.md',
  '.txt',
  '.yaml',
  '.yml',
  '.json',
]);

const STOPWORDS = new Set([
  'the', 'and', 'are', 'for', 'with', 'from', 'that', 'this', 'have', 'has',
  'had', 'not', 'but', 'you', 'all', 'can', 'was', 'were', 'been', 'when',
  'then', 'than', 'into', 'over', 'your', 'will', 'would', 'should', 'shall',
  'must', 'does', 'do', 'did', 'user', 'users', 'system', 'their', 'they',
  'them', 'what', 'which', 'while', 'each', 'some', 'there', 'other', 'these',
  'those', 'about', 'after', 'before', 'only', 'also', 'such', 'its', 'been',
]);

function scenarioTerms(scenario: DriftScenario): string[] {
  const text = `${scenario.scenario} ${scenario.expected}`.toLowerCase();
  const terms = new Set<string>();
  for (const word of text.split(/[^a-z0-9]+/)) {
    if (word.length >= 4 && !STOPWORDS.has(word)) {
      terms.add(word);
    }
  }
  return [...terms];
}

async function collectSourceTerms(projectRoot: string): Promise<Set<string>> {
  const terms = new Set<string>();
  const stack = [projectRoot];

  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          stack.push(full);
        }
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        try {
          const content = await fs.readFile(full, 'utf-8');
          for (const term of content.toLowerCase().split(/[^a-z0-9]+/)) {
            if (term.length >= 4) {
              terms.add(term);
            }
          }
        } catch {
          // Unreadable file - skip.
        }
      }
    }
  }

  return terms;
}

/**
 * Classifies one scenario by scanning the project source for its distinctive
 * terms. All found -> compliant, none found -> missing, some -> drifted.
 */
export async function classifyScenario(
  scenario: DriftScenario,
  projectRoot: string
): Promise<DriftFinding> {
  const terms = scenarioTerms(scenario);
  if (terms.length === 0) {
    return { ...scenario, status: 'compliant', actual: null };
  }

  const sourceTerms = await collectSourceTerms(projectRoot);
  const found = terms.filter((term) => sourceTerms.has(term));

  const status: DriftStatus =
    found.length === terms.length
      ? 'compliant'
      : found.length === 0
        ? 'missing'
        : 'drifted';

  return {
    ...scenario,
    status,
    actual: found.length > 0 ? `found: ${found.join(', ')}` : null,
  };
}
