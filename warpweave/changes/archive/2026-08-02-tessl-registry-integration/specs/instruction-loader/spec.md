## MODIFIED Requirements

### Requirement: Template Enrichment
The system SHALL enrich templates with change-specific context.

#### Scenario: Include artifact metadata
- **WHEN** instructions are generated for an artifact
- **THEN** the output includes change name, artifact ID, schema name, and output path

#### Scenario: Include dependency status
- **WHEN** an artifact has dependencies
- **THEN** the output shows each dependency with completion status (done/missing)

#### Scenario: Include unlocked artifacts
- **WHEN** instructions are generated
- **THEN** the output includes which artifacts become available after this one
- **AND** they are listed in the order the schema declares them, matching the order `warpweave status` recommends them

#### Scenario: Root artifact indicator
- **WHEN** an artifact has no dependencies
- **THEN** the dependency section indicates this is a root artifact

#### Scenario: Include registry skills in context
- **WHEN** Tessl Registry integration is enabled and skills are resolved for the project
- **THEN** the output includes a `## Registry Skills` section with resolved skill metadata
- **AND** the section is placed after the project context block
