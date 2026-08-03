## Purpose

After each release, the project compares itself against the previous release to measure how much it improved (or worsened) on defined criteria, scores that improvement, and warns — without blocking — when the change falls short of a configurable minimum improvement threshold.
## Requirements
### Requirement: Release compare runs after each release
The system SHALL run a before/after comparison of the project when a release happens, comparing the current state against the previous release.

#### Scenario: Compare runs on release event
- **WHEN** a project release is published
- **THEN** the system runs a comparison of the project state against the previous release and presents the result

#### Scenario: Manual invocation
- **WHEN** the user invokes `/ww:release-compare`
- **THEN** the system runs the same comparison manually at any time

#### Scenario: First release has no baseline
- **WHEN** the current release is the project's first and no previous release exists
- **THEN** the system establishes the current state as the new baseline and reports that no comparison is possible yet

### Requirement: Comparison scores defined improvement criteria
The comparison SHALL measure the change across defined criteria and produce a single improvement score, mixing measurable data and agent judgment.

#### Scenario: Criteria measured and reported
- **WHEN** a release comparison runs
- **THEN** it SHALL measure each criterion (test pass rate and coverage, spec compliance via drift check, security findings via native security scan, code size and dependency deltas, token savings) and report per-criterion before/after values

#### Scenario: Improvement score computed
- **WHEN** all criteria are measured
- **THEN** the system SHALL compute a weighted improvement score on a 0–100 scale representing the delta between the previous release and the current one

#### Scenario: Worsening is reported
- **WHEN** a criterion or the overall score worsened versus the previous release
- **THEN** the system SHALL report the regression explicitly rather than only reporting improvements

### Requirement: Threshold warns but never blocks
The improvement score SHALL be compared against a configurable minimum threshold; falling below it SHALL produce a warning with a recommendation, not a blocked release.

#### Scenario: Below-threshold improvement warns
- **WHEN** the improvement score is below the configured minimum improvement threshold (e.g. 25%)
- **THEN** the system SHALL flag the release as needing work, show which criteria dragged the score down, and recommend the changes to make before the next release

#### Scenario: Above-threshold improvement confirms
- **WHEN** the improvement score is at or above the threshold
- **THEN** the system SHALL report the improvement as satisfactory

#### Scenario: Threshold configurable per project
- **WHEN** a project configures a minimum improvement threshold
- **THEN** the configured value SHALL be used instead of the default

### Requirement: Comparison measures real user value
Beyond raw metrics, the comparison SHALL include an agent-judged assessment of the change's real benefit to the end user.

#### Scenario: User-value judgment included
- **WHEN** a release comparison runs
- **THEN** it SHALL include an agent assessment of user-facing benefit (features delivered versus promised, clarity, documentation, experience) as part of the criteria, not only machine-measured numbers

### Requirement: Comparison report is advisory and persistent
The comparison SHALL produce a written report the user can inspect, without modifying project files.

#### Scenario: Report written to release history
- **WHEN** a release comparison completes
- **THEN** it SHALL write the report to the release history (e.g. `warpweave/metrics/release-compare/<release>.md`) and show a summary

#### Scenario: Compare is read-only
- **WHEN** a release comparison runs
- **THEN** it SHALL not modify project code, specs, or change artifacts

### Requirement: Comparison tracks the token-budget effect on spend
When budget data is available, the comparison SHALL track per-change token-budget facts and report the budget's effect on average token spend per change across releases.

#### Scenario: Budget facts collected per change
- **WHEN** a release comparison runs and changes have token-budget data (budget set, tokens measured, near/over-ceiling events, advisory-trigger skips)
- **THEN** the comparison SHALL collect those facts and report average token spend per change for the release
- **AND** report the delta versus the previous release

#### Scenario: Budget effect on average spend reported
- **WHEN** comparing two releases where at least one has budget data
- **THEN** the comparison SHALL report whether average per-change token spend improved GIVEN the budget (e.g. more changes stayed under the cap, fewer overruns)
- **AND** flag a regression if average spend per change worsened

#### Scenario: No budget data keeps existing behavior
- **WHEN** a release has no token-budget data configured
- **THEN** the comparison SHALL keep the existing behavior and SHALL NOT add a budget section or warnings

