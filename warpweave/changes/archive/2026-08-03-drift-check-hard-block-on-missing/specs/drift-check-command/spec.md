## ADDED Requirements

### Requirement: Missing scenario hard-blocks the drift check
The drift check SHALL exit with a non-zero code when any scenario is `missing`, so the deterministic layer can block progress rather than rely on the agent's willingness to pause.

#### Scenario: Missing scenario blocks with non-zero exit
- **WHEN** the drift check finds one or more scenarios with status `missing` (zero term matches across the source)
- **THEN** the drift check SHALL exit non-zero
- **AND** the human path SHALL clearly list the blocking `missing` findings

#### Scenario: Drifted scenario stays advisory
- **WHEN** the drift check finds only `drifted` (some terms found) or `compliant` scenarios
- **THEN** the drift check SHALL exit 0 (drifted remains advisory, requiring agent judgment)

#### Scenario: Missing block can be overridden
- **WHEN** the user opts out explicitly (e.g. `--no-fail-on-missing`)
- **THEN** the drift check SHALL still report `missing` findings but SHALL exit 0

## MODIFIED Requirements

### Requirement: Drift check output is structured
The system SHALL output drift check results in a clear, structured format.

#### Scenario: Human-readable output
- **WHEN** drift check completes
- **THEN** the output shows each spec scenario with its compliance status (compliant / missing / drifted)
- **AND** for drifted scenarios, shows the expected vs actual behavior

#### Scenario: JSON output for automation
- **WHEN** user passes `--json` flag
- **THEN** the output is a JSON array of drift findings with file, line, expected, and actual fields
- **AND** reflects the blocking state of the check (e.g. a `blocked` field) so automation can rely on it
