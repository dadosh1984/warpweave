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

#### Scenario: Optional Tessl setup during init
- **WHEN** `warpweave init` completes successfully
- **AND** Tessl Registry integration is enabled in config
- **THEN** the system SHALL prompt the user: "Configure Tessl Registry integration? (y/N)"
- **AND** if confirmed, run dependency auto-detection and cache Tessl skills
- **AND** display a summary of resolved skills in the success output
