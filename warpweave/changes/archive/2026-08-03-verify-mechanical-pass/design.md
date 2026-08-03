## Context

`verify-change` currently has no mechanical core (`src/core/verify.ts` does not exist) — only the agent-facing template `src/core/templates/workflows/verify-change.ts`. `drift-check` already implements the deterministic first pass in `src/core/drift-check.ts` (`extractSpecScenarios`, `classifyScenario`) but scopes it to a change's delta specs and — by the design the user traced — effectively covers per-task-touched files. See proposal.md - Why and the `verify-mechanical-pass` spec.

## Goals / Non-Goals

**Goals:**
- Reuse drift-check's deterministic machinery for a whole-spec mechanical verify pass.
- Surface per-scenario compliant/missing/drifted in the verify report, before agent judgment.

**Non-Goals:**
- No new detection algorithm; reuse `classifyScenario`.
- Not replacing the agent's semantic layer.
- Not changing per-task drift-check.

## Decisions

**Decision D1 — Reuse drift-check's functions; change only the input scope.**
`verify-mechanical-pass` calls `extractSpecScenarios(change's delta spec files)` and `classifyScenario(scenario, projectRoot)` exactly as drift-check does. The difference is purely which spec files feed it: verify uses all of the change's delta specs, and classification already scans the whole project source (so the per-task-diff limitation the user noted is a property of how apply *uses* drift-check, not of `classifyScenario` itself).
- Rationale: maximum reuse; the whole-spec scan is already how `classifyScenario` works.
- Alternative: fork drift logic into a new `src/core/verify.ts` — rejected (duplication; the machinery is identical).

**Decision D2 — `src/core/verify.ts` is a thin orchestrator.**
A small `src/core/verify.ts` (or a function in drift-check) gathers the change's spec files, runs the classify loop, and returns `{ scenarios, findings }` shaped for the verify report.
- Rationale: explicit verify-core surface (the user's "no verify.ts" point) with zero algorithm duplication.
- Alternative: verify template calls drift-check CLI — rejected (coupling agent template to CLI execution).

**Decision D3 — Report merges mechanical status with agent assessment.**
The verify template presents the mechanical status per scenario, then the agent's judgment; a `missing` finding must be addressed before verified.
- Rationale: deterministic signal first, semantic refinement second — mirrors the proven drift-check economy.

## Risks / Trade-offs

- Whole-spec scan is conservative (term matching) → it is a filter, not proof; agent judgment still refines, and false `missing` is loud and addressable.
- Reusing `collectSourceTerms` scans the whole repo → acceptable cost at one verify point (matches drift-check).

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Whole-spec classify | 2 (Reuse) | Reuse `extractSpecScenarios` + `classifyScenario`. |
| Verify orchestrator | 7 (Minimum) | Thin wrapper shaping findings for the report. |
| Report merge | 7 (Minimum) | Mechanical status + agent assessment in the template. |
| Dependencies | 5→none | No new dependency. |
