## MODIFIED Requirements

### Requirement: GitHub CLI dependency

The system SHALL use `gh` CLI for automatic feedback submission when available, and provide a manual submission fallback when `gh` is not installed or not authenticated. The system SHALL use platform-appropriate commands to detect `gh` CLI availability.

#### Scenario: Missing gh CLI with fallback

- **WHEN** user runs `warpweave feedback "message"`
- **AND** `gh` CLI is not installed (not found in PATH)
- **THEN** the system displays warning: "GitHub CLI not found. Manual submission required."
- **AND** outputs structured feedback content with delimiters:
  - "--- FORMATTED FEEDBACK ---"
  - Title line
  - Labels line
  - Body content with metadata
  - "--- END FEEDBACK ---"
- **AND** displays pre-filled GitHub issue URL for manual submission
- **AND** surfaces the canonical Discord channel `https://discord.gg/RHpQMYfje` for bug reports and feature requests
- **AND** exits with zero code (successful fallback)

#### Scenario: Cross-platform gh CLI detection on Unix

- **WHEN** system is running on macOS or Linux (platform is 'darwin' or 'linux')
- **AND** checking if `gh` CLI is installed
- **THEN** the system executes `which gh` command

#### Scenario: Cross-platform gh CLI detection on Windows

- **WHEN** system is running on Windows (platform is 'win32')
- **AND** checking if `gh` CLI is installed
- **THEN** the system executes `where gh` command

#### Scenario: Unauthenticated gh CLI with fallback

- **WHEN** user runs `warpweave feedback "message"`
- **AND** `gh` CLI is installed but not authenticated
- **THEN** the system displays warning: "GitHub authentication required. Manual submission required."
- **AND** outputs structured feedback content (same format as missing gh CLI scenario)
- **AND** displays pre-filled GitHub issue URL for manual submission
- **AND** surfaces the canonical Discord channel `https://discord.gg/RHpQMYfje` for bug reports and feature requests
- **AND** displays authentication instructions: "To auto-submit in the future: gh auth login"
- **AND** exits with zero code (successful fallback)

#### Scenario: Authenticated gh CLI

- **WHEN** user runs `warpweave feedback "message"`
- **AND** `gh auth status` returns success (authenticated)
- **THEN** the system proceeds with feedback submission

### Requirement: Error handling

The system SHALL handle feedback submission errors gracefully.

#### Scenario: gh CLI execution failure

- **WHEN** `gh issue create` command fails for any reason other than the repository not defining the `feedback` label
- **THEN** the system displays the error output from `gh` CLI
- **AND** surfaces the canonical Discord channel `https://discord.gg/RHpQMYfje` for bug reports and feature requests
- **AND** exits with the same exit code as `gh`
- **AND** does not retry the submission

#### Scenario: Network failure

- **WHEN** `gh` CLI reports network connectivity issues
- **THEN** the system displays the error message from `gh`
- **AND** suggests checking network connectivity
- **AND** surfaces the canonical Discord channel `https://discord.gg/RHpQMYfje` for bug reports and feature requests
- **AND** exits with non-zero code
