## Context

See proposal.md - Why: the budget-gating behavior is specced in `warpweave/specs/skill-triggers/spec.md` but the apply orchestration template `src/core/templates/workflows/apply-change.ts` never implements it — it runs verify + benchmark unconditionally at completion (two template variants, ~lines 112-115 and 344-347). The token budget exists as the `warpweave-token-budget` skill, reading a limit / reserve from `config/unified.toml`.

## Goals / Non-Goals

**Goals:**
- Put the budget-aware completion gating into the apply template so the executing agent actually consults the budget and skips/defer advisory triggers near the ceiling.
- Keep safety gates (per-task security-scan, pre-commit guardrails) and manual `/ww:verify`/`/ww:benchmark` overrides unconditional.
- Add parity coverage so the gating institution can't silently regress.

**Non-Goals:**
- No new token accounting engine; reuse `warpweave-token-budget` + `unified.toml`.
- No change to which skills exist.
- No change to the budget skill itself.

## Decisions

**Decision D1 — Budget gating is added to the apply orchestration template, not inside each skill.**
Add a step to the completion phase of both `apply-change.ts` variants: before running verify+benchmark, consult the change's budget (`warpweave-token-budget`) and `config/unified.toml`; if exhausted or within the configured reserve of the ceiling, warn and skip/defer benchmark then verify. Individual skills stay unchanged.
- Rationale: a single decision point; matches how the auto-trigger table centralizes orchestration; keeps manual `/ww:*` overrides working (they run unconditionally).
- Alternative: embed inside `warpweave-benchmark`/`warpweave-verify` — rejected (scatters policy, complicates unconditional manual override).

**Decision D2 — Deferral order and safety-gate carve-out.**
When budget forces a skip, defer benchmark first, then verify. Per-task security-scan and pre-commit guardrails always run.
- Rationale: advisory completion reports are least critical; safety gates are required by the `skill-triggers` spec.

**Decision D3 — Manual overrides always run.**
Explicit `/ww:benchmark`/`/ww:verify` run regardless of budget; only automated auto-triggers are budget-gated.

**Decision D4 — Unset budget → unchanged behavior.**
If no budget is configured, the template performs the current path with no warnings.

**Decision D5 — Parity guard anchors on the template institution.**
Add a config-parity-style check asserting the `apply-change.ts` template text contains a budget-gating anchor (e.g. a distinctive phrase such as "budget" + "skip"/"defer" near "verify"/"benchmark").

## Risks / Trade-offs

- Skipping verify/benchmark near ceiling hides a report → warning names what was skipped; user re-runs manually.
- Budget source absent → unset-budget rule (no warnings), per spec.
- Distinctive-anchor parity could false-pass if wording drifts → anchor uses strong, spec-derived phrasing; kept minimal.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Budget-aware gating in template | 2 (Reuse) | Reuse `warpweave-token-budget` + `unified.toml` budget; no new accounting. |
| Skip/defer policy | 7 (Minimum) | Conditional warn+skip at the single orchestration point. |
| Parity guard | 2 (Reuse) | Reuse `config-parity.test.ts` style; no new framework. |
| Dependencies | 5→none | No new dependency. |
