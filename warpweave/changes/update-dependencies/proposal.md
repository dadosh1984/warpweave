## Why

Six Dependabot PRs sit open on `dadosh1984/warpweave`, all dependency bumps. None merge, so `main` drifts from the lockfile those PRs propose and from the current toolchain. Not a bug, but accumulated tech debt: version drift blocks future updates and keeps the CI actions and runtime dependencies a generation behind. The project is a single maintainer and every open PR is from the bot — merging them closes the debt while the changes are small and well-scoped.

## What Changes

- **Runtime dependencies** (PRs #2, #3, #4): bump `@inquirer/core` 10.3.2 → 11.2.1, `@inquirer/prompts` 7.10.1 → 8.5.2, `commander` 14.0.3 → 15.0.0. Commander 15 is **BREAKING**: ESM-only (we are already ESM, so seamless), requires Node ≥ 22.12 (see Impact), and changes how paired `--opt` / `--no-opt` flags default — the repo defines such pairs (`--init-git`/`--no-init-git`, `--default`/`--no-default`) so their semantics must be re-verified.
- **Dev dependencies** (PRs #6, #8): bump `eslint` 10.7.0 → 10.8.0, `@types/node` 20.19.43 → 26.1.0.
- **CI actions** (PR #7): bump `actions/checkout` 4 → 7, `actions/setup-node` 4 → 7, `pnpm/action-setup` 2 → 6, `actions/upload-artifact` 4 → 7, `softprops/action-gh-release` 1 → 3.
- **Node engine**: if commander 15's Node ≥ 22.12 requirement binds, raise `engines.node` to `>=22.12.0` and align every workflow `node-version` (currently `20.19.0`) — otherwise `warpweave install`/CI would break.

## Capabilities

### New Capabilities

None — this is a tooling/dependency update, not a user-facing behavior change.

### Modified Capabilities

None — no spec-level behavior changes. `skip_specs: true` is set in `.warpweave.yaml`.

## Impact

- `package.json`, `pnpm-lock.yaml` (runtime + dev deps).
- `.github/workflows/*.yml` (5 actions across `ci.yml`, `test.yml`, `build.yml`, `release.yml`, `security.yml`).
- `src/cli/index.ts`, `src/commands/schema.ts`, `src/commands/store.ts`, `src/commands/spec.ts`, `src/commands/doctor.ts`, `src/commands/context.ts`, `src/commands/workset.ts`, `src/commands/config.ts` (commander import + `--no-*` option semantics).
- Prompt code (`src/` via `@inquirer/*`) — API surface check on major bump.
- `engines.node` and CI `node-version` (possible raise to ≥ 22.12.0).
- Release workflow: merging bumps nothing in the npm version unless `package.json` changes it — dependency bumps alone do not re-publish.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — 6 bot PRs accumulate; version drift becomes debt and blocks later updates |
| Existing code reuse? | Yes — Dependabot already produced exact lockfile deltas; apply them rather than hand-editing |
| Stdlib? | No — dependency updates are a lockfile/action concern, stdlib does not apply |
| Native platform? | No — GitHub's own actions (`checkout`, `setup-node`) are the CI mechanism |
| New dependency? | No — every bump targets an already-declared package; no new deps introduced |
