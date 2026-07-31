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

/** The `/otrix-<id>` case, which most flat tools use. */
const transformToHyphenCommands = (text: string): string =>
  transformCommandInvocations(text, FLAT_SLASH);

describe('transformCommandInvocations', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/otrix:new')).toBe('/otrix-new');
    });

    it('should transform multiple command references', () => {
      const input = '/otrix:new and /otrix:apply';
      const expected = '/otrix-new and /otrix-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /otrix:apply to implement tasks';
      const expected = 'Use /otrix-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/otrix:continue` to proceed';
      const expected = 'Run `/otrix-continue` to proceed';
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
      const input = '/ops:new otrix: /other:command';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should handle multiple occurrences on same line', () => {
      const input = '/otrix:new /otrix:continue /otrix:apply';
      const expected = '/otrix-new /otrix-continue /otrix-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should leave unknown command references unchanged', () => {
      // Mirrors transformToSkillReferences: an invented id is left as written
      // rather than reshaped into a command that does not exist either.
      const input = 'Try /otrix:unknown-command here';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should rewrite only the known id on a mixed line', () => {
      expect(transformToHyphenCommands('/otrix:apply and /otrix:bogus')).toBe(
        '/otrix-apply and /otrix:bogus'
      );
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /otrix:new to start
Then /otrix:continue to proceed
Finally /otrix:apply to implement`;
      const expected = `Use /otrix-new to start
Then /otrix-continue to proceed
Finally /otrix-apply to implement`;
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
    ];

    for (const cmd of commands) {
      it(`should transform /otrix:${cmd}`, () => {
        expect(transformToHyphenCommands(`/otrix:${cmd}`)).toBe(`/otrix-${cmd}`);
      });
    }
  });

  describe('non-slash prefixes', () => {
    it("spells Amazon Q's prompt library form, replacing the slash", () => {
      // The whole `/otrix:` is consumed, so no stray slash survives: it is
      // `@otrix-apply`, never `/@otrix-apply` or `@/otrix-apply`.
      expect(transformCommandInvocations('/otrix:apply', FLAT_AT)).toBe('@otrix-apply');
      expect(transformCommandInvocations('Run `/otrix:archive` when done.', FLAT_AT)).toBe(
        'Run `@otrix-archive` when done.'
      );
    });

    it('leaves unknown ids alone under a non-slash prefix too', () => {
      expect(transformCommandInvocations('/otrix:apply and /otrix:bogus', FLAT_AT)).toBe(
        '@otrix-apply and /otrix:bogus'
      );
    });

    it('is a no-op for the canonical namespaced slash form', () => {
      const input = 'Use /otrix:new then /otrix:apply';
      expect(transformCommandInvocations(input, NAMESPACED_SLASH)).toBe(input);
    });
  });
});

describe('transformToSkillReferences', () => {
  describe('all known commands', () => {
    const mappings: Array<[string, string]> = [
      ['explore', '/openspec-explore'],
      ['new', '/openspec-new-change'],
      ['continue', '/openspec-continue-change'],
      ['apply', '/openspec-apply-change'],
      ['update', '/openspec-update-change'],
      ['ff', '/openspec-ff-change'],
      ['sync', '/openspec-sync-specs'],
      ['archive', '/openspec-archive-change'],
      ['bulk-archive', '/openspec-bulk-archive-change'],
      ['verify', '/openspec-verify-change'],
      ['onboard', '/openspec-onboard'],
      ['propose', '/openspec-propose'],
    ];

    for (const [cmd, skillRef] of mappings) {
      it(`should transform /otrix:${cmd} to ${skillRef}`, () => {
        expect(transformToSkillReferences(`/otrix:${cmd}`)).toBe(skillRef);
      });
    }
  });

  describe('basic transformations', () => {
    it('should transform command reference in context', () => {
      const input = 'Use /otrix:apply to implement tasks';
      const expected = 'Use /openspec-apply-change to implement tasks';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform multiple command references', () => {
      const input = 'Run /otrix:apply then /otrix:archive';
      const expected = 'Run /openspec-apply-change then /openspec-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/otrix:continue` to proceed';
      const expected = 'Run `/openspec-continue-change` to proceed';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform references across multiple lines', () => {
      const input = `Use /otrix:new to start
Then /otrix:apply to implement`;
      const expected = `Use /openspec-new-change to start
Then /openspec-apply-change to implement`;
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
      const input = 'Try /otrix:unknown-command here';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new otrix: /other:command';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should transform longest matching command (bulk-archive vs archive)', () => {
      const input = '/otrix:bulk-archive and /otrix:archive';
      const expected = '/openspec-bulk-archive-change and /openspec-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });
});

describe('getSkillReferenceTransformer', () => {
  it('uses the default /<name> form for tools without a custom prefix', () => {
    expect(getSkillReferenceTransformer('vibe')).toBe(transformToSkillReferences);
    expect(getSkillReferenceTransformer('hermes')('/otrix:apply')).toBe('/openspec-apply-change');
  });

  it('uses /skill:<name> for Kimi Code, per its documented invocation syntax', () => {
    const transformer = getSkillReferenceTransformer('kimi');
    expect(transformer('/otrix:propose')).toBe('/skill:openspec-propose');
    expect(transformer('Run `/otrix:apply` then /otrix:archive')).toBe(
      'Run `/skill:openspec-apply-change` then /skill:openspec-archive-change'
    );
    expect(transformer('/otrix:unknown-command')).toBe('/otrix:unknown-command');
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
    // skills must never reference /otrix:* commands that were not generated.
    expect(getTransformerForTool('vibe', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('hermes', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    // Kimi Code documents /skill:<name> invocations (docs/supported-tools.md)
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('kimi', delivery, 'none', undefined);
      expect(transformer?.('/otrix:propose')).toBe('/skill:openspec-propose');
    }
  });

  it('selects hyphen commands for every flat-invocation tool when commands are generated', () => {
    // These tools invoke commands by filename (/otrix-<id>), so skills must
    // reference the hyphen form their command files actually answer to.
    for (const toolId of ['bob', 'cursor', 'github-copilot', 'oh-my-pi', 'opencode', 'pi', 'qwen'] as const) {
      for (const delivery of ['both', 'commands'] as const) {
        const transformer = getTransformerForTool(toolId, delivery, 'adapter-backed', FLAT_SLASH);
        expect(transformer?.('/otrix:apply'), `${toolId} ${delivery}`).toBe('/otrix-apply');
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
    expect(commandsOnly?.('/otrix:propose')).toBe('/otrix-propose');
  });

  it("selects Amazon Q's @-prefixed prompt form when commands are generated", () => {
    // Amazon Q loads .amazonq/prompts/otrix-<id>.md into its prompt library,
    // which is invoked with @ — it registers no slash command at all.
    for (const delivery of ['both', 'commands'] as const) {
      const transformer = getTransformerForTool('amazon-q', delivery, 'adapter-backed', FLAT_AT);
      expect(transformer?.('/otrix:apply'), delivery).toBe('@otrix-apply');
      expect(transformer?.('Run /otrix:archive next'), delivery).toBe('Run @otrix-archive next');
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
      expect(transformer?.('/otrix:propose')).toBe('$openspec-propose');
      expect(transformer?.('Run /otrix:apply next')).toBe('Run $openspec-apply-change next');
    }
  });
});
