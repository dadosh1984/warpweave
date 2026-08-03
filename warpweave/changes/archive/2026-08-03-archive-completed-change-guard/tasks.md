## 1. Build the archive-hygiene detection

- [x] 1.1 Add `src/core/archive-hygiene.ts` exporting `findCompletedUnarchived(root)` and `findStaleDuplicates(root)`, returning findings with a reminder to run `/ww:archive`
  - **Spec scenario**: Completed-but-unarchived change is surfaced / Stale changes/archive duplicate is detected
  - **Ladder rung**: 2 (Reuse — reuse task parser and planning-home path resolution)
  - **Test first**: unit tests for a completed-unarchived change and a stale duplicate fixture
  - **Verify**: `rtk vitest run test/core/archive-hygiene.test.ts`
- [x] 1.2 Completed-but-unarchived: flag a change whose tasks are all `- [x]`; do not flag a change with any `- [ ]` remaining; no tasks.md → not flagged
  - **Spec scenario**: Fully completed change detected / Change with incomplete tasks is not flagged
  - **Ladder rung**: 2 (Reuse)
  - **Test first**: fixtures: all-done (flagged), one-pending (not flagged), no tasks.md (not flagged)
  - **Verify**: `rtk vitest run test/core/archive-hygiene.test.ts`
- [x] 1.3 Stale duplicate: report a name in both `changes/` and `changes/archive/` (archive date prefix stripped), identifying the leftover
  - **Spec scenario**: Duplicate name across changes/ and archive/
  - **Ladder rung**: 7 (Minimum — strip prefix, exact base-name compare)
  - **Test first**: fixture with same base name in both dirs → finding naming the leftover
  - **Verify**: `rtk vitest run test/core/archive-hygiene.test.ts`

## 2. Surface the findings

- [x] 2.1 Wire the hygiene findings into the `doctor` project self-check (see `add-warpweave-doctor`) and/or `list`/`status` output
  - **Spec scenario**: Completed-but-unarchived / stale duplicate surfaced
  - **Ladder rung**: 2 (Reuse — extend existing surface)
  - **Test first**: CLI test asserting the surfaced finding appears
  - **Verify**: `rtk vitest run test/core/archive-hygiene.test.ts`
- [x] 2.2 Reconcile the current stale duplicate: `warpweave/changes/fix-validate-release-tracking` (completed, already archived under `2026-08-02-fix-validate-release-tracking`) — remove the leftover active copy after user confirm
  - **Spec scenario**: Stale changes/archive duplicate is detected (resolved)
  - **Ladder rung**: 7 (Minimum — remove leftover)
  - **Test first**: `rtk warpweave list` no longer shows the duplicate after removal
  - **Verify**: `rtk ls warpweave/changes` and `rtk ls warpweave/changes/archive`
- [x] 2.3 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
