## Why

The `auto-trigger-token-budget` change was archived with every task marked `[x]` and its `skill-triggers` delta spec synced to the main spec, yet the actual behavior was never implemented: `src/core/templates/workflows/apply-change.ts` still runs **verify** and **benchmark** unconditionally at completion (see lines 112-115 and 344-347) with no budget consult, no near-ceiling skip, and no warning. The only mention of budget gating lives in prose (`AGENTS.md` and `onboard.ts`), which the executing agent sees but the apply template does not enforce. The spec exists; the behavior does not. This change closes that gap by putting the budget-aware gating into the apply template itself — the same class of problem `drift-detection` is meant to catch, except here spec and template diverged instead of spec and code.

## What Changes

- Add a budget-consult step to the apply completion phase in `src/core/templates/workflows/apply-change.ts` (both template variants): before running verify + benchmark, read the change's token budget, and if it is exhausted or within the configured reserve of the ceiling, **warn** and **skip or defer** the advisory completion triggers, naming the skipped trigger(s) and the remaining budget.
- Guarantee the safety gates (per-task security scan, pre-commit guardrails) run unconditionally regardless of budget, and that manual `/ww:verify` / `/ww:benchmark` overrides bypass the budget gate.
- Preserve unset-budget behavior: no budget → auto-triggers run exactly as today, no warnings.
- Add config-parity-style coverage asserting the apply template actually contains the budget-aware gating institution (keyword anchor), so this regression cannot ship silently again.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `skill-triggers`: refine the "Apply runs verify and benchmark on completion" and the budget-gating requirements so the apply workflow SHALL physically carry the budget gating institution in its completion phase (delta spec), not only describe it in prose.

## Impact

- `src/core/templates/workflows/apply-change.ts` — add budget-aware completion gating (two template variants).
- `test/core/config-parity.test.ts` (or a template-parity test) — add keyword-parity coverage for the apply completion gating.
- `warpweave/specs/skill-triggers/spec.md` — synced via delta on archive.
- No new dependencies; reuse `warpweave-token-budget` and `config/unified.toml` budget.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — behavior is specced and archived but not implemented; users silently burn budget past the ceiling on every apply completion. |
| Existing code reuse? | Yes — reuse the existing `warpweave-token-budget` skill and the `config-parity.test.ts` guard style already in the repo. |
| Stdlib? | Yes — budget read/compare is plain logic; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
