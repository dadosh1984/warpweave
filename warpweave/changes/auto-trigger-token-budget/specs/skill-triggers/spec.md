## MODIFIED Requirements

### Requirement: Auto-triggers respect the change's token budget
The apply workflow SHALL consult the active change's token budget before firing completion-time auto-triggers, and SHALL warn and skip (or defer) advisory triggers when the budget is exhausted or near its ceiling.

#### Scenario: Budget near or over ceiling defers advisory triggers
- **WHEN** `/ww:apply` reaches completion (all tasks done) and the change's token budget is exhausted or within the configured reserve of the ceiling
- **THEN** the apply workflow SHALL warn the user that the budget is near/over the ceiling
- **AND** the workflow SHALL skip or defer the advisory completion triggers (benchmark and verify) rather than running them and consuming budget beyond the limit

#### Scenario: Per-task security check still runs near ceiling
- **WHEN** a task is marked complete during `/ww:apply` and the change's token budget is near or over the ceiling
- **THEN** the per-task security scan SHALL still run, because it is a safety gate, and the workflow SHALL warn about the budget state

#### Scenario: Guardrails gate still runs before commit near ceiling
- **WHEN** a commit is proposed during `/ww:apply` and the change's token budget is near or over the ceiling
- **THEN** the four pre-commit gates (SPEC, TDD, LADDER, RTK) SHALL still run, because they are required for a valid commit

#### Scenario: Warning names skipped triggers and remaining budget
- **WHEN** the apply workflow skips or defers any auto-trigger because of budget limits
- **THEN** the workflow SHALL display a warning that names the skipped/deferred trigger(s) and the remaining budget

### Requirement: Auto-trigger budget respects an unset budget
When a change has no explicit token budget configured, auto-triggers SHALL run normally (current default behavior) without new warnings.

#### Scenario: No budget configured
- **WHEN** `/ww:apply` runs on a change that has no token budget set in `config/unified.toml` or the change
- **THEN** the auto-triggers SHALL run as they do today, with no budget warnings
