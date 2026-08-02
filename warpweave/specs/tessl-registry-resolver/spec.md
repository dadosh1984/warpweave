# tessl-registry-resolver Specification

## Purpose

Lets warpweave query the Tessl Registry for verified library skills matching the project's dependencies, cache results locally, and inject them into agent instructions to reduce API hallucination.

## Requirements

### Requirement: Resolver queries Tessl Registry by dependency name
The system SHALL accept a library name (e.g., `commander`, `zod`) and query the Tessl Registry API at `https://tessl.io/registry` for matching skills.

#### Scenario: Successful query returns skill metadata
- **WHEN** the resolver queries the Tessl Registry for a known library
- **THEN** it returns the skill's name, description, version, and download URL

#### Scenario: Unknown library returns empty result
- **WHEN** the resolver queries for a library not in the registry
- **THEN** it returns an empty result set without error

### Requirement: Resolver caches results locally
The system SHALL cache resolved Tessl skills in `warpweave/registry-cache/` to avoid redundant network calls.

#### Scenario: Cached result is returned without network call
- **WHEN** the resolver queries for a library that was previously cached
- **THEN** it returns the cached result without making an HTTP request

#### Scenario: Cache expires after configurable TTL
- **WHEN** the cached result is older than the configured TTL (default 24 hours)
- **THEN** the resolver re-fetches from the registry

### Requirement: Resolver auto-detects project dependencies
The system SHALL read `package.json` from the project root and extract dependency names for registry lookup.

#### Scenario: Dependencies extracted from package.json
- **WHEN** the resolver reads a project's `package.json`
- **THEN** it extracts all keys from `dependencies` and `devDependencies`

#### Scenario: No package.json returns empty list
- **WHEN** the project has no `package.json`
- **THEN** the resolver returns an empty dependency list without error

### Requirement: Resolver injects skills into agent instructions
The system SHALL append resolved Tessl skills as additional context in generated agent instructions.

#### Scenario: Skills appear in instruction context
- **WHEN** instructions are generated for any artifact
- **THEN** resolved Tessl skills are included as a `## Registry Skills` section in the context

#### Scenario: No skills found does not modify instructions
- **WHEN** no Tessl skills match the project's dependencies
- **THEN** instructions are generated without the Registry Skills section
