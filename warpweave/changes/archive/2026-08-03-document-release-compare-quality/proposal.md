## Why

`release-compare` (the advisory gate that scores improvement between releases against a configurable `min_improvement` threshold) and the `[quality]` block in `config/unified.toml` are only documented in `README.md` and the SKILL.md itself. `docs/cheatsheet.md` and `docs/UNIFIED.md` — the first places a user looks — say nothing about them, so a user who doesn't read skill sources will never discover this non-trivial mechanism.

## What Changes

- Add a concise section documenting **release-compare** (what it scores, the advisory `min_improvement` gate, how to configure it) to `docs/cheatsheet.md` (and/or `docs/UNIFIED.md`).
- Document the `[quality]` → `min_improvement` setting in `config/unified.toml` and where release-compare reads it from.
- Cross-link to the `warpweave-release-compare` skill and `release-compare` workflow for full details.
- No code or behavior change.

## Capabilities

### New Capabilities
(none — documentation only; `skip_specs: true`)

### Modified Capabilities
(none)

## Impact

- `docs/cheatsheet.md`, `docs/UNIFIED.md` — new release-compare / `[quality]` sections.
- No runtime code, no dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — a shipped advisory-gate feature is undiscoverable outside skill sources; docs close the gap cheaply. |
| Existing code reuse? | Yes — reuse existing `docs/` conventions and cross-links rather than a new docs structure. |
| Stdlib? | No. |
| Native platform? | No. |
| New dependency? | No — pure Markdown. |

## Complexity

Complexity: **minimal**
