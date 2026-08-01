import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import {
  detectLegacyArtifacts,
  detectLegacyConfigFiles,
  detectLegacySlashCommands,
  detectLegacyStructureFiles,
  getCodexPromptDir,
  hasWarpweaveMarkers,
  isOnlyWarpweaveContent,
  removeMarkerBlock,
  cleanupLegacyArtifacts,
  formatDeferredGlobalPromptSummary,
  formatCleanupSummary,
  formatDetectionSummary,
  formatProjectMdMigrationHint,
  getToolsFromLegacyArtifacts,
  LEGACY_CONFIG_FILES,
  LEGACY_GLOBAL_SLASH_COMMAND_PATHS,
  LEGACY_SLASH_COMMAND_PATHS,
} from '../../src/core/legacy-cleanup.js';
import { WARPWEAVE_MARKERS } from '../../src/core/config.js';
import { CommandAdapterRegistry } from '../../src/core/command-generation/registry.js';
import { resolveCommandSurfaceCapability } from '../../src/core/command-surface.js';

describe('legacy-cleanup', () => {
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openspec-legacy-test-'));
    process.env.CODEX_HOME = path.join(testDir, 'codex-home');
    // Create warpweave directory structure
    await fs.mkdir(path.join(testDir, 'openspec'), { recursive: true });
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('hasWarpweaveMarkers', () => {
    it('should return true when both markers are present', () => {
      const content = `Some content
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}
More content`;
      expect(hasWarpweaveMarkers(content)).toBe(true);
    });

    it('should return false when start marker is missing', () => {
      const content = `Some content
Warpweave content
${WARPWEAVE_MARKERS.end}`;
      expect(hasWarpweaveMarkers(content)).toBe(false);
    });

    it('should return false when end marker is missing', () => {
      const content = `${WARPWEAVE_MARKERS.start}
Warpweave content
Some content`;
      expect(hasWarpweaveMarkers(content)).toBe(false);
    });

    it('should return false when no markers are present', () => {
      const content = 'Plain content without markers';
      expect(hasWarpweaveMarkers(content)).toBe(false);
    });
  });

  describe('isOnlyWarpweaveContent', () => {
    it('should return true when content is only markers and whitespace outside', () => {
      const content = `${WARPWEAVE_MARKERS.start}
Warpweave content here
${WARPWEAVE_MARKERS.end}`;
      expect(isOnlyWarpweaveContent(content)).toBe(true);
    });

    it('should return true with whitespace before and after markers', () => {
      const content = `

${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}

`;
      expect(isOnlyWarpweaveContent(content)).toBe(true);
    });

    it('should return false when content exists before markers', () => {
      const content = `User content here
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`;
      expect(isOnlyWarpweaveContent(content)).toBe(false);
    });

    it('should return false when content exists after markers', () => {
      const content = `${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}
User content here`;
      expect(isOnlyWarpweaveContent(content)).toBe(false);
    });

    it('should return false when markers are missing', () => {
      const content = 'Plain content without markers';
      expect(isOnlyWarpweaveContent(content)).toBe(false);
    });

    it('should return false when end marker comes before start marker', () => {
      const content = `${WARPWEAVE_MARKERS.end}
Content
${WARPWEAVE_MARKERS.start}`;
      expect(isOnlyWarpweaveContent(content)).toBe(false);
    });
  });

  describe('removeMarkerBlock', () => {
    it('should remove marker block and preserve content before', () => {
      const content = `User content before
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`;
      const result = removeMarkerBlock(content);
      expect(result).toBe('User content before\n');
      expect(result).not.toContain(WARPWEAVE_MARKERS.start);
      expect(result).not.toContain(WARPWEAVE_MARKERS.end);
    });

    it('should remove marker block and preserve content after', () => {
      const content = `${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}
User content after`;
      const result = removeMarkerBlock(content);
      expect(result).toBe('User content after\n');
    });

    it('should remove marker block and preserve content before and after', () => {
      const content = `User content before
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}
User content after`;
      const result = removeMarkerBlock(content);
      expect(result).toContain('User content before');
      expect(result).toContain('User content after');
      expect(result).not.toContain(WARPWEAVE_MARKERS.start);
    });

    it('should clean up double blank lines', () => {
      const content = `Line 1


${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}


Line 2`;
      const result = removeMarkerBlock(content);
      expect(result).not.toMatch(/\n{3,}/);
    });

    it('should return empty string when only markers remain', () => {
      const content = `${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`;
      const result = removeMarkerBlock(content);
      expect(result).toBe('');
    });

    it('should return original content when markers are missing', () => {
      const content = 'Plain content without markers';
      const result = removeMarkerBlock(content);
      // When no markers found, content is returned trimmed (no trailing newline added)
      expect(result).toBe('Plain content without markers');
    });

    it('should return original content when markers are in wrong order', () => {
      const content = `${WARPWEAVE_MARKERS.end}
Content
${WARPWEAVE_MARKERS.start}`;
      const result = removeMarkerBlock(content);
      expect(result).toContain(WARPWEAVE_MARKERS.end);
      expect(result).toContain(WARPWEAVE_MARKERS.start);
    });

    it('should ignore inline mentions of markers and only remove actual block', () => {
      const content = `Intro referencing ${WARPWEAVE_MARKERS.start} and ${WARPWEAVE_MARKERS.end} inline.

${WARPWEAVE_MARKERS.start}
Managed content here
${WARPWEAVE_MARKERS.end}
After content`;
      const result = removeMarkerBlock(content);
      // Inline mentions preserved
      expect(result).toContain('Intro referencing');
      expect(result).toContain(WARPWEAVE_MARKERS.start);
      expect(result).toContain(WARPWEAVE_MARKERS.end);
      // Managed content removed
      expect(result).not.toContain('Managed content here');
      expect(result).toContain('After content');
    });
  });

  describe('detectLegacyConfigFiles', () => {
    it('should detect CLAUDE.md with Warpweave markers and put in update list', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`);

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toContain('CLAUDE.md');
      // Config files are NEVER deleted, always updated (markers removed)
      expect(result.filesToUpdate).toContain('CLAUDE.md');
    });

    it('should detect files with mixed content and put in update list', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `User instructions here
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`);

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toContain('CLAUDE.md');
      expect(result.filesToUpdate).toContain('CLAUDE.md');
    });

    it('should not detect files without Warpweave markers', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, 'Plain instructions without markers');

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).not.toContain('CLAUDE.md');
    });

    it('should detect multiple config files', async () => {
      // Create multiple config files with markers
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), `${WARPWEAVE_MARKERS.start}\nContent\n${WARPWEAVE_MARKERS.end}`);
      await fs.writeFile(path.join(testDir, 'CLINE.md'), `${WARPWEAVE_MARKERS.start}\nContent\n${WARPWEAVE_MARKERS.end}`);
      await fs.writeFile(path.join(testDir, 'QODER.md'), `${WARPWEAVE_MARKERS.start}\nContent\n${WARPWEAVE_MARKERS.end}`);

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toHaveLength(3);
      expect(result.allFiles).toContain('CLAUDE.md');
      expect(result.allFiles).toContain('CLINE.md');
      expect(result.allFiles).toContain('QODER.md');
      // All should be in update list, none deleted
      expect(result.filesToUpdate).toHaveLength(3);
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toHaveLength(0);
      expect(result.filesToUpdate).toHaveLength(0);
    });
  });

  describe('detectLegacySlashCommands', () => {
    it('should detect legacy Claude slash command directory', async () => {
      const dirPath = path.join(testDir, '.claude', 'commands', 'openspec');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'proposal.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.directories).toContain('.claude/commands/openspec');
    });

    it('should detect legacy Cursor slash command files', async () => {
      const dirPath = path.join(testDir, '.cursor', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'openspec-proposal.md'), 'content');
      await fs.writeFile(path.join(dirPath, 'warpweave-apply.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.cursor/commands/openspec-proposal.md');
      expect(result.files).toContain('.cursor/commands/warpweave-apply.md');
    });

    it('should detect legacy Windsurf workflow files', async () => {
      const dirPath = path.join(testDir, '.windsurf', 'workflows');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'warpweave-archive.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.windsurf/workflows/warpweave-archive.md');
    });

    it('should detect multiple tool directories and files', async () => {
      // Create directory-based
      await fs.mkdir(path.join(testDir, '.claude', 'commands', 'openspec'), { recursive: true });
      await fs.mkdir(path.join(testDir, '.qoder', 'commands', 'openspec'), { recursive: true });

      // Create file-based
      await fs.mkdir(path.join(testDir, '.cursor', 'commands'), { recursive: true });
      await fs.writeFile(path.join(testDir, '.cursor', 'commands', 'openspec-proposal.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.directories).toContain('.claude/commands/openspec');
      expect(result.directories).toContain('.qoder/commands/openspec');
      expect(result.files).toContain('.cursor/commands/openspec-proposal.md');
    });

    it('should not detect non-warpweave files', async () => {
      const dirPath = path.join(testDir, '.cursor', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'other-command.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).not.toContain('.cursor/commands/other-command.md');
    });

    it('should handle non-existent directories gracefully', async () => {
      const result = await detectLegacySlashCommands(testDir);
      expect(result.directories).toHaveLength(0);
      expect(result.files).toHaveLength(0);
    });

    it('should detect TOML-based slash commands for Qwen', async () => {
      const dirPath = path.join(testDir, '.qwen', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'openspec-proposal.toml'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.qwen/commands/openspec-proposal.toml');
    });

    it('should detect deprecated ww TOML commands for Qwen', async () => {
      const dirPath = path.join(testDir, '.qwen', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'ww-explore.toml'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.qwen/commands/ww-explore.toml');
    });

    it('should not detect new Markdown commands for Qwen as legacy', async () => {
      const dirPath = path.join(testDir, '.qwen', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'ww-explore.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).not.toContain('.qwen/commands/ww-explore.md');
    });

    it('should detect Continue prompt files', async () => {
      const dirPath = path.join(testDir, '.continue', 'prompts');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'warpweave-apply.prompt'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.continue/prompts/warpweave-apply.prompt');
    });

    it('should detect legacy OpenCode ww-* command files', async () => {
      const dirPath = path.join(testDir, '.opencode', 'command');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'ww-propose.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.opencode/command/ww-propose.md');
    });

    it('should detect legacy OpenCode openspec-* command files', async () => {
      const dirPath = path.join(testDir, '.opencode', 'command');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'warpweave-new.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.opencode/command/warpweave-new.md');
    });

    it('should detect both ww-* and openspec-* OpenCode command files', async () => {
      const dirPath = path.join(testDir, '.opencode', 'command');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'ww-propose.md'), 'content');
      await fs.writeFile(path.join(dirPath, 'warpweave-new.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.opencode/command/ww-propose.md');
      expect(result.files).toContain('.opencode/command/warpweave-new.md');
    });

    it('should not include managed global Codex prompt files in repo-local slash command detection', async () => {
      const promptDir = getCodexPromptDir();
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(path.join(promptDir, 'ww-explore.md'), 'legacy explore prompt');
      await fs.writeFile(path.join(promptDir, 'openspec-proposal.md'), 'managed');
      await fs.writeFile(path.join(promptDir, 'my-custom-prompt.md'), 'user');

      const result = await detectLegacySlashCommands(testDir);

      expect(result.files).not.toContain(path.join(promptDir, 'ww-explore.md'));
      expect(result.files).not.toContain(path.join(promptDir, 'openspec-proposal.md'));
      expect(result.files).not.toContain(path.join(promptDir, 'my-custom-prompt.md'));
    });
  });

  describe('detectLegacyStructureFiles', () => {
    it('should detect openspec/AGENTS.md', async () => {
      const agentsPath = path.join(testDir, 'openspec', 'AGENTS.md');
      await fs.writeFile(agentsPath, '# AGENTS.md content');

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasOpenspecAgents).toBe(true);
    });

    it('should detect openspec/project.md', async () => {
      const projectPath = path.join(testDir, 'openspec', 'project.md');
      await fs.writeFile(projectPath, '# Project content');

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasProjectMd).toBe(true);
    });

    it('should detect root AGENTS.md with Warpweave markers', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, `${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`);

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasRootAgentsWithMarkers).toBe(true);
    });

    it('should not detect root AGENTS.md without markers', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, 'Plain content without markers');

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasRootAgentsWithMarkers).toBe(false);
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasOpenspecAgents).toBe(false);
      expect(result.hasProjectMd).toBe(false);
      expect(result.hasRootAgentsWithMarkers).toBe(false);
    });
  });

  describe('detectLegacyArtifacts', () => {
    it('should return hasLegacyArtifacts: false when nothing is found', async () => {
      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(false);
    });

    it('should return hasLegacyArtifacts: true when config files are found', async () => {
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), `${WARPWEAVE_MARKERS.start}\nContent\n${WARPWEAVE_MARKERS.end}`);

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.configFiles).toContain('CLAUDE.md');
    });

    it('should return hasLegacyArtifacts: true when slash commands are found', async () => {
      await fs.mkdir(path.join(testDir, '.claude', 'commands', 'openspec'), { recursive: true });

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.slashCommandDirs).toContain('.claude/commands/openspec');
    });

    it('should return hasLegacyArtifacts: true when openspec/AGENTS.md is found', async () => {
      await fs.writeFile(path.join(testDir, 'openspec', 'AGENTS.md'), 'content');

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.hasOpenspecAgents).toBe(true);
    });

    it('should detect project.md for migration hint (it is preserved, not deleted)', async () => {
      await fs.writeFile(path.join(testDir, 'openspec', 'project.md'), 'content');

      const result = await detectLegacyArtifacts(testDir);
      // project.md triggers hasLegacyArtifacts to show migration hint
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.hasProjectMd).toBe(true);
    });

    it('should combine all detection results', async () => {
      // Create various legacy artifacts
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), `${WARPWEAVE_MARKERS.start}\nContent\n${WARPWEAVE_MARKERS.end}`);
      await fs.mkdir(path.join(testDir, '.claude', 'commands', 'openspec'), { recursive: true });
      await fs.writeFile(path.join(testDir, 'openspec', 'AGENTS.md'), 'content');
      await fs.writeFile(path.join(testDir, 'openspec', 'project.md'), 'content');

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.configFiles).toContain('CLAUDE.md');
      expect(result.slashCommandDirs).toContain('.claude/commands/openspec');
      expect(result.hasOpenspecAgents).toBe(true);
      expect(result.hasProjectMd).toBe(true);
    });

    it('should detect allowlisted global Codex prompts separately from repo-local slash commands', async () => {
      const promptDir = getCodexPromptDir();
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(path.join(promptDir, 'ww-explore.md'), 'prompt generated by an older Warpweave version');
      await fs.writeFile(path.join(promptDir, 'ww-update.md'), 'legacy update prompt');
      await fs.writeFile(path.join(promptDir, 'ww-review.md'), 'user');
      await fs.writeFile(path.join(promptDir, 'openspec-proposal.md'), 'managed');
      await fs.writeFile(path.join(promptDir, 'my-custom-prompt.md'), 'user');

      const result = await detectLegacyArtifacts(testDir);

      expect(result.globalSlashCommandFiles).toContain(path.join(promptDir, 'ww-explore.md'));
      expect(result.globalSlashCommandFiles).toContain(path.join(promptDir, 'ww-update.md'));
      expect(result.globalSlashCommandFiles).not.toContain(path.join(promptDir, 'ww-review.md'));
      expect(result.globalSlashCommandFiles).not.toContain(path.join(promptDir, 'openspec-proposal.md'));
      expect(result.globalSlashCommandFiles).not.toContain(path.join(promptDir, 'my-custom-prompt.md'));
      expect(result.slashCommandFiles).not.toContain(path.join(promptDir, 'ww-explore.md'));
    });

    it('should detect exact allowlisted global Codex filenames regardless of template revision', async () => {
      const promptDir = getCodexPromptDir();
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(
        path.join(promptDir, 'ww-explore.md'),
        '# custom explore prompt\n\nThis is not an Warpweave generated Codex prompt.\n'
      );

      const result = await detectLegacyArtifacts(testDir);

      expect(result.globalSlashCommandFiles).toContain(path.join(promptDir, 'ww-explore.md'));
    });
  });

  describe('cleanupLegacyArtifacts', () => {
    it('should remove markers from config files that have only Warpweave content (never delete)', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `${WARPWEAVE_MARKERS.start}\nContent\n${WARPWEAVE_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      // Config files should NEVER be deleted, only have markers removed
      expect(result.deletedFiles).not.toContain('CLAUDE.md');
      expect(result.modifiedFiles).toContain('CLAUDE.md');
      // File should still exist
      await expect(fs.access(claudePath)).resolves.not.toThrow();
      // File should be empty or have markers removed
      const content = await fs.readFile(claudePath, 'utf-8');
      expect(content).not.toContain(WARPWEAVE_MARKERS.start);
      expect(content).not.toContain(WARPWEAVE_MARKERS.end);
    });

    it('should remove marker block from files with mixed content', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `User instructions
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.modifiedFiles).toContain('CLAUDE.md');
      const content = await fs.readFile(claudePath, 'utf-8');
      expect(content).toContain('User instructions');
      expect(content).not.toContain(WARPWEAVE_MARKERS.start);
    });

    it('should delete legacy slash command directories', async () => {
      const dirPath = path.join(testDir, '.claude', 'commands', 'openspec');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'proposal.md'), 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedDirs).toContain('.claude/commands/openspec');
      await expect(fs.access(dirPath)).rejects.toThrow();
      // Parent directory should still exist
      await expect(fs.access(path.join(testDir, '.claude', 'commands'))).resolves.not.toThrow();
    });

    it('should delete legacy slash command files', async () => {
      const dirPath = path.join(testDir, '.cursor', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, 'openspec-proposal.md');
      await fs.writeFile(filePath, 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain('.cursor/commands/openspec-proposal.md');
      await expect(fs.access(filePath)).rejects.toThrow();
    });

    it('should delete openspec/AGENTS.md', async () => {
      const agentsPath = path.join(testDir, 'openspec', 'AGENTS.md');
      await fs.writeFile(agentsPath, 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain('openspec/AGENTS.md');
      await expect(fs.access(agentsPath)).rejects.toThrow();
      // warpweave directory should still exist
      await expect(fs.access(path.join(testDir, 'openspec'))).resolves.not.toThrow();
    });

    it('should NOT delete openspec/project.md', async () => {
      const projectPath = path.join(testDir, 'openspec', 'project.md');
      await fs.writeFile(projectPath, 'User project content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.projectMdNeedsMigration).toBe(true);
      expect(result.deletedFiles).not.toContain('openspec/project.md');
      await expect(fs.access(projectPath)).resolves.not.toThrow();
    });

    it('should handle root AGENTS.md with mixed content', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, `User content
${WARPWEAVE_MARKERS.start}
Warpweave content
${WARPWEAVE_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.modifiedFiles).toContain('AGENTS.md');
      const content = await fs.readFile(agentsPath, 'utf-8');
      expect(content).toContain('User content');
      expect(content).not.toContain(WARPWEAVE_MARKERS.start);
    });

    it('should remove markers from root AGENTS.md even when only Warpweave content (never delete)', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, `${WARPWEAVE_MARKERS.start}\nOpenSpec content\n${WARPWEAVE_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      // Root AGENTS.md should NEVER be deleted, only have markers removed
      expect(result.deletedFiles).not.toContain('AGENTS.md');
      expect(result.modifiedFiles).toContain('AGENTS.md');
      // File should still exist
      await expect(fs.access(agentsPath)).resolves.not.toThrow();
    });

    it('should report errors without stopping cleanup', async () => {
      // Create a valid detection result with a non-existent file to simulate error
      const detection = {
        configFiles: ['NON_EXISTENT.md'],
        configFilesToUpdate: ['NON_EXISTENT.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const result = await cleanupLegacyArtifacts(testDir, detection);

      // Should not throw, but should record the error
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('NON_EXISTENT.md');
    });

    it('should remove allowlisted global Codex prompts and preserve unmanaged prompts', async () => {
      const promptDir = getCodexPromptDir();
      const managedPrompt = path.join(promptDir, 'ww-apply.md');
      const customOpsxPrompt = path.join(promptDir, 'ww-review.md');
      const legacyPrompt = path.join(promptDir, 'openspec-proposal.md');
      const unmanagedPrompt = path.join(promptDir, 'personal.md');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(managedPrompt, 'legacy apply prompt');
      await fs.writeFile(customOpsxPrompt, 'user');
      await fs.writeFile(legacyPrompt, 'managed');
      await fs.writeFile(unmanagedPrompt, 'user');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain(managedPrompt);
      expect(result.deletedFiles).not.toContain(legacyPrompt);
      expect(result.deletedFiles).not.toContain(customOpsxPrompt);
      await expect(fs.access(managedPrompt)).rejects.toThrow();
      await expect(fs.access(customOpsxPrompt)).resolves.not.toThrow();
      await expect(fs.access(legacyPrompt)).resolves.not.toThrow();
      await expect(fs.access(unmanagedPrompt)).resolves.not.toThrow();
    });

    it('should remove exact allowlisted global Codex filenames when their content differs', async () => {
      const promptDir = getCodexPromptDir();
      const customizedManagedName = path.join(promptDir, 'ww-apply.md');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(
        customizedManagedName,
        '# customized legacy apply prompt\n'
      );

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain(customizedManagedName);
      await expect(fs.access(customizedManagedName)).rejects.toThrow();
    });

    it('should skip unmanaged global prompt paths in stale detection objects', async () => {
      const promptDir = getCodexPromptDir();
      const managedPrompt = path.join(promptDir, 'ww-apply.md');
      const unmanagedPrompt = path.join(promptDir, 'personal.md');
      const outsidePrompt = path.join(testDir, 'other-codex-home', 'prompts', 'ww-apply.md');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.mkdir(path.dirname(outsidePrompt), { recursive: true });
      await fs.writeFile(managedPrompt, 'legacy apply prompt');
      await fs.writeFile(unmanagedPrompt, 'user');
      await fs.writeFile(outsidePrompt, 'outside configured Codex prompt directory');

      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [managedPrompt, unmanagedPrompt, outsidePrompt],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain(managedPrompt);
      expect(result.deletedFiles).not.toContain(unmanagedPrompt);
      expect(result.deletedFiles).not.toContain(outsidePrompt);
      expect(result.errors).toContain(`Skipped unmanaged global prompt ${unmanagedPrompt}`);
      expect(result.errors).toContain(`Skipped unmanaged global prompt ${outsidePrompt}`);
      await expect(fs.access(managedPrompt)).rejects.toThrow();
      await expect(fs.access(unmanagedPrompt)).resolves.not.toThrow();
      await expect(fs.access(outsidePrompt)).resolves.not.toThrow();
    });
  });

  describe('formatCleanupSummary', () => {
    it('should format deleted files', () => {
      const result = {
        deletedFiles: ['CLAUDE.md', 'CLINE.md'],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('Cleaned up legacy files:');
      expect(summary).toContain('✓ Removed CLAUDE.md');
      expect(summary).toContain('✓ Removed CLINE.md');
    });

    it('should format deleted directories', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: ['.claude/commands/openspec'],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('✓ Removed .claude/commands/openspec/ (replaced by Warpweave skills and commands)');
    });

    it('should format modified files', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: ['AGENTS.md'],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('✓ Removed Warpweave markers from AGENTS.md');
    });

    it('should include migration hint for project.md', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: true,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('Needs your attention');
      expect(summary).toContain('openspec/project.md');
      expect(summary).toContain('config.yaml');
    });

    it('should include errors', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: ['Failed to delete CLAUDE.md: Permission denied'],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('Errors during cleanup:');
      expect(summary).toContain('Failed to delete CLAUDE.md');
    });

    it('should return empty string when nothing to report', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toBe('');
    });
  });

  describe('formatDetectionSummary', () => {
    it('should include welcoming upgrade header and explanation', () => {
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Upgrading to the new Warpweave');
      expect(summary).toContain('agent skills');
      expect(summary).toContain('keeping everything working');
    });

    it('should format config files as files to update (never remove)', () => {
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      // Config files should be in "Files to update", not "Files to remove"
      expect(summary).toContain('Files to update');
      expect(summary).toContain('• CLAUDE.md');
      // Should NOT be in removals
      expect(summary).not.toContain('No user content to preserve');
    });

    it('should format files to be updated', () => {
      const detection = {
        configFiles: ['CLINE.md'],
        configFilesToUpdate: ['CLINE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to update');
      expect(summary).toContain('markers will be removed');
      expect(summary).toContain('your content preserved');
      expect(summary).toContain('• CLINE.md');
    });

    it('should format slash command directories', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: ['.claude/commands/openspec'],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('• .claude/commands/openspec/');
    });

    it('should format slash command files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.cursor/commands/openspec-proposal.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('• .cursor/commands/openspec-proposal.md');
    });

    it('should format openspec/AGENTS.md', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: true,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('• openspec/AGENTS.md');
    });

    it('should include attention section for project.md', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: true,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: false,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Needs your attention');
      expect(summary).toContain('• openspec/project.md');
      expect(summary).toContain('won\'t delete this file');
      expect(summary).toContain('config.yaml');
      expect(summary).toContain('"context:"');
    });

    it('should include attention section with other legacy artifacts', () => {
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: true,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      // Config files now in "Files to update", not "Files to remove"
      expect(summary).toContain('Files to update');
      expect(summary).toContain('CLAUDE.md');
      expect(summary).toContain('Needs your attention');
      expect(summary).toContain('openspec/project.md');
    });

    it('should group both removals and updates correctly', () => {
      const detection = {
        configFiles: ['CLAUDE.md', 'CLINE.md'],
        configFilesToUpdate: ['CLAUDE.md', 'CLINE.md'],
        slashCommandDirs: ['.claude/commands/openspec'],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: true,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      // Check both sections exist
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('Files to update');
      // Check removals (only slash commands and openspec/AGENTS.md)
      expect(summary).toContain('• .claude/commands/openspec/');
      expect(summary).toContain('• openspec/AGENTS.md');
      // Check updates (all config files)
      expect(summary).toContain('• CLAUDE.md');
      expect(summary).toContain('• CLINE.md');
    });

    it('should format deferred global prompts cleanup separately from repo-local files', () => {
      const globalPrompt = path.join(getCodexPromptDir(), 'ww-explore.md');
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [globalPrompt],
        globalSlashCommandDetails: [{
          path: globalPrompt,
          toolId: 'codex',
          managedFileName: 'ww-explore.md',
          workflowIds: ['explore'],
          replacementLabel: 'Codex skills',
        }],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDeferredGlobalPromptSummary(detection);
      expect(summary).toContain('Deferred global prompts cleanup');
      expect(summary).toContain('These global prompts will only be removed after matching replacement skills are installed');
      expect(summary).toContain(`codex: ${globalPrompt}`);
      expect(summary).toContain(globalPrompt);
    });

    it('should return empty string when nothing is detected', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: false,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toBe('');
    });
  });

  describe('formatProjectMdMigrationHint', () => {
    it('should return migration hint message', () => {
      const hint = formatProjectMdMigrationHint();
      expect(hint).toContain('Needs your attention');
      expect(hint).toContain('openspec/project.md');
      expect(hint).toContain('won\'t delete this file');
      expect(hint).toContain('config.yaml');
      expect(hint).toContain('"context:"');
    });

    it('should include actionable instructions', () => {
      const hint = formatProjectMdMigrationHint();
      expect(hint).toContain('move any useful content');
      expect(hint).toContain('delete the file when ready');
    });

    it('should explain the new context section benefits', () => {
      const hint = formatProjectMdMigrationHint();
      expect(hint).toContain('included in every Warpweave request');
      expect(hint).toContain('reliably');
    });
  });

  describe('LEGACY_CONFIG_FILES', () => {
    it('should include expected config file names', () => {
      expect(LEGACY_CONFIG_FILES).toContain('CLAUDE.md');
      expect(LEGACY_CONFIG_FILES).toContain('CLINE.md');
      expect(LEGACY_CONFIG_FILES).toContain('CODEBUDDY.md');
      expect(LEGACY_CONFIG_FILES).toContain('COSTRICT.md');
      expect(LEGACY_CONFIG_FILES).toContain('QODER.md');
      expect(LEGACY_CONFIG_FILES).toContain('IFLOW.md');
      expect(LEGACY_CONFIG_FILES).toContain('AGENTS.md');
      expect(LEGACY_CONFIG_FILES).toContain('QWEN.md');
    });
  });

  describe('LEGACY_SLASH_COMMAND_PATHS', () => {
    it('should include expected tool patterns', () => {
      expect(LEGACY_SLASH_COMMAND_PATHS['claude']).toEqual({
        type: 'directory',
        path: ['.claude/commands/openspec', '.claude/commands/warpweave', '.claude/commands/otrix'],
      });

      expect(LEGACY_SLASH_COMMAND_PATHS['cursor']).toEqual({
        type: 'files',
        pattern: ['.cursor/commands/openspec-*.md', '.cursor/commands/warpweave-*.md', '.cursor/commands/otrix-*.md'],
      });

      expect(LEGACY_SLASH_COMMAND_PATHS['devin']).toEqual({
        type: 'files',
        pattern: ['.windsurf/workflows/openspec-*.md', '.windsurf/workflows/warpweave-*.md', '.windsurf/workflows/otrix-*.md'],
      });
    });

    it('should only include legacy tool IDs with a command surface capability', () => {
      const registeredTools = new Set(CommandAdapterRegistry.getAll().map(adapter => adapter.toolId));

      for (const tool of Object.keys(LEGACY_SLASH_COMMAND_PATHS)) {
        expect(registeredTools.has(tool) || resolveCommandSurfaceCapability(tool) === 'skills-invocable').toBe(true);
      }

      // Pi was never a pre-1.0 legacy tool
      expect(LEGACY_SLASH_COMMAND_PATHS).not.toHaveProperty('pi');
    });

    it('should use the repo-local compatibility glob pattern for Codex prompt detection', () => {
      const codexPatterns = LEGACY_SLASH_COMMAND_PATHS['codex'];
      expect(codexPatterns.type).toBe('files');
      const patterns = Array.isArray(codexPatterns.pattern) ? codexPatterns.pattern : [codexPatterns.pattern];
      expect(patterns).toContain('.codex/prompts/openspec-*.md');
      expect(patterns).not.toContain('.codex/prompts/ww-*.md');
    });
  });

  describe('LEGACY_GLOBAL_SLASH_COMMAND_PATHS', () => {
    it('should define the allowlisted managed global Codex prompt names separately from project-local paths', () => {
      const codexPatterns = LEGACY_GLOBAL_SLASH_COMMAND_PATHS['codex'];
      expect(codexPatterns.managedFileNames).toContain('ww-explore.md');
      expect(codexPatterns.managedFileNames).toContain('ww-apply.md');
      expect(codexPatterns.managedFileNames).toContain('ww-update.md');
      expect(codexPatterns.workflowIdsByFileName?.['ww-update.md']).toEqual(['update']);
      expect(codexPatterns.managedFileNames).not.toContain('ww-review.md');
      expect(codexPatterns.managedFileNames).not.toContain('openspec-proposal.md');
      expect(codexPatterns.resolvePromptDir()).toBe(getCodexPromptDir());
    });
  });

  describe('getToolsFromLegacyArtifacts', () => {
    it('should extract claude from directory-based legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: ['.claude/commands/openspec'],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('claude');
      expect(tools).toHaveLength(1);
    });

    it('should extract cursor from file-based legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.cursor/commands/openspec-proposal.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('cursor');
      expect(tools).toHaveLength(1);
    });

    it('should extract cursor from Windows-style legacy artifact paths', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.cursor\\commands\\openspec-proposal.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('cursor');
      expect(tools).toHaveLength(1);
    });

    it('should extract multiple tools from mixed legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: ['.claude/commands/openspec', '.qoder/commands/openspec'],
        slashCommandFiles: ['.cursor/commands/warpweave-apply.md', '.windsurf/workflows/warpweave-archive.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('claude');
      expect(tools).toContain('qoder');
      expect(tools).toContain('cursor');
      expect(tools).toContain('devin');
      expect(tools).toHaveLength(4);
    });

    it('should deduplicate tools when multiple files match same tool', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [
          '.cursor/commands/openspec-proposal.md',
          '.cursor/commands/warpweave-apply.md',
          '.cursor/commands/warpweave-archive.md',
        ],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('cursor');
      expect(tools).toHaveLength(1);
    });

    it('should extract codex from managed global legacy prompt files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [path.join(getCodexPromptDir(), 'ww-explore.md')],
        globalSlashCommandDetails: [{
          path: path.join(getCodexPromptDir(), 'ww-explore.md'),
          toolId: 'codex',
          managedFileName: 'ww-explore.md',
          workflowIds: ['explore'],
          replacementLabel: 'Codex skills',
        }],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('codex');
      expect(tools).toHaveLength(1);
    });

    it('should return empty array when no legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: false,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toHaveLength(0);
    });

    it('should handle qwen TOML-based legacy files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.qwen/commands/openspec-proposal.toml'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('qwen');
      expect(tools).toHaveLength(1);
    });

    it('should handle continue prompt files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.continue/prompts/warpweave-apply.prompt'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('continue');
      expect(tools).toHaveLength(1);
    });

    it('should handle github-copilot prompt files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.github/prompts/warpweave-apply.prompt.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('github-copilot');
      expect(tools).toHaveLength(1);
    });

    it('should handle opencode ww-* legacy files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.opencode/command/ww-propose.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('opencode');
      expect(tools).toHaveLength(1);
    });

    it('should handle opencode openspec-* legacy files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.opencode/command/warpweave-new.md'],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('opencode');
      expect(tools).toHaveLength(1);
    });

    it('should deduplicate opencode when both ww-* and openspec-* files exist', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [
          '.opencode/command/ww-propose.md',
          '.opencode/command/warpweave-new.md',
        ],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('opencode');
      expect(tools).toHaveLength(1);
    });

    it('should not extract tools from config files only', () => {
      // Config files don't indicate which tools were configured
      // Only slash command dirs/files tell us which tools to upgrade
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasOpenspecAgents: true,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toHaveLength(0);
    });
  });
});
