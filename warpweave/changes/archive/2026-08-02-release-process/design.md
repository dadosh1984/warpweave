## Context

See `proposal.md`. The current flow: version is bumped manually in `package.json` in a PR; `validate-changesets` (`ci.yml:227-276`) checks changed changeset files exist but never runs `changeset version` or asserts consumption; `release.yml` publishes on merge to main. `@changesets/cli` and `@changesets/changelog-github` are already devDependencies; `changeset status --since=<branch>` reports unconsumed changesets.

## Goals / Non-Goals

**Goals:**
- Make it impossible to merge a version bump while `.changeset/*.md` files remain unconsumed.
- Document the contract at the point of use in `release.yml`.
- One-time remediation: bring CHANGELOG's top entry to `1.3.1`.

**Non-Goals:**
- No migration to `changesets/action` auto-bump bot.
- No changes to runtime code or dependencies.

## Decisions

**D1 — Consumption guard in `validate-changesets`.**
After the existing steps, detect a version bump: `git diff origin/main...HEAD -- package.json`. If changed, run `pnpm exec changeset status --since=origin/main`; treat non-zero exit (which `changeset status` returns when changesets are unreleased/unconsumed) as a hard failure with a message telling the author to run `pnpm changeset version`. Implementation: a bash step guarded by a `version_changed` output, mirroring the existing `changed-changesets` pattern.

**D2 — Guard only when version actually changed.**
The check must not fail ordinary feature PRs that add a changeset (no version bump yet). Gate on `package.json` version diff — that is exactly when CHANGELOG must be regenerated.

**D3 — Process comment in `release.yml`.**
Expand the header comment (lines 12-13) to: "Versioning: bump `version` in package.json AND run `pnpm changeset version` to consume pending changesets in the same PR; the merge to main triggers publish." Documenting at the point of use so the invariant is discoverable.

**D4 — One-time remediation.**
Run `pnpm changeset version` locally to consume the two pending changesets (`2026-08-02-07-38-05.md`, `2026-08-02-08-59-drift-detection.md`), updating `CHANGELOG.md` top entry to `1.3.1`. This is a manual, reviewed step; if it produces an unexpected `1.2.1`/`1.3.0` intermediate, reconcile by keeping package version at `1.3.1` and folding notes accordingly (changelog-github groups by the actual released version). Inspect the diff before committing.

## Risks / Trade-offs

- [`changeset status` exits non-zero for reasons other than unconsumed changesets (e.g. bad changeset)] → Mitigation: the guard's message points to `pnpm changeset version` / `changeset status` output; both are the author's to fix. The existing job already surfaces `changeset status --since` failures.
- [Intermediate version numbers from `changeset version` bump history] → Mitigation: remediation task D4 inspects the CHANGELOG diff manually before commit; the guard only gates future PRs, it does not rewrite history.
- [Monorepo-less single package: `changeset version` also bumps package.json] → Mitigation: after remediation, verify `package.json` still reads `1.3.1`; if `changeset version` produced a higher semver from the changesets, keep the released `1.3.1` and regenerate CHANGELOG to match (documented in D4).

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Guard step | 2 | Reuse existing `validate-changesets` job + `changeset status` |
| Version-diff gate | 3 | stdlib `git diff` + shell |
| Process comment | 6 | One-line doc edit |
| Remediation | 2 | Reuse existing `pnpm changeset version` |
