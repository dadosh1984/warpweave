## Purpose

Ensures the installed `warpweave-security-scan` skill reflects the native (semgrep-free) contract and covers the established detection categories, so users never silently run a stale, semgrep-based instruction set and drift is caught without false positives from machine-generated installed skills.

## ADDED Requirements

### Requirement: Installed security-scan skill reflects the native contract
The installed `security-scan` skill the user runs SHALL reflect the native contract: running it must not require semgrep or Docker.

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
