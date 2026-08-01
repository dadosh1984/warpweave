## Context

The Warpweave skill system ships agent instructions as skill templates (`src/core/templates/workflows/*.ts`), each either skill-only (like `feedback.ts`) or paired with a command. `warpweave init` installs the set of skills for the active profile via `getSkillTemplates(workflows)` (skill-generation.ts) filtered by `getProfileWorkflows` (profiles.ts). The committed `skills/*/SKILL.md` tree is regenerated from the same templates by `pnpm generate:skills` and guarded by the parity test `test/core/templates/skillssh-parity.test.ts`. See proposal.md — Why for motivation.

## Goals / Non-Goals

**Goals:**
- Ship a `warpweave-translator` skill modeled on trailofbits' `ask-questions-if-underspecified` (skill-only, no command pair).
- Install it **by default** in the core profile so `warpweave init` writes it for every user without extra configuration.
- Keep the skills.sh distribution and parity test green.

**Non-Goals:**
- No changes to the warpweave CLI runtime behavior or commands.
- No new runtime dependency.
- No changes to existing core skills' content.

## Decisions

**1. Skill-only template (like `feedback`), no command pair.**
The skill is a behavior instruction for the agent at intake time, not a slash command. Modeling it on `feedback.ts` (a `SkillTemplate` with no `CommandTemplate`) reuses the existing pattern and avoids inventing a command that would add little. Alternative considered: a `/ww:translate` command pair — rejected, the skill should run implicitly when a request is underspecified, not only when explicitly invoked.

**2. Register under workflow id `translator`, directory `warpweave-translator`.**
Follows the existing `warpweave-*` directory convention and the `{ template, dirName, workflowId }` registry shape in `getSkillTemplates`. Alternative: `warpweave-ask-questions` — rejected for a shorter, product-facing name that matches the requested feature.

**3. Add `translator` to `CORE_WORKFLOWS` (and `ALL_WORKFLOWS`).**
`CORE_WORKFLOWS` is what `getProfileWorkflows('core')` returns, and core is the default profile, so listing it there makes the skill install by default. Adding it to `ALL_WORKFLOWS` keeps the full set consistent and lets custom profiles opt it in by name.

**4. Regenerate the skills.sh distribution with the existing generator.**
`pnpm build && pnpm generate:skills` writes `skills/warpweave-translator/SKILL.md` from the template with volatile frontmatter stripped — the same path used for all other skills, so the parity test passes without edits.

## Risks / Trade-offs

- [Skill is Markdown-only; no automated test can assert its conversational behavior] → Spec scenarios verify structure/placement (skill present by default, distribution parity), while behavior correctness is carried by the skill's own instructions, validated by the two-stage review in tasks.
- [Adding a workflow id could affect profile/custom-workflow filtering in `init`/`update`/completions] → The registry and profiles are the single source of truth; existing tests cover profile filtering, and the skills.sh parity test enforces the committed tree matches the registry.
- [README/version bump is a release step with a push to GitHub] → Bump is done via changeset + manual version edit, validated by `pnpm run check:pack-version`; push only after tests pass.

## Migration Plan

1. Implement the template + registry + profile registration.
2. Regenerate skills distribution; run parity test.
3. Update README; add changeset; bump version.
4. Commit, tag, push to `origin`.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Translator skill content | 2 | Reuse trailofbits' proven `ask-questions-if-underspecified` content, adapted to Warpweave voice |
| Template structure | 2 | Reuse the existing `feedback` skill-only `SkillTemplate` pattern |
| Registry + profiles | 2 | Reuse existing `getSkillTemplates` / `getProfileWorkflows`; only add entries |
| Distribution regeneration | 2 | Reuse `pnpm generate:skills` + parity test |
| New dependency | 1 | YAGNI — no new package needed |
