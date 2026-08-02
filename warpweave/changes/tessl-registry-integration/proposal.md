## Why

AI agents hallucinate when using external libraries — they guess APIs from stale training data, invent non-existent functions, and waste time on rework. Warpweave has no mechanism to pull verified, up-to-date library instructions into agent context.

## What Changes

- Add a `tessl-registry-resolver` module that queries the Tessl Registry (tessl.io/registry) for library skills matching the project's dependencies
- Add a `warpweave config registry` command to configure registry integration (enable/disable, API key)
- Inject resolved Tessl skills into agent instructions alongside project context
- Update `warpweave init` to optionally install Tessl skills during setup
- Update README with registry integration documentation

## Capabilities

### New Capabilities
- `tessl-registry-resolver`: Queries Tessl Registry for library skills matching project dependencies, caches results, and injects them into agent instructions
- `registry-config`: CLI command to configure registry integration (enable/disable, API endpoint, auto-detect)

### Modified Capabilities
- `instruction-loader`: Extended to inject Tessl skills into generated instructions as additional context
- `init`: Extended with optional Tessl setup step during project initialization

## Impact

- No new runtime dependency — uses built-in `node:fetch` (Node.js 20+)
- New module: `src/core/tessl-registry/` with resolver, cache, and config
- Modified: `src/core/artifact-graph/instruction-loader.ts` — inject Tessl skills
- Modified: `src/core/init.ts` — optional Tessl setup
- New CLI command: `warpweave config registry`
- No breaking changes — registry integration is opt-in

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — hallucination is a real cost driver |
| Existing code reuse? | No — no existing registry integration exists |
| Stdlib? | No — Node.js has no registry client |
| Native platform? | No — no OS-level registry support |
| New dependency? | No — `node:fetch` is built into Node.js 20+ |
| One-liner? | No — requires resolver, cache, config, injection |
| Minimum | Full module with resolver + cache + config + injection |

## Complexity

Complexity: **normal**
