## Why

GitHub issue creation is restricted on `dadosh1984/warpweave`, yet `warpweave init` output and most docs direct users to `github.com/dadosh1984/warpweave/issues` as the bug-report channel, and some docs point to foreign repositories (`Fission-AI/OpenSpec/issues`, `Fission-AI/warpweave/issues`) and to a foreign Discord server (`discord.gg/YctCnvvshC`). A regular user has no working way to report a bug.

## What Changes

- Define Discord (`https://discord.gg/RHpQMYfje`) as the canonical feedback channel for bug reports and feature requests.
- `warpweave init` success output: the `Feedback:` line shows the Discord invite instead of the restricted GitHub issues URL (`src/core/init.ts`).
- `warpweave feedback` fallback paths (gh missing, gh unauthenticated, or `gh issue create` failure including disabled issues): alongside the existing manual GitHub submission guidance, surface the canonical Discord channel.
- Replace the foreign Discord link `discord.gg/YctCnvvshC` with the canonical one in the root `README.md` and docs (`docs/README.md`, `docs/faq.md`, `docs/troubleshooting.md`, `docs/ww.md`, `docs/MIGRATION.md`, `docs/migration-guide.md`).
- Replace GitHub issues feedback links that point to restricted or foreign repositories with the canonical Discord channel (same docs files).

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `cli-feedback`: the fallback and manual-submission guidance SHALL surface the canonical Discord channel whenever gh cannot create the issue (missing, unauthenticated, or creation failure).

The `cli-init` success output, docs links, and README links change too, but they are implementation-level changes: neither the `cli-init` spec nor any other spec pins the exact feedback URL, so no additional delta is needed.

## Impact

- **Code**: `src/core/init.ts` (the `Feedback:` link line); `src/commands/feedback.ts` (fallback guidance in `reportGhFailure` and `handleFallback`).
- **Docs**: root `README.md`, `docs/README.md`, `docs/faq.md`, `docs/troubleshooting.md`, `docs/ww.md`, `docs/MIGRATION.md`, `docs/migration-guide.md`.
- **Tests**: `test/commands/feedback.test.ts` asserts the pre-filled GitHub issue URL on fallback and may need new assertions for the Discord guidance.
- **No new dependencies or public API changes.**

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the advertised bug-report channel is restricted or foreign, so users currently have no working path to report a bug. |
| Existing code reuse? | Yes — reuse the existing `warpweave feedback` command and the already-used Discord concept; introduce no new mechanism. |
| Stdlib? | Yes — only URL/string constants; nothing beyond Node stdlib and existing helpers. |
| Native platform? | No — no platform feature applies. |
| New dependency? | No — plain string constants, no new package. |
