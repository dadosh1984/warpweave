# translator-skill Specification

## Purpose

The Translator skill turns underspecified user requests into clearly-specified ones before implementation, saving user time and AI budget by asking a minimal set of clarifying questions instead of guessing wrong or over-asking.

## Requirements

### Requirement: Translator skill installed by default
The system SHALL install the Translator skill as part of the default (core) workflow set whenever it generates skills for a project.

#### Scenario: Core workflow includes the translator skill
- **WHEN** `warpweave init` generates skills for a project using the default profile
- **THEN** the project SHALL receive a Translator skill (`warpweave-translator`) alongside the existing core workflow skills

#### Scenario: All workflows include the translator skill
- **WHEN** a user selects any workflow set (core or full) during init or update
- **THEN** the Translator skill SHALL be available in the generated skill set

#### Scenario: Skills.sh distribution includes the translator skill
- **WHEN** the skills.sh distribution is regenerated
- **THEN** it SHALL contain `skills/warpweave-translator/SKILL.md` with the Translator skill content

### Requirement: Detect underspecified requests
The Translator skill SHALL treat a request as underspecified when key details are unclear, including objective, acceptance criteria, scope, constraints, environment, or safety.

#### Scenario: Multiple plausible interpretations
- **WHEN** a user's request has multiple plausible interpretations
- **THEN** the skill SHALL treat the request as underspecified

#### Scenario: Clearly specified request
- **WHEN** a request is already clear and a quick, low-risk discovery read can confirm the remaining details
- **THEN** the skill SHALL NOT ask unnecessary questions and SHALL proceed without clarifying questions

### Requirement: Ask minimal must-have questions
The skill SHALL ask at most 1-5 clarifying questions in the first pass, preferring questions that eliminate whole branches of work.

#### Scenario: Question format is scannable
- **WHEN** the skill asks clarifying questions
- **THEN** the questions SHALL be short and numbered
- **AND** multiple-choice options SHALL be offered whenever possible
- **AND** recommended defaults SHALL be clearly marked
- **AND** a fast-path reply (e.g., `defaults`) SHALL accept all recommended choices

#### Scenario: Compact answer format
- **WHEN** the skill presents questions
- **THEN** the user SHALL be able to answer with compact decisions (e.g., `1b 2a 3c`)
- **AND** the skill SHALL restate the chosen options in plain language to confirm

### Requirement: Pause before acting
The skill SHALL NOT run commands, edit files, or produce a detailed plan that depends on unanswered unknowns until the must-have answers are provided.

#### Scenario: Proceed on stated assumptions
- **WHEN** the user explicitly asks to proceed without answering
- **THEN** the skill SHALL state assumptions as a short numbered list and ask for confirmation before proceeding
- **AND** the skill SHALL proceed only after the user confirms or corrects the assumptions

#### Scenario: Low-risk discovery is allowed
- **WHEN** a clearly labeled discovery step does not commit to a direction (e.g., inspecting repo structure or config files)
- **THEN** the skill SHALL be permitted to perform it while paused

### Requirement: Confirm interpretation before starting work
Once the answers are received, the skill SHALL restate the requirements in 1-3 sentences — including key constraints and what success looks like — before starting work.

#### Scenario: Requirements restated
- **WHEN** the user provides the clarifying answers
- **THEN** the skill SHALL restate the confirmed requirements in plain language
- **AND** the skill SHALL then begin the requested work
