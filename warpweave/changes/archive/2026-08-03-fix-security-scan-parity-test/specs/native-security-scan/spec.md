## MODIFIED Requirements

### Requirement: Installed security-scan skill reflects the native contract
The installed `security-scan` skill the user runs SHALL reflect the native contract: running it must not require semgrep or Docker, and the committed distribution source SHALL be verified native unconditionally.

#### Scenario: Distribution source is native
- **WHEN** the committed distribution source `skills/warpweave-security-scan/SKILL.md` is inspected
- **THEN** it SHALL not require semgrep or Docker (no "Requires semgrep" compatibility contract, no semgrep/Docker-only instructions)
- **AND** a parity check SHALL verify this unconditionally, even where no installed copy exists (e.g. clean clones and CI)

#### Scenario: Installed copy is native
- **WHEN** the installed skill at `.opencode/skills/warpweave-security-scan/SKILL.md` is inspected
- **THEN** it SHALL NOT require semgrep or Docker to run (no "Requires semgrep" compatibility contract, no semgrep/Docker-only instructions)
- **AND** it SHALL describe a native scan over the code changed by a task

#### Scenario: Stale semgrep installed copy is caught
- **WHEN** the installed security-scan skill still declares a semgrep/Docker requirement or instructs running semgrep/Docker
- **THEN** the CI parity check SHALL fail, naming the stale installed skill
- **AND** the failure SHALL be surfaced before the change is merged

#### Scenario: Absent installed skills are not a failure
- **WHEN** there is no installed skill directory (e.g. a CI checkout that has not run install)
- **THEN** the parity check SHALL pass without error rather than report missing files
