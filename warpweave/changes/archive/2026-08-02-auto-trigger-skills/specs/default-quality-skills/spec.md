## MODIFIED Requirements

### Requirement: Minimal-output skill installed by default
When Warpweave generates skills for a project, it SHALL install a minimal-output skill (the YAGNI ladder and `// ponytail:` debt markers) as part of the default workflow set.

#### Scenario: Core workflow includes the minimal-output skill
- **WHEN** `warpweave init` generates skills for a project using the default profile
- **THEN** the project SHALL receive a minimal-output skill alongside the existing core workflow skills

#### Scenario: Full workflow includes the minimal-output skill
- **WHEN** a user selects any workflow set (core or full) during init or update
- **THEN** the minimal-output skill SHALL be available in the generated skill set

#### Scenario: Skills.sh distribution includes the minimal-output skill
- **WHEN** the skills.sh distribution is regenerated
- **THEN** it SHALL contain the minimal-output skill content

### Requirement: TDD methodology skill installed by default
When Warpweave generates skills for a project, it SHALL install a TDD methodology skill (RED-GREEN-REFACTOR, subagent-driven development, two-stage review) as part of the default workflow set.

#### Scenario: Core workflow includes the TDD skill
- **WHEN** `warpweave init` generates skills for a project using the default profile
- **THEN** the project SHALL receive a TDD methodology skill alongside the existing core workflow skills

#### Scenario: Full workflow includes the TDD skill
- **WHEN** a user selects any workflow set (core or full) during init or update
- **THEN** the TDD methodology skill SHALL be available in the generated skill set

#### Scenario: Skills.sh distribution includes the TDD skill
- **WHEN** the skills.sh distribution is regenerated
- **THEN** it SHALL contain the TDD methodology skill content

### Requirement: Guardrails skill installed by default
When Warpweave generates skills for a project, it SHALL install a guardrails skill (the four pipeline gates: SPEC, TDD, LADDER, RTK) as part of the default workflow set.

#### Scenario: Core workflow includes the guardrails skill
- **WHEN** `warpweave init` generates skills for a project using the default profile
- **THEN** the project SHALL receive a guardrails skill alongside the existing core workflow skills

#### Scenario: Full workflow includes the guardrails skill
- **WHEN** a user selects any workflow set (core or full) during init or update
- **THEN** the guardrails skill SHALL be available in the generated skill set

#### Scenario: Skills.sh distribution includes the guardrails skill
- **WHEN** the skills.sh distribution is regenerated
- **THEN** it SHALL contain the guardrails skill content

### Requirement: Quality skills install for every supported agent
The minimal-output, TDD methodology, and guardrails skills SHALL be generated into the skills directory of every supported AI agent that Warpweave configures, not only one tool.

#### Scenario: Skills generated for each configured agent
- **WHEN** `warpweave init` configures multiple AI agents for a project
- **THEN** each configured agent's skills directory SHALL receive the minimal-output, TDD methodology, and guardrails skills

#### Scenario: Refresh adds quality skills
- **WHEN** a project updates Warpweave and its tools are refreshed
- **THEN** the refresh SHALL generate the minimal-output, TDD methodology, and guardrails skills for the configured agents

### Requirement: Quality skills installed without manual configuration
Installing the quality skills SHALL require no manual edit of tool configuration files, such as adding plugin entries or running separate setup commands.

#### Scenario: Init requires no extra setup step
- **WHEN** a user runs `warpweave init`
- **THEN** the quality skills SHALL be installed without the user editing tool config files or running additional commands

#### Scenario: Init output reports quality skills as installed
- **WHEN** `warpweave init` finishes
- **THEN** the completion output SHALL present the minimal-output, TDD methodology, and guardrails skills as installed, rather than as manual suggestions
