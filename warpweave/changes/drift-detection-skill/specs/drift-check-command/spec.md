## Purpose

Lets users manually trigger a spec/code drift check at any point during development, not just during the apply phase.

## ADDED Requirements

### Requirement: User can run drift check manually
The system SHALL provide a CLI command to manually trigger a drift check.

#### Scenario: Manual drift check via command
- **WHEN** user runs `/ww:drift-check` or `warpweave drift-check`
- **THEN** the system runs a full drift check against the current change's spec files

#### Scenario: Drift check without active change
- **WHEN** user runs drift check with no active change
- **THEN** the system lists available changes and asks the user to select one

### Requirement: Drift check output is structured
The system SHALL output drift check results in a clear, structured format.

#### Scenario: Human-readable output
- **WHEN** drift check completes
- **THEN** the output shows each spec scenario with its compliance status (compliant / missing / drifted)
- **AND** for drifted scenarios, shows the expected vs actual behavior

#### Scenario: JSON output for automation
- **WHEN** user passes `--json` flag
- **THEN** the output is a JSON array of drift findings with file, line, expected, and actual fields
