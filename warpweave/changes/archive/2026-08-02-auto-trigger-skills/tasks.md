## 1. Native security-scan rewrite

- [x] 1.1 Rewrite `security-scan.ts` skill template to native agent-driven scan
  - **Spec scenario**: Native security scan runs without external tools; Scan targets only changed code
  - **Ladder rung**: 2 (reuse drift-detection pattern + ladder-audit shape)
  - **Test first**: `it('security-scan skill content contains no semgrep reference')` in `skill-templates-parity.test.ts`
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.2 Rewrite `security-scan.ts` command template (`WW: Security Scan`) to match native version
  - **Spec scenario**: Scan is read-only; Scan uses the repo diff as scope
  - **Ladder rung**: 2 (reuse skill body)
  - **Test first**: extend parity test asserting both templates share severity output shape
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.3 Update security-scan description to dual trigger ("after each task during apply or manually via /ww:security-scan")
  - **Spec scenario**: Apply runs a security check after each task
  - **Ladder rung**: 7 (description string change)
  - **Test first**: parity hash regen covers it
  - **Verify**: `rtk vitest run test/core/templates/skillssh-parity.test.ts`

## 2. Apply workflow auto-triggers

- [x] 2.1 Add per-task security check invocation to apply-change.ts skill template step 6 (line ~99)
  - **Spec scenario**: Security check fires after task completion; Findings pause apply for resolution
  - **Ladder rung**: 2 (reuse drift-check invocation slot)
  - **Test first**: extend parity test to assert apply template contains security-scan invocation
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.2 Add per-task security check invocation to apply-change.ts command template (line ~316)
  - **Spec scenario**: Security check fires after task completion
  - **Ladder rung**: 2 (mirror skill body)
  - **Test first**: parity test asserts both apply bodies carry the invocation
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.3 Add dependency-intercept bullet to apply task loop (invoke /ww:dependency-check when a new dependency is proposed)
  - **Spec scenario**: New dependency is walked up the ladder; Rejected dependency is not silently added
  - **Ladder rung**: 2 (reuse dependency-check skill)
  - **Test first**: parity test asserts apply template references /ww:dependency-check
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.4 Wire verify + benchmark auto-run at all_done in apply skill template step 7 / completion output
  - **Spec scenario**: Verify runs at all-done; Benchmark runs at all-done; Archive suggested after reports
  - **Ladder rung**: 2 (reuse existing verify/benchmark skills)
  - **Test first**: parity test asserts completion output references /ww:verify and /ww:benchmark
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.5 Mirror the all_done verify+benchmark wiring in apply command template
  - **Spec scenario**: Verify runs at all-done
  - **Ladder rung**: 2 (mirror skill body)
  - **Test first**: parity test asserts both apply bodies carry the wiring
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`

## 3. Dependency-check, verify, benchmark trigger wording

- [x] 3.1 Update dependency-check.ts description to intercept wording ("Use whenever a new dependency is proposed…")
  - **Spec scenario**: New dependency is walked up the ladder
  - **Ladder rung**: 7 (description string change)
  - **Test first**: parity hash regen covers it
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 3.2 Update verify-change.ts description to note auto-run at apply completion
  - **Spec scenario**: Verify runs at all-done
  - **Ladder rung**: 7 (description string change)
  - **Test first**: parity hash regen covers it
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 3.3 Update benchmark.ts description to note auto-run at apply completion
  - **Spec scenario**: Benchmark runs at all-done
  - **Ladder rung**: 7 (description string change)
  - **Test first**: parity hash regen covers it
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`

## 4. Guardrails in core + workflow map sync

- [x] 4.1 Add `'guardrails'` to `CORE_WORKFLOWS` in `src/core/profiles.ts`
  - **Spec scenario**: Core workflow includes the guardrails skill
  - **Ladder rung**: 7 (one-line constant change)
  - **Test first**: `it('CORE_WORKFLOWS includes guardrails')` in `test/core/profiles.test.ts`
  - **Verify**: `rtk vitest run test/core/profiles.test.ts`
- [x] 4.2 Update guardrails.ts description with auto-trigger wording (pre-commit gate)
  - **Spec scenario**: Guardrails gate runs before commit
  - **Ladder rung**: 7 (description string change)
  - **Test first**: parity hash regen covers it
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 4.3 Sync `WORKFLOW_TO_SKILL_DIR` in `src/core/init.ts` to 26 entries (add translator, ponytail-minimal-output, superpowers-tdd)
  - **Spec scenario**: (refactor — no direct spec; keeps skill cleanup correct)
  - **Ladder rung**: 7 (add 3 entries to existing constant)
  - **Test first**: `it('init WORKFLOW_TO_SKILL_DIR matches profile-sync-drift')` in `test/core/init.test.ts`
  - **Verify**: `rtk vitest run test/core/init.test.ts`

## 4a. Release-compare skill

- [x] 4a.1 Create `release-compare.ts` skill template (`warpweave-release-compare`)
  - **Spec scenario**: Criteria measured and reported; Improvement score computed; Worsening is reported
  - **Ladder rung**: 2 (reuse benchmark criteria + drift-check/security signals + `rtk git`/`rtk gain`)
  - **Test first**: `it('release-compare skill content measures defined criteria')` in `skill-templates-parity.test.ts`
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 4a.2 Create `release-compare.ts` command template (`WW: Release Compare`)
  - **Spec scenario**: Manual invocation
  - **Ladder rung**: 2 (mirror skill body)
  - **Test first**: parity test asserts command template exists and shares output shape
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 4a.3 Register `release-compare` in registry: `ALL_WORKFLOWS` (profiles.ts), skill-generation.ts, command-references.ts, WORKFLOW_TO_SKILL_DIR (both copies), COMMAND_IDS/tool-detection
  - **Spec scenario**: Manual invocation; Release compare runs after each release
  - **Ladder rung**: 7 (add to existing constant lists)
  - **Test first**: `it('ALL_WORKFLOWS includes release-compare')` + registry parity tests
  - **Verify**: `rtk vitest run test/core/profiles.test.ts test/core/profile-sync-drift.test.ts test/utils/command-references.test.ts`
- [x] 4a.4 Add `[quality] min_improvement` threshold to `config/unified.toml` (default 0.25) and have release-compare read it
  - **Spec scenario**: Threshold configurable per project; Below-threshold improvement warns
  - **Ladder rung**: 7 (config key + read in skill instructions)
  - **Test first**: extend `test/core/config-parity.test.ts` to assert `[quality]` key
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 4a.5 Write release-comparison report to `warpweave/metrics/release-compare/<release>.md`, read-only
  - **Spec scenario**: Report written to release history; Compare is read-only
  - **Ladder rung**: 7 (path constant + read-only guardrail in instructions)
  - **Test first**: parity test asserts report path + read-only guardrail in content
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`

## 5. Docs and regenerated artifacts

- [x] 5.1 Update AGENTS.md with the automatic-trigger model (security per-task, dependency intercept, verify+benchmark at completion, guardrails pre-commit, release-compare after release)
  - **Spec scenario**: (all trigger scenarios — operational contract)
  - **Ladder rung**: 2 (reuse existing layer structure)
  - **Test first**: n/a (docs)
  - **Verify**: `rtk git diff --stat`
- [x] 5.2 Update README.md: "ships by default" 11 → 12, describe auto-trigger model and release-compare
  - **Spec scenario**: Core workflow includes the guardrails skill
  - **Ladder rung**: 2 (reuse existing README structure)
  - **Test first**: n/a (docs)
  - **Verify**: `rtk git diff --stat`
- [x] 5.3 Update docs/UNIFIED.md default skill list if it enumerates the core set
  - **Spec scenario**: Core workflow includes the guardrails skill
  - **Ladder rung**: 2 (reuse existing doc structure)
  - **Test first**: n/a (docs)
  - **Verify**: `rtk git diff --stat`
- [x] 5.4 Regenerate skills tree and parity hashes
  - **Spec scenario**: Skills.sh distribution includes the guardrails skill
  - **Ladder rung**: 2 (existing scripts)
  - **Test first**: n/a (generation)
  - **Verify**: `pnpm build; pnpm generate:skills; pnpm regen:parity-hashes; rtk vitest run test/core/templates/skillssh-parity.test.ts test/core/templates/skill-templates-parity.test.ts`
- [x] 5.5 Add changeset (minor) documenting the auto-trigger model, native security scan, and release-compare
  - **Spec scenario**: (release metadata)
  - **Ladder rung**: 2 (existing changeset flow)
  - **Test first**: `rtk pnpm exec changeset status`
  - **Verify**: `rtk pnpm exec changeset status`

## 6. Full verification

- [x] 6.1 Run full test suite
  - **Spec scenario**: (all)
  - **Ladder rung**: 2 (existing suite)
  - **Test first**: n/a (full suite)
  - **Verify**: `rtk pnpm test`
- [x] 6.2 Run lint and typecheck
  - **Spec scenario**: (all)
  - **Ladder rung**: 2 (existing tooling)
  - **Test first**: n/a
  - **Verify**: `pnpm build; pnpm lint; tsc --noEmit`
