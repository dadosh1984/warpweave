## Context

`release-compare` already runs a per-criterion comparison (tokens is a 5%-weighted criterion) and writes `warpweave/metrics/release-compare/<release>.md`. The budget skill (`warpweave-token-budget`) tracks spend per change. See proposal.md - Why and the `release-compare` spec.

## Goals / Non-Goals

**Goals:**
- Collect per-change budget facts during release-compare and report the budget's effect on average per-change token spend.
- Measure the real effect of budget gating across releases (the user's explicit ask).

**Non-Goals:**
- No new token accounting engine; consume `warpweave-token-budget` facts.
- No blocking or gating of releases (release-compare stays advisory).
- No change to non-budgeted projects.

## Decisions

**Decision D1 — Budget facts are a read of existing per-change budget data.**
Release-compare reads each change's budget facts (budget set, tokens, near/over-ceiling events, skips) from where `warpweave-token-budget` records them, and adds a "Budget" subsection to the report.
- Rationale: no new accounting; reuse the skill's bookkeeping.
- Alternative: build a parallel budget ledger — rejected (duplication).

**Decision D2 — Budget effect is reported as an adjacent metric to the tokens criterion.**
Average-per-change spend (this release vs previous) is reported with the token-savings criterion, and a regression flags worsening.
- Rationale: keeps the single report coherent; budget is a real-world lever on the same axis (tokens).

**Decision D3 — Absent budget data → unchanged behavior.**
If a release has no budget data, no budget section and no warnings are emitted.
- Rationale: spec requires default parity for non-budgeted projects.

## Risks / Trade-offs

- Budget data may be sparse → report what exists, no fabricated numbers.
- Average spend can be noisy per change → report alongside the count, note small samples.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Budget facts collection | 2 (Reuse) | Read existing `warpweave-token-budget` data. |
| Report subsection | 7 (Minimum) | Add a markdown section; no new component. |
| Average-spend delta | 7 (Minimum) | Arithmetic over collected facts. |
| Dependencies | 5→none | No new dependency. |
