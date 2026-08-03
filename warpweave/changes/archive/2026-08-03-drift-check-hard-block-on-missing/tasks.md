## 1. Hard-block on missing

- [x] 1.1 In `src/commands/drift-check.ts`, after building findings, set `process.exitCode = 1` when any scenario has status `missing` (unless opted out), and print the blocking `missing` findings clearly in the human report
  - **Spec scenario**: Missing scenario blocks with non-zero exit
  - **Ladder rung**: 2 (Reuse — mirror `archive.ts` non-zero block)
  - **Test first**: fixture with a `missing` scenario → command exits non-zero; human output lists the blocking finding
  - **Verify**: `rtk vitest run test/commands/drift-check.test.ts`
- [x] 1.2 Keep `drifted` advisory: exit 0 when only `drifted`/`compliant` scenarios exist
  - **Spec scenario**: Drifted scenario stays advisory
  - **Ladder rung**: 1 (YAGNI — no block on drifted)
  - **Test first**: fixture with only drifted/compliant → exit 0
  - **Verify**: `rtk vitest run test/commands/drift-check.test.ts`
- [x] 1.3 Add `--no-fail-on-missing` option (and/or config value): report `missing` findings but exit 0
  - **Spec scenario**: Missing block can be overridden
  - **Ladder rung**: 7 (Minimum — one boolean option)
  - **Test first**: same missing fixture with `--no-fail-on-missing` → exit 0 while still reporting missing
  - **Verify**: `rtk vitest run test/commands/drift-check.test.ts`
- [x] 1.4 Add `blocked` to JSON output: `true` when the check would fail (any missing and not opted out)
  - **Spec scenario**: JSON output for automation (blocked field)
  - **Ladder rung**: 7 (Minimum — add a field)
  - **Test first**: `--json` on the missing fixture includes `blocked: true`; on opted-out/clean fixture `blocked: false`
  - **Verify**: `rtk vitest run test/core/drift-detection/drift-check.test.ts`

## 2. Reference hard-block in apply/drift flows and final checks

- [x] 2.1 Update `src/core/templates/workflows/drift-detection.ts` and `apply-change.ts` guidance so the apply flow treats `missing` as a blocking condition (non-zero) rather than only a pause suggestion
  - **Spec scenario**: Missing scenario blocks (apply flow)
  - **Ladder rung**: 2 (Reuse — edit existing guidance to match new exit semantics)
  - **Test first**: template text assertion that `missing` blocks/prevents continuing
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.2 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
