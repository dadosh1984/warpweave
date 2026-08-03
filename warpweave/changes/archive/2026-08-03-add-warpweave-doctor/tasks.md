## 1. Extract shared self-check module

- [x] 1.1 Add `src/core/project-selfcheck.ts` exporting deterministic bridge checks: `checkSpecTemplateParity`, `checkInstalledSkillDrift`, `checkVersionSync` — each reads files and returns `{ ok, message, fix }`
  - **Spec scenario**: Doctor reports project self-check bridges
  - **Ladder rung**: 2 (Reuse — reuse parity logic from `config-parity.test.ts` semantics)
  - **Test first**: unit test each check returns `{ ok, message, fix }` for ok and finding cases
  - **Verify**: `rtk vitest run test/core/project-selfcheck.test.ts`
- [x] 1.2 Spec↔template parity check: given the curated anchor mapping (from `spec-template-parity`), verify each mapped template contains its anchor
  - **Spec scenario**: spec↔template parity bridge
  - **Ladder rung**: 2 (Reuse — share mapping with the parity guard)
  - **Test first**: a fixture template missing an anchor → check returns a finding
  - **Verify**: `rtk vitest run test/core/project-selfcheck.test.ts`
- [x] 1.3 Installed-skill drift check: always evaluate distribution source; inspect installed copy when present, report absence otherwise
  - **Spec scenario**: Installed security-scan skill vs distribution source
  - **Ladder rung**: 7 (Minimum — conditional file read)
  - **Test first**: absent installed copy → check reports absence (not a skip); stale installed copy → finding
  - **Verify**: `rtk vitest run test/core/project-selfcheck.test.ts`
- [x] 1.4 Version-sync check: compare pipeline.yaml `version` to package.json `version`
  - **Spec scenario**: pipeline.yaml version vs package.json version
  - **Ladder rung**: 2 (Reuse — config-parity already asserts this equality)
  - **Test first**: mismatched versions → finding
  - **Verify**: `rtk vitest run test/core/project-selfcheck.test.ts`

## 2. Wire the section into doctor

- [x] 2.1 Add the project self-check section to `src/commands/doctor.ts` human output and, when `--json`, to the returned payload
  - **Spec scenario**: Doctor shows the self-check section
  - **Ladder rung**: 2 (Reuse — extend existing printHumanHealth/JSON)
  - **Test first**: CLI test runs `warpweave doctor` and asserts the section appears; JSON includes a `selfcheck` key
  - **Verify**: `rtk vitest run test/core/project-selfcheck.test.ts`
- [x] 2.2 Keep the section read-only (no writes) and gate it to a healthy project root
  - **Spec scenario**: Self-check is read-only
  - **Ladder rung**: 2 (Reuse — doctor is already read-only)
  - **Test first**: assertion no filesystem writes occur (e.g. git status unchanged after run)
  - **Verify**: `rtk vitest run test/core/project-selfcheck.test.ts`
- [x] 2.3 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
