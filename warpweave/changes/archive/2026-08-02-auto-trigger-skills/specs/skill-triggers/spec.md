## Purpose

Skills that can act automatically fire on the situation they are designed for, so the pipeline runs by itself and the user observes rather than drives; skills that require intent stay explicit commands.

## ADDED Requirements

### Requirement: Apply runs a security check after each task
The apply workflow SHALL invoke the native security scan automatically after each task is completed, in the same slot as the existing drift check.

#### Scenario: Security check fires after task completion
- **WHEN** a task is marked complete during `/ww:apply`
- **THEN** the apply workflow runs the native security scan over the task's changed code before continuing to the next task

#### Scenario: Findings pause apply for resolution
- **WHEN** the security scan reports ERROR-level findings in the task's changed code
- **THEN** the apply workflow SHALL pause and offer resolution (fix / review / continue) before proceeding

### Requirement: Apply intercepts new dependency proposals
The apply workflow SHALL check any proposed new dependency against the Ponytail ladder before it is added.

#### Scenario: New dependency is walked up the ladder
- **WHEN** implementation proposes adding a dependency not present in the project manifest
- **THEN** the workflow SHALL walk the Ponytail ladder (reuse, stdlib, native, existing dependency, one-liner) and report APPROVE / ALTERNATIVE / REJECT before the dependency is added

#### Scenario: Rejected dependency is not silently added
- **WHEN** the ladder check rejects a proposed dependency
- **THEN** the dependency SHALL NOT be added without the user accepting the alternative

### Requirement: Apply runs verify and benchmark on completion
When all tasks of a change are complete, the apply workflow SHALL run verification and benchmark automatically and show both reports before suggesting archive.

#### Scenario: Verify runs at all-done
- **WHEN** `/ww:apply` reaches `all_done`
- **THEN** it SHALL run the verify workflow against the change artifacts and display the verification report

#### Scenario: Benchmark runs at all-done
- **WHEN** `/ww:apply` reaches `all_done`
- **THEN** it SHALL run the benchmark workflow, write `benchmark.md`, and display the report alongside verification

#### Scenario: Archive suggested after reports
- **WHEN** verify and benchmark have run and their reports are shown
- **THEN** the apply workflow SHALL suggest archiving the change with `/ww:archive`

### Requirement: Guardrails gate runs before commit
The guardrails skill SHALL run automatically as a pre-commit gate when a commit is proposed during a change.

#### Scenario: Guardrails check fires before commit
- **WHEN** the workflow is about to commit a change or task
- **THEN** the four gates (SPEC, TDD, LADDER, RTK) SHALL be checked and the result reported before the commit proceeds

#### Scenario: Gate failure blocks commit
- **WHEN** any of the four gates fails
- **THEN** the commit SHALL be blocked with the failing gate and its reason reported
