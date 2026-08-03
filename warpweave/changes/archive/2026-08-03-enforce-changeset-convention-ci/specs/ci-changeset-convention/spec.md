## Purpose

Lets the release pipeline gently prod the author when a single changeset appears to bundle multiple unrelated features — the "one changeset = one logical feature" convention that otherwise lives only in prose — with a warning that never blocks the merge.

## ADDED Requirements

### Requirement: CI warns on possibly-bundled changeset features
The CI SHALL inspect the changed changesets and emit a non-blocking advisory warning when a changeset may bundle multiple unrelated features.

#### Scenario: Possibly-bundling changeset triggers a warning
- **WHEN** a changed changeset is detected and the heuristic judges its summary to describe multiple unrelated concerns (e.g. several release-note bullets across distinct areas)
- **THEN** CI SHALL emit a `::warning::` naming the changeset and quoting its summary for human review
- **AND** the job SHALL still pass (the check is advisory, not a gate)

#### Scenario: Ordinary changeset produces no warning
- **WHEN** the changed changesets each describe a single coherent feature
- **THEN** CI SHALL emit no convention warning for those changesets

#### Scenario: No changed changesets
- **WHEN** a PR has no changed changeset files
- **THEN** CI SHALL skip the convention check without warning
