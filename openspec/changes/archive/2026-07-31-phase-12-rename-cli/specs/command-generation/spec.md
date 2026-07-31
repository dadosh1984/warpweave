## MODIFIED Requirements

### Requirement: ToolCommandAdapter interface

The system SHALL define a `ToolCommandAdapter` interface for per-tool formatting.

#### Scenario: Adapter interface structure

- **WHEN** implementing a tool adapter
- **THEN** `ToolCommandAdapter` SHALL require:
  - `toolId`: string identifier matching `AIToolOption.value`
  - `getFilePath(commandId: string)`: returns file path for command (relative from project root, or absolute for global-scoped tools like Codex)
  - `formatFile(content: CommandContent)`: returns complete file content with frontmatter

#### Scenario: Claude adapter formatting

- **WHEN** formatting a command for Claude Code
- **THEN** the adapter SHALL output YAML frontmatter with `name`, `description`, `category`, `tags` fields
- **AND** file path SHALL follow pattern `.claude/commands/otrix/<id>.md`

#### Scenario: Cursor adapter formatting

- **WHEN** formatting a command for Cursor
- **THEN** the adapter SHALL output YAML frontmatter with `name` as `/otrix-<id>`, `id`, `category`, `description` fields
- **AND** file path SHALL follow pattern `.cursor/commands/otrix-<id>.md`

#### Scenario: Windsurf adapter formatting

- **WHEN** formatting a command for Windsurf
- **THEN** the adapter SHALL output YAML frontmatter with `name`, `description`, `category`, `tags` fields
- **AND** file path SHALL follow pattern `.windsurf/workflows/otrix-<id>.md`

#### Scenario: Trae adapter formatting

- **WHEN** formatting a command for Trae
- **THEN** the adapter SHALL output YAML frontmatter with `name` and `description` fields
- **AND** file path SHALL follow pattern `.trae/commands/otrix-<id>.md`

### Requirement: Command generator function

The system SHALL provide a `generateCommand` function that combines content with adapter.

#### Scenario: Generate command file

- **WHEN** calling `generateCommand(content, adapter)`
- **THEN** it SHALL return an object with:
  - `path`: the file path from `adapter.getFilePath(content.id)`
  - `fileContent`: the formatted content from `adapter.formatFile(content)`

#### Scenario: Command references match the name the tool registers

- **WHEN** the adapter's file path names the command by filename (`otrix-<id>`)
- **THEN** `generateCommand` SHALL rewrite `/otrix:<id>` references in the body to `/otrix-<id>` before formatting
- **WHEN** the adapter's file path does not name the command by filename (for example it namespaces the command under an `otrix/` directory)
- **THEN** the body's `/otrix:<id>` references SHALL be left unchanged

#### Scenario: Command references use the tool's own invocation prefix

- **WHEN** an adapter declares an `invocationPrefix` because its files are not invoked with a slash (Amazon Q loads `.amazonq/prompts/otrix-<id>.md` into a prompt library invoked with `@`)
- **THEN** `generateCommand` SHALL rewrite `/otrix:<id>` references in the body to `<prefix>otrix-<id>` — for Amazon Q, `@otrix-<id>` — replacing the leading slash rather than adding to it
- **AND** generated skills and the `init`/`update` "Getting started" hint SHALL use the same form
- **WHEN** an adapter declares no `invocationPrefix`
- **THEN** the prefix SHALL default to `/`

#### Scenario: Generate multiple commands

- **WHEN** generating all otrix commands for a tool
- **THEN** the system SHALL iterate over command contents and generate each using the tool's adapter

### Requirement: Shared command body content

The body content of commands SHALL be shared across all tools.

#### Scenario: Same instructions across tools

- **WHEN** generating the 'explore' command for Claude and Cursor
- **THEN** both SHALL use the same `body` content
- **AND** only the frontmatter, the file path, and the spelling of `/otrix:*` command references SHALL differ
