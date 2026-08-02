## Purpose

Lets warpweave automatically detect when implemented code drifts from approved specifications during the apply phase, catching mismatches early when they are cheap to fix.

## ADDED Requirements

### Requirement: Drift detection runs after each task in apply
The system SHALL run a drift check automatically after each task is completed during the apply phase.

#### Scenario: Drift check fires after task completion
- **WHEN** a task is marked complete during `/ww-apply`
- **THEN** the system runs a drift check comparing the current codebase against the change's spec files

#### Scenario: No drift found continues normally
- **WHEN** the drift check finds no discrepancies
- **THEN** the apply phase continues to the next task without interruption

### Requirement: Drift detection compares code against spec scenarios
The system SHALL read the change's spec files and compare each scenario's expected behavior against the actual implementation.

#### Scenario: Spec scenario matched by implementation
- **WHEN** a spec scenario describes a behavior that exists in the code
- **THEN** the scenario is reported as compliant

#### Scenario: Spec scenario missing from implementation
- **WHEN** a spec scenario describes a behavior not found in the code
- **THEN** the scenario is reported as missing with a reference to the spec file and line

### Requirement: Drift detection reports discrepancies with resolution options
The system SHALL present detected drifts to the user with actionable resolution choices.

#### Scenario: Drift found with resolution prompt
- **WHEN** drift is detected between spec and code
- **THEN** the system shows a diff of what spec expects vs what code does
- **AND** offers options: fix code to match spec, update spec to match code, or continue with a note

#### Scenario: User chooses to fix code
- **WHEN** the user selects "fix code to match spec"
- **THEN** the system generates a task to align the implementation with the spec

#### Scenario: User chooses to update spec
- **WHEN** the user selects "update spec to match code"
- **THEN** the system generates a delta spec update reflecting the actual implementation
