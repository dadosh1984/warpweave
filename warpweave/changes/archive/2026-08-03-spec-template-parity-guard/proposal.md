## Why

The three findings in this batch share one root cause: half the project's contracts are English prose (specs, skill templates) that an LLM-agent reads, and there is no automated bridge between one English text and another — unlike `config-parity.test.ts`, which works precisely because it compares deterministic file content. The `auto-trigger-token-budget` case is the proof: the `skill-triggers` spec SHALL-ed budget gating, but the `apply-change.ts` template never implemented it, and nothing caught the spec↔template divergence before archiving. Drift-detection guards code against specs; nothing guards templates against specs.

## What Changes

- Add a lightweight spec↔template parity guard in `test/core/config-parity.test.ts` (config-parity style) that maps a small set of **behavioral spec requirements** to **template keyword anchors**, and asserts the template genuinely contains the text/sl nearby.
- The mapping is explicit and curated (not semantic parsing): each entry names a capability/spec phrase and the template file + expected anchor text that must co-occur.
- Initial anchors cover the requirements that actually diverged in this batch (budget gating in `apply-change.ts`) and can be extended per requirement as the project adds spec-negotiated behavior.
- The guard is deliberately light: it is a keyword co-occurrence check, not semantic validation — it catches "spec says X but template never mentions X-ish at all", the exact failure that slipped through.

## Capabilities

### New Capabilities
- `spec-template-parity`: a guard that keeps spec-negotiated behavior present in the corresponding skill/workflow template (delta spec).

### Modified Capabilities
(none)

## Impact

- `test/core/config-parity.test.ts` — add the spec↔template keyword-parity block (curated mapping).
- Reference: `warpweave/specs/skill-triggers/spec.md` ↔ `src/core/templates/workflows/apply-change.ts` (first mapped pair).
- No runtime code, no dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — this is the systematic fix for the "prose contract without implementation" class; it is the mechanism that would have caught change 1 before archive. |
| Existing code reuse? | Yes — extend the existing `config-parity.test.ts` pattern and `getSkillTemplates()`; no new framework. |
| Stdlib? | Yes — `fs`/string includes; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
