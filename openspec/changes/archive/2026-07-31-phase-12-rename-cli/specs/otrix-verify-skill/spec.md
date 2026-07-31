## MODIFIED Requirements

### Requirement: Verify Skill Invocation
The system SHALL provide an `/otrix:verify` skill that validates implementation against change artifacts.

#### Scenario: Verify with change name provided
- **WHEN** agent executes `/otrix:verify <change-name>`
- **THEN** the agent verifies implementation for that specific change
- **AND** produces a verification report

#### Scenario: Verify without change name
- **WHEN** agent executes `/otrix:verify` without a change name
- **THEN** the agent infers the change from conversation context, or auto-selects it when only one active change exists
- **AND** when ambiguous, prompts user to select from available changes, showing only changes that have implementation tasks
- **AND** announces which change was selected and how to override

#### Scenario: Change has no tasks
- **WHEN** selected change has no tasks.md or tasks are empty
- **THEN** the agent reports "No tasks to verify"
- **AND** suggests running `/otrix:continue` to create tasks
