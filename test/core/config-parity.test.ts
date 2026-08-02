import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

import { getSkillTemplates } from '../../src/core/shared/skill-generation.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const configDir = join(repoRoot, 'config');
const require = createRequire(import.meta.url);
const { version: WARPWEAVE_VERSION } = require('../../package.json');

function collectSkillIdentifiers(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) collectSkillIdentifiers(item, out);
  } else if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (/skill/i.test(key)) {
        if (typeof value === 'string') out.push(value);
        else if (Array.isArray(value)) out.push(...value.filter((v): v is string => typeof v === 'string'));
      }
      collectSkillIdentifiers(value, out);
    }
  }
  return out;
}

describe('config content parity', () => {
  it('declares [warpweave] and not [openspec] in config/unified.toml', () => {
    const toml = readFileSync(join(configDir, 'unified.toml'), 'utf8');
    expect(toml).toContain('[warpweave]');
    expect(toml).not.toContain('[openspec]');
  });

  it('uses the /ww: namespace in config/pipeline.yaml', () => {
    const pipelineYaml = readFileSync(join(configDir, 'pipeline.yaml'), 'utf8');
    expect(pipelineYaml).not.toContain('opsx');
    expect(pipelineYaml).toContain('/ww:explore');
  });

  it('resolves every pipeline skill identifier to a shipped template', () => {
    const pipelineYaml = readFileSync(join(configDir, 'pipeline.yaml'), 'utf8');
    const pipeline = parseYaml(pipelineYaml) as { pipeline: unknown };
    const templateNames = new Set(getSkillTemplates().map(({ dirName }) => dirName));

    const skills = collectSkillIdentifiers(pipeline.pipeline);
    expect(skills.length).toBeGreaterThan(0);
    for (const skill of skills) {
      expect(templateNames, `unknown skill '${skill}' in config/pipeline.yaml`).toContain(skill);
    }
  });

  it('keeps pipeline version in sync with package.json', () => {
    const pipelineYaml = readFileSync(join(configDir, 'pipeline.yaml'), 'utf8');
    const pipeline = parseYaml(pipelineYaml) as {
      pipeline: { version?: string };
    };
    expect(pipeline.pipeline.version).toBe(WARPWEAVE_VERSION);
  });

  it('keeps release notes free of replacement characters', () => {
    const sources = [join(repoRoot, 'CHANGELOG.md')];
    const changesetDir = join(repoRoot, '.changeset');
    if (existsSync(changesetDir)) {
      for (const file of readdirSync(changesetDir)) {
        if (file.endsWith('.md')) sources.push(join(changesetDir, file));
      }
    }
    for (const src of sources) {
      const content = readFileSync(src, 'utf8');
      expect(content, `replacement character (U+FFFD) in ${src}`).not.toContain('\uFFFD');
    }
  });

  it('derives init skill mapping from the single source in profile-sync-drift', () => {
    const initSrc = readFileSync(join(repoRoot, 'src/core/init.ts'), 'utf8');
    const profileSrc = readFileSync(join(repoRoot, 'src/core/profile-sync-drift.ts'), 'utf8');
    expect(profileSrc).toContain('export const WORKFLOW_TO_SKILL_DIR');
    expect(initSrc).toContain("import { WORKFLOW_TO_SKILL_DIR } from './profile-sync-drift.js'");
    expect(initSrc).not.toMatch(/const WORKFLOW_TO_SKILL_DIR\s*:/);
  });

  it('runs tests with vitest, not jest', () => {
    const pipelineYaml = readFileSync(join(configDir, 'pipeline.yaml'), 'utf8');
    const pipeline = parseYaml(pipelineYaml) as {
      pipeline: { phases?: Array<{ commands_rewritten?: { npm_test?: string } }> };
    };
    const npmTest = pipeline.pipeline.phases?.find((p) => p.commands_rewritten?.npm_test)?.commands_rewritten?.npm_test;
    expect(npmTest).toBeDefined();
    expect(npmTest).not.toContain('jest');
  });

  it('declares a [quality] minimum improvement threshold in config/unified.toml', () => {
    const toml = readFileSync(join(configDir, 'unified.toml'), 'utf8');
    expect(toml).toContain('[quality]');
    expect(toml).toContain('min_improvement');
  });
});
