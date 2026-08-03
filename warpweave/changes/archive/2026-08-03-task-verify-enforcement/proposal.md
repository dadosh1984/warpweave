## Why

Every task in `tasks.md` already declares a `**Verify**: <command>` field — the author's own, specific, runnable test of that task. Yet the CLI never reads it: `src/utils/task-progress.ts:23` extracts only the `[ ]/[x]` checkbox and the line text, and `warpweave apply` never executes the command. The field exists purely as prose an agent may or may not follow. That is the model-dependence the project's philosophy rejects: a strong model runs its Verify commands (or notices a mismatch) and a weak one marks `[x]` on faith. The cheapest, strongest fix is to wire the already-required field into execution: let the CLI extract and run each task's `**Verify**:` command and refuse the `[x]` mark when it exits non-zero — the same deterministic gate `archive.ts` already provides for checkboxes, now applied to the content of the task.

## What Changes

- Add an executable CLI surface that, given a change and a task reference, extracts that task's `**Verify**:` command from `tasks.md`, runs it (RTK-wrapped per convention), and exits non-zero when the command fails.
- Have the apply guidance (the apply skill template) instruct the agent to invoke this gate before marking a task `[x]`.
- Refuse the `[x]` mark on non-zero verify: the mark is not made (or the check is reported failed) until the command passes.
- Report the verify command, its exit code, and any output so the failure is transparent and fixable — not a silent block.
- Tasks with no `**Verify**:` field keep today's behavior (no gate), preserving backward compatibility with existing tasks.md.

## Capabilities

### New Capabilities
- `task-verify-enforcement`: the CLI extracts and runs each task's `**Verify**:` command and blocks the `[x]` mark on non-zero exit (delta spec).

### Modified Capabilities
- `skill-triggers` (or `apply`): apply guidance SHALL require the verify gate before marking a task complete (delta spec, per the apply flow).

## Impact

- A new CLI command (e.g. under `warpweave task check <change> <task>` or a sibling of `drift-check`) that parses `tasks.md`, runs the `**Verify**:` command, returns non-zero on failure.
- `src/utils/task-progress.ts` — extend parsing to also capture a task's `**Verify**:` command block (its sub-lines).
- `src/core/templates/workflows/apply-change.ts` (both variants) — instruct running the gate before `- [ ]` → `- [x]`.
- `test/` — cover extraction, execution, non-zero blocking, missing-field behavior.
- No new dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the Verify field already exists in every task; only wiring it into execution turns a model-dependent suggestion into a deterministic gate. |
| Existing code reuse? | Yes — reuse `parseTaskLines`/`task-progress.ts` parsing and the RTK-wrapping convention already used for verify steps; mirror `archive.ts`'s non-zero blocking semantics. |
| Stdlib? | Yes — `child_process` to exec; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
