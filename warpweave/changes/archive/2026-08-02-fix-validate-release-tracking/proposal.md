## Why

The CI job "Validate Release Tracking" fails on **every legitimate release pull request**. A release PR bumps `package.json`, updates `CHANGELOG.md`, and consumes a changeset that was already merged into `main`. The job's guard step runs `pnpm changeset status --since=origin/main`, which reports `Some packages have been changed but no changesets were found` because `origin/main` already contains the changeset being consumed — the deletion plus the version diff trips the check. The failure reproduces even with the canonical `pnpm changeset version` flow (verified locally). The check is not a required gate, so it does not block merges, but it produces misleading red output on the release pipeline and undermines confidence in CI. This surfaced during the v1.4.0 release (PR #23).

## What Changes

- Remove the newly-added, never-working "Guard version bump consumes changesets" step from the CI `validate-changesets` job ("Validate Release Tracking"). It was introduced in `f43dfa2` and — as reproduced locally via `pnpm changeset status` — fails on **every** legitimate release PR regardless of baseline (`--since=origin/main`, last tag, or `--output`). It catches nothing and is not a required status check.
- Remove the `version-changed` detection step that exists only to feed that guard, and restore the job's `if` conditions to depend on the long-standing `has_changesets` signal (the path that has always worked).
- Keep the pre-existing "Validate release-tracked changesets" behavior (`changeset status` when a PR adds/removes changesets) unchanged.
- No change to required status checks; existing release cadence (`main`/PR workflows) is preserved.
- Result: a legitimate release PR (version bump + consumed changeset) completes the job with no misleading failure.

## Capabilities

### New Capabilities
- `ci-release-tracking`: The CI "Validate Release Tracking" job MUST complete successfully for legitimate release PRs (a version bump accompanied by consuming the pending changesets) and for non-release PRs, so developers get reliable green signal on every release without the misleading failure introduced in `f43dfa2`.

### Modified Capabilities
(none)

## Impact

- `.github/workflows/ci.yml` — the `validate-changesets` job ("Validate Release Tracking"), specifically the "Guard version bump consumes changesets" step and its version-detection logic.
- No runtime code, no dependencies.
- Future release PRs (like vX.Y.Z bumps) will show green instead of a misleading red "Validate Release Tracking".

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | Yes for the broken guard — it was added in `f43dfa2`, never worked, and isn't required; simplest correct fix is to remove it rather than reimplement bespoke release-tracking logic. The pre-existing `has_changesets` validation stays. |
| Existing code reuse? | Yes — rely on the existing `has_changesets` signal and `changeset status` path that already worked before `f43dfa2`. |
| Stdlib? | No — stdlib has no changeset/release state logic. |
| Native platform? | No — GitHub Actions shell is the only platform mechanism, already in use. |
| New dependency? | No — no new dependency needed. |

## Complexity

Complexity: **normal**
