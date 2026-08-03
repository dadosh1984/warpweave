## 1. Collect per-change budget facts in release-compare

- [x] 1.1 In the release-compare collection step, read each change's token-budget facts (budget set, tokens measured, near/over-ceiling events, advisory-trigger skips) from `warpweave-token-budget` bookkeeping
  - **Spec scenario**: Budget facts collected per change
  - **Ladder rung**: 2 (Reuse — consume existing budget-alpha data)
  - **Test first**: a fixture with recorded budget facts yields collected facts
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.2 Compute average token spend per change for the release and the delta vs the previous release
  - **Spec scenario**: Budget effect on average spend reported
  - **Ladder rung**: 7 (Minimum — arithmetic)
  - **Test first**: two fixtures with differing average spend → correct delta
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.3 Add a "Budget" subsection to the release-compare report (and JSON payload), flagging regression if average spend worsened
  - **Spec scenario**: Budget effect on average spend reported / Worsening is reported
  - **Ladder rung**: 7 (Minimum — add a section)
  - **Test first**: report content contains the Budget subsection; worsened-spend fixture yields a regression flag
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.4 Ensure absent budget data keeps existing behavior (no budget section, no warnings)
  - **Spec scenario**: No budget data keeps existing behavior
  - **Ladder rung**: 1 (YAGNI — default path unchanged)
  - **Test first**: no-budget fixture produces no budget section
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`

## 2. Final checks

- [x] 2.1 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
