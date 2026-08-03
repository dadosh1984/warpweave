#!/usr/bin/env node
/**
 * Advisory "one changeset = one logical feature" check.
 *
 * Reads the changed changeset files named in CHANGESET_FILES (newline-separated)
 * and emits a GitHub Actions `::warning::` when a changeset's summary appears to
 * bundle multiple unrelated features (a simple heuristic: multiple `-` release
 * bullets, or several top-level feature phrases). Always exits 0 — this is a
 * tripwire for human review, never a build gate.
 *
 * Usage: CHANGESET_FILES="$(...)" node scripts/changeset-convention-check.js
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const files = (process.env.CHANGESET_FILES ?? '')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Heuristic: a changeset "may bundle" when its body lists several distinct
 * release notes (multiple `-` bullets), or its summary mentions several
 * top-level feature keywords. Deliberately conservative and advisory.
 */
function mayBundle(content, file) {
  const text = content.replace(/^---[\s\S]*?---/, '').trim();
  if (!text) return false;

  const bulletLines = text.split('\n').filter((l) => /^\s*[-*]\s*\S+/.test(l.trim()));
  if (bulletLines.length >= 2) {
    return true;
  }

  const featureKeywords = ['feat', 'add', 'support', 'implement', 'introduce', 'new'];
  const lower = text.toLowerCase();
  let matches = 0;
  for (const kw of featureKeywords) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) {
      matches += 1;
    }
  }
  if (matches >= 3) {
    return true;
  }

  return false;
}

for (const file of files) {
  let content;
  try {
    content = readFileSync(resolve(file), 'utf-8');
  } catch {
    // Unreadable changeset — nothing to warn about.
    continue;
  }
  if (mayBundle(content, file)) {
    const summary = content.replace(/^---[\s\S]*?---/, '').trim().replace(/\s+/g, ' ');
    console.log(
      `::warning file=${file},line=1,col=1,endColumn=1::` +
        `Changeset '${file}' may bundle multiple unrelated features (one changeset = one logical feature). Summary: ${summary.slice(0, 180)}`
    );
  }
}

process.exit(0);
