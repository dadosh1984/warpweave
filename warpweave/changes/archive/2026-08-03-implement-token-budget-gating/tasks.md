## 1. Add budget-aware completion gating to the apply template

- [x] 1.1 Add a "consult budget" step to the completion phase of `src/core/templates/workflows/apply-change.ts` (both variants): before running verify + benchmark, read the change's token budget via `warpweave-token-budget` / `unified.toml` and determine near/over-ceiling state
  - **Spec scenario**: Budget near or over ceiling defers advisory triggers
  - **Ladder rung**: 2 (Reuse — reuse `warpweave-token-budget` / `unified.toml`)
  - **Test first**: `config-parity`-style test asserting the apply template names the budget-aware gating step
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts test/core/templates/skill-templates-parity.test.ts`
- [x] 1.2 Implement skip/defer order (benchmark, then verify) with a warning naming skipped triggers and remaining budget, when budget near/over ceiling
  - **Spec scenario**: Budget near or over ceiling defers advisory triggers / warning names skipped triggers
  - **Ladder rung**: 7 (Minimum — conditional warn+defer at one point)
  - **Test first**: template text assertion that a near-ceiling state defers benchmark/verify while security-scan and guardrails stay unconditional
  - **Verify**: `rtk vitest run test/`
- [x] 1.3 Keep safety gates (per-task security-scan, pre-commit guardrails) unconditional and manual `/ww:verify`/`/ww:benchmark` overrides bypassing the budget gate
  - **Spec scenario**: Safety gates remain unconditional near ceiling
  - **Ladder rung**: 2 (Reuse — keep existing guardrails/override behavior untouched)
  - **Test first**: assertion that the guidance keeps security-scan and guardrails unconditional and manual overrides run
  - **Verify**: `rtk vitest run test/`
- [x] 1.4 Ensure unset budget → unchanged current behavior (no warnings) in the apply template
  - **Spec scenario**: Auto-trigger budget respects an unset budget
  - **Ladder rung**: 1 (YAGNI — nothing to add for the default path)
  - **Test first**: assertion the default path performs no budget warning
  - **Verify**: `rtk vitest run test/`

## 2. Parity coverage and final checks

- [x] 2.1 Add config-parity coverage in `test/core/config-parity.test.ts` asserting the apply template carries the budget-aware gating anchor (budget + skip/defer near verify/benchmark)
  - **Spec scenario**: Apply template carries the budget gating anchor
  - **Ladder rung**: 2 (Reuse — extend existing config-parity test)
  - **Test first**: `expect(applyTemplate).toContain(...)` budget-gating anchor
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 2.2 Run build + full lint + typecheck + test suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a (suite already exists)
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
