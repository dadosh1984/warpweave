## Purpose

Lets users configure Tessl Registry integration — enable/disable, set API endpoint, and control auto-detection behavior.

## ADDED Requirements

### Requirement: User can enable or disable registry integration
The system SHALL provide a CLI command to enable or disable Tessl Registry integration.

#### Scenario: Enable registry integration
- **WHEN** user runs `warpweave config registry --enable`
- **THEN** registry integration is activated and saved to project config

#### Scenario: Disable registry integration
- **WHEN** user runs `warpweave config registry --disable`
- **THEN** registry integration is deactivated and cached skills are cleared

### Requirement: User can set custom API endpoint
The system SHALL allow configuring a custom Tessl Registry API endpoint.

#### Scenario: Custom endpoint configured
- **WHEN** user runs `warpweave config registry --endpoint https://custom.registry.com`
- **THEN** the resolver uses the custom endpoint instead of the default

### Requirement: User can toggle auto-detection
The system SHALL allow enabling or disabling automatic dependency scanning.

#### Scenario: Auto-detect enabled
- **WHEN** auto-detection is enabled and instructions are generated
- **THEN** the resolver automatically scans `package.json` and queries the registry

#### Scenario: Auto-detect disabled
- **WHEN** auto-detection is disabled
- **THEN** the resolver only queries libraries explicitly listed in config
