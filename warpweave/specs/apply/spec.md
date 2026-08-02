# Apply Specification

## Purpose

Defines how the apply phase executes approved change tasks, including drift detection between task completions.

## Requirements

### Requirement: Apply phase runs drift check after each task
The system SHALL run a drift check automatically after each task is completed during the apply phase.

#### Scenario: Drift check fires after task completion
- **WHEN** a task is marked complete during apply
- **THEN** the system invokes the drift-detection skill to compare code against spec files

#### Scenario: Drift found pauses apply with options
- **WHEN** drift is detected after a task
- **THEN** the apply phase pauses and presents the user with resolution options (fix code / update spec / continue)
- **AND** apply resumes only after the user makes a choice
