/**
 * Project Self-Check
 *
 * Deterministic cross-cutting bridges reported by `warpweave doctor`: spec vs
 * template parity, installed security-scan skill vs distribution source, and
 * pipeline.yaml version vs package.json version. Each check is read-only and
 * returns a small ok/message/fix result.
 */
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

export interface SelfCheckResult {
  ok: boolean;
  message: string;
  fix?: string;
}

/** Anchor mapping shared with the config-parity test (single source of truth). */
export interface SpecTemplateAnchor {
  capability: string;
  specPhrase: string;
  templateFile: string;
  anchor: string;
}

export const SPEC_TEMPLATE_ANCHORS: SpecTemplateAnchor[] = [
  {
    capability: 'skill-triggers',
    specPhrase: 'budget-aware gating of advisory completion triggers',
    templateFile: 'src/core/templates/workflows/apply-change.ts',
    anchor: 'skip or defer the advisory completion triggers',
  },
  {
    capability: 'skill-triggers',
    specPhrase: 'safety gates remain unconditional near ceiling',
    templateFile: 'src/core/templates/workflows/apply-change.ts',
    anchor: 'Safety gates always run near the ceiling',
  },
];

async function readOptional(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, 'utf-8');
  } catch {
    return null;
  }
}

/** Every mapped spec behavior is anchored in its template. */
export async function checkSpecTemplateParity(projectRoot: string): Promise<SelfCheckResult> {
  const missing: string[] = [];
  for (const { capability, specPhrase, templateFile, anchor } of SPEC_TEMPLATE_ANCHORS) {
    const content = await readOptional(path.join(projectRoot, templateFile));
    if (content === null || !content.includes(anchor)) {
      missing.push(`${capability} (${specPhrase}) → ${templateFile}: missing '${anchor}'`);
    }
  }
  if (missing.length === 0) {
    return { ok: true, message: 'spec↔template anchors all present' };
  }
  return {
    ok: false,
    message: `${missing.length} spec↔template anchor(s) missing`,
    fix: `Restore the required anchor(s):\n  ${missing.join('\n  ')}`,
  };
}

/** Distribution source is native; installed copy is native when present. */
export async function checkInstalledSkillDrift(projectRoot: string): Promise<SelfCheckResult> {
  const source = path.join(projectRoot, 'skills', 'warpweave-security-scan', 'SKILL.md');
  const sourceContent = await readOptional(source);
  if (sourceContent === null) {
    return { ok: false, message: 'distribution source skills/warpweave-security-scan/SKILL.md missing', fix: 'Ship the distribution source.' };
  }
  const sourceNative = !sourceContent.includes('Requires semgrep') && sourceContent.toLowerCase().includes('no semgrep');

  const installed = path.join(projectRoot, '.opencode', 'skills', 'warpweave-security-scan', 'SKILL.md');
  if (!existsSync(installed)) {
    return sourceNative
      ? { ok: true, message: 'distribution source native; no installed copy present' }
      : {
          ok: false,
          message: 'distribution source is NOT native',
          fix: 'Remove semgrep/Docker from the distribution source.',
        };
  }

  const installedContent = await readOptional(installed);
  const installedNative = installedContent !== null && !installedContent.includes('Requires semgrep') && installedContent.toLowerCase().includes('no semgrep');
  if (sourceNative && installedNative) {
    return { ok: true, message: 'distribution source and installed copy are native' };
  }
  return {
    ok: false,
    message: 'security-scan skill uses semgrep/Docker (source or installed copy)',
    fix: 'Re-sync the installed copy from the distribution source (no semgrep/Docker).',
  };
}

/** pipeline.yaml version === package.json version. */
export async function checkVersionSync(projectRoot: string): Promise<SelfCheckResult> {
  const pipelineContent = await readOptional(path.join(projectRoot, 'config', 'pipeline.yaml'));
  const packageContent = await readOptional(path.join(projectRoot, 'package.json'));
  if (pipelineContent === null || packageContent === null) {
    return { ok: false, message: 'config/pipeline.yaml or package.json missing', fix: 'Ensure both config files exist.' };
  }
  // A malformed file in the checked root is a finding, not a crash: doctor
  // aggregates these results, so one throw would abort the whole command.
  try {
    const pkg = JSON.parse(packageContent) as { version?: string };
    const pipeline = parseYaml(pipelineContent) as { pipeline?: { version?: string } };
    const a = pipeline.pipeline?.version;
    const b = pkg.version;
    if (a === b) {
      return { ok: true, message: `pipeline.yaml version matches package.json (${a})` };
    }
    return {
      ok: false,
      message: `pipeline.yaml version (${a}) != package.json version (${b})`,
      fix: 'Bump config/pipeline.yaml version to match package.json.',
    };
  } catch (error) {
    return {
      ok: false,
      message: `could not parse package.json or config/pipeline.yaml: ${(error as Error).message}`,
      fix: 'Fix the malformed config file, then re-run doctor.',
    };
  }
}

export interface ProjectSelfCheck {
  specTemplateParity: SelfCheckResult;
  installedSkillDrift: SelfCheckResult;
  versionSync: SelfCheckResult;
}

/**
 * The three bridges compare the checked-out root against the warpweave
 * distribution itself (templates under src/, skills/, config/pipeline.yaml).
 * They are only meaningful inside a warpweave development checkout; anywhere
 * else they would report the same "missing file" findings on every run.
 */
function isWarpweaveDevCheckout(projectRoot: string): boolean {
  return existsSync(path.join(projectRoot, 'src', 'core', 'templates', 'workflows'));
}

/** Run all deterministic self-check bridges for a project root. */
export async function runProjectSelfCheck(projectRoot: string): Promise<ProjectSelfCheck> {
  if (!isWarpweaveDevCheckout(projectRoot)) {
    const skipped: SelfCheckResult = {
      ok: true,
      message: 'skipped: not a warpweave development checkout',
    };
    return { specTemplateParity: skipped, installedSkillDrift: skipped, versionSync: skipped };
  }
  const [specTemplateParity, installedSkillDrift, versionSync] = await Promise.all([
    checkSpecTemplateParity(projectRoot),
    checkInstalledSkillDrift(projectRoot),
    checkVersionSync(projectRoot),
  ]);
  return { specTemplateParity, installedSkillDrift, versionSync };
}
