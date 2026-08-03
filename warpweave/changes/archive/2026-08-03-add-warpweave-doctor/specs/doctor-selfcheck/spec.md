## Purpose

Lets the maintainer check, in one read-only command, the deterministic cross-cutting bridges that otherwise drift silently between doc-pretext contracts: spec vs template, installed skill vs distribution source, and version sync. It is the executable heart of "doctor touches exactly the bridges a drift-detection pass would, but for warpweave itself."

## ADDED Requirements

### Requirement: Doctor reports project self-check bridges
The doctor command SHALL report deterministic project self-check results in a dedicated section, in addition to its existing relationship-health output.

#### Scenario: Doctor shows the self-check section
- **WHEN** the user runs `warpweave doctor` on a project root
- **THEN** the output SHALL include a project self-check section that reports:
  - spec↔template parity (curated keyword anchors)
  - installed security-scan skill vs distribution source drift
  - pipeline.yaml version vs package.json version sync
- **AND** report, for each, ok / finding with a suggested fix

#### Scenario: Self-check is read-only
- **WHEN** the doctor self-check runs
- **THEN** it SHALL NOT modify project files, specs, skills, or config
- **AND** it SHALL only report findings and fixes

#### Scenario: Missing installed skill is reported, not skipped
- **WHEN** an installed security-scan skill copy does not exist (e.g. clean clone)
- **THEN** the doctor SHALL still report the distribution-source check
- **AND** SHALL note the absent installed copy rather than silently omitting the bridge
