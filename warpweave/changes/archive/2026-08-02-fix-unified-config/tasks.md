## 1. unified.toml fix

- [x] 1.1 Rename `[openspec]` section to `[warpweave]` in `config/unified.toml`
  - **Spec scenario**: N/A (skip_specs change — content fix)
  - **Ladder rung**: 2 (reuse — parser already reads `config.warpweave`)
  - **Test first**: `expect(unifiedFile).toContain('[warpweave]')` — add assertion to a config content test
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`
- [x] 1.2 Update header comment in `config/unified.toml` from "OpenSpec Unified" to "Warpweave Unified"
  - **Spec scenario**: N/A (content fix)
  - **Ladder rung**: 6 (one-liner)
  - **Test first**: `expect(firstLine).toMatch(/Warpweave Unified/)`
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`

## 2. pipeline.yaml fix

- [x] 2.1 Replace `/opsx:explore OR /opsx:propose` with `/ww:explore OR /ww:propose` in `config/pipeline.yaml`
  - **Spec scenario**: N/A (content fix)
  - **Ladder rung**: 2 (reuse — canonical namespace in `command-references.ts`)
  - **Test first**: config content test asserting no `opsx:` and presence of `/ww:explore`
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`
- [x] 2.2 Replace `skill: writing-plans` with `warpweave-propose`
  - **Spec scenario**: N/A (content fix)
  - **Ladder rung**: 2 (reuse — real shipped skill name)
  - **Test first**: assert pipeline yaml references only real skill names
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`
- [x] 2.3 Replace execute skills with `warpweave-superpowers-tdd`, `warpweave-ponytail-minimal-output`
  - **Spec scenario**: N/A (content fix)
  - **Ladder rung**: 2 (reuse — real template names)
  - **Test first**: assert only `warpweave-*` skill names appear
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`
- [x] 2.4 Replace `npm_test: "rtk jest OR rtk vitest"` with `"rtk vitest"`
  - **Spec scenario**: N/A (content fix)
  - **Ladder rung**: 6 (one-liner)
  - **Test first**: assert no `jest` reference in pipeline.yaml
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`
- [x] 2.5 Bump `version: "1.0.0"` to `"1.3.1"`
  - **Spec scenario**: N/A (content fix)
  - **Ladder rung**: 6 (one-liner)
  - **Test first**: assert pipeline version equals package.json version
  - **Verify**: `rtk vitest run test/core/unified-config.test.ts`

## 3. drift-detection template fix

- [x] 3.1 Fix duplicated step number ("5. Offer resolution" → "6.") in both bodies of `src/core/templates/workflows/drift-detection.ts`
  - **Spec scenario**: N/A (template content fix)
  - **Ladder rung**: 6 (one-liner)
  - **Test first**: template parity test asserting step numbering is sequential
  - **Verify**: `rtk vitest run test/core/templates/skillssh-parity.test.ts`
- [x] 3.2 Regenerate skills tree with `warpweave update --force` and confirm drift-detection SKILL.md matches template
  - **Spec scenario**: N/A (regeneration)
  - **Ladder rung**: 2 (reuse — existing update command)
  - **Test first**: N/A (parity tests cover it)
  - **Verify**: `rtk warpweave drift-check`
