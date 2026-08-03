## Purpose

Turns the per-task `**Verify**: <command>` field from advisory prose into an enforced gate: the CLI executes the author's own verification command and refuses to accept a task as done unless it passes, so any model — strong or weak — cannot close a task against its own stated criterion.

## ADDED Requirements

### Requirement: Task verify command is extracted
The CLI SHALL parse `tasks.md` and, for a given task reference, extract the task's `**Verify**: <command>` command (the sub-line(s) following the task's checkbox line).

#### Scenario: Verify field parsed per task
- **WHEN** the user/agent requests the verify gate for a task that has a `**Verify**:` field
- **THEN** the CLI SHALL extract that task's verify command from `tasks.md`

#### Scenario: No verify field on the task
- **WHEN** a task has no `**Verify**:` field
- **THEN** the gate SHALL report the task as having no verify command and SHALL not block on it (backward compatible)

### Requirement: Verify command is executed and gates completion
The CLI SHALL execute the task's verify command and block the `[x]` mark when it exits non-zero.

#### Scenario: Verify passes
- **WHEN** the task's verify command exits with code 0
- **THEN** the CLI SHALL report the task verify as passed and allow the `[x]` mark

#### Scenario: Verify fails blocks the mark
- **WHEN** the task's verify command exits with a non-zero code
- **THEN** the CLI SHALL report the failure with the command, exit code, and output
- **AND** SHALL refuse the `[x]` mark (exit non-zero itself) until the command passes

#### Scenario: Verify command execution is transparent
- **WHEN** the CLI runs a task's verify command
- **THEN** it SHALL surface the command, its exit code, and (on failure) its output so the failure is observable and fixable, not a silent block
