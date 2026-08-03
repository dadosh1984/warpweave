## ADDED Requirements

### Requirement: Budget gating institution lives in the apply template
The apply workflow template SHALL physically contain the budget-aware completion gating guidance (consult budget, warn near ceiling, skip/defer benchmark and verify), rather than relying solely on external prose.

#### Scenario: Apply template carries the budget gating anchor
- **WHEN** the apply workflow template (`apply-change.ts`) is inspected
- **THEN** it SHALL contain the budget-consult and skip/defer institution in its completion phase
- **AND** a parity check SHALL confirm the template mentions budget-aware gating of the advisory completion triggers

#### Scenario: Safety gates remain unconditional near ceiling
- **WHEN** `/ww:apply` is near or over the change's token budget
- **THEN** the per-task security scan and the pre-commit guardrails gate SHALL still run, because they are safety gates

## MODIFIED Requirements

### Requirement: Apply runs verify and benchmark on completion
When all tasks of a change are complete, the apply workflow SHALL run verification and benchmark automatically and show both reports before suggesting archive, **unless** the change's token budget is exhausted or within the configured reserve of the ceiling, in which case they SHALL be skipped or deferred with a budget warning.

#### Scenario: Verify runs at all-done
- **WHEN** `/ww:apply` reaches `all_done` and the change's token budget is unset or has headroom
- **THEN** it SHALL run the verify workflow against the change artifacts and display the verification report

#### Scenario: Benchmark runs at all-done
- **WHEN** `/ww:apply` reaches `all_done` and the change's token budget is unset or has headroom
- **THEN** it SHALL run the benchmark workflow, write `benchmark.md`, and display the report alongside verification

#### Scenario: Budget near or over ceiling defers advisory triggers
- **WHEN** `/ww:apply` reaches completion (all tasks done) and the change's token budget is exhausted or within the configured reserve of the ceiling
- **THEN** the apply workflow SHALL warn the user that the budget is near/over the ceiling
- **AND** the workflow SHALL skip or defer the advisory completion triggers (benchmark and verify) rather than running them and consuming budget beyond the limit
- **AND** the workflow SHALL display a warning that names the skipped/deferred trigger(s) and the remaining budget

#### Scenario: Archive suggested after reports
- **WHEN** verify and benchmark have run (or been budget-skipped) and their reports are shown
- **THEN** the apply workflow SHALL suggest archiving the change with `/ww:archive`

### Requirement: Auto-trigger budget respects an unset budget
When a change has no explicit token budget configured, auto-triggers SHALL run normally (current default behavior) without new warnings.

#### Scenario: No budget configured
- **WHEN** `/ww:apply` runs on a change that has no token budget set in `config/unified.toml` or the change
- **THEN** the auto-triggers SHALL run as they do today, with no budget warnings
