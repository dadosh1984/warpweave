## 1. Build the spec↔template parity guard

- [x] 1.1 Add a curated spec↔template mapping table (typed: specPhrase, capability, templateFile, anchor) to `test/core/config-parity.test.ts`
  - **Spec scenario**: Mapping is explicit and curated
  - **Ladder rung**: 2 (Reuse — extend existing config-parity test)
  - **Test first**: `expect(parityRows.length).toBeGreaterThan(0)` + each row has required fields
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 1.2 Implement the parity loop: for each row, read the template file and assert it contains the anchor, failing with a clear message naming the requirement, template, and anchor
  - **Spec scenario**: Mapped behavior is anchored in the template / Template missing mapped anchor fails
  - **Ladder rung**: 7 (Minimum — `readFileSync` + `includes` in a loop)
  - **Test first**: `test('mapped spec behavior is present in template', () => { ... })` — a deliberate fixture missing an anchor fails
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`

## 2. Anchor the first mapped pair

- [x] 2.1 Add the budget-gating pair: `skill-triggers` spec phrase → `apply-change.ts` must carry the skip/defer-benchmark/verify-near-ceiling anchor
  - **Spec scenario**: Budget gating anchored in apply template
  - **Ladder rung**: 2 (Reuse — the pair is the one that diverged)
  - **Test first**: assert the apply template text names the budget-aware completion gating
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 2.2 Run build + lint + typecheck + full test suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a (suite exists)
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
