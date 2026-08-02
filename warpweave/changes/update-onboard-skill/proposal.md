## Why

`warpweave-onboard` (the skill that walks a newcomer through the project's capabilities) does not mention the three features shipped since 1.4.0: the **auto-trigger model**, **release-compare**, and **token-budget** (confirmed: none of these terms appear in `skills/warpweave-onboard/SKILL.md`). A user completing onboarding will not learn about the three newest capabilities.

## What Changes

- Update `skills/warpweave-onboard/SKILL.md` to cover the newly-shipped capabilities so onboarding reflects the current feature surface:
  - The **auto-trigger model** — which skills now fire automatically during `/ww:apply` (per-task security-scan, dependency-check; completion verify-change + benchmark; pre-commit guardrails), and that each keeps a manual `/ww:*` override.
  - **release-compare** — the advisory post-release improvement gate and `[quality] min_improvement` config.
  - **token-budget** — the budget/ledger concept and how it interacts with the workflow.
- No code or runtime behavior change.

## Capabilities

### New Capabilities
(none — skill/docs content; `skip_specs: true`)

### Modified Capabilities
(none)

## Impact

- `skills/warpweave-onboard/SKILL.md` — add the three missing feature sections.
- No runtime code, no dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — onboarding is the newcomer's first tour; omitting three shipped features leaves it wrong. |
| Existing code reuse? | Yes — reuse the existing SKILL.md structure/voice and link the real skill names. |
| Stdlib? | No. |
| Native platform? | No. |
| New dependency? | No — Markdown only. |

## Complexity

Complexity: **minimal**
