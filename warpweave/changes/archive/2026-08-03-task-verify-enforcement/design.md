## Context

`tasks.md` tasks carry a `**Verify**: <command>` field that is currently prose-only. `src/utils/task-progress.ts:23` (`TASK_LINE_PATTERN`) parses only the checkbox and line text; the apply flow (`apply-change.ts`) is agent-driven and never runs verify commands. `archive.ts` already demonstrates the deterministic non-zero-block gate for incomplete checkboxes. See proposal.md - Why and the `task-verify-enforcement` spec.

## Goals / Non-Goals

**Goals:**
- A CLI surface that extracts a task's `**Verify**:` command, runs it, and blocks the `[x]` on non-zero exit.
- Extend task parsing to capture the verify command; instruct the apply template to run the gate before marking done.

**Non-Goals:**
- No semantic evaluation of verify output beyond exit code.
- No change to tasks without a verify field (backward compatible).
- Not replacing the agent's judgment for non-mechanical tasks (no verify field → no gate).

## Decisions

**Decision D1 — New CLI command `warpweave task check <change> <task>` (sibling of `drift-check`).**
The command parses `tasks.md`, locates the task by number/description, extracts its `**Verify**:` command, runs it via `child_process` (spawn), and exits non-zero on failure.
- Rationale: deterministic, scriptable, reusable by the apply skill and by hand; mirrors `drift-check`'s structure and `archive`'s non-zero semantics.
- Alternative: a native `apply` command that marks tasks — too broad a redesign; the agent-driven apply stays, the gate is the enforcement hook.

**Decision D2 — Extend `task-progress.ts` parsing to capture the verify command.**
Add `verifyCommand?: string` to `ParsedTask`, capturing the `**Verify**:` sub-line(s) rather than only the checkbox text. Keeps a single parsing source.
- Rationale: reusable by the new command, apply, and any future gate.
- Alternative: a separate ad-hoc parser — rejected (drift between parsers).

**Decision D3 — RTK-wrapped exec by convention.**
The command runs the verify string through the standard shell honoring the RTK convention (wrap with `rtk`, tee logs), surfacing command, exit code, and (on failure) output.
- Rationale: matches project RTK rule; failures keep their tee logs for inspection.

**Decision D4 — No verify field → no gate.**
A task lacking `**Verify**:` is reported as "no verify command" and not blocked.
- Rationale: keeps existing tasks.md working; agent judgment remains for non-mechanical tasks.

## Risks / Trade-offs

- Arbitrary command execution from tasks.md → the commands are the author's own, repo-scoped verify steps (already written into every task); execution stays within the working repo, consistent with how RTK already runs test/verify commands.
- A failing verify could block progress → the gate is deliberate (refuse `[x]`); the user can fix the command or code, or override explicitly.
- Shell/platform differences in verify commands → run through the standard shell with the project's RTK wrapper; document platform caveats.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Parsing verify command | 2 (Reuse) | Extend `parseTaskLines` in `task-progress.ts`. |
| Exec/gate command | 2 (Reuse) | Mirror `archive.ts` non-zero semantics; `child_process`. |
| Apply-template hook | 2 (Reuse) | Edit `apply-change.ts` guidance. |
| Dependencies | 5→none | No new dependency. |
