## Context

See proposal.md - Why. The repo is ESM (`"type": "module"`), so commander 15's ESM-only migration is seamless. CI pins Node `20.19.0` in five workflows; `engines.node` is `>=20.19.0`. Paired boolean flags exist in `src/commands/store.ts` (`--init-git`/`--no-init-git`) and `src/commands/schema.ts` (`--default`/`--no-default`) — commander 15 changed how paired positive/negative options default (`--no-*` no longer implicitly flips the paired default).

## Goals / Non-Goals

**Goals:**
- Merge all six open Dependabot PRs (#2–#4, #6–#8) into `main` via one coordinated update.
- Keep every CLI flag's observable semantics byte-identical to today.
- Raise Node baseline to ≥ 22.12.0 (commander 15 requirement) coherently across `engines` and CI.

**Non-Goals:**
- No new features or user-facing behavior changes.
- No unrelated refactors of commander/inquirer usage beyond what the major bumps require.
- No npm version bump — dependency updates alone do not re-publish.

## Decisions

1. **Adopt commander 15, raise Node to ≥ 22.12.0** — commander 14 is in maintenance (security until May 2027) but moving to 15 now avoids a second forced migration later. We are already ESM, so the main cost is the Node floor, which the maintainer accepted. *Alternative considered:* stay on commander 14 and close #3 — rejected, keeps drift.
2. **Align every workflow `node-version` to the same release as `engines`** — use `22.12.0` everywhere (`ci.yml` ×3, `test.yml`, `build.yml`, `release.yml`, `security.yml`) to guarantee CI matches the declared floor. *Alternative:* `22.x` floating — rejected, non-reproducible.
3. **Verify paired `--opt`/`--no-opt` flags after the commander bump** — re-run the CLI test suite and the `init`/`store setup`/`schema set-default` interactions; adjust defaults explicitly if commander 15 changed negation semantics (`store.ts`, `schema.ts`).
4. **Apply Dependabot's exact lockfile deltas** — bump via `pnpm install` against the updated `package.json` ranges so `pnpm-lock.yaml` matches, rather than hand-editing the lockfile.
5. **Inquirer 7→8 / core 10→11** — API is backwards-compatible for our usage (`@inquirer/prompts`, `@inquirer/core`); rely on the existing prompt tests to catch any surface change.
6. **Bump CI actions via PR #7's diff** — checkout 4→7, setup-node 4→7, pnpm/action-setup 2→6, upload-artifact 4→7, softprops/action-gh-release 1→3; keep action `uses:` tags exactly as Dependabot proposed.
7. **Keep npm version untouched** — `package.json` version stays `1.0.1`; the release workflow only publishes on a new version.

## Risks / Trade-offs

- [Commander 15 `--no-*` negation semantics change] → Mitigation: full test run; explicit default assertion for `--init-git`, `--default` pairs.
- [Node 22.12 floor breaks older consumer environments] → Mitigation: intentional, documented in `engines`; matches commander 15 requirement.
- [Action major bumps (checkout 4→7, setup-node 4→7) change runner behavior] → Mitigation: PR #7's actions are exercised by the full CI suite before merge.
- [pnpm/action-setup 2→6 pins pnpm; version mismatch] → Mitigation: keep `version: 9.15.9` to match `packageManager` in `package.json`.
- [Dependabot PRs may now conflict with `main`] → Mitigation: resolve via rebase during implementation, not a fresh manual diff.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Dependency deltas | 2 (reuse) | Apply Dependabot's exact package.json + lockfile diffs — already produced, don't re-derive |
| pnpm-lock.yaml | 5 (dependency) | Regenerate via `pnpm install` against bumped ranges |
| commander 15 | 5 (dependency) | Required to clear PR #3; ESM-compatible with our `"type": "module"` |
| Node floor raise | 4 (native) | Platform requirement of commander 15 — bump `engines` + CI `node-version` together |
| Paired-flag verification | 7 (minimum) | Existing suite + targeted assertions; no new harness |
| CI actions | 2 (reuse) | Take PR #7's `uses:` version changes verbatim |
