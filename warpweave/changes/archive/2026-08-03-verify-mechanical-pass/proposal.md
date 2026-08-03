## Why

`verify-change` is the last barrier before archive, yet it is the weakest layer in the hierarchy: there is no `src/core/verify.ts` — only a textual skill template (`src/core/templates/workflows/verify-change.ts`) instructing an agent to reason about the whole change. In the `auto-trigger-token-budget` case this is exactly where the hole was: the budget requirement lived in the spec but never appeared in any task's diff, so the per-task `drift-check` (which by design scans files a specific task touched) never looked at `apply-change.ts`, and nothing at verify time reconciled the spec's budget requirement against the template. `drift-check` already has a proven, deterministic first pass (`classifyScenario`: compliant/missing/drifted from spec-scenario terms vs. source terms). The proposal is to give `verify-change` the same mechanical first pass, run across the change's **entire** spec (not per-task diff), so a spec requirement with zero code evidence is surfaced deterministically before any agent judgment.

## What Changes

- Add a mechanical first pass for verify-change: reuse the drift-check machinery (`extractSpecScenarios` + `classifyScenario`) but run it over the change's full delta-spec set against the whole project source, not per-task diffs.
- Surface per-scenario compliant/missing/drifted status in the verify report, in addition to the agent's semantic assessment.
- Ensure a spec requirement with no matching evidence in the code (status `missing`) is deterministically reported in the verify output — closing the spec↔code hole without relying on the model noticing it.
- Keep the agent's judgment as the semantic refinement layer, as drift-check does for tasks.

## Capabilities

### New Capabilities
- `verify-mechanical-pass`: verify-change runs a deterministic mechanical first pass over the change's full spec against the project source (delta spec).

### Modified Capabilities
- `ww-verify-skill` (or `release-compare`/`apply`): the verify surface includes the mechanical first pass in its report.

## Impact

- A shared `src/core/verify.ts` (or reuse of `drift-check.ts` functions) implementing the whole-spec mechanical first pass.
- `src/core/templates/workflows/verify-change.ts` — instruct/incorporate the mechanical pass in the verify report.
- `test/` — coverage for whole-spec mechanical verification, including the no-task-touched-file case (budget-requirement-style).
- No new dependencies (reuses drift-check machinery).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — verify is the last gate before archive and currently has zero deterministic checks; the budget hole proves a whole-spec mechanical pass is needed. |
| Existing code reuse? | Yes — reuse `extractSpecScenarios`/`classifyScenario` exactly as drift-check does; only change the input scope (whole spec, not per-task diff). |
| Stdlib? | Yes — no new library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
