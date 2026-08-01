## 1. Skill Template

- [x] 1.1 Create `src/core/templates/workflows/translator.ts` with `getTranslatorSkillTemplate()` (name `warpweave-translator`) modeled on trailofbits' `ask-questions-if-underspecified`, adapted to Warpweave's voice, and including `${STORE_SELECTION_GUIDANCE}` so the deployed-skill parity check passes
  - **Spec scenario**: Detect underspecified requests; Ask minimal must-have questions; Pause before acting; Confirm interpretation before starting work
  - **Ladder rung**: 2 (reuse — adapt the proven trailofbits content; the template shape reuses `feedback.ts`)
  - **Test first**: add `getTranslatorSkillTemplate` to `EXPECTED_FUNCTION_HASHES` and `GENERATED_SKILL_FACTORIES` in `test/core/templates/skill-templates-parity.test.ts`, then watch `preserves all template function payloads exactly` fail because the factory is missing from `src`
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 1.2 Export `getTranslatorSkillTemplate` from the `src/core/templates/skill-templates.ts` facade
  - **Spec scenario**: Translator skill installed by default (template is available for deployment)
  - **Ladder rung**: 2 (reuse the existing facade re-export pattern)
  - **Test first**: typecheck via build — the parity test imports from `skill-templates.js`, so the export must resolve
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`; `pnpm build`

## 2. Registry + Profiles

- [x] 2.1 Register the template in `getSkillTemplates()` (`src/core/shared/skill-generation.ts`) with `dirName: 'warpweave-translator'` and `workflowId: 'translator'`
  - **Spec scenario**: Skills.sh distribution includes the translator skill
  - **Ladder rung**: 2 (reuse the existing registry — add one entry)
  - **Test first**: `pins every skill the production registry deploys` in `skill-templates-parity.test.ts` fails until the registry entry matches `GENERATED_SKILL_FACTORIES`
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.2 Add `translator` to `ALL_WORKFLOWS` and `CORE_WORKFLOWS` in `src/core/profiles.ts` (core is the default profile, so this installs the skill by default)
  - **Spec scenario**: Core workflow includes the translator skill; All workflows include the translator skill
  - **Ladder rung**: 2 (reuse `getProfileWorkflows` — only add constant entries)
  - **Test first**: update `test/core/profiles.test.ts` expected `CORE_WORKFLOWS` (now 7) and `ALL_WORKFLOWS` (now 22) lists; watch `should contain the default core workflows` fail before the profile change
  - **Verify**: `rtk vitest run test/core/profiles.test.ts`

## 3. Distribution + Parity

- [x] 3.1 Regenerate the skills.sh distribution: `pnpm build && pnpm generate:skills` to produce `skills/warpweave-translator/SKILL.md`
  - **Spec scenario**: Skills.sh distribution includes the translator skill
  - **Ladder rung**: 2 (reuse the existing generator — no new code)
  - **Test first**: `test/core/templates/skillssh-parity.test.ts` `keeps committed skills/ in sync` fails because `skills/warpweave-translator/SKILL.md` is missing
  - **Verify**: `rtk vitest run test/core/templates/skillssh-parity.test.ts`
- [x] 3.2 Regenerate the golden hashes: `pnpm regen:parity-hashes` (after 3.1, `dist/` is current), then re-run the parity suite
  - **Spec scenario**: Translator skill installed by default (deployment pipeline consistent)
  - **Ladder rung**: 2 (reuse the existing regen script)
  - **Test first**: run the parity test first to observe the hash mismatch, then regenerate
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`

## 4. Docs + Release

- [x] 4.1 Update `README.md` to document the Translator skill (what it does, that it ships by default)
  - **Spec scenario**: Translator skill installed by default (product-facing documentation)
  - **Ladder rung**: 7 (minimum — a short documented entry, no new doc infrastructure)
  - **Test first**: none — documentation change; review the README diff manually
  - **Verify**: `rtk git diff -- README.md`
- [x] 4.2 Add a changeset (minor bump) describing the new Translator skill; bump `package.json` version and `CHANGELOG.md`
  - **Spec scenario**: Translator skill installed by default (released to users)
  - **Ladder rung**: 5 (dependency — reuse the existing `@changesets/cli` release tooling)
  - **Test first**: `pnpm run check:pack-version` fails until `package.json` version matches the changeset bump
  - **Verify**: `rtk pnpm run check:pack-version`
- [x] 4.3 Full verification: build, lint, and full test suite pass
  - **Spec scenario**: All translator-skill requirements (regression check)
  - **Ladder rung**: 7 (minimum — run the existing commands, write no new code)
  - **Test first**: none — regression gate
  - **Verify**: `rtk pnpm run build; rtk pnpm run lint; rtk pnpm test`
- [x] 4.4 Commit, tag (e.g., `v1.1.0`), and push to `origin`
  - **Spec scenario**: Translator skill installed by default (shipped to GitHub)
  - **Ladder rung**: 7 (minimum — standard git release flow)
  - **Test first**: none — release step
  - **Verify**: `rtk git log --oneline -5; rtk git push origin main --tags`
