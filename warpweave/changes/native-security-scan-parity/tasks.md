## 1. Sync installed skill and guard against drift

- [x] 1.1 Re-sync the installed security-scan skill so `.opencode/skills/warpweave-security-scan/SKILL.md` reflects the native source (copy `skills/warpweave-security-scan/SKILL.md` over it)
  - **Spec scenario**: Installed copy is native
  - **Ladder rung**: 2 (reuse — reuse init's copy/install path)
  - **Test first**: after sync, the installed file no longer declares "Requires semgrep"
  - **Verify**: `Select-String -Path .opencode\skills\warpweave-security-scan\SKILL.md -Pattern 'semgrep|Docker'` shows no semgrep requirement
- [x] 1.2 Add a targeted parity test in `test/core/config-parity.test.ts` asserting that, when the installed `.opencode/skills/warpweave-security-scan/SKILL.md` exists, it reflects the native contract (no "Requires semgrep" / semgrep-Docker instructions); skip when the installed skill directory is absent (paths via `path.join`)
  - **Spec scenario**: Stale semgrep installed copy is caught; Absent installed skills are not a failure
  - **Ladder rung**: 2 (reuse — extend existing `config-parity.test.ts` pattern; skip-when-absent for CI)
  - **Test first**: `test('installed security-scan skill reflects native contract', ...)` fails if the installed copy is the stale semgrep version
  - **Verify**: `rtk pnpm exec vitest run test/core/config-parity.test.ts`
- [x] 1.3 Confirm the native skill documents coverage of secrets + injection and that running it does not require semgrep/Docker
  - **Spec scenario**: Detection categories are preserved
  - **Ladder rung**: 2 (reuse — existing coverage text already present; just confirm/record)
  - **Test first**: assertion that the skill body contains secrets and injection categories and no "semgrep"/"Docker" requirement
  - **Verify**: `rtk pnpm exec vitest run test/` and read the skill body
