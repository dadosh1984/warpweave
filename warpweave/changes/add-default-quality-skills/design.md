# Design: add-default-quality-skills

## Context

See proposal.md — Why. Warpweave generates `SKILL.md` files for every configured AI agent from `getSkillTemplates(workflows)` (init at `src/core/init.ts:768-782`, update at `src/core/update.ts:276-285`), filtered by profile workflows. The skill template registry (`src/core/shared/skill-generation.ts`), the name registry (`SKILL_NAMES` in `src/core/shared/tool-detection.ts`), and the profile lists (`src/core/profiles.ts`) are the three extension points a new generated skill touches. The Translator skill (`warpweave-translator`, skill-only, no command pair) is the established pattern for a skill without a `/ww:*` command.

## Goals / Non-Goals

**Goals:**
- Ship a minimal-output ladder skill and a TDD methodology skill as generated skills for every supported agent, installed by the default `core` profile and the full workflow set.
- Skill-only: no new `/ww:*` command pairs, mirroring the Translator skill.
- Update the init completion hints so these skills are reported as installed, not suggested.

**Non-Goals:**
- Not installing the external `@dietrichgebert/ponytail` npm plugin or any opencode plugin machinery. The skills are self-contained generated instructions.
- Not adding command-pair adapters for either skill.
- Not wiring global npm-install-time hooks; activation happens via `warpweave init` / `warpweave update`.

## Decisions

**D1: Two new skill-only templates, registered like the Translator skill.**
`ponytail-minimal-output` and `superpowers-tdd` follow the exact shape of `getTranslatorSkillTemplate`: a template in `src/core/templates/workflows/`, re-exported from `skill-templates.ts`, registered in `getSkillTemplates()` with `workflowId` = the workflow id. No command template is created, and the workflow ids are added to `CORE_WORKFLOWS` and `ALL_WORKFLOWS` only.
- *Alternative considered:* wrapping the external npm plugins. Rejected — the user chose generated skills for tool-agnostic coverage across all 34 agents; external plugins are opencode-specific.
- *Alternative considered:* adding command pairs. Rejected — neither skill is a change-workflow command; skill-only keeps the command surface stable.

**D2: Workflow ids `ponytail-minimal-output` and `superpowers-tdd` reused as skill dir names.**
Consistent with `warpweave-translator`, the dir name is derived from the workflow id (`WORKFLOW_TO_SKILL_DIR` in `src/core/profile-sync-drift.ts`). The command drift-check already skips workflows that have no command entry, so no extra guard is needed beyond keeping `COMMAND_IDS` unchanged.

**D3: Init hints switch from "Add to opencode.json" to "installed".**
The Unified tools section (`src/core/init.ts:1044-1048`) drops the manual Ponytail/Superpowers lines (they are now installed skills) and keeps the RTK line, which remains an external-tool suggestion. Skill counts already reflect the new templates via `getSkillTemplates(workflows).length`.

**D4: Parity hashes and skills.sh distribution regenerated.**
The parity test (`test/core/templates/skill-templates-parity.test.ts`) pins every template factory; the two new factories are added to the expected sets, then `pnpm regen:parity-hashes` updates the golden hashes. The skills.sh distribution (`skills/`) gains the two new skill directories via the existing generator.

## Risks / Trade-offs

- [Skill content drift from the external tools] → The generated skills are our own distilled instructions; the ladder rules are already embedded across the apply/update templates, so content is consistent internally.
- [More generated files per agent] → Two extra `SKILL.md` files per agent; minimal, and the same machinery already ships 22 skills.
- [Init hint regression tests assert the "Add to opencode.json" lines] → Update the affected tests (`test/core/init.test.ts` and config/update tests) to assert the installed-skill wording.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Skill templates (2 files) | 2 | Reuse the existing skill template shape (`getTranslatorSkillTemplate`) |
| Registry entry | 2 | Reuse `getSkillTemplates()` — add two entries |
| Name registry `SKILL_NAMES` | 2 | Reuse `SKILL_NAMES` — add two names |
| Profile lists | 2 | Reuse `CORE_WORKFLOWS` / `ALL_WORKFLOWS` — add two entries |
| Parity hashes | 2 | Reuse `pnpm regen:parity-hashes` |
| Init hints | 7 | Minimum — edit the console lines, no new infrastructure |
