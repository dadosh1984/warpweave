## 1. Test scaffold

- [x] 1.1 Create `test/core/config-parity.test.ts` with cross-platform `config/` resolution (repoRoot via `import.meta.url`, mirroring `skillssh-parity.test.ts`)
  - **Spec scenario**: N/A (skip_specs — test-only)
  - **Ladder rung**: 2 (reuse parity-test pattern)
  - **Test first**: the new file itself is the test
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 1.2 Read `config/unified.toml` and assert it declares `[warpweave]` (and does not contain `[openspec]`)
  - **Spec scenario**: N/A
  - **Ladder rung**: 3 (stdlib read + assert)
  - **Test first**: `expect(toml).toContain('[warpweave]')` / `expect(toml).not.toContain('[openspec]')`
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 1.3 Read `config/pipeline.yaml` and assert no `/opsx:` substring; spec-phase entry uses `/ww:`
  - **Spec scenario**: N/A
  - **Ladder rung**: 6 (explicit assertions)
  - **Test first**: `expect(pipelineYaml).not.toContain('opsx')` / `expect(pipelineYaml).toContain('/ww:explore')`
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`

## 2. Content guards

- [x] 2.1 Parse `config/pipeline.yaml` with installed `yaml` parser and assert every skill identifier resolves via `getSkillTemplates()` (covers `writing-plans`, `subagent-driven-development`, `test-driven-development`, `quality-ladder` regressions)
  - **Spec scenario**: N/A
  - **Ladder rung**: 5 (reuse `yaml` dependency) + 2 (reuse `getSkillTemplates`)
  - **Test first**: `for (const skill of collectedSkills) expect(templateNames).toContain(skill)`
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 2.2 Assert pipeline `version` equals `package.json` version
  - **Spec scenario**: N/A
  - **Ladder rung**: 6
  - **Test first**: `expect(pipeline.version).toBe(packageJson.version)`
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`
- [x] 2.3 Assert no `jest` reference in `commands_rewritten.npm_test`
  - **Spec scenario**: N/A
  - **Ladder rung**: 6
  - **Test first**: `expect(npmTestCommand).not.toContain('jest')`
  - **Verify**: `rtk vitest run test/core/config-parity.test.ts`

## 3. Full suite

- [x] 3.1 Run the full test suite to confirm no unrelated regressions
  - **Spec scenario**: N/A
  - **Ladder rung**: 7 (minimum)
  - **Test first**: N/A (verification)
  - **Verify**: `rtk pnpm test`
