## Why

Three Warpweave workflow templates and their generated skills contain the grammar error "an Warpweave change" instead of "a Warpweave change". It does not affect behavior, but reads unprofessionally in user-facing text.

## What Changes

- Replace every occurrence of "an Warpweave change" with "a Warpweave change" in:
  - `src/core/templates/workflows/apply-change.ts` (description, instructions, and the experimental variant)
  - `src/core/templates/workflows/continue-change.ts` (description)
  - `src/core/templates/workflows/update-change.ts` (description)
- Regenerate the `skills/` distribution so the generated `SKILL.md` files carry the fix.

## Capabilities

### New Capabilities

None. This is a text-only correction in templates and generated docs.

### Modified Capabilities

None. No behavior or requirements change.

## Impact

- Source templates: `src/core/templates/workflows/{apply-change,continue-change,update-change}.ts`
- Generated skills: `skills/warpweave-{apply-change,continue-change,update-change}/SKILL.md`
- No API, CLI, or behavioral changes.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the typo is user-visible across three workflow prompts. |
| Existing code reuse? | Yes — fix the template sources and regenerate skills with the existing generator. |
| Stdlib? | N/A — text replacement in existing strings. |
| Native platform? | N/A |
| New dependency? | No |
