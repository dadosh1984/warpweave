## Why

Since 1.4.0 the auto-trigger model runs up to five skills automatically on every `/ww:apply` (per-task security-scan, dependency-check; completion verify-change + benchmark; pre-commit guardrails). This is token-heavy and currently happens without explicit consent and without consulting the change's token budget, so a change near its budget ceiling silently burns budget on auto-triggers the user didn't ask for.

## What Changes

- Make auto-triggers **budget-aware**: before firing, consult the active change's token budget (from `warpweave-token-budget` / `config/unified.toml`).
- When the budget is exhausted or near the ceiling, the pipeline SHALL warn the user and **skip (or defer) the least-critical auto-triggers** instead of silently consuming budget beyond the limit.
- Which triggers are skippable: benchmark and verify (completion-only, advisory) are deferred/skipped first; per-task security-scan stays as it is a safety gate; guardrails (pre-commit) always run.
- User-facing signal: a short warning naming the skipped/deferred triggers and the remaining budget.
- This is a behavior change to the auto-trigger model.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `skill-triggers`: auto-triggers SHALL respect the change's token budget and warn/skip advisory triggers near or over the ceiling (delta spec).

### Additional context
- `skill-triggers` is the capability that defines how skills fire automatically; this change narrows when the advisory completion triggers may fire.

## Impact

- `warpweave/specs/skill-triggers` — delta: budget-aware auto-trigger behavior.
- Auto-trigger orchestration docs/guidance (`AGENTS.md` "Automatic Triggers" and the `warpweave-apply-change` pipeline) — add budget-aware step.
- `warpweave-token-budget` skill — clarify how auto-triggers read/consume the budget.
- No new dependency.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — auto-triggers now run automatically on every apply; hardcoding a token ceiling for them prevents uncontrolled cost without adding scope. |
| Existing code reuse? | Yes — reuse the existing `warpweave-token-budget` skill and `config/unified.toml` budget already present. |
| Stdlib? | No. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
