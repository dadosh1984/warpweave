## Why

Users frequently write tasks quickly, on the go ("сделай авторизацию", "поправь баг с оплатой"), leaving gaps in scope, acceptance criteria, constraints, and environment. The AI then either guesses (and guesses wrong) or asks a barrage of questions, wasting both user time and AI budget. A proven, top-ranked skill — `ask-questions-if-underspecified` from trailofbits/skills (269k+ downloads) — already solves exactly this: it works like a secretary at the intake, spots missing details, asks 1–5 short clarifying questions with ready-made answer options (so the user just replies "1a, 2b"), and only then passes a clean, unambiguous formulation onward.

## What Changes

- Add a new skill template `warpweave-translator` to the skill-generation system (`src/core/templates/workflows/translator.ts`) modeled on the trailofbits `ask-questions-if-underspecified` skill.
- Register it as a core workflow so `warpweave init` installs it **by default** in every project, alongside the existing core skills.
- Regenerate the committed skills.sh distribution (`skills/warpweave-translator/SKILL.md`) so skills.sh users also get it.
- Update `README.md` to document the Translator skill.
- Bump the release version and push to GitHub.

## Capabilities

### New Capabilities
- `translator-skill`: The Translator skill turns underspecified user requests into clearly-specified ones before implementation, by detecting missing details, asking 1–5 multiple-choice clarifying questions, and confirming the interpretation before acting.

### Modified Capabilities
<!-- No existing requirement changes: this is a new skill shipped by default, not a change to existing spec-level behavior. -->

## Impact

- `src/core/templates/workflows/translator.ts` — new skill template (skill-only, no command pair, like `feedback`).
- `src/core/templates/skill-templates.ts` — export the new template.
- `src/core/shared/skill-generation.ts` — register the template + directory name + workflow id.
- `src/core/profiles.ts` — add `translator` to `CORE_WORKFLOWS` and `ALL_WORKFLOWS`.
- `skills/warpweave-translator/SKILL.md` — regenerated distribution.
- `README.md` — document the new skill.
- `package.json` version bump + `CHANGELOG.md` + git tag + push to `origin`.
- No new runtime dependencies; behavior is pure agent instructions.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No - vague prompts cause wrong work and wasted AI budget; this is a direct hit to the "fast + quality + economical" mission |
| Existing code reuse? | Yes - reuse the existing skill-template system (`feedback`-style skill-only template); content modeled on trailofbits' proven `ask-questions-if-underspecified` |
| Stdlib? | No - this is agent instruction content, not something stdlib provides |
| Native platform? | No - no platform feature ships an intake-clarification behavior |
| New dependency? | No - pure Markdown skill template; no new package required |
