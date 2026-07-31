## MODIFIED Requirements

### Requirement: Specs Sync Skill
The system SHALL provide an `/otrix:sync` skill that syncs delta specs from a change to the main specs.

#### Scenario: Sync delta specs to main specs
- **WHEN** agent executes `/otrix:sync` with a change name
- **THEN** the agent reads delta specs from `openspec/changes/<name>/specs/`
- **AND** reads corresponding main specs from `openspec/specs/`
- **AND** reconciles main specs to match what the deltas describe

#### Scenario: Idempotent operation
- **WHEN** agent executes `/otrix:sync` multiple times on the same change
- **THEN** the result is the same as running it once
- **AND** no duplicate requirements are created

#### Scenario: Change selection prompt
- **WHEN** agent executes `/otrix:sync` without specifying a change
- **THEN** the agent infers the change from conversation context, or auto-selects it when only one active change exists
- **AND** when ambiguous, prompts user to select from available changes, showing changes that have delta specs
- **AND** announces which change was selected and how to override
