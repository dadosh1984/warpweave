## Why

After the spectrix → warpweave rebrand, the shipped unified config files in `config/` were never updated: `config/unified.toml` still declares an `[openspec]` section and `config/pipeline.yaml` still references the removed `/opsx:` command namespace, deleted skills, and jest. These files are copied verbatim into every unified-mode project by `copyUnifiedConfig()`, so every new user receives instructions that do not match the actual CLI. The `drift-detection` skill template also has a duplicate step number (two "5." steps).

## What Changes

- `config/unified.toml`: rename section `[openspec]` → `[warpweave]` and update the header comment from "OpenSpec Unified" to "Warpweave Unified".
- `config/pipeline.yaml`:
  - Replace `/opsx:explore OR /opsx:propose` with `/ww:explore OR /ww:propose`.
  - Replace the plan-phase `skill: writing-plans` (nonexistent) with the real shipped planning skill `warpweave-propose` (which generates proposal/specs/design/tasks).
  - Replace execute-phase skills `subagent-driven-development`, `test-driven-development`, `quality-ladder` with the real shipped skills `warpweave-superpowers-tdd`, `warpweave-ponytail-minimal-output`.
  - Replace `npm_test: "rtk jest OR rtk vitest"` with the project's actual runner (`rtk vitest`).
  - Bump `version: "1.0.0"` → `"1.3.1"`.
- `src/core/templates/workflows/drift-detection.ts`: fix the duplicated step number (second "5." → "6.") in both skill-bundled and command-bundled instruction bodies.

No source behavior changes: the CLI parsing code stays identical; only the content of shipped config files and the generated skill template text change.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- (none — this is a content-only fix. No spec-level behavior changes.)

## Impact

- `config/unified.toml`, `config/pipeline.yaml` — shipped template files (repo-local source of truth; copied by `src/core/init.ts:copyUnifiedConfig`).
- `src/core/templates/workflows/drift-detection.ts` — generated-skill template; regenerated `skills/` tree will follow after `warpweave update --force`.
- Consumers: every unified-mode project created after this fix.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — shipped configs contradict the actual CLI; every unified user gets broken instructions |
| Existing code reuse? | Yes — the canonical command namespace lives in `src/utils/command-references.ts`; fix references, don't invent |
| Stdlib? | n/a — content edits, no algorithms |
| Native platform? | n/a |
| New dependency? | No — no new packages needed |

## Complexity

Complexity: **normal**
