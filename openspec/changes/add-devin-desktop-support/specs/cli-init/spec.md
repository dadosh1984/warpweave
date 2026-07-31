# cli-init Delta Specification

## MODIFIED Requirements

### Requirement: Skill Generation

The command SHALL generate Agent Skills for selected AI tools.

#### Scenario: Generating skills for a tool

- **WHEN** a tool is selected during initialization
- **THEN** create 9 skill directories under `.<tool>/skills/`:
  - `openspec-explore/SKILL.md`
  - `openspec-new-change/SKILL.md`
  - `openspec-continue-change/SKILL.md`
  - `openspec-apply-change/SKILL.md`
  - `openspec-ff-change/SKILL.md`
  - `openspec-verify-change/SKILL.md`
  - `openspec-sync-specs/SKILL.md`
  - `openspec-archive-change/SKILL.md`
  - `openspec-bulk-archive-change/SKILL.md`
- **AND** each SKILL.md SHALL contain YAML frontmatter with name and description
- **AND** each SKILL.md SHALL contain the skill instructions

#### Scenario: Devin skills reference skills rather than workflows

- **GIVEN** the Devin Local agent does not support workflows and its documentation directs users to skills instead
- **WHEN** generating skills for the `devin` tool
- **THEN** rewrite `/otrix:<id>` references in the skill body to the matching `/openspec-<skill>` invocation, which both Devin agents accept
- **AND** the getting-started hint SHALL name `/openspec-propose` rather than a workflow
- **AND** under commands-only delivery, where no Devin skills are written, both the workflow bodies and the hint SHALL fall back to `/otrix-<id>`

### Requirement: Slash Command Generation

The command SHALL generate otrix slash commands only for selected tools that have a registered command adapter, while keeping adapterless tools valid for skill generation.

#### Scenario: Generating slash commands for a tool with a registered adapter

- **WHEN** a tool with a registered command adapter is selected during initialization
- **THEN** create 9 slash command files using the tool's command adapter:
  - `/otrix:explore`
  - `/otrix:new`
  - `/otrix:continue`
  - `/otrix:apply`
  - `/otrix:ff`
  - `/otrix:verify`
  - `/otrix:sync`
  - `/otrix:archive`
  - `/otrix:bulk-archive`
- **AND** use tool-specific path conventions (e.g., `.claude/commands/otrix/` for Claude)
- **AND** include tool-specific frontmatter format

#### Scenario: Selected tool has no command adapter

- **GIVEN** a selected tool has `skillsDir` configured but no registered command adapter
- **WHEN** initialization includes command generation
- **THEN** skill generation for that tool SHALL still remain valid
- **AND** command-file generation SHALL be skipped for that tool
- **AND** the command output SHALL include `Commands skipped for: <tool-id> (no adapter)`

#### Scenario: Kimi Code skips command-file generation

- **WHEN** the user selects Kimi Code during initialization
- **THEN** OpenSpec SHALL treat it as a supported tool with `skillsDir: '.kimi-code'`
- **AND** command-file generation SHALL be skipped because no Kimi adapter is registered

#### Scenario: Generating workflows for Devin Desktop

- **WHEN** the user selects Devin Desktop during initialization
- **THEN** create one workflow file per profile workflow at `.devin/workflows/otrix-<id>.md`
- **AND** include frontmatter with `name`, `description`, `category`, and `tags`
- **AND** rewrite `/otrix:<id>` references in the body to `/otrix-<id>`, the name Devin registers for a workflow file
