## Context

The `validate-changesets` job in `.github/workflows/ci.yml` (display name "Validate Release Tracking") gained two steps in `f43dfa2`: a "Detect package version change" step and a "Guard version bump consumes changesets" step. Reproduction (locally, against the real `@changesets/cli`) shows the guard fails on every legitimate release PR — for `--since=origin/main`, for a tag baseline, and even when using `--output` (which writes nothing on error). It is not a required status check. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Make legitimate release PRs and non-release PRs pass the job (green signal, no misleading failure).
- Remove only the broken, newly-added machinery; keep the pre-existing `has_changesets` validation that worked before `f43dfa2`.

**Non-Goals:**
- No reimplementation of release-tracking logic.
- No change to required status checks, release cadence, or `release.yml`.
- No runtime code changes.

## Decisions

**Decision D1 — Remove the broken guard and its only feeder.**
Delete the "Guard version bump consumes changesets" step and the "Detect package version change" (`version-changed`) step. The `version-changed` output is consumed solely by the removed guard and by the three `if:` conditions touched in `f43dfa2`; with the guard gone there is nothing left to feed or gate, so both go together.
- Rationale: YAGNI. The guard never worked for its purpose and provides no protection, so reimplementing or repairing it is wasted effort and maintenance burden.
- Alternative considered: repairing the step (fixing `--since` baseline or parsing `changeset status --output`) — rejected because every baseline variant fails for a legitimate release (the new version has no changeset in range and no tag yet), so no command-level fix yields the wanted behavior without bespoke logic.

**Decision D2 — Restore job gating to the `has_changesets` signal.**
Revert the `if:` conditions on the "Setup pnpm", "Setup Node.js", and "Install dependencies" steps from `steps.changed-changesets.outputs.has_changesets == 'true' || steps.version-changed.outputs.version_changed == 'true'` back to the pre-`f43dfa2` form `steps.changed-changesets.outputs.has_changesets == 'true'`. This avoids installing dependencies for version-only changes that no longer need any validation.
- Rationale: minimal diff; restores the job's original, working shape.

## Risks / Trade-offs

- Removing the guard means a manual version bump that also leaves a pending changeset is no longer flagged by this job → the job was added only in `f43dfa2`, never produced a working signal, and is not a required gate; the changeset-bot "Version Packages" flow still reconciles versions at release time.
- Scope creep risk if the whole job is refactored → keep the change surgical: only delete the two added steps and revert the three `if:` conditions.

## Migration Plan

- Apply to `.github/workflows/ci.yml` on a branch, push a PR; the job should show success for a release-shaped PR. No rollback concern beyond reverting the diff; `validate-changesets` is not a required check, so worst case is cosmetic.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Guard step removal | 1 (YAGNI) | The guard never worked and isn't required; remove instead of repairing or reimplementing. |
| Change to job gating | 2 (Reuse) | Keep the existing `has_changesets` signal and `changeset status` path rather than inventing new detection. |
| Dependencies | 5→none | No new dependency; fix is a YAML-only workflow change. |
