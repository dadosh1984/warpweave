# Proposal: add-default-quality-skills

## Why

`warpweave init` prints Ponytail and Superpowers as console suggestions ("Add to opencode.json: \"@dietrichgebert/ponytail\"") but never actually installs them. Users who follow the unified workflow never get the minimal-output ladder or the TDD methodology — they remain dead text in AGENTS.md. The tools should ship by default, the same way Warpweave's own skills are generated for every AI agent.

## What Changes

- Add two new generated skills to the core workflow set, produced by `warpweave init` and refreshed by `warpweave update` for **every supported AI agent** (Claude Code, OpenCode, Cursor, etc. — all 34 tool ids):
  - `ponytail-minimal-output` — the YAGNI ladder (skip / reuse / stdlib / native / dependency / one-liner / minimum) and `// ponytail:` debt markers
  - `superpowers-tdd` — RED-GREEN-REFACTOR, subagent-driven development, two-stage review
- Both skills are skill-only (no `/ww:*` command pair), mirroring how the Translator skill was shipped.
- The skills are part of the default `core` profile and the full workflow set, so they are installed without any manual configuration step.
- The init "Unified tools" hints are updated: Ponytail and Superpowers are reported as installed skills rather than "Add to opencode.json" suggestions.

## Capabilities

### New Capabilities

- `default-quality-skills`: the minimal-output ladder and the TDD methodology are available as installed skills in every generated project by default.

### Modified Capabilities

_(none — no existing spec-level behavior changes)_

## Impact

- `src/core/templates/workflows/ponytail-minimal-output.ts` and `superpowers-tdd.ts` — new skill templates (modeled on existing skill templates).
- `src/core/templates/skill-templates.ts` — re-export the two new factories.
- `src/core/shared/skill-generation.ts` — register both templates in `getSkillTemplates()`.
- `src/core/shared/tool-detection.ts` — extend `SKILL_NAMES` with the two new dir names.
- `src/core/profiles.ts` — add `ponytail-minimal-output` and `superpowers-tdd` to `CORE_WORKFLOWS` and `ALL_WORKFLOWS`.
- `src/core/profile-sync-drift.ts` — `WORKFLOW_TO_SKILL_DIR` mapping; command drift-check must keep skipping workflows without a command pair.
- `src/core/init.ts` — "Unified tools" hint section reports the skills as installed.
- Parity test golden hashes (`test/core/templates/skill-templates-parity.test.ts`) regenerated; `skills/warpweave-ponytail-minimal-output/` and `skills/warpweave-superpowers-tdd/` added to the skills.sh distribution.
- Tests updated: skill-generation, tool-detection, profiles, config tests, update tests.
- `README.md` / `CHANGELOG.md` / `package.json` version bump (minor) for the new default skills.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the unified workflow promises these tools but ships none of them; users explicitly report the skill is absent |
| Existing code reuse? | Yes — reuse `getSkillTemplates()` / `generateSkillContent()` / `SKILL_NAMES`; the Translator skill established the skill-only pattern |
| Stdlib? | No — content generation is template string handling already in the codebase |
| Native platform? | No — no platform feature installs agent skills |
| New dependency? | No — ship as generated skills, not as a runtime dependency on the external plugins |
