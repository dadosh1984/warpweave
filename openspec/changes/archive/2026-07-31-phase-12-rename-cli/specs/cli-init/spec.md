## MODIFIED Requirements

### Requirement: AI Tool Configuration

The command SHALL configure AI coding assistants with skills and slash commands using a searchable multi-select experience.

#### Scenario: Prompting for AI tool selection

- **WHEN** run interactively
- **THEN** display animated welcome screen with Spectrix logo
- **AND** present a searchable multi-select that shows all available tools
- **AND** mark already configured tools with "(configured ✓)" indicator
- **AND** pre-select configured tools for easy refresh
- **AND** sort configured tools to appear first in the list
- **AND** allow filtering by typing to search

#### Scenario: Selecting tools to configure

- **WHEN** user selects tools and confirms
- **THEN** generate skills in `.<tool>/skills/` directory for each selected tool
- **AND** generate slash commands for each selected tool with a command adapter, at that adapter's own path (for example `.claude/commands/otrix/<id>.md` or `.cursor/commands/otrix-<id>.md`)
- **AND** create `openspec/config.yaml` with default schema setting

### Requirement: Success Output

The command SHALL provide clear, actionable next steps upon successful initialization.

#### Scenario: Displaying success message

- **WHEN** initialization completes successfully
- **THEN** display categorized summary:
  - "Created: <tools>" for newly configured tools
  - "Refreshed: <tools>" for already-configured tools that were updated
  - Count of skills and commands generated
- **AND** display a getting started section naming an installed onboarding workflow (for example `/otrix:propose` - Start a change)
- **AND** spell each command the way the configured tool registers it: `/otrix-<id>` for tools whose command files are named `otrix-<id>`, and the tool's skill invocation (`$openspec-<skill>` for Codex, `/skill:openspec-<skill>` for Kimi Code, `/openspec-<skill>` otherwise) for tools that receive no command files
- **AND** print one labeled line per distinct form when the selected tools disagree
- **AND** display links to documentation and feedback

#### Scenario: Displaying restart instruction

- **WHEN** initialization completes successfully and tools were created or refreshed
- **THEN** display instruction to restart IDE for slash commands to take effect

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
- **THEN** Spectrix SHALL treat it as a supported tool with `skillsDir: '.kimi-code'`
- **AND** command-file generation SHALL be skipped because no Kimi adapter is registered
