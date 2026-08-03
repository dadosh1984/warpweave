## Purpose

Gives `verify-change` a deterministic mechanical first pass over the change's entire spec, reusing the drift-check machinery that already classifies each spec scenario as compliant/missing/drifted against the project source — so a spec requirement with no code evidence is surfaced even when no task diff touched the relevant file.

## ADDED Requirements

### Requirement: Verify runs a whole-spec mechanical first pass
The verify surface SHALL run a deterministic mechanical pass over the change's full delta-spec set against the project source, classifying each scenario, in addition to the agent's semantic assessment.

#### Scenario: Whole-spec scenarios classified
- **WHEN** verify-change runs for a change
- **THEN** it SHALL extract every scenario from the change's delta-spec files and classify each as compliant / missing / drifted against the project source
- **AND** include those classifications in the verify report

#### Scenario: Missing scenario is surfaced regardless of task diffs
- **WHEN** a spec scenario has no matching evidence anywhere in the project source (status `missing`)
- **THEN** the verify report SHALL surface it as missing, even if no task diff directly touched the relevant file
- **AND** the agent SHALL address it before the change can be considered verified

#### Scenario: Whole spec, not per-task diff
- **WHEN** the mechanical pass runs
- **THEN** it SHALL scan the project source for the scenario terms across the whole spec, not only the files a single task's diff touched

### Requirement: Verify report combines mechanical and agent layers
The verify surface SHALL present both the deterministic mechanical classification and the agent's semantic assessment.

#### Scenario: Report shows mechanical status and agent assessment
- **WHEN** verify-change produces its report
- **THEN** the report SHALL show, per scenario, the mechanical status (compliant/missing/drifted) alongside the agent's judgment
