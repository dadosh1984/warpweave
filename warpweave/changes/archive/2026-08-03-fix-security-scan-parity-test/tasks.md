## 1. Repoint the security-scan parity guard at the committed source

- [x] 1.1 Update `test/core/config-parity.test.ts` so the native-security-scan guard asserts against the committed distribution source `skills/warpweave-security-scan/SKILL.md` unconditionally (always present), and keeps a best-effort check of the installed copy when present (no silent `return` on absent installed copy)
  - **Spec scenario**: Distribution source is native / Installed copy is native when present
  - **Ladder rung**: 2 (Reuse — extend the existing config-parity test)
  - **Test first**: assertion that the distribution source is native unconditionally; a stale installed copy (when present) fails
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`

## 2. Final checks

- [x] 2.1 Run full test suite + build + lint + typecheck
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a (suite exists)
  - **Verify**: `rtk vitest run test/`, `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`
