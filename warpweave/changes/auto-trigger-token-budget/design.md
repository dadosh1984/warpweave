## Context

Auto-triggers (security-scan, dependency-check, verify-change, benchmark, guardrails) are orchestrated by the apply pipeline — see `AGENTS.md` "Automatic Triggers" and the `warpweave-apply-change` pipeline. The token budget exists as the `warpweave-token-budget` skill, reading a limit from `config/unified.toml` (`[warpweave]`/budget) or a default; consumption is tracked per change. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Auto-trigger behavior respects a change's token budget: near/exceeded ceiling → warn + skip/defer advisory completion triggers (benchmark, verify).
- Keep safety gates (per-task security-scan, pre-commit guardrails) always-on.
- Unset budget → unchanged current behavior.

**Non-Goals:**
- No new token accounting engine; reuse `warpweave-token-budget` and `unified.toml`.
- No change to which skills exist, only to when advisory completion triggers may be skipped.

## Decisions

**Decision D1 — Budget check lives at the apply orchestration boundary, not inside each skill.**
The decide-to-skip logic is added to the apply pipeline's completion phase (AGENTS.md apply flow / the apply skill instructions): before running verify+benchmark, read the change's budget (via `warpweave-token-budget`), and if exhausted/within reserve of ceiling, warn and skip deferrable triggers. Each individual skill stays unchanged.
- Rationale: keeps one decision point instead of duplicating budget logic in two skills; matches how the existing auto-trigger table in AGENTS.md centralizes orchestration.
- Alternative considered: embedding the check inside `warpweave-benchmark`/`warpweave-verify` — rejected (scatters the policy and complicates the manual `/ww:*` overrides, which must still run on explicit request).

**Decision D2 — Deferral order: benchmark and verify first; safety gates never skip.**
When budget forces a skip, skip/defer completion advisory triggers in order (benchmark, then verify). Per-task security-scan and pre-commit guardrails always run.
- Rationale: advisory completion reports are the least critical; safety gates are required by `skill-triggers` spec.

**Decision D3 — Manual overrides always run.**
An explicit `/ww:benchmark` or `/ww:verify` invocation runs regardless of budget (only automated auto-triggers are budget-gated), preserving the documented "each auto-trigger has a manual override".

## Risks / Trade-offs

- Skipping verify/benchmark near the ceiling could hide a report → the warning names what was skipped, and the user can re-run manually (/ww:verify, /ww:benchmark).
- Budget source may be absent → D-rule: unset budget = current behavior (no warnings), per spec.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Budget-aware gating | 2 (Reuse) | Reuse existing `warpweave-token-budget` + `unified.toml` budget; no new accounting. |
| Skip policy | 7 (Minimum) | Conditional warn+skip at the single orchestration point; no new component. |
| Dependencies | 5→none | No new dependency. |
