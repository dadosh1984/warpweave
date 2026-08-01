## Why

<!-- Explain the motivation for this change. What problem does this solve? Why now? -->

## What Changes

<!-- Describe what will change. Be specific about new capabilities, modifications, or removals. -->

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `<name>`: <brief description of what this capability covers>

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from warpweave/specs/. Leave empty if no requirement
     changes. A change with no capabilities at all (pure refactor, tooling, docs)
     must set `skip_specs: true` in its .warpweave.yaml - warpweave validate rejects
     a zero-delta change without that marker. Do not invent a requirement just to
     satisfy validation. -->
- `<existing-name>`: <what requirement is changing>

## Impact

<!-- Affected code, APIs, dependencies, systems -->

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | |
| Existing code reuse? | |
| Stdlib? | |
| Native platform? | |
| New dependency? | |

## Complexity

<!-- Auto-detected by the AI agent. Do not set manually.
     minimal: ≤3 files, <30 lines, or pure style/config/typo fix
     normal: 4+ files, new component/service, new public behavior/API
     If unclear, default to normal. -->

Complexity: **normal**
