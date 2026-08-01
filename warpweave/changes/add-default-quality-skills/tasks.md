## 1. Skill Templates

- [x] 1.1 Create `src/core/templates/workflows/ponytail-minimal-output.ts` with `getPonytailMinimalOutputSkillTemplate()` (name `warpweave-ponytail-minimal-output`) — the YAGNI ladder (skip/reuse/stdlib/native/dependency/one-liner/minimum), `// ponytail:` debt markers, and "never cut validation/error handling/security/accessibility"
  - **Spec scenario**: Minimal-output skill installed by default (template available for deployment)
  - **Ladder rung**: 2 (reuse — model on the existing skill template shape; the ladder rules already live in apply/update templates)
  - **Test first**: add `getPonytailMinimalOutputSkillTemplate` to `EXPECTED_FUNCTION_HASHES` and `GENERATED_SKILL_FACTORIES` in `test/core/templates/skill-templates-parity.test.ts`, then watch `preserves all template function payloads exactly` fail because the factory is missing from `src`
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.2 Create `src/core/templates/workflows/superpowers-tdd.ts` with `getSuperpowersTddSkillTemplate()` (name `warpweave-superpowers-tdd`) — RED-GREEN-REFACTOR, subagent-driven development, two-stage review (spec compliance, then code quality)
  - **Spec scenario**: TDD methodology skill installed by default (template available for deployment)
  - **Ladder rung**: 2 (reuse — model on the existing skill template shape; TDD rules already embedded in apply template)
  - **Test first**: add `getSuperpowersTddSkillTemplate` to `EXPECTED_FUNCTION_HASHES` and `GENERATED_SKILL_FACTORIES` in the parity test, watch the same parity test fail
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.3 Export both factories from `src/core/templates/skill-templates.ts` facade
  - **Spec scenario**: Minimal-output and TDD skills installed by default (template available for deployment)
  - **Ladder rung**: 2 (reuse the existing facade re-export pattern)
  - **Test first**: typecheck via build — the parity test imports from `skill-templates.js`, so the exports must resolve
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`; `pnpm build`

## 2. Registry + Profiles

- [x] 2.1 Register both templates in `getSkillTemplates()` (`src/core/shared/skill-generation.ts`) with `dirName: 'warpweave-ponytail-minimal-output'`/`'warpweave-superpowers-tdd'` and `workflowId` equal to the workflow ids
  - **Spec scenario**: Skills.sh distribution includes both quality skills; quality skills generated for each configured agent
  - **Ladder rung**: 2 (reuse the existing registry — add two entries)
  - **Test first**: `pins every skill the production registry deploys` in `skill-templates-parity.test.ts` fails until the registry entries match `GENERATED_SKILL_FACTORIES`
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.2 Add `ponytail-minimal-output` and `superpowers-tdd` to `CORE_WORKFLOWS` and `ALL_WORKFLOWS` in `src/core/profiles.ts` (core is the default profile, so this installs both by default)
  - **Spec scenario**: Core workflow includes the minimal-output and TDD skills; full workflow includes them
  - **Ladder rung**: 2 (reuse `getProfileWorkflows` — only add constant entries)
  - **Test first**: update `test/core/profiles.test.ts` expected `CORE_WORKFLOWS` (now 9) and `ALL_WORKFLOWS` (now 24) lists; watch `should contain the default core workflows` fail before the profile change
  - **Verify**: `rtk vitest run test/core/profiles.test.ts`
- [x] 2.3 Extend `SKILL_NAMES` in `src/core/shared/tool-detection.ts` with `warpweave-ponytail-minimal-output` and `warpweave-superpowers-tdd`
  - **Spec scenario**: Quality skills generated for each configured agent (detection/version tracking covers the new dirs)
  - **Ladder rung**: 2 (reuse the existing name registry — add two entries)
  - **Test first**: update `test/core/shared/tool-detection.test.ts` expected `SKILL_NAMES` list; watch the skill-count assertion fail before the change
  - **Verify**: `rtk vitest run test/core/shared/tool-detection.test.ts`
- [x] 2.4 Add both workflow ids to `WORKFLOW_TO_SKILL_DIR` in `src/core/profile-sync-drift.ts` (skill-only — no command pair, so `COMMAND_IDS` stays unchanged and the drift-check keeps skipping them)
  - **Spec scenario**: Quality skills install without manual configuration (profile sync covers the new dirs)
  - **Ladder rung**: 2 (reuse the existing mapping — add two entries)
  - **Test first**: update the affected profile-sync/drift test expectations for the new workflow count
  - **Verify**: `rtk vitest run test/core/profile-sync-drift.test.ts`

## 3. Distribution + Parity

- [x] 3.1 Regenerate the skills.sh distribution: `pnpm build && pnpm generate:skills` to produce `skills/warpweave-ponytail-minimal-output/SKILL.md` and `skills/warpweave-superpowers-tdd/SKILL.md`
  - **Spec scenario**: Skills.sh distribution includes both quality skills
  - **Ladder rung**: 2 (reuse the existing generator — no new code)
  - **Test first**: `test/core/templates/skillssh-parity.test.ts` `keeps committed skills/ in sync` fails because the two dirs are missing
  - **Verify**: `rtk vitest run test/core/templates/skillssh-parity.test.ts`
- [x] 3.2 Regenerate the golden hashes: `pnpm regen:parity-hashes` (after 3.1, `dist/` is current), then re-run the parity suite
  - **Spec scenario**: Minimal-output and TDD skills installed by default (deployment pipeline consistent)
  - **Ladder rung**: 2 (reuse the existing regen script)
  - **Test first**: run the parity test first to observe the hash mismatch, then regenerate
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`

## 4. Init Hints + Docs

- [x] 4.1 Update the "Unified tools" section in `src/core/init.ts` so Ponytail and Superpowers are reported as installed skills instead of "Add to opencode.json" suggestions (keep the RTK line)
  - **Spec scenario**: Init output reports quality skills as installed
  - **Ladder rung**: 7 (minimum — edit the console lines)
  - **Test first**: update `test/core/init.test.ts` assertions to expect the installed-skill wording
  - **Verify**: `rtk vitest run test/core/init.test.ts`
- [x] 4.2 Update `README.md` to document the two new default skills (minimal-output ladder, TDD methodology) and that they ship for every supported agent
  - **Spec scenario**: Quality skills installed without manual configuration (product-facing documentation)
  - **Ladder rung**: 7 (minimum — short documented entries)
  - **Test first**: none — documentation change; review the README diff manually
  - **Verify**: `rtk git diff -- README.md`
- [x] 4.3 Add a changeset (minor bump) describing the two new default skills; bump `package.json` version and `CHANGELOG.md`
  - **Spec scenario**: Quality skills installed without manual configuration (released to users)
  - **Ladder rung**: 5 (dependency — reuse the existing `@changesets/cli` release tooling)
  - **Test first**: `pnpm run check:pack-version` fails until `package.json` version matches the changeset bump
  - **Verify**: `rtk pnpm run check:pack-version`

## 5. Full Verification

- [x] 5.1 Full verification: build, lint, and full test suite pass
  - **Spec scenario**: All quality-skills requirements (regression check)
  - **Ladder rung**: 7 (minimum — run the existing commands, write no new code)
  - **Test first**: none — regression gate
  - **Verify**: `rtk pnpm run build; rtk pnpm run lint; rtk pnpm test`
