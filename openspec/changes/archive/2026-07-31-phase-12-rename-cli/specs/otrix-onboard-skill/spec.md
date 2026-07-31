## MODIFIED Requirements

### Requirement: OTRIX Onboard Skill

The system SHALL provide an `/otrix:onboard` skill that guides users through their first complete Spectrix workflow cycle with narration and real codebase work.

#### Scenario: Skill invocation

- **WHEN** user invokes `/otrix:onboard`
- **THEN** agent checks if Spectrix is initialized
- **AND** if not initialized, prompts user to run `spectrix init` first
- **AND** if initialized, proceeds with onboarding flow

#### Scenario: Welcome and expectations

- **WHEN** onboarding begins
- **THEN** agent displays welcome message explaining what will happen
- **AND** sets expectation of ~15 minute duration
- **AND** explains the workflow phases: explore → new → artifacts → apply → archive

### Requirement: Explore Phase Demo

The skill SHALL briefly demonstrate explore mode before creating a change.

#### Scenario: Brief explore demonstration

- **WHEN** task is selected
- **THEN** agent briefly demonstrates `/otrix:explore` by investigating relevant code
- **AND** explains explore mode is for thinking before doing
- **AND** keeps this phase short (not a full exploration session)
- **AND** transitions to change creation

### Requirement: Recap and Next Steps

The skill SHALL conclude with a recap and command reference.

#### Scenario: Final recap

- **WHEN** onboarding is complete
- **THEN** agent summarizes the workflow phases completed
- **AND** emphasizes this rhythm works for any size change
- **AND** provides command reference table (/otrix:explore, /otrix:new, /otrix:ff, /otrix:continue, /otrix:apply, /otrix:verify, /otrix:archive)
- **AND** suggests next actions (try /otrix:new or /otrix:ff on something)

### Requirement: Graceful Exit Handling

The skill SHALL handle users who want to stop mid-way.

#### Scenario: User wants to stop

- **WHEN** user indicates they want to stop during onboarding
- **THEN** agent acknowledges gracefully
- **AND** notes that the in-progress change is saved
- **AND** explains how to continue later with `/otrix:continue <name>`
- **AND** exits without pressure

#### Scenario: User wants quick reference only

- **WHEN** user says they just want to see the commands
- **THEN** agent provides command cheat sheet
- **AND** exits gracefully with encouragement to try `/otrix:new`
