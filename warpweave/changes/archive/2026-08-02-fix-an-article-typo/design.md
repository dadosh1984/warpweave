## Context

The grammar error "an Warpweave change" appears in user-facing template text in three workflow template files (see proposal.md). The `skills/` distribution is generated from these templates by `scripts/generate-skillssh.mjs`, so fixing only the sources and regenerating covers both.

## Goals / Non-Goals

**Goals:**
- Correct the article in every occurrence within the three template files.
- Regenerate the skills distribution so generated `SKILL.md` files match.

**Non-Goals:**
- Rewording or rephrasing template content beyond the article fix.
- Touching parity hashes: the typo text is not part of the pinned template function hashes.

## Decisions

- **Fix sources, then regenerate** — the templates in `src/core/templates/workflows/` are the source of truth; `skills/` is generated. Regenerating via `pnpm run generate:skills` keeps the distribution consistent.
- **Replace all occurrences in the file** — apply-change.ts contains the phrase in both the skill description/instructions and the experimental variant, so all instances are corrected.
- **Regenerate parity hashes** — the pinned hashes in `test/core/templates/skill-templates-parity.test.ts` cover the full template payload, so the article change invalidates them. Run `pnpm regen:parity-hashes` after the build.

## Risks / Trade-offs

- [Regeneration overwrites the skills distribution] → Mitigation: this is the expected pipeline; verify `git diff` shows only the intended article changes.
- [Parity hash update masks an unintended payload change] → Mitigation: review `git diff` on the hash test file to confirm only the three edited templates changed.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Text fix | 2 | Fix existing template strings in place, reuse the existing generator for `skills/`. |
