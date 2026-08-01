## 1. Fix the Article in Templates

- [x] 1.1 Replace "an Warpweave change" with "a Warpweave change" in `src/core/templates/workflows/apply-change.ts` (description, instructions, and experimental variant)
  - **Spec scenario**: skip_specs — no behavior change; text-only correction
  - **Ladder rung**: 2 (reuse existing strings, minimal edit)
  - **Test first**: `rtk grep "an Warpweave change" src/core/templates/workflows/apply-change.ts` shows 0 matches after edit
  - **Verify**: `rtk grep "an Warpweave change" src/`
- [x] 1.2 Replace "an Warpweave change" with "a Warpweave change" in `src/core/templates/workflows/continue-change.ts` (description)
  - **Spec scenario**: skip_specs — text-only correction
  - **Ladder rung**: 2
  - **Test first**: `rtk grep "an Warpweave change" src/core/templates/workflows/continue-change.ts` shows 0 matches
  - **Verify**: `rtk grep "an Warpweave change" src/`
- [x] 1.3 Replace "an Warpweave change" with "a Warpweave change" in `src/core/templates/workflows/update-change.ts` (description)
  - **Spec scenario**: skip_specs — text-only correction
  - **Ladder rung**: 2
  - **Test first**: `rtk grep "an Warpweave change" src/core/templates/workflows/update-change.ts` shows 0 matches
  - **Verify**: `rtk grep "an Warpweave change" src/`

## 2. Regenerate Distribution + Verify

- [x] 2.1 Regenerate the skills distribution: `pnpm run build && pnpm run generate:skills`
  - **Spec scenario**: skip_specs — generated skills reflect the fixed templates
  - **Ladder rung**: 2 (reuse the existing generator)
  - **Test first**: run the skillssh parity test before regenerating to see the mismatch
  - **Verify**: `rtk pnpm exec vitest run test/core/templates/skillssh-parity.test.ts`
- [x] 2.2 Full verification: no remaining "an Warpweave change" anywhere, build/lint/tests pass
  - **Spec scenario**: skip_specs — regression gate
  - **Ladder rung**: 7 (run existing commands, write no new code)
  - **Test first**: `rtk grep -rn "an Warpweave change" .` returns no matches
  - **Verify**: `rtk pnpm run build; rtk pnpm run lint; rtk pnpm test`
