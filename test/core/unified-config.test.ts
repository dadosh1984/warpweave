import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  loadUnifiedConfig,
  resolveUnifiedConfigPath,
  formatUnifiedConfigSummary,
  UNIFIED_CONFIG_FILENAME,
} from '../../src/core/unified-config.js';
import { UNIFIED_PROFILE_PRESETS } from '../../src/core/profiles.js';

describe('unified-config', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('returns undefined when no unified config exists', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-unified-test-'));
    expect(resolveUnifiedConfigPath(tempDir)).toBeUndefined();
    expect(loadUnifiedConfig(tempDir)).toBeUndefined();
  });

  it('resolves and parses .unified/config/unified.toml', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-unified-test-'));
    const configDir = path.join(tempDir, '.unified', 'config');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, UNIFIED_CONFIG_FILENAME),
      `[warpweave]\nschema = "spec-driven"\nprofile = "standard"\n\n[superpowers]\ntdd_mode = "strict"\n\n[ponytail]\nmode = "full"\n\n[rtk]\ntee_mode = "failures"\n\n[pipeline]\ngate_spec = true\ngate_tdd = true\n`
    );

    expect(resolveUnifiedConfigPath(tempDir)).toBe(path.join(configDir, UNIFIED_CONFIG_FILENAME));
    const config = loadUnifiedConfig(tempDir);
    expect(config?.warpweave?.schema).toBe('spec-driven');
    expect(config?.warpweave?.profile).toBe('standard');
    expect(config?.superpowers?.tdd_mode).toBe('strict');
    expect(config?.ponytail?.mode).toBe('full');
    expect(config?.rtk?.tee_mode).toBe('failures');
    expect(config?.pipeline?.gate_spec).toBe(true);
  });

  it('formats a human-readable summary of all sections', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-unified-test-'));
    const configDir = path.join(tempDir, '.unified', 'config');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, UNIFIED_CONFIG_FILENAME),
      `[warpweave]\nprofile = "standard"\n\n[superpowers]\nsubagent_review = false\n\n[ponytail]\nyagni_strict = true\n\n[rtk]\nauto_rewrite = true\n\n[pipeline]\ngate_review = false\n`
    );

    const lines = formatUnifiedConfigSummary(loadUnifiedConfig(tempDir)!);
    expect(lines.join('\n')).toContain('schema: spec-driven, profile: standard');
    expect(lines.join('\n')).toContain('tdd_mode: strict, subagent_review: false');
    expect(lines.join('\n')).toContain('gate_review=false');
  });

  it('falls back to defaults in the summary when a section omits fields', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-unified-test-'));
    const configDir = path.join(tempDir, '.unified', 'config');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, UNIFIED_CONFIG_FILENAME), `[warpweave]\n`);

    const lines = formatUnifiedConfigSummary(loadUnifiedConfig(tempDir)!);
    expect(lines.join('\n')).toContain('schema: spec-driven, profile: standard');
  });
});

describe('UNIFIED_PROFILE_PRESETS', () => {
  it('exposes minimal, standard, and enterprise presets', () => {
    const ids = UNIFIED_PROFILE_PRESETS.map((entry) => entry.id);
    expect(ids).toEqual(['minimal', 'standard', 'enterprise']);
  });

  it('each preset maps to a non-empty workflow set', () => {
    for (const preset of UNIFIED_PROFILE_PRESETS) {
      expect(preset.workflows.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });
});
