## MODIFIED Requirements

### Requirement: OTRIX Archive Skill

The system SHALL provide an `/otrix:archive` skill that archives completed changes in the experimental workflow.

#### Scenario: Archive a change with all artifacts complete

- **WHEN** agent executes `/otrix:archive` with a change name
- **AND** all artifacts in the schema are complete
- **AND** all tasks are complete
- **THEN** the agent moves the change to `openspec/changes/archive/<target-name>/`
- **AND** displays success message with archived location

#### Scenario: Change selection prompt

- **WHEN** agent executes `/otrix:archive` without specifying a change
- **THEN** the agent infers the change from conversation context, or auto-selects it when only one active change exists
- **AND** when ambiguous, prompts user to select from available changes, showing only active changes (excludes archive/)
- **AND** announces which change was selected and how to override

### Requirement: Spec Sync Prompt

The skill SHALL prompt to sync delta specs before archiving if specs exist.

#### Scenario: Delta specs exist

- **WHEN** agent checks for delta specs
- **AND** `specs/` directory exists in the change with spec files
- **THEN** prompt user: "This change has delta specs. Would you like to sync them to main specs before archiving?"
- **AND** if user cancels, stop without archiving
- **AND** if user confirms, execute `/otrix:sync` logic inline and wait for it to complete
- **AND** verify every capability that has a delta spec, not only those the sync reports it touched: ADDED requirements present, MODIFIED requirements carrying the changes named in the delta, REMOVED requirements absent, RENAMED requirements present under the new name and absent under the old one
- **AND** stop without archiving if the sync fails or any capability does not verify
- **AND** archive only after verification passes, or when the user explicitly chose to archive without syncing or to archive already-synced specs

#### Scenario: No delta specs

- **WHEN** agent checks for delta specs
- **AND** no `specs/` directory or no spec files exist
- **THEN** proceed without sync prompt

### Requirement: Skill Output

The skill SHALL provide clear feedback about the archive operation.

#### Scenario: Archive complete with sync

- **WHEN** archive completes after syncing specs
- **THEN** display summary:
  - Specs synced (from `/otrix:sync` output)
  - Change archived to location
  - Schema that was used

#### Scenario: Archive complete without sync

- **WHEN** archive completes without syncing specs
- **THEN** display summary:
  - Note that specs were not synced (if applicable)
  - Change archived to location
  - Schema that was used

#### Scenario: Archive complete with warnings

- **WHEN** archive completes with incomplete artifacts or tasks
- **THEN** include note about what was incomplete
- **AND** suggest reviewing if archive was intentional
