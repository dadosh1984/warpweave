import { describe, it, expect } from 'vitest';
import {
  getSkillReferenceTransformer,
  getTransformerForTool,
  transformCommandInvocations,
  transformToSkillReferences,
} from '../../src/utils/command-references.js';
import type { CommandInvocation } from '../../src/core/command-generation/invocation.js';

const FLAT_SLASH: CommandInvocation = { style: 'flat', prefix: '/' };
const FLAT_AT: CommandInvocation = { style: 'flat', prefix: '@' };
const NAMESPACED_SLASH: CommandInvocation = { style: 'namespaced', prefix: '/' };

/** The `/ww-<id>` case, which most flat tools use. */
const transformToHyphenCommands = (text: string): string =>
  transformCommandInvocations(text, FLAT_SLASH);

describe('transformCommandInvocations', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/ww:new')).toBe('/ww-new');
    });

    it('should transform multiple command references', () => {
      const input = '/ww:new and /ww:apply';
      const expected = '/ww-new and /ww-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /ww:apply to implement tasks';
      const expected = 'Use /ww-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/ww:continue` to proceed';
      const expected = 'Run `/ww-continue` to proceed';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToHyphenCommands('')).toBe('');
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new ww: /other:command';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should handle multiple occurrences on same line', () => {
      const input = '/ww:new /ww:continue /ww:apply';
      const expected = '/ww-new /ww-continue /ww-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should leave unknown command references unchanged', () => {
      // Mirrors transformToSkillReferences: an invented id is left as written
      // rather than reshaped into a command that does not exist either.
      const input = 'Try /ww:unknown-command here';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should rewrite only the known id on a mixed line', () => {
      expect(transformToHyphenCommands('/ww:apply and /ww:bogus')).toBe(
        '/ww-apply and /ww:bogus'
      );
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /ww:new to start
Then /ww:continue to proceed
Finally /ww:apply to implement`;
      const expected = `Use /ww-new to start
Then /ww-continue to proceed
Finally /ww-apply to implement`;
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('all known commands', () => {
    const commands = [
      'new',
      'continue',
      'apply',
      'update',
      'ff',
      'sync',
      'archive',
      'bulk-archive',
      'verify',
      'explore',
      'onboard',
      'security-scan',
    ];

    for (const cmd of commands) {
      it(`should transform /ww:${cmd}`, () => {
        expect(transformToHyphenCommands(`/ww:${cmd}`)).toBe(`/ww-${cmd}`);
      });
    }
  });

  describe('non-slash prefixes', () => {
    it("spells Amazon Q's prompt library form, replacing the slash", () => {
      // The whole `/ww:` is consumed, so no stray slash survives: it is
      // `@ww-apply`, never `/@ww-apply` or `@/ww-apply`.
      expect(transformCommandInvocations('/ww:apply', FLAT_AT)).toBe('@ww-apply');
      expect(transformCommandInvocations('Run `/ww:archive` when done.', FLAT_AT)).toBe(
        'Run `@ww-archive` when done.'
      );
    });

    it('leaves unknown ids alone under a non-slash prefix too', () => {
      expect(transformCommandInvocations('/ww:apply and /ww:bogus', FLAT_AT)).toBe(
        '@ww-apply and /ww:bogus'
      );
    });

    it('is a no-op for the canonical namespaced slash form', () => {
      const input = 'Use /ww:new then /ww:apply';
      expect(transformCommandInvocations(input, NAMESPACED_SLASH)).toBe(input);
    });
  });
});

describe('transformToSkillReferences', () => {
  describe('all known commands', () => {
    const mappings: Array<[string, string]> = [
      ['explore', '/warpweave-explore'],
      ['new', '/warpweave-new-change'],
      ['continue', '/warpweave-continue-change'],
      ['apply', '/warpweave-apply-change'],
      ['update', '/warpweave-update-change'],
      ['ff', '/warpweave-ff-change'],
      ['sync', '/warpweave-sync-specs'],
      ['archive', '/warpweave-archive-change'],
      ['bulk-archive', '/warpweave-bulk-archive-change'],
      ['verify', '/warpweave-verify-change'],
      ['onboard', '/warpweave-onboard'],
      ['propose', '/warpweave-propose'],
      ['security-scan', '/warpweave-security-scan'],
    ];

    for (const [cmd, skillRef] of mappings) {
      it(`should transform /ww:${cmd} to ${skillRef}`, () => {
        expect(transformToSkillReferences(`/ww:${cmd}`)).toBe(skillRef);
      });
    }
  });

  describe('basic transformations', () => {
    it('should transform command reference in context', () => {
      const input = 'Use /ww:apply to implement tasks';
      const expected = 'Use /warpweave-apply-change to implement tasks';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform multiple command references', () => {
      const input = 'Run /ww:apply then /ww:archive';
      const expected = 'Run /warpweave-apply-change then /warpweave-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/ww:continue` to proceed';
      const expected = 'Run `/warpweave-continue-change` to proceed';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform references across multiple lines', () => {
      const input = `Use /ww:new to start
Then /ww:apply to implement`;
      const expected = `Use /warpweave-new-change to start
Then /warpweave-apply-change to implement`;
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToSkillReferences('')).toBe('');
    });

    it('should leave unknown command references unchanged', () => {
      const input = 'Try /ww:unknown-command here';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new ww: /other:command';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should transform longest matching command (bulk-archive vs archive)', () => {
      const input = '/ww:bulk-archive and /ww:archive';
      const expected = '/warpweave-bulk-archive-change and /warpweave-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });
});

describe('getSkillReferenceTransformer', () => {
  it('uses the default /<name> form for tools without a custom prefix', () => {
    expect(getSkillReferenceTransformer('vibe')).toBe(transformToSkillReferences);
    expect(getSkillReferenceTransformer('hermes')('/ww:apply')).toBe('/warpweave-apply-change');
  });

  it('uses /skill:<name> for Kimi Code, per its documented invocation syntax', () => {
    const transformer = getSkillReferenceTransformer('kimi');
    expect(transformer('/ww:propose')).toBe('/skill:warpweave-propose');
    expect(transformer('Run `/ww:apply` then /ww:archive')).toBe(
      'Run `/skill:warpweave-apply-change` then /skill:warpweave-archive-change'
    );
    expect(transformer('/ww:unknown-command')).toBe('/ww:unknown-command');
  });
});

describe('getTransformerForTool', () => {
  it('selects skill references for skills-only delivery for every tool', () => {
    expect(getTransformerForTool('claude', 'skills', 'adapter-backed', NAMESPACED_SLASH)).toBe(
      transformToSkillReferences
    );
    // hyphen-command tools must not fall back to hyphen commands when no commands are generated
    expect(getTransformerForTool('opencode', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('pi', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('oh-my-pi', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
  });

  it('selects skill references for tools without a command surface, regardless of delivery', () => {
    // Tools like Kimi Code or Mistral Vibe have no command adapter, so their
    // skills must never reference /ww:* commands that were not generated.
    expect(getTransformerForTool('vibe', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('hermes', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    // Kimi Code documents /skill:<name> invocations (docs/supported-tools.md)
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('kimi', delivery, 'none', undefined);
      expect(transformer?.('/ww:propose')).toBe('/skill:warpweave-propose');
    }
  });

  it('selects hyphen commands for every flat-invocation tool when commands are generated', () => {
    // These tools invoke commands by filename (/ww-<id>), so skills must
    // reference the hyphen form their command files actually answer to.
    for (const toolId of ['bob', 'cursor', 'github-copilot', 'oh-my-pi', 'opencode', 'pi', 'qwen'] as const) {
      for (const delivery of ['both', 'commands'] as const) {
        const transformer = getTransformerForTool(toolId, delivery, 'adapter-backed', FLAT_SLASH);
        expect(transformer?.('/ww:apply'), `${toolId} ${delivery}`).toBe('/ww-apply');
      }
      // ...but must not fall back to hyphen commands when no commands are generated
      expect(getTransformerForTool(toolId, 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    }
  });

  it('selects skill references for devin whenever skills are generated', () => {
    // The Devin Local agent has no workflows, so Devin skill bodies and the
    // getting-started hint must name `/openspec-*` skills, which both Devin
    // agents accept. Workflow bodies get the hyphen form from the generator,
    // like every other flat-invocation tool.
    expect(getTransformerForTool('devin', 'both', 'adapter-backed', FLAT_SLASH)).toBe(
      transformToSkillReferences
    );
    expect(getTransformerForTool('devin', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(
      transformToSkillReferences
    );
    // Under commands-only delivery no Devin skills exist to point at, so the
    // hint falls back to the workflow name Devin registers.
    const commandsOnly = getTransformerForTool('devin', 'commands', 'adapter-backed', FLAT_SLASH);
    expect(commandsOnly?.('/ww:propose')).toBe('/ww-propose');
  });

  it("selects Amazon Q's @-prefixed prompt form when commands are generated", () => {
    // Amazon Q loads .amazonq/prompts/ww-<id>.md into its prompt library,
    // which is invoked with @ — it registers no slash command at all.
    for (const delivery of ['both', 'commands'] as const) {
      const transformer = getTransformerForTool('amazon-q', delivery, 'adapter-backed', FLAT_AT);
      expect(transformer?.('/ww:apply'), delivery).toBe('@ww-apply');
      expect(transformer?.('Run /ww:archive next'), delivery).toBe('Run @ww-archive next');
    }
    // Skills-only delivery generates no prompt files, so point at the skill.
    expect(getTransformerForTool('amazon-q', 'skills', 'adapter-backed', FLAT_AT)).toBe(
      transformToSkillReferences
    );
  });

  it('selects no transformer for namespaced tools when commands are generated', () => {
    expect(getTransformerForTool('claude', 'both', 'adapter-backed', NAMESPACED_SLASH)).toBeUndefined();
    expect(getTransformerForTool('claude', 'commands', 'adapter-backed', NAMESPACED_SLASH)).toBeUndefined();
  });

  it('selects $-prefixed skill references for codex, which registers no slash commands', () => {
    // Codex CLI invokes skills as $<name>; the /<name> form is unrecognized.
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('codex', delivery, 'skills-invocable', undefined);
      expect(transformer?.('/ww:propose')).toBe('$warpweave-propose');
      expect(transformer?.('Run /ww:apply next')).toBe('Run $warpweave-apply-change next');
    }
  });
});
