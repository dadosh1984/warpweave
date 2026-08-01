## Context

Warpweave currently has no mechanism to pull verified library instructions into agent context. All project context is manually maintained in `warpweave/config.yaml`. The Tessl Registry (tessl.io/registry) hosts 10,000+ evaluated, versioned skills for popular libraries — but warpweave has no resolver, no cache, and no injection point for them.

The project uses TypeScript/Node.js ESM, Commander.js for CLI, and has no HTTP client dependency. Any registry integration must work cross-platform (macOS, Linux, Windows).

## Goals / Non-Goals

**Goals:**
- Query Tessl Registry for skills matching project dependencies
- Cache results locally to avoid redundant network calls
- Inject resolved skills into agent instructions as additional context
- Provide CLI command to configure registry integration
- Auto-detect dependencies from `package.json`

**Non-Goals:**
- Full MCP server implementation (future concern)
- Publishing warpweave skills to Tessl Registry (separate change)
- Real-time registry queries on every instruction generation (cache-first)
- Supporting non-npm dependency managers (only `package.json` for now)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP client | `node:fetch` (built-in, Node ≥18) | No new dependency needed — Node.js 20+ has stable fetch. Avoids adding axios/node-fetch. |
| Cache format | JSON files in `warpweave/registry-cache/` | Follows existing warpweave conventions (file-based, no DB). Easy to inspect and debug. |
| Cache TTL | 24 hours (configurable) | Balances freshness with performance. Libraries don't change hourly. |
| Config storage | `warpweave/config.yaml` | Reuses existing config system. No new config file format. |
| Injection point | `instruction-loader.ts` `generateInstructions()` | Single place where all context is assembled. Minimal diff. |
| Registry API | Direct HTTP to `https://tessl.io/api/registry/search` | No SDK dependency. Simple REST API. |
| Auto-detection trigger | On `warpweave init` and `warpweave update` | Natural lifecycle points. Not on every instruction generation. |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Registry API changes | Version-pin API path, add integration tests |
| Network failure blocks instructions | Cache-first with graceful fallback — stale cache is better than no instructions |
| Large number of dependencies | Rate-limit queries, batch requests, cache aggressively |
| Windows path issues | Use `path.join()` for all cache paths, test on Windows CI |

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| HTTP client | 3 (Stdlib) | `node:fetch` built into Node.js 20+ |
| Cache storage | 2 (Reuse) | JSON files in warpweave/ dir, same pattern as existing file-based storage |
| Config integration | 2 (Reuse) | Extend existing `warpweave/config.yaml` parsing |
| CLI command | 2 (Reuse) | Extend existing `warpweave config` command group |
| Instruction injection | 2 (Reuse) | Single injection point in `generateInstructions()` |
| Dependency detection | 3 (Stdlib) | Read `package.json` with built-in `fs` and `JSON.parse` |
