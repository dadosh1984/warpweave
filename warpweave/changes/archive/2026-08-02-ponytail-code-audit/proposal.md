## Why

The codebase has grown to ~36k lines across 200 source files (plus ~41k lines of tests). No systematic check has ever run against the Ponytail ladder (YAGNI → reuse → stdlib → native → dependency → one-liner → minimum). Unnecessary abstraction, dead code, duplicated logic, and over-engineered dependencies accumulate silently. Before any cleanup change is written, we need a single source of truth: a code audit that scores the whole codebase against the ladder and produces prioritized, actionable recommendations.

## What Changes

- Run a full codebase audit against the Ponytail YAGNI ladder (rungs 1–7) across `src/`, `test/`, and `scripts/`.
- Produce a structured audit report (`docs/ponytail-audit.md`) that:
  - Lists findings grouped by ladder rung (violations of YAGNI, missed reuse, stdlib-vs-dependency choices, non-minimal code)
  - Records each finding with file/line references and the ladder rung it violates
  - Ranks recommendations by effort (one-liner → refactor) and impact
  - Marks each recommendation with a proposed `// ponytail: <reason>` marker where a deliberate simplification applies
- Does **not** change product behavior, and does **not** edit source files. Fixes are deliberately deferred to a follow-up change.

## Capabilities

### New Capabilities

- None — this change introduces no product behavior. It is an analysis/documentation deliverable.

### Modified Capabilities

- None — no requirement or spec-level behavior changes. `skip_specs: true` is set in `.warpweave.yaml` because no spec describes audit output.

## Impact

- **Affected code**: none (read-only analysis of `src/`, `test/`, `scripts/`).
- **Artifacts**: new `docs/ponytail-audit.md` report.
- **Dependencies**: none added; the audit uses existing tools (`rg`, `grep`, `node`, the existing `debt-ledger` and `ladder-audit` skill templates).
- **Systems**: documentation only. No APIs, schemas, or CLI behavior change.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **no** — the audit itself is the deliverable the user requested; it is the cheapest way to decide what cleanup is worth doing |
| Existing code reuse? | **yes** — reuse the existing `ladder-audit` skill template (`src/core/templates/workflows/ladder-audit.ts`) and `debt-ledger` skill (`// ponytail:` marker scanning) instead of inventing a new audit methodology |
| Stdlib? | **yes** — file scanning and counting use `node:fs`, `node:path`, and ripgrep already installed; no new tooling |
| Native platform? | **no** — no platform-specific feature needed; scanning is cross-platform via `rg`/`grep` |
| New dependency? | **no** — zero new dependencies. The report is Markdown, consumed by humans and the agent |
| One-liner? | **no** — the work is inherently multi-file; the report structure is a template, not a one-liner |

## Complexity

<!-- Auto-detected by the AI agent. Do not set manually.
     minimal: ≤3 files, <30 lines, or pure style/config/typo fix
     normal: 4+ files, new component/service, new public behavior/API
     If unclear, default to normal. -->

Complexity: **normal**
