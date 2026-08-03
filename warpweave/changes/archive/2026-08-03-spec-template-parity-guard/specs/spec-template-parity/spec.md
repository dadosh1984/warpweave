## Purpose

Keeps spec-negotiated behavior visibly present in the skill/workflow template that is supposed to deliver it, so a spec↔template divergence (behavior specified in prose but never implemented in the agent-facing template) fails CI instead of shipping silently.

## ADDED Requirements

### Requirement: Mapped spec behavior is anchored in the template
The project SHALL maintain a curated mapping between behavioral spec requirements and the template files that must carry them, and verify each mapped template contains its anchor text.

#### Scenario: Mapped requirement appears in template
- **WHEN** a behavioral spec requirement is present in the mapping
- **THEN** the mapped template file SHALL contain the anchor text associated with that requirement
- **AND** a parity check SHALL fail if the anchor is absent

#### Scenario: Template missing mapped anchor fails
- **WHEN** a mapped template no longer contains its required anchor (e.g. a refactor strips the institution)
- **THEN** the parity check SHALL report the missing anchor and fail

#### Scenario: Mapping is explicit and curated
- **WHEN** a new spec-negotiated behavior requires a template anchor
- **THEN** it SHALL be added to the explicit mapping table (capability/phrase → template + anchor), not inferred by pattern matching

#### Scenario: Budget gating anchored in apply template
- **WHEN** the `skill-triggers` spec requires budget-aware gating of advisory completion triggers
- **THEN** the `apply-change.ts` template SHALL contain the budget-gating anchor (budget consult + skip/defer of benchmark and verify near ceiling)
