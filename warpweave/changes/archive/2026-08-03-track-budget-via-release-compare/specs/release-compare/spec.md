## ADDED Requirements

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

## MODIFIED Requirements

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
