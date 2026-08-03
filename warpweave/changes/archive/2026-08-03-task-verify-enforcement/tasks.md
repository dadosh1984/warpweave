## 1. Parse the verify command

- [x] 1.1 Extend `src/utils/task-progress.ts` so each `ParsedTask` also captures its `**Verify**:` command sub-line(s), without breaking the existing `[ ]/[x]` parsing
  - **Spec scenario**: Verify field parsed per task
  - **Ladder rung**: 2 (Reuse — extend the existing parser)
  - **Test first**: `parseTaskLines` on a task with a `**Verify**: rtk vitest run ...` sub-line returns `verifyCommand`; a task without one returns `undefined`
  - **Verify**: `rtk vitest run test/utils/task-progress.test.ts`
- [x] 1.2 Keep no-verify-field behavior backward compatible (parsing still counts the task normally)
  - **Spec scenario**: No verify field on the task
  - **Ladder rung**: 1 (YAGNI — default path unchanged)
  - **Test first**: assert a task without `**Verify**:` still parses with `verifyCommand === undefined` and its checkbox state is unchanged
  - **Verify**: `rtk vitest run test/utils/task-progress.test.ts`

## 2. Add the executable gate

- [x] 2.1 Add `warpweave task check <change> <task>` (CLI + command module): resolve the change, parse tasks.md, locate the task by reference, extract its `**Verify**:` command
  - **Spec scenario**: Verify field parsed per task
  - **Ladder rung**: 2 (Reuse — mirror `drift-check` command structure)
  - **Test first**: CLI test running the command against a fixture change returns the extracted command
  - **Verify**: `rtk vitest run test/commands/task-check.test.ts`
- [x] 2.2 Execute the verify command via `child_process` (RTK-wrapped), surfacing command, exit code, and (on failure) output
  - **Spec scenario**: Verify command is executed and gates completion
  - **Ladder rung**: 7 (Minimum — spawn + exit code)
  - **Test first**: a fixture verify that exits 0 → the command exits 0 and reports pass; one that exits non-zero → the command exits non-zero and reports command/exit/output
  - **Verify**: `rtk vitest run test/commands/task-check.test.ts`
- [x] 2.3 Block the `[x]` mark on non-zero exit: the gate exits non-zero itself and does not report the task passed
  - **Spec scenario**: Verify fails blocks the mark
  - **Ladder rung**: 2 (Reuse — mirror `archive.ts` non-zero block)
  - **Test first**: failing verify fixture → gate exit code non-zero and report says not passed
  - **Verify**: `rtk vitest run test/commands/task-check.test.ts`
- [x] 2.4 No-verify-field task → gate reports "no verify command" and does not block
  - **Spec scenario**: No verify field on the task
  - **Ladder rung**: 1 (YAGNI)
  - **Test first**: task without verify → exit 0, message "no verify command"
  - **Verify**: `rtk vitest run test/commands/task-check.test.ts`

## 3. Wire into the apply flow

- [x] 3.1 Update `src/core/templates/workflows/apply-change.ts` (both variants) to instruct running the verify gate (`warpweave task check`) before marking a task `- [ ]` → `- [x]`, and to not mark it done when the gate fails
  - **Spec scenario**: Verify command is executed and gates completion (apply flow)
  - **Ladder rung**: 2 (Reuse — edit existing apply guidance)
  - **Test first**: assert the apply template text names the `warpweave task check` gate before completion
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 3.2 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
