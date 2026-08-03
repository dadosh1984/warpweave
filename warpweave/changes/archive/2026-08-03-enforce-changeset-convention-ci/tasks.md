## 1. Build the advisory heuristic

- [x] 1.1 Add `scripts/changeset-convention-check.js`: reads changed changeset files (from `CHANGESET_FILES` env, newline-separated) and flags a changeset whose summary appears to bundle multiple unrelated features, emitting `::warning::` with the filename and quoted summary; always exits 0
  - **Spec scenario**: Possibly-bundling changeset triggers a warning / Ordinary changeset produces no warning
  - **Ladder rung**: 7 (Minimum — plain Node, stdlib)
  - **Test first**: `node scripts/changeset-convention-check.js` unit tests for multi-bullet (warning) vs single-feature (no warning) summaries
  - **Verify**: `rtk vitest run test/scripts/changeset-convention-check.test.ts`
- [x] 1.2 Ensure the script is advisory-only: exits 0 on every path, never returns non-zero for a detected violation
  - **Spec scenario**: Possibly-bundling changeset triggers a warning (job still passes)
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: assertion exit code is 0 even when a warning was emitted
  - **Verify**: `rtk vitest run test/scripts/changeset-convention-check.test.ts`
- [x] 1.3 Handle the no-changed-changesets case (skip without warning)
  - **Spec scenario**: No changed changesets
  - **Ladder rung**: 1 (YAGNI — early return)
  - **Test first**: empty `CHANGESET_FILES` → no warning, exit 0
  - **Verify**: `rtk vitest run test/scripts/changeset-convention-check.test.ts`

## 2. Wire into CI

- [x] 2.1 Add the convention-check step to the `validate-changesets` job in `.github/workflows/ci.yml`, gated on `has_changesets == 'true'`, passing `CHANGESET_FILES`
  - **Spec scenario**: Possibly-bundling changeset triggers a warning (in job)
  - **Ladder rung**: 2 (Reuse — extend existing job)
  - **Test first**: assert ci.yml contains the step and env wiring
  - **Verify**: `rtk grep -n "changeset-convention-check" .github/workflows/ci.yml`
- [x] 2.2 Verify the advisory step never causes the job to fail (no `exit 1`, no non-zero gate)
  - **Spec scenario**: Possibly-bundling changeset does not block
  - **Ladder rung**: 2 (Reuse)
  - **Test first**: assert no `continuation-on-error: false` / exit-1 in the step
  - **Verify**: `rtk vitest run test/scripts/changeset-convention-check.test.ts`
- [x] 2.3 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
