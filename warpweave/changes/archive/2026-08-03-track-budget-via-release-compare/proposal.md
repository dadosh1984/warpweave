## Why

Once budget gating (change 1) actually works, the maintained claim is that it reduces average token spend per change. That claim should be measured, not assumed. `release-compare` already scores "token savings" as a criterion (weighted 5%), but it reasons about RTK shell-output savings, not about whether the per-change budget actually capped spend near the ceiling. Until the budget's real effect is tracked across releases, we cannot tell whether `implement-token-budget-gating` improved anything — the user's specific ask is to connect release-compare to the budget so the improvement is observable, not presumed.

## What Changes

- Make release-compare collect per-change **budget** facts — budget set, tokens measured against it, near/over-ceiling events, and advisory-trigger skips — alongside its existing per-criterion data.
- When comparing two releases, report a **delta in average token spend per change** and whether budget adoption (budget set, cap respected) improved GIVEN the budget, as part of (or adjacent to) the existing token-savings criterion.
- Keep it advisory and read-only: release-compare reports the trend and flags regression/worsening; it never blocks.
- No change to non-budgeted projects: if a release has no budget data, the existing behavior is unchanged.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `release-compare`: the comparison SHALL track per-change token-budget data and report the budget's effect on average per-change token spend across releases (delta spec).

## Impact

- `release-compare` template/skill and its per-criterion logic — add budget facts + average-spend-per-change delta.
- `warpweave/metrics/release-compare/<release>.md` report — budget section.
- `warpweave/specs/release-compare/spec.md` — synced via delta on archive.
- No new dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the whole point of budget gating is cost control; without a measured effect it is an unverified assumption. |
| Existing code reuse? | Yes — extend the release-compare criteria flow and its report persistence; reuse `warpweave-token-budget` facts. |
| Stdlib? | Yes — the report already writes markdown; just add a section. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
