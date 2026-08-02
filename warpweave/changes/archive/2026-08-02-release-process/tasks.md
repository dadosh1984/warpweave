## 1. CI consumption guard

- [x] 1.1 Add a `version_changed` detection step in `validate-changesets` (`ci.yml`) that diffs `package.json` against `origin/main`
  - **Spec scenario**: N/A (skip_specs — CI change)
  - **Ladder rung**: 3 (stdlib `git diff`)
  - **Test first**: N/A (shell logic; validated by workflow run)
  - **Verify**: `rtk gh workflow run ci.yml --ref <branch>` (dry validation) — otherwise lint/parse check
- [x] 1.2 Add a guarded step: when `version_changed=true`, run `pnpm exec changeset status --since=origin/main` and fail the job on unconsumed changesets
  - **Spec scenario**: N/A
  - **Ladder rung**: 2 (reuse existing `changeset status` invocation)
  - **Test first**: N/A
  - **Verify**: `rtk gh workflow run` or manual `pnpm exec changeset status --since=origin/main`
- [x] 1.3 Verify the guard does not fail ordinary feature PRs (no version bump) — confirm the `if:` condition only fires on version change
  - **Spec scenario**: N/A
  - **Ladder rung**: 6 (one-line condition)
  - **Test first**: N/A
  - **Verify**: `rtk gh workflow run`

## 2. Process documentation

- [x] 2.1 Expand the versioning comment in `.github/workflows/release.yml` (lines 12-13) to require `pnpm changeset version` alongside the manual bump
  - **Spec scenario**: N/A
  - **Ladder rung**: 6 (one-line doc edit)
  - **Test first**: N/A
  - **Verify**: `rtk pnpm exec prettier --check .github/workflows/release.yml` (if configured) or manual review

## 3. One-time remediation

- [x] 3.1 Run `pnpm changeset version` to consume the two pending changesets; inspect the CHANGELOG diff; ensure top entry is `1.3.1` and `package.json` stays `1.3.1`
  - **Spec scenario**: N/A
  - **Ladder rung**: 2 (reuse `changeset version`)
  - **Test first**: N/A
  - **Verify**: `rtk pnpm changeset version` then `rtk git diff CHANGELOG.md`; confirm top heading `## 1.3.1`
- [x] 3.2 Run full test suite to confirm nothing regressed from the CHANGELOG/changeset changes
  - **Spec scenario**: N/A
  - **Ladder rung**: 7 (minimum)
  - **Test first**: N/A
  - **Verify**: `rtk pnpm test`
