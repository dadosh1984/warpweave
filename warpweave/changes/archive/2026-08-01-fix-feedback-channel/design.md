## Context

See proposal.md - Why. Current state that shapes the approach:

- GitHub issue creation is restricted on `dadosh1984/warpweave`, so the issues URL advertised in `init` output and docs is a dead end for regular users.
- `src/commands/feedback.ts` hardcodes the repo `dadosh1984/warpweave` and builds a pre-filled `issues/new` URL; its fallback paths (`handleFallback`, `reportGhFailure`) print that URL.
- `src/core/init.ts` prints `Feedback: https://github.com/dadosh1984/warpweave/issues`; `src/core/update.ts` prints only `Learn more`, so it needs no change.
- URL constants are inlined per file (no shared constants module exists in `src/`).
- The canonical channel is Discord: `https://discord.gg/RHpQMYfje`.

## Goals / Non-Goals

**Goals:**
- Every advertised bug-report path resolves to a working channel (Discord primary).
- `warpweave feedback` keeps working as designed when gh can create issues.

**Non-Goals:**
- Enabling GitHub issues on the repository (a repo-settings action, not code).
- Changing the `warpweave feedback` happy path or its GitHub metadata format.
- Migrating the empty `warpweave/specs/` main-spec directory (repo-level transition state, unrelated).

## Decisions

1. **Keep the gh/GitHub path as the primary submission route; surface Discord in every fallback.**
   `warpweave feedback` auto-creates a GitHub issue when possible; only when gh is missing, unauthenticated, or `gh issue create` fails (including "issues disabled") does the output add the Discord invite line.
   - *Alternative considered:* drop GitHub entirely and make feedback Discord-only — rejected: it breaks the designed happy path, its tests, and contributors who can create issues.
2. **Keep the pre-filled GitHub issue URL in fallback output, always paired with the Discord invite.**
   The URL is still useful to maintainers and to users if issues are re-enabled later; Discord is the guaranteed-working channel for everyone else.
3. **Inline the Discord invite per file (docs and source), matching the existing per-file URL pattern.**
   No shared constants module is introduced. `feedback.ts` and `init.ts` get the string directly; the 7 doc/README files get it via text replacement.
   - *Alternative considered:* export a `FEEDBACK_CHANNEL_URL` constant and import it in both commands — rejected as borderline YAGNI for a single string, and it cannot help the Markdown docs anyway. Worth revisiting if more channel URLs are added.

## Risks / Trade-offs

- **Duplicate invite string across ~9 files** → Mitigation: one text replacement sweep in this change; if the invite changes later, a single mechanical replace covers it. The source value is quoted identically everywhere.
- **Tests assert the pre-filled GitHub URL** → Mitigation: existing assertions keep passing (URL is retained); add new assertions for the Discord line in fallback scenarios.
- **Docs still advertise GitHub for contributors** → Mitigation: acceptable; contributors with access can use issues, everyone else gets Discord.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Feedback fallback channel | 2 (Reuse) | Reuse the existing `handleFallback`/`reportGhFailure` output flow; append the Discord line instead of building new machinery. |
| Discord URL source | 6 (One-liner) | A single string constant value inline, no new module. |
| Docs link updates | 6 (One-liner) | Text replacement of the wrong/foreign links. |
