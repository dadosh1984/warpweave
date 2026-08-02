## Why

The release process bumps `version` in `package.json` manually in a PR (`.github/workflows/release.yml:12-13`), but nothing requires the `.changeset/*.md` files to be *consumed* (`pnpm changeset version`) in the same PR. `validate-changesets` in `ci.yml` only asserts a changeset was *added* — it never checks that CHANGELOG was regenerated. Result: CHANGELOG.md's top entry is `1.2.0` while `package.json` is `1.3.1`, and two changesets (`tessl-registry/fast-lane/express-profile`, `drift-detection`) sit unconsumed. This drift will recur on every release because the manual bump is a structural gap.

## What Changes

- Add a CI guard in `validate-changesets` (`ci.yml`): when the PR changes `package.json` `version`, run `pnpm exec changeset status --since=origin/main` and fail if any changesets remain unconsumed. This forces a version-bump PR to also run `pnpm changeset version`, keeping CHANGELOG in sync with the package version.
- Update the release-process guidance comment in `release.yml` to state that version bumps MUST be paired with `pnpm changeset version` (so the process contract is documented at the point of use).
- Add a one-time remediation task: run `pnpm changeset version` to consume the two pending changesets so CHANGELOG's top entry matches `1.3.1`.

**Design choice (vs alternatives):**
- **Rejected: switch to `changesets/action` auto-bump.** That changes the whole release cadence (Version Packages PR, bot token, "changeset" only workflow) and would require a separate, larger migration.
- **Chosen: enforce consumption at the existing manual-bump gate.** Minimal, matches the current process, closes the specific gap.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- (none — CI/process change, `skip_specs: true`)

## Impact

- `.github/workflows/ci.yml` — `validate-changesets` job gains a consumption check.
- `.github/workflows/release.yml` — process-comment update only.
- `CHANGELOG.md` — regenerated once by the remediation task.
- No runtime code, no dependency changes.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — CHANGELOG/version drift recurs on every manual-bump release |
| Existing code reuse? | Yes — reuse the existing `validate-changesets` job and `changeset status` command already used there |
| Stdlib? | n/a |
| Native platform? | n/a |
| New dependency? | No — `@changesets/cli` already a devDependency |

## Complexity

Complexity: **normal**
