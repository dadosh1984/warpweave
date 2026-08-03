## Purpose

Security scanning runs natively inside the Warpweave pipeline without external tools, checking only the code changed by a task and reporting findings by severity so the user sees security as part of the automated flow, not a manual chore.
## Requirements
### Requirement: Native security scan runs without external tools
The system SHALL run a security scan over the code changed by a task without requiring semgrep, Docker, or any other external security tool to be installed.

#### Scenario: Scan runs without semgrep installed
- **WHEN** a task is completed and the native security scan runs on a machine without semgrep
- **THEN** the scan completes successfully using only agent judgment and built-in CLI/`git` information

#### Scenario: Scan targets only changed code
- **WHEN** the native security scan runs after a task
- **THEN** it SHALL restrict its review to the files and lines changed by the task, not the whole codebase

#### Scenario: Scan uses the repo diff as scope
- **WHEN** the native security scan establishes its review scope
- **THEN** it SHALL use the repository diff (`rtk git diff`) and the change's scope from `warpweave status --change "<name>" --json` to identify changed files

### Requirement: Security scan reports findings by severity
The native security scan SHALL classify each finding into severity levels and present actionable detail for each one.

#### Scenario: Findings grouped by severity
- **WHEN** the security scan completes with findings
- **THEN** it SHALL group them as ERROR (fix before commit), WARNING (review and fix if applicable), and INFO (consider), with file, line, and a suggested fix for each

#### Scenario: Clean scan reports no issues
- **WHEN** the security scan finds no issues in the changed code
- **THEN** it SHALL report the scan as clean and allow the workflow to continue without interruption

#### Scenario: Scan is read-only
- **WHEN** the security scan runs
- **THEN** it SHALL not modify any files

### Requirement: Security scan checks standard vulnerability classes
The native security scan SHALL check the changed code for the security-relevant patterns the codebase's minimal-output guardrails enumerate: hardcoded secrets and credentials, injection (SQL, shell, template, path traversal), unsafe evaluation or deserialization, and missing validation on untrusted input.

#### Scenario: Hardcoded secret in changed code is flagged
- **WHEN** changed code contains a hardcoded secret, token, or credential
- **THEN** the scan SHALL report it as a finding with file and line

#### Scenario: Injection surface in changed code is flagged
- **WHEN** changed code builds a query, shell command, or template from untrusted input without validation
- **THEN** the scan SHALL report the injection surface as a finding

### Requirement: Security scan is cautious with uncertain findings
When the scan is not certain a pattern is a vulnerability, it SHALL prefer a lower severity rather than raising a false-critical alarm.

#### Scenario: Uncertain finding is downgraded
- **WHEN** a potential issue is plausible but not certain
- **THEN** the scan SHALL prefer INFO or WARNING over ERROR and include the reasoning

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

### Requirement: Detection categories are preserved
The native security-scan skill SHALL document coverage of the same detection categories the previous semgrep-based version covered.

#### Scenario: Categories still covered
- **WHEN** a user reads the `security-scan` skill instructions
- **THEN** the skill SHALL cover hardcoded secrets (API keys, tokens, passwords, credentials, private keys) and injection surfaces (SQL, shell, template, or path-traversal sinks)
- **AND** the skill SHALL not require semgrep or Docker to run

