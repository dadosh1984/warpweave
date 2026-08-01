import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'smol-toml';

export const UNIFIED_CONFIG_FILENAME = 'unified.toml';
export const UNIFIED_CONFIG_RELATIVE_PATH = path.join('.unified', 'config', UNIFIED_CONFIG_FILENAME);

/**
 * Unified config sections, mirroring `config/unified.toml`.
 */
export interface UnifiedConfig {
  warpweave?: Record<string, unknown>;
  superpowers?: Record<string, unknown>;
  ponytail?: Record<string, unknown>;
  rtk?: Record<string, unknown>;
  pipeline?: Record<string, unknown>;
}

/**
 * Resolves the project-local unified config path, or undefined when absent.
 *
 * Looks in `.unified/config/unified.toml` relative to the given project path
 * (defaults to the current working directory).
 */
export function resolveUnifiedConfigPath(projectPath?: string): string | undefined {
  const base = projectPath ?? process.cwd();
  const candidate = path.join(base, UNIFIED_CONFIG_RELATIVE_PATH);
  return fs.existsSync(candidate) ? candidate : undefined;
}

/**
 * Loads and parses the project's unified config, or undefined when absent or invalid.
 */
export function loadUnifiedConfig(projectPath?: string): UnifiedConfig | undefined {
  const configPath = resolveUnifiedConfigPath(projectPath);
  if (!configPath) return undefined;

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return parse(raw) as UnifiedConfig;
  } catch {
    return undefined;
  }
}

/**
 * Human-readable one-liner summary of each unified section, used by `warpweave config list`.
 */
export function formatUnifiedConfigSummary(config: UnifiedConfig): string[] {
  const lines: string[] = [];

  const warpweave = config.warpweave;
  if (warpweave) {
    const schema = warpweave.schema ?? 'spec-driven';
    const profile = warpweave.profile ?? 'standard';
    lines.push(`  schema: ${String(schema)}, profile: ${String(profile)}`);
  }

  const superpowers = config.superpowers;
  if (superpowers) {
    const tdd = superpowers.tdd_mode ?? 'strict';
    const review = superpowers.subagent_review ?? true;
    lines.push(`  tdd_mode: ${String(tdd)}, subagent_review: ${String(review)}`);
  }

  const ponytail = config.ponytail;
  if (ponytail) {
    const mode = ponytail.mode ?? 'full';
    const yagni = ponytail.yagni_strict ?? true;
    lines.push(`  mode: ${String(mode)}, yagni_strict: ${String(yagni)}`);
  }

  const rtk = config.rtk;
  if (rtk) {
    const autoRewrite = rtk.auto_rewrite ?? true;
    const tee = rtk.tee_mode ?? 'failures';
    lines.push(`  auto_rewrite: ${String(autoRewrite)}, tee_mode: ${String(tee)}`);
  }

  const pipeline = config.pipeline;
  if (pipeline) {
    const gates = ['gate_spec', 'gate_plan', 'gate_tdd', 'gate_review']
      .map((gate) => `${gate}=${String(pipeline[gate] ?? false)}`)
      .join(' ');
    lines.push(`  ${gates}`);
  }

  return lines;
}
