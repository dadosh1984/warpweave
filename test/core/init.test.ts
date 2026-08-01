import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { InitCommand } from '../../src/core/init.js';
import { saveGlobalConfig, getGlobalConfig } from '../../src/core/global-config.js';

const { confirmMock, showWelcomeScreenMock, searchableMultiSelectMock } = vi.hoisted(() => ({
  confirmMock: vi.fn(),
  showWelcomeScreenMock: vi.fn().mockResolvedValue(undefined),
  searchableMultiSelectMock: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  confirm: confirmMock,
}));

vi.mock('../../src/ui/welcome-screen.js', () => ({
  showWelcomeScreen: showWelcomeScreenMock,
}));

vi.mock('../../src/prompts/searchable-multi-select.js', () => ({
  searchableMultiSelect: searchableMultiSelectMock,
}));

describe('InitCommand', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-init-test-'));
    originalEnv = { ...process.env };
    // Use a temp dir for global config to avoid reading real config
    configTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-config-init-'));
    process.env.XDG_CONFIG_HOME = configTempDir;
    process.env.CODEX_HOME = path.join(testDir, 'codex-home');

    // Mock console.log to suppress output during tests
    vi.spyOn(console, 'log').mockImplementation(() => { });
    confirmMock.mockReset();
    confirmMock.mockResolvedValue(true);
    showWelcomeScreenMock.mockClear();
    searchableMultiSelectMock.mockReset();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('execute with --tools flag', () => {
    it('should create Warpweave directory structure', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(testDir);

      const openspecPath = path.join(testDir, 'warpweave');
      expect(await directoryExists(openspecPath)).toBe(true);
      expect(await directoryExists(path.join(openspecPath, 'specs'))).toBe(true);
      expect(await directoryExists(path.join(openspecPath, 'changes'))).toBe(true);
      expect(await directoryExists(path.join(openspecPath, 'changes', 'archive'))).toBe(true);
    });

    it('should copy unified config files to .unified/config', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(testDir);

      expect(await fileExists(path.join(testDir, '.unified', 'config', 'unified.toml'))).toBe(true);
      expect(await fileExists(path.join(testDir, '.unified', 'config', 'pipeline.yaml'))).toBe(true);
    });

    it('should copy AGENTS.md and .env.example to the project root', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(testDir);

      expect(await fileExists(path.join(testDir, 'AGENTS.md'))).toBe(true);
      expect(await fileExists(path.join(testDir, '.env.example'))).toBe(true);

      const agents = await fs.readFile(path.join(testDir, 'AGENTS.md'), 'utf-8');
      expect(agents).toContain('SPEC GATE');
      expect(agents).toContain('Superpowers');
      expect(agents).toContain('Ponytail');
      expect(agents).toContain('RTK');
    });

    it('should not overwrite an existing AGENTS.md in the project root', async () => {
      await fs.writeFile(path.join(testDir, 'AGENTS.md'), '# custom agents\n');

      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const agents = await fs.readFile(path.join(testDir, 'AGENTS.md'), 'utf-8');
      expect(agents).toBe('# custom agents\n');
    });

    it('should suggest unified external tools in the success message', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
      expect(logCalls.some((entry) => entry.includes('Unified tools'))).toBe(true);
      expect(logCalls.some((entry) => entry.includes('rtk init -g --opencode'))).toBe(true);
      expect(logCalls.some((entry) => entry.includes('superpowers'))).toBe(true);
      expect(logCalls.some((entry) => entry.includes('ponytail'))).toBe(true);
    });

    it('should create config.yaml with default schema', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(testDir);

      const configPath = path.join(testDir, 'warpweave', 'config.yaml');
      expect(await fileExists(configPath)).toBe(true);

      const content = await fs.readFile(configPath, 'utf-8');
      expect(content).toContain('schema: spec-driven');
    });

    it('should create core profile skills for Claude Code by default', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(testDir);

      // Core profile: propose, explore, apply, update, sync, archive
      const coreSkillNames = [
        'warpweave-propose',
        'warpweave-explore',
        'warpweave-apply-change',
        'warpweave-update-change',
        'warpweave-sync-specs',
        'warpweave-archive-change',
      ];

      for (const skillName of coreSkillNames) {
        const skillFile = path.join(testDir, '.claude', 'skills', skillName, 'SKILL.md');
        expect(await fileExists(skillFile)).toBe(true);

        const content = await fs.readFile(skillFile, 'utf-8');
        expect(content).toContain('---');
        expect(content).toContain('name:');
        expect(content).toContain('description:');
      }

      // Non-core skills should NOT be created
      const nonCoreSkillNames = [
        'warpweave-new-change',
        'warpweave-continue-change',
        'warpweave-ff-change',
        'warpweave-bulk-archive-change',
        'warpweave-verify-change',
      ];

      for (const skillName of nonCoreSkillNames) {
        const skillFile = path.join(testDir, '.claude', 'skills', skillName, 'SKILL.md');
        expect(await fileExists(skillFile)).toBe(false);
      }
    });

    it('should create core profile commands for Claude Code by default', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(testDir);

      // Core profile: propose, explore, apply, update, sync, archive
      const coreCommandNames = [
        'ww/propose.md',
        'ww/explore.md',
        'ww/apply.md',
        'ww/update.md',
        'ww/sync.md',
        'ww/archive.md',
      ];

      for (const cmdName of coreCommandNames) {
        const cmdFile = path.join(testDir, '.claude', 'commands', cmdName);
        expect(await fileExists(cmdFile)).toBe(true);
      }

      // Non-core commands should NOT be created
      const nonCoreCommandNames = [
        'ww/new.md',
        'ww/continue.md',
        'ww/ff.md',
        'ww/bulk-archive.md',
        'ww/verify.md',
      ];

      for (const cmdName of nonCoreCommandNames) {
        const cmdFile = path.join(testDir, '.claude', 'commands', cmdName);
        expect(await fileExists(cmdFile)).toBe(false);
      }
    });

    it('should create skills in Cursor skills directory', async () => {
      const initCommand = new InitCommand({ tools: 'cursor', force: true });

      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.cursor', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);
    });

    it('should route the retired windsurf id to Devin Desktop', async () => {
      // Windsurf was rebranded to Devin Desktop; `--tools windsurf` still
      // resolves so an existing setup script keeps working, but it configures
      // the current tool and writes the current directory.
      const initCommand = new InitCommand({ tools: 'windsurf', force: true });

      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.devin', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);
      expect(
        await fileExists(path.join(testDir, '.windsurf', 'skills', 'warpweave-explore', 'SKILL.md'))
      ).toBe(false);
    });

    it('should generate ZCode skills and commands under .zcode without creating .agents', async () => {
      const initCommand = new InitCommand({ tools: 'zcode', force: true });

      await initCommand.execute(testDir);

      // Core profile skills land under .zcode/skills
      const exploreSkill = path.join(testDir, '.zcode', 'skills', 'warpweave-explore', 'SKILL.md');
      const proposeSkill = path.join(testDir, '.zcode', 'skills', 'warpweave-propose', 'SKILL.md');
      expect(await fileExists(exploreSkill)).toBe(true);
      expect(await fileExists(proposeSkill)).toBe(true);

      // Core profile commands land under .zcode/commands/ww
      const exploreCmd = path.join(testDir, '.zcode', 'commands', 'ww', 'explore.md');
      const proposeCmd = path.join(testDir, '.zcode', 'commands', 'ww', 'propose.md');
      expect(await fileExists(exploreCmd)).toBe(true);
      expect(await fileExists(proposeCmd)).toBe(true);

      const cmdContent = await fs.readFile(exploreCmd, 'utf-8');
      expect(cmdContent).toContain('---');
      expect(cmdContent).toContain('name:');
      expect(cmdContent).toContain('description:');
      expect(cmdContent).toContain('category:');
      expect(cmdContent).toContain('tags:');

      // ZCode writes only to its own root; selecting it must never create another
      // tool's root, including the shared .agents target.
      expect(await directoryExists(path.join(testDir, '.agents'))).toBe(false);
    });

    it('should support the shared agents target as an adapterless skills-only tool', async () => {
      saveGlobalConfig({
        featureFlags: {},
        profile: 'core',
        delivery: 'both',
      });

      const initCommand = new InitCommand({ tools: 'agents', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.agents', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      const commandsDir = path.join(testDir, '.agents', 'commands');
      expect(await directoryExists(commandsDir)).toBe(false);

      const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
      expect(
        logCalls.some(
          (entry) => entry.includes('Commands skipped for: agents') && entry.includes('(no adapter)'),
        ),
      ).toBe(true);
    });

    it('should support Kimi Code as an adapterless skills-only tool', async () => {
      saveGlobalConfig({
        featureFlags: {},
        profile: 'core',
        delivery: 'both',
      });

      const initCommand = new InitCommand({ tools: 'kimi', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.kimi-code', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      const commandsDir = path.join(testDir, '.kimi-code', 'commands');
      expect(await directoryExists(commandsDir)).toBe(false);

      const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
      expect(
        logCalls.some(
          (entry) => entry.includes('Commands skipped for: kimi') && entry.includes('(no adapter)'),
        ),
      ).toBe(true);
    });

    it('should support CodeArts as an adapterless skills-only tool', async () => {
      saveGlobalConfig({
        featureFlags: {},
        profile: 'core',
        delivery: 'both',
      });

      const initCommand = new InitCommand({ tools: 'codeartsagent', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.codeartsdoer', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      const commandsDir = path.join(testDir, '.codeartsdoer', 'commands');
      expect(await directoryExists(commandsDir)).toBe(false);

      const codeArtsLogCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
      expect(codeArtsLogCalls.some((entry) => entry.includes('Created: CodeArts'))).toBe(true);
      expect(
        codeArtsLogCalls.some(
          (entry) => entry.includes('Commands skipped for: codeartsagent') && entry.includes('(no adapter)'),
        ),
      ).toBe(true);
    });

    it('should support Hermes Agent as an adapterless skills-only tool with a setup note', async () => {
      saveGlobalConfig({
        featureFlags: {},
        profile: 'core',
        delivery: 'both',
      });

      const initCommand = new InitCommand({ tools: 'hermes', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.hermes', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      const commandsDir = path.join(testDir, '.hermes', 'commands');
      expect(await directoryExists(commandsDir)).toBe(false);

      const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
      expect(
        logCalls.some(
          (entry) => entry.includes('Commands skipped for: hermes') && entry.includes('(no adapter)'),
        ),
      ).toBe(true);
      expect(
        logCalls.some(
          (entry) => entry.includes('Setup required for Hermes Agent') && entry.includes('skills.external_dirs'),
        ),
      ).toBe(true);
    });

    it('should migrate Warpweave skills from legacy .kimi to .kimi-code during init', async () => {
      const legacySkillDir = path.join(testDir, '.kimi', 'skills', 'warpweave-explore');
      await fs.mkdir(legacySkillDir, { recursive: true });
      await fs.writeFile(
        path.join(legacySkillDir, 'SKILL.md'),
        `---\nname: warpweave-explore\nmetadata:\n  author: openspec\n  version: "0.9"\n---\n\nOld instructions content\n`
      );
      await fs.writeFile(path.join(testDir, '.kimi', 'config.toml'), 'user config');

      const initCommand = new InitCommand({ tools: 'kimi', force: true });
      await initCommand.execute(testDir);

      // Regenerated in the new location, legacy managed skill removed
      const newSkill = path.join(testDir, '.kimi-code', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(newSkill)).toBe(true);
      expect(await directoryExists(legacySkillDir)).toBe(false);

      // User files under .kimi are preserved
      expect(await fileExists(path.join(testDir, '.kimi', 'config.toml'))).toBe(true);
    });

    it('should create both skills and commands for Trae with adapter', async () => {
      saveGlobalConfig({
        featureFlags: {},
        profile: 'core',
        delivery: 'both',
      });

      const initCommand = new InitCommand({ tools: 'trae', force: true });
      await initCommand.execute(testDir);

      // Skills should be created
      const skillFile = path.join(testDir, '.trae', 'skills', 'warpweave-explore', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      // Commands should also be created (Trae has an adapter)
      const commandFile = path.join(testDir, '.trae', 'commands', 'ww-explore.md');
      expect(await fileExists(commandFile)).toBe(true);

      const commandContent = await fs.readFile(commandFile, 'utf-8');
      expect(commandContent).toContain('---');
      expect(commandContent).toContain('name:');
      expect(commandContent).toContain('description:');
    });

    it.each(['both', 'skills', 'commands'] as const)(
      'should create Codex skills and no global prompts when delivery=%s',
      async (delivery) => {
        saveGlobalConfig({
          featureFlags: {},
          profile: 'core',
          delivery,
        });

        const initCommand = new InitCommand({ tools: 'codex', force: true });
        await initCommand.execute(testDir);

        const skillFile = path.join(testDir, '.codex', 'skills', 'warpweave-explore', 'SKILL.md');
        expect(await fileExists(skillFile)).toBe(true);

        const promptFile = path.join(process.env.CODEX_HOME!, 'prompts', 'ww-explore.md');
        expect(await fileExists(promptFile)).toBe(false);
      }
    );

    it('should create skills for multiple tools at once', async () => {
      const initCommand = new InitCommand({ tools: 'claude,cursor', force: true });

      await initCommand.execute(testDir);

      const claudeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'warpweave-explore', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
    });

    it('should select all tools with --tools all option', async () => {
      const initCommand = new InitCommand({ tools: 'all', force: true });

      await initCommand.execute(testDir);

      // Check a few representative tools
      const claudeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const codeArtsSkill = path.join(testDir, '.codeartsdoer', 'skills', 'warpweave-explore', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'warpweave-explore', 'SKILL.md');
      const devinSkill = path.join(testDir, '.devin', 'skills', 'warpweave-explore', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(codeArtsSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
      expect(await fileExists(devinSkill)).toBe(true);
    });

    it('should skip tool configuration with --tools none option', async () => {
      const initCommand = new InitCommand({ tools: 'none', force: true });

      await initCommand.execute(testDir);

      // Should create Warpweave structure but no skills
      const openspecPath = path.join(testDir, 'warpweave');
      expect(await directoryExists(openspecPath)).toBe(true);

      // No tool-specific directories should be created
      const claudeSkillsDir = path.join(testDir, '.claude', 'skills');
      expect(await directoryExists(claudeSkillsDir)).toBe(false);
    });

    it('should throw error for invalid tool names', async () => {
      const initCommand = new InitCommand({ tools: 'invalid-tool', force: true });

      await expect(initCommand.execute(testDir)).rejects.toThrow(/Invalid tool\(s\): invalid-tool/);
    });

    it('should handle comma-separated tool names with spaces', async () => {
      const initCommand = new InitCommand({ tools: 'claude, cursor', force: true });

      await initCommand.execute(testDir);

      const claudeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'warpweave-explore', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
    });

    it('should reject combining reserved keywords with explicit tool ids', async () => {
      const initCommand = new InitCommand({ tools: 'all,claude', force: true });

      await expect(initCommand.execute(testDir)).rejects.toThrow(
        /Cannot combine reserved values "all" or "none" with specific tool IDs/
      );
    });

    it('should not create config.yaml if it already exists', async () => {
      // Pre-create config.yaml
      const openspecDir = path.join(testDir, 'warpweave');
      await fs.mkdir(openspecDir, { recursive: true });
      const configPath = path.join(openspecDir, 'config.yaml');
      const existingContent = 'schema: custom-schema\n';
      await fs.writeFile(configPath, existingContent);

      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const content = await fs.readFile(configPath, 'utf-8');
      expect(content).toBe(existingContent);
    });

    it('should handle non-existent target directory', async () => {
      const newDir = path.join(testDir, 'new-project');
      const initCommand = new InitCommand({ tools: 'claude', force: true });

      await initCommand.execute(newDir);

      const openspecPath = path.join(newDir, 'warpweave');
      expect(await directoryExists(openspecPath)).toBe(true);
    });

    it('should work in extend mode (re-running init)', async () => {
      const initCommand1 = new InitCommand({ tools: 'claude', force: true });
      await initCommand1.execute(testDir);

      // Run init again with a different tool
      const initCommand2 = new InitCommand({ tools: 'cursor', force: true });
      await initCommand2.execute(testDir);

      // Both tools should have skills
      const claudeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const cursorSkill = path.join(testDir, '.cursor', 'skills', 'warpweave-explore', 'SKILL.md');

      expect(await fileExists(claudeSkill)).toBe(true);
      expect(await fileExists(cursorSkill)).toBe(true);
    });

    it('should refresh skills on re-run for the same tool', async () => {
      const initCommand1 = new InitCommand({ tools: 'claude', force: true });
      await initCommand1.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const originalContent = await fs.readFile(skillFile, 'utf-8');

      // Modify the file
      await fs.writeFile(skillFile, '# Modified content\n');

      // Run init again
      const initCommand2 = new InitCommand({ tools: 'claude', force: true });
      await initCommand2.execute(testDir);

      const newContent = await fs.readFile(skillFile, 'utf-8');
      expect(newContent).toBe(originalContent);
    });
  });

  describe('skill content validation', () => {
    it('should generate valid SKILL.md with YAML frontmatter', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      // Should have YAML frontmatter
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('name: warpweave-explore');
      expect(content).toContain('description:');
      expect(content).toContain('license:');
      expect(content).toContain('compatibility:');
      expect(content).toContain('metadata:');
      expect(content).toMatch(/---\n\n/); // End of frontmatter
    });

    it('should include explore mode instructions', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toContain('Enter explore mode');
      expect(content).toContain('thinking partner');
    });

    it('should include propose skill instructions', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-propose', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toContain('name: warpweave-propose');
    });

    it('should include apply-change skill instructions', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-apply-change', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      expect(content).toContain('name: warpweave-apply-change');
    });

    it('should embed generatedBy version in skill files', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
      const content = await fs.readFile(skillFile, 'utf-8');

      // Should contain generatedBy field with a version string
      expect(content).toMatch(/generatedBy:\s*["']?\d+\.\d+\.\d+["']?/);
    });
  });

  describe('command generation', () => {
    it('should generate Claude Code commands with correct format', async () => {
      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.claude', 'commands', 'ww', 'explore.md');
      const content = await fs.readFile(cmdFile, 'utf-8');

      // Claude commands use YAML frontmatter
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('name:');
      expect(content).toContain('description:');
    });

    it('should generate Cursor commands with correct format', async () => {
      const initCommand = new InitCommand({ tools: 'cursor', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.cursor', 'commands', 'ww-explore.md');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toMatch(/^---\n/);
    });
  });

  describe('error handling', () => {
    it('should provide helpful error for insufficient permissions', async () => {
      // Mock the permission check to fail
      const readOnlyDir = path.join(testDir, 'readonly');
      await fs.mkdir(readOnlyDir);

      const originalWriteFile = fs.writeFile;
      vi.spyOn(fs, 'writeFile').mockImplementation(
        async (filePath: any, ...args: any[]) => {
          if (
            typeof filePath === 'string' &&
            filePath.includes('.warpweave-test-')
          ) {
            throw new Error('EACCES: permission denied');
          }
          return (originalWriteFile as any)(filePath, ...args);
        }
      );

      const initCommand = new InitCommand({ tools: 'claude', force: true });
      await expect(initCommand.execute(readOnlyDir)).rejects.toThrow(/Insufficient permissions/);
    });

    it('should throw error in non-interactive mode without --tools flag and no detected tools', async () => {
      const initCommand = new InitCommand({ interactive: false });

      await expect(initCommand.execute(testDir)).rejects.toThrow(/No tools detected and no --tools flag/);
    });
  });

  describe('tool-specific adapters', () => {
    it('should generate Gemini CLI commands as TOML files', async () => {
      const initCommand = new InitCommand({ tools: 'gemini', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.gemini', 'commands', 'ww', 'explore.toml');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toContain('description =');
      expect(content).toContain('prompt =');
    });

    it('should generate Devin workflows for the retired windsurf id', async () => {
      const initCommand = new InitCommand({ tools: 'windsurf', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.devin', 'workflows', 'ww-explore.md');
      expect(await fileExists(cmdFile)).toBe(true);
    });

    it('should generate Devin Desktop workflows that reference the hyphen form Devin registers', async () => {
      const initCommand = new InitCommand({ tools: 'devin', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.devin', 'workflows', 'ww-apply.md');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toMatch(/^---\nname: "/);
      expect(content).toContain('category: "Workflow"');
      // Devin discovers `.devin/workflows/ww-apply.md` as `/ww-apply`.
      expect(content).toContain('/ww-');
      expect(content).not.toContain('/ww:');
    });

    it('should generate Devin Desktop skills that reference skills, not workflows', async () => {
      const initCommand = new InitCommand({ tools: 'devin', force: true });
      await initCommand.execute(testDir);

      // The Devin Local agent has no workflows, so skill bodies must point at
      // `/warpweave-*` skills, which both Devin agents accept.
      const skillFile = path.join(testDir, '.devin', 'skills', 'warpweave-apply-change', 'SKILL.md');
      expect(await fileExists(skillFile)).toBe(true);

      const content = await fs.readFile(skillFile, 'utf-8');
      expect(content).toContain('/warpweave-apply-change');
      expect(content).not.toContain('/ww:');
      expect(content).not.toContain('/ww-');
    });

    it('should generate Continue prompt files', async () => {
      const initCommand = new InitCommand({ tools: 'continue', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.continue', 'prompts', 'ww-explore.prompt');
      expect(await fileExists(cmdFile)).toBe(true);

      const content = await fs.readFile(cmdFile, 'utf-8');
      expect(content).toContain('name: "ww-explore"');
      expect(content).toContain('invokable: true');
    });

    it('should generate Cline workflow files', async () => {
      const initCommand = new InitCommand({ tools: 'cline', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.clinerules', 'workflows', 'ww-explore.md');
      expect(await fileExists(cmdFile)).toBe(true);
    });

    it('should generate GitHub Copilot prompt files', async () => {
      const initCommand = new InitCommand({ tools: 'github-copilot', force: true });
      await initCommand.execute(testDir);

      const cmdFile = path.join(testDir, '.github', 'prompts', 'ww-explore.prompt.md');
      expect(await fileExists(cmdFile)).toBe(true);
    });
  });
});

describe('InitCommand - profile and detection features', () => {
  let testDir: string;
  let configTempDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-init-profile-test-'));
    originalEnv = { ...process.env };
    // Use a temp dir for global config to avoid polluting real config
    configTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-config-test-'));
    process.env.XDG_CONFIG_HOME = configTempDir;
    process.env.CODEX_HOME = path.join(testDir, 'codex-home');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    confirmMock.mockReset();
    confirmMock.mockResolvedValue(true);
    showWelcomeScreenMock.mockClear();
    searchableMultiSelectMock.mockReset();
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.rm(configTempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('should use --profile flag to override global config', async () => {
    // Set global config to custom profile
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'both',
      workflows: ['explore', 'new', 'apply'],
    });

    // Override with --profile core
    const initCommand = new InitCommand({ tools: 'claude', force: true, profile: 'core' });
    await initCommand.execute(testDir);

    // Core profile skills should be created
    const proposeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-propose', 'SKILL.md');
    expect(await fileExists(proposeSkill)).toBe(true);

    // Non-core skills (from the custom profile) should NOT be created
    const newChangeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-new-change', 'SKILL.md');
    expect(await fileExists(newChangeSkill)).toBe(false);
  });

  it('should reject invalid --profile values', async () => {
    const initCommand = new InitCommand({
      tools: 'claude',
      force: true,
      profile: 'invalid-profile',
    });

    await expect(initCommand.execute(testDir)).rejects.toThrow(
      /Invalid profile "invalid-profile"/
    );
  });

  it('should use detected tools in non-interactive mode when no --tools flag', async () => {
    // Create a .claude directory to simulate detected tool
    await fs.mkdir(path.join(testDir, '.claude'), { recursive: true });

    const initCommand = new InitCommand({ interactive: false, force: true });
    await initCommand.execute(testDir);

    // Should have used claude (detected)
    const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);
  });

  it('should auto-cleanup legacy artifacts in non-interactive mode without --force', async () => {
    // Create legacy OpenCode command files (singular 'command' path)
    const legacyDir = path.join(testDir, '.opencode', 'command');
    await fs.mkdir(legacyDir, { recursive: true });
    await fs.writeFile(path.join(legacyDir, 'ww-propose.md'), 'legacy content');

    // Run init in non-interactive mode without --force
    const initCommand = new InitCommand({ tools: 'opencode' });
    await initCommand.execute(testDir);

    // Legacy files should be cleaned up automatically
    expect(await fileExists(path.join(legacyDir, 'ww-propose.md'))).toBe(false);

    // New commands should be at the correct plural path
    const newCommandsDir = path.join(testDir, '.opencode', 'commands');
    expect(await directoryExists(newCommandsDir)).toBe(true);
  });

  it('should remove managed global Codex prompts in non-interactive mode', async () => {
    const promptDir = path.join(process.env.CODEX_HOME!, 'prompts');
    const legacyPrompt = path.join(promptDir, 'ww-apply.md');
    await fs.mkdir(promptDir, { recursive: true });
    await fs.writeFile(legacyPrompt, 'legacy apply prompt');

    const initCommand = new InitCommand({ tools: 'codex' });
    await initCommand.execute(testDir);

    expect(await fileExists(legacyPrompt)).toBe(false);
    expect(await fileExists(
      path.join(testDir, '.codex', 'skills', 'warpweave-apply-change', 'SKILL.md')
    )).toBe(true);
  });

  it('should preserve legacy Codex prompts without replacement skills during non-interactive init', async () => {
    const promptDir = path.join(process.env.CODEX_HOME!, 'prompts');
    const legacyPrompt = path.join(promptDir, 'ww-onboard.md');
    await fs.mkdir(promptDir, { recursive: true });
    await fs.writeFile(legacyPrompt, 'legacy onboard prompt');

    const initCommand = new InitCommand({ tools: 'codex' });
    await initCommand.execute(testDir);

    expect(await fileExists(legacyPrompt)).toBe(true);
    expect(await fileExists(
      path.join(testDir, '.codex', 'skills', 'warpweave-explore', 'SKILL.md')
    )).toBe(true);
    expect(await fileExists(
      path.join(testDir, '.codex', 'skills', 'warpweave-onboard', 'SKILL.md')
    )).toBe(false);
  });

  it('should defer global Codex prompt removal messaging until after interactive tool selection', async () => {
    const promptDir = path.join(process.env.CODEX_HOME!, 'prompts');
    const legacyPrompt = path.join(promptDir, 'ww-apply.md');
    await fs.mkdir(promptDir, { recursive: true });
    await fs.writeFile(legacyPrompt, 'legacy apply prompt');

    searchableMultiSelectMock.mockResolvedValue(['codex']);

    const initCommand = new InitCommand({ force: true });
    vi.spyOn(initCommand as any, 'canPromptInteractively').mockReturnValue(true);

    await initCommand.execute(testDir);

    const toolSelectionOrder = searchableMultiSelectMock.mock.invocationCallOrder[0];
    const consoleLogMock = console.log as ReturnType<typeof vi.fn>;
    const logsBeforeSelection = consoleLogMock.mock.calls
      .filter((_, index) => consoleLogMock.mock.invocationCallOrder[index] < toolSelectionOrder)
      .flat()
      .join('\n');

    expect(logsBeforeSelection).toContain('Deferred global prompts cleanup');
    expect(logsBeforeSelection).toContain('will only be removed after matching replacement skills are installed');
    expect(logsBeforeSelection).toContain(`codex: ${legacyPrompt}`);
    expect(await fileExists(legacyPrompt)).toBe(false);
  });

  it('should preselect configured tools but not directory-detected tools in extend mode', async () => {
    // Simulate existing Warpweave project (extend mode).
    await fs.mkdir(path.join(testDir, 'warpweave'), { recursive: true });

    // Configured with OpenSpec
    const claudeSkillDir = path.join(testDir, '.claude', 'skills', 'warpweave-explore');
    await fs.mkdir(claudeSkillDir, { recursive: true });
    await fs.writeFile(path.join(claudeSkillDir, 'SKILL.md'), 'configured');

    // Directory detected only (not configured with Warpweave)
    await fs.mkdir(path.join(testDir, '.github'), { recursive: true });
    await fs.writeFile(path.join(testDir, '.github', 'copilot-instructions.md'), '');

    searchableMultiSelectMock.mockResolvedValue(['claude']);

    const initCommand = new InitCommand({ force: true });
    vi.spyOn(initCommand as any, 'canPromptInteractively').mockReturnValue(true);

    await initCommand.execute(testDir);

    expect(searchableMultiSelectMock).toHaveBeenCalledTimes(1);
    const [{ choices }] = searchableMultiSelectMock.mock.calls[0] as [{ choices: Array<{ value: string; preSelected?: boolean; detected?: boolean }> }];

    const claude = choices.find((choice) => choice.value === 'claude');
    const githubCopilot = choices.find((choice) => choice.value === 'github-copilot');

    expect(claude?.preSelected).toBe(true);
    expect(githubCopilot?.preSelected).toBe(false);
    expect(githubCopilot?.detected).toBe(true);
  });

  it('should preselect detected tools for first-time interactive setup', async () => {
    // First-time init: no openspec/ directory and no configured Warpweave skills.
    await fs.mkdir(path.join(testDir, '.github'), { recursive: true });
    await fs.writeFile(path.join(testDir, '.github', 'copilot-instructions.md'), '');

    searchableMultiSelectMock.mockResolvedValue(['github-copilot']);

    const initCommand = new InitCommand({ force: true });
    vi.spyOn(initCommand as any, 'canPromptInteractively').mockReturnValue(true);

    await initCommand.execute(testDir);

    expect(searchableMultiSelectMock).toHaveBeenCalledTimes(1);
    const [{ choices }] = searchableMultiSelectMock.mock.calls[0] as [{ choices: Array<{ value: string; preSelected?: boolean }> }];
    const githubCopilot = choices.find((choice) => choice.value === 'github-copilot');

    expect(githubCopilot?.preSelected).toBe(true);
  });

  it('should respect custom profile from global config', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'both',
      workflows: ['explore', 'new'],
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    // Custom profile skills should be created
    const exploreSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    const newChangeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-new-change', 'SKILL.md');
    expect(await fileExists(exploreSkill)).toBe(true);
    expect(await fileExists(newChangeSkill)).toBe(true);

    // Non-selected skills should NOT be created
    const proposeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-propose', 'SKILL.md');
    expect(await fileExists(proposeSkill)).toBe(false);
  });

  it('should migrate commands-only extend mode to custom profile without injecting propose', async () => {
    await fs.mkdir(path.join(testDir, 'warpweave'), { recursive: true });
    await fs.mkdir(path.join(testDir, '.claude', 'commands', 'ww'), { recursive: true });
    await fs.writeFile(path.join(testDir, '.claude', 'commands', 'ww', 'explore.md'), '# explore\n');

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    const config = getGlobalConfig();
    expect(config.profile).toBe('custom');
    expect(config.delivery).toBe('commands');
    expect(config.workflows).toEqual(['explore']);

    const exploreCommand = path.join(testDir, '.claude', 'commands', 'ww', 'explore.md');
    const proposeCommand = path.join(testDir, '.claude', 'commands', 'ww', 'propose.md');
    expect(await fileExists(exploreCommand)).toBe(true);
    expect(await fileExists(proposeCommand)).toBe(false);

    const exploreSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    const proposeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-propose', 'SKILL.md');
    expect(await fileExists(exploreSkill)).toBe(false);
    expect(await fileExists(proposeSkill)).toBe(false);
  });

  it('should not prompt for confirmation when applying custom profile in interactive init', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'custom',
      delivery: 'both',
      workflows: ['explore', 'new'],
    });

    const initCommand = new InitCommand({ force: true });
    vi.spyOn(initCommand as any, 'canPromptInteractively').mockReturnValue(true);
    vi.spyOn(initCommand as any, 'getSelectedTools').mockResolvedValue(['claude']);

    await initCommand.execute(testDir);

    expect(showWelcomeScreenMock).toHaveBeenCalled();
    // The welcome screen must be handed the profile's workflows, otherwise it
    // advertises commands this profile never installs.
    expect(showWelcomeScreenMock).toHaveBeenCalledWith(['explore', 'new'], { animate: true });
    expect(confirmMock).not.toHaveBeenCalled();

    const exploreSkill = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    const newChangeSkill = path.join(testDir, '.claude', 'skills', 'warpweave-new-change', 'SKILL.md');
    expect(await fileExists(exploreSkill)).toBe(true);
    expect(await fileExists(newChangeSkill)).toBe(true);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    expect(logCalls.some((entry) => entry.includes('Applying custom profile'))).toBe(false);
  });

  it('should respect delivery=skills setting (no commands)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'skills',
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    // Skills should exist
    const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);

    // Commands should NOT exist
    const cmdFile = path.join(testDir, '.claude', 'commands', 'ww', 'explore.md');
    expect(await fileExists(cmdFile)).toBe(false);

    // Skill content should reference skills, not commands that were never generated
    const skillContent = await fs.readFile(skillFile, 'utf-8');
    expect(skillContent).not.toContain('/ww:');
    expect(skillContent).not.toContain('/ww-');
    expect(skillContent).toContain('/warpweave-');

    // update-change references several other workflows; a command missing
    // from the reference map would leave a raw /ww: reference behind
    const updateSkillContent = await fs.readFile(
      path.join(testDir, '.claude', 'skills', 'warpweave-update-change', 'SKILL.md'),
      'utf-8'
    );
    expect(updateSkillContent).not.toContain('/ww:');
    expect(updateSkillContent).not.toContain('/ww-');
    expect(updateSkillContent).toContain('/warpweave-');
  });

  it('should use skill references for adapterless tools under default delivery (#1155)', async () => {
    // Kimi Code has no command adapter: commands are skipped even when
    // delivery is 'both', so generated skills must not reference /ww:*
    const initCommand = new InitCommand({ tools: 'kimi', force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.kimi-code', 'skills', 'warpweave-apply-change', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);

    const skillContent = await fs.readFile(skillFile, 'utf-8');
    expect(skillContent).not.toContain('/ww:');
    expect(skillContent).not.toContain('/ww-');
    // Kimi Code documents /skill:<name> invocations (docs/supported-tools.md)
    expect(skillContent).toContain('/skill:warpweave-');

    // The getting-started hint must point at the skill, not a missing command
    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHint = logCalls.find((entry) => entry.includes('Start your first change'));
    expect(startHint).toContain('/skill:warpweave-propose');
    expect(startHint).not.toContain('/ww:propose');
  });

  it('should print a configuration correction, not a dead hint, when delivery=commands generates nothing (adapterless tool)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'commands',
    });

    const initCommand = new InitCommand({ tools: 'kimi', force: true });
    await initCommand.execute(testDir);

    // Kimi has no command adapter and delivery excludes skills: nothing is generated
    expect(await fileExists(path.join(testDir, '.kimi-code', 'skills', 'warpweave-explore', 'SKILL.md'))).toBe(false);
    expect(await fileExists(path.join(testDir, '.kimi-code', 'commands'))).toBe(false);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    // No invocation hint may be shown — neither /ww:* nor a skill reference exists
    expect(logCalls.some((entry) => entry.includes('Start your first change'))).toBe(false);
    const correction = logCalls.find((entry) => entry.includes('No skills or commands were generated'));
    expect(correction).toBeTruthy();
    expect(correction).toContain("warpweave config set delivery both");
    // Nothing was generated, so there is nothing an IDE restart would pick up
    expect(logCalls.some((entry) => entry.includes('Restart your IDE'))).toBe(false);
  });

  it('should print one usable hint per invocation syntax when adapterless tools disagree', async () => {
    // kimi documents /skill:<name>, vibe documents /<name> — every advertised
    // instruction must be usable by the tool it is labeled for
    const initCommand = new InitCommand({ tools: 'kimi,vibe', force: true });
    await initCommand.execute(testDir);

    // Each tool's own skill files still use its documented syntax
    const kimiSkill = await fs.readFile(
      path.join(testDir, '.kimi-code', 'skills', 'warpweave-apply-change', 'SKILL.md'),
      'utf-8'
    );
    const vibeSkill = await fs.readFile(
      path.join(testDir, '.vibe', 'skills', 'warpweave-apply-change', 'SKILL.md'),
      'utf-8'
    );
    expect(kimiSkill).toContain('/skill:warpweave-');
    expect(vibeSkill).toContain('/warpweave-');
    expect(vibeSkill).not.toContain('/skill:');

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    expect(startHints).toHaveLength(2);
    const kimiHint = startHints.find((entry) => entry.includes('Kimi Code'));
    const vibeHint = startHints.find((entry) => entry.includes('Mistral Vibe'));
    expect(kimiHint).toContain('/skill:warpweave-propose');
    expect(vibeHint).toContain('/warpweave-propose');
    expect(vibeHint).not.toContain('/skill:');
    for (const hint of startHints) {
      expect(hint).not.toContain('/ww:');
    }
  });

  it('should print the $-prefixed skill hint for codex (skills-invocable, no slash surface)', async () => {
    // Codex has no slash-command surface: it invokes skills as $<name>, so the
    // hint - and the generated skills - must use that form, never /ww:*
    const initCommand = new InitCommand({ tools: 'codex', force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.codex', 'skills', 'warpweave-apply-change', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);
    const skillContent = await fs.readFile(skillFile, 'utf-8');
    expect(skillContent).not.toContain('/ww:');
    expect(skillContent).toContain('$warpweave-');

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHint = logCalls.find((entry) => entry.includes('Start your first change'));
    expect(startHint).toContain('$warpweave-propose');
    expect(startHint).not.toContain('/warpweave-propose');
    expect(startHint).not.toContain('/ww:propose');

    // No slash commands were generated, so the restart line must not claim any
    const restartHint = logCalls.find((entry) => entry.includes('Restart your IDE'));
    expect(restartHint).toContain('Restart your IDE for the new skills to take effect.');
    expect(restartHint).not.toContain('slash commands');
  });

  it('should print the @-prefixed prompt hint for amazon-q (prompt library, no slash surface)', async () => {
    // Amazon Q loads .amazonq/prompts/ww-<id>.md into its prompt library,
    // invoked as @ww-<id>. It registers no slash command under any spelling,
    // so neither the hint, the generated prompts, the skills, nor the restart
    // line may name one.
    const initCommand = new InitCommand({ tools: 'amazon-q', force: true });
    await initCommand.execute(testDir);

    const promptFile = path.join(testDir, '.amazonq', 'prompts', 'ww-apply.md');
    const skillFile = path.join(testDir, '.amazonq', 'skills', 'warpweave-apply-change', 'SKILL.md');
    for (const file of [promptFile, skillFile]) {
      expect(await fileExists(file)).toBe(true);
      const content = await fs.readFile(file, 'utf-8');
      expect(content).toContain('@ww-apply');
      expect(content).not.toContain('/ww:');
      expect(content).not.toContain('/ww-');
    }

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHint = logCalls.find((entry) => entry.includes('Start your first change'));
    expect(startHint).toContain('@ww-propose');
    expect(startHint).not.toContain('/ww-propose');
    expect(startHint).not.toContain('/ww:propose');

    // Commands were generated, but they are not slash commands.
    const restartHint = logCalls.find((entry) => entry.includes('Restart your IDE'));
    expect(restartHint).toContain('Restart your IDE for the new commands to take effect.');
    expect(restartHint).not.toContain('slash commands');
  });

  it('should label the codex hint separately when mixed with a slash-invocable adapterless tool', async () => {
    const initCommand = new InitCommand({ tools: 'codex,vibe', force: true });
    await initCommand.execute(testDir);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    expect(startHints).toHaveLength(2);
    const codexHint = startHints.find((entry) => entry.includes('(Codex)'));
    const vibeHint = startHints.find((entry) => entry.includes('Mistral Vibe'));
    expect(codexHint).toContain('$warpweave-propose');
    expect(codexHint).not.toContain('/warpweave-propose');
    expect(vibeHint).toContain('/warpweave-propose');
    for (const hint of startHints) {
      expect(hint).not.toContain('/ww:');
    }
  });

  it('should reference commands by the names each tool registers (cursor+claude)', async () => {
    // Cursor registers commands by filename (.cursor/commands/ww-apply.md ->
    // /ww-apply) while Claude namespaces them under ww/ (-> /ww:apply).
    // Command bodies, skills and the onboarding hint must each follow the tool
    // they are written for.
    const initCommand = new InitCommand({ tools: 'cursor,claude', force: true });
    await initCommand.execute(testDir);

    const read = (...segments: string[]) => fs.readFile(path.join(testDir, ...segments), 'utf-8');

    const cursorCommand = await read('.cursor', 'commands', 'ww-apply.md');
    // A body cross-reference, not the frontmatter name, which already
    // carried the hyphen form before this behaviour existed.
    expect(cursorCommand).toContain('/ww-archive');
    expect(cursorCommand).not.toContain('/ww:');

    const cursorSkill = await read('.cursor', 'skills', 'warpweave-apply-change', 'SKILL.md');
    expect(cursorSkill).not.toContain('/ww:');

    // Claude's namespaced commands are unchanged
    const claudeCommand = await read('.claude', 'commands', 'ww', 'apply.md');
    expect(claudeCommand).toContain('/ww:archive');
    expect(claudeCommand).not.toContain('/ww-');

    const claudeSkill = await read('.claude', 'skills', 'warpweave-apply-change', 'SKILL.md');
    expect(claudeSkill).not.toContain('/ww-');

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    expect(startHints.find((entry) => entry.includes('Cursor'))).toContain('/ww-propose');
    expect(startHints.find((entry) => entry.includes('Claude Code'))).toContain('/ww:propose');
  });

  it('should print the hyphen command hint for filename-invoked tools (claude+qwen)', async () => {
    const initCommand = new InitCommand({ tools: 'claude,qwen', force: true });
    await initCommand.execute(testDir);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    // Qwen invokes commands by filename (/ww-propose), so it must not share
    // Claude's /ww:propose line
    expect(startHints).toHaveLength(2);
    const claudeHint = startHints.find((entry) => entry.includes('Claude Code'));
    const qwenHint = startHints.find((entry) => entry.includes('Qwen Code'));
    expect(claudeHint).toContain('/ww:propose');
    expect(qwenHint).toContain('/ww-propose');
    expect(qwenHint).not.toContain('/ww:propose');
  });

  it('should not advertise an instruction for a tool that got no skills (delivery=commands, codex+kimi)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'commands',
    });

    const initCommand = new InitCommand({ tools: 'codex,kimi', force: true });
    await initCommand.execute(testDir);

    // Codex is skills-invocable so its skills are generated even under
    // delivery=commands; kimi (capability none) gets nothing at all
    expect(await fileExists(path.join(testDir, '.codex', 'skills', 'warpweave-propose', 'SKILL.md'))).toBe(true);
    expect(await fileExists(path.join(testDir, '.kimi-code'))).toBe(false);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    // Only the codex instruction may be advertised — a Kimi line would point
    // at skills that were never generated
    expect(startHints).toHaveLength(1);
    expect(startHints[0]).toContain('$warpweave-propose');
    expect(startHints[0]).not.toContain('Kimi');
    expect(logCalls.some((entry) => entry.includes('/skill:warpweave-'))).toBe(false);
    // Kimi got zero artifacts, so it still deserves the configuration correction
    const correction = logCalls.find((entry) => entry.includes('No skills or commands were generated for'));
    expect(correction).toContain('Kimi Code');
    expect(correction).not.toContain('Codex');
    expect(correction).toContain("warpweave config set delivery both");
  });

  it('should print a per-tool correction when an adapter-backed tool masks an adapterless one (delivery=commands, claude+kimi)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'commands',
    });

    const initCommand = new InitCommand({ tools: 'claude,kimi', force: true });
    await initCommand.execute(testDir);

    // Claude gets commands; kimi (no adapter, delivery excludes skills) gets nothing
    expect(await fileExists(path.join(testDir, '.claude', 'commands', 'ww', 'propose.md'))).toBe(true);
    expect(await fileExists(path.join(testDir, '.kimi-code'))).toBe(false);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    // The /ww: hint is correct for Claude, but Kimi must not be left with
    // a dead instruction: the correction names it even though another tool
    // generated commands
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    expect(startHints).toHaveLength(1);
    expect(startHints[0]).toContain('/ww:propose');
    const correction = logCalls.find((entry) => entry.includes('No skills or commands were generated for'));
    expect(correction).toContain('Kimi Code');
    expect(correction).not.toContain('Claude');
    expect(correction).toContain("warpweave config set delivery both");
    expect(logCalls.some((entry) => entry.includes('/skill:warpweave-'))).toBe(false);
  });

  it('should label per-tool hints when adapter-backed and adapterless tools are mixed (claude+kimi)', async () => {
    // Claude gets /ww:* commands; kimi only gets skills invoked as
    // /skill:warpweave-*. A single unlabeled /ww: hint would be unusable
    // for the Kimi user, so each tool gets its own labeled instruction.
    const initCommand = new InitCommand({ tools: 'claude,kimi', force: true });
    await initCommand.execute(testDir);

    expect(await fileExists(path.join(testDir, '.claude', 'commands', 'ww', 'propose.md'))).toBe(true);
    expect(await fileExists(path.join(testDir, '.kimi-code', 'skills', 'warpweave-propose', 'SKILL.md'))).toBe(true);

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHints = logCalls.filter((entry) => entry.includes('Start your first change'));
    expect(startHints).toHaveLength(2);
    const claudeHint = startHints.find((entry) => entry.includes('Claude Code'));
    const kimiHint = startHints.find((entry) => entry.includes('Kimi Code'));
    expect(claudeHint).toContain('/ww:propose');
    expect(kimiHint).toContain('/skill:warpweave-propose');
    expect(kimiHint).not.toContain('/ww:');
  });

  it('should keep /ww: command hints for adapter-backed tools under default delivery', async () => {
    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-apply-change', 'SKILL.md');
    const skillContent = await fs.readFile(skillFile, 'utf-8');
    expect(skillContent).toContain('/ww:');

    const logCalls = (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().map(String);
    const startHint = logCalls.find((entry) => entry.includes('Start your first change'));
    expect(startHint).toContain('/ww:propose');
  });

  it('should use skill references for opencode in skills-only delivery', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'skills',
    });

    const initCommand = new InitCommand({ tools: 'opencode', force: true });
    await initCommand.execute(testDir);

    const skillFile = path.join(testDir, '.opencode', 'skills', 'warpweave-explore', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);

    // Skills-only must win over the hyphen transform: no /ww: or /ww- references
    const skillContent = await fs.readFile(skillFile, 'utf-8');
    expect(skillContent).not.toContain('/ww:');
    expect(skillContent).not.toContain('/ww-');
    expect(skillContent).toContain('/warpweave-');
  });

  it('should respect delivery=commands setting (no skills)', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'commands',
    });

    const initCommand = new InitCommand({ tools: 'claude', force: true });
    await initCommand.execute(testDir);

    // Skills should NOT exist
    const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(false);

    // Commands should exist
    const cmdFile = path.join(testDir, '.claude', 'commands', 'ww', 'explore.md');
    expect(await fileExists(cmdFile)).toBe(true);
  });

  it('should remove commands on re-init when delivery changes to skills', async () => {
    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'both',
    });

    const initCommand1 = new InitCommand({ tools: 'claude', force: true });
    await initCommand1.execute(testDir);

    const cmdFile = path.join(testDir, '.claude', 'commands', 'ww', 'explore.md');
    expect(await fileExists(cmdFile)).toBe(true);

    saveGlobalConfig({
      featureFlags: {},
      profile: 'core',
      delivery: 'skills',
    });

    const initCommand2 = new InitCommand({ tools: 'claude', force: true });
    await initCommand2.execute(testDir);

    expect(await fileExists(cmdFile)).toBe(false);

    const skillFile = path.join(testDir, '.claude', 'skills', 'warpweave-explore', 'SKILL.md');
    expect(await fileExists(skillFile)).toBe(true);
  });
});

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
