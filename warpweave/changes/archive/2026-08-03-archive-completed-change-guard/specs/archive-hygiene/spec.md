## Purpose

Surfaces change-hygiene gaps that otherwise stay invisible: a fully completed change that was never archived, and a change name present in both the active `changes/` directory and `changes/archive/` (a stale leftover duplicate).

## ADDED Requirements

### Requirement: Completed-but-unarchived change is surfaced
The system SHALL report a change whose tasks are all complete but which has not been archived, so the author is reminded to run `/ww:archive`.

#### Scenario: Fully completed change detected
- **WHEN** a change in `changes/` has all its tasks marked complete (`- [x]`) and no open blockers
- **THEN** the system SHALL surface it as completed-but-unarchived and remind the user to run `/ww:archive`

#### Scenario: Change with incomplete tasks is not flagged
- **WHEN** a change in `changes/` still has incomplete tasks (`- [ ]`)
- **THEN** the system SHALL NOT flag it as completed-but-unarchived

### Requirement: Stale changes/archive duplicate is detected
The system SHALL report a change name present in both the active `changes/` and `changes/archive/`, as one is a leftover that should be reconciled.

#### Scenario: Duplicate name across changes/ and archive/
- **WHEN** a change name appears in both `warpweave/changes/` and `warpweave/changes/archive/` (ignoring the date prefix on the archived name)
- **THEN** the system SHALL report the duplicate and identify which entry is the leftover
