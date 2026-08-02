## 1. Drift Detection Skill

- [x] 1.1 Create `skills/warpweave-drift-detection/SKILL.md` with drift detection workflow
  - **Spec scenario**: Drift detection runs after each task in apply
  - **Ladder rung**: 2 (reuse — existing SKILL.md format)
  - **Test first**: `test('creates drift detection skill file', () => { ... })`
  - **Verify**: `rtk vitest test/core/shared/skill-generation.test.ts`

- [x] 1.2 Implement drift analysis logic: read spec scenarios, scan code for matching behavior
  - **Spec scenario**: Drift detection compares code against spec scenarios
  - **Ladder rung**: 7 (minimum — AI-driven semantic comparison)
  - **Test first**: `test('detects missing spec scenario in code', async () => { ... })`
  - **Verify**: `rtk vitest test/core/drift-detection/`

- [x] 1.3 Implement drift reporting with resolution options
  - **Spec scenario**: Drift found with resolution prompt
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('presents resolution options on drift', async () => { ... })`
  - **Verify**: `rtk vitest test/core/drift-detection/`

## 2. Drift Check CLI Command

- [x] 2.1 Add `/ww:drift-check` command template to workflow templates
  - **Spec scenario**: Manual drift check via command
  - **Ladder rung**: 2 (reuse — existing command template pattern)
  - **Test first**: `test('registers drift-check command template', () => { ... })`
  - **Verify**: `rtk vitest test/core/templates/skill-templates-parity.test.ts`

- [x] 2.2 Register drift-check in skill generation and command registry
  - **Spec scenario**: Manual drift check via command
  - **Ladder rung**: 2 (reuse — extend existing registries)
  - **Test first**: `test('includes drift-check in generated skills', () => { ... })`
  - **Verify**: `rtk vitest test/core/shared/skill-generation.test.ts`

## 3. Apply Integration

- [x] 3.1 Add drift check hook to apply workflow template
  - **Spec scenario**: Drift check fires after task completion
  - **Ladder rung**: 2 (reuse — extend existing apply template)
  - **Test first**: `test('apply template includes drift check step', () => { ... })`
  - **Verify**: `rtk vitest test/core/templates/skill-templates-parity.test.ts`

- [x] 3.2 Handle drift-found pause in apply flow
  - **Spec scenario**: Drift found pauses apply with options
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('apply pauses on drift detection', async () => { ... })`
  - **Verify**: `rtk vitest test/core/drift-detection/`

## 4. Documentation

- [x] 4.1 Update README with drift detection section
  - **Spec scenario**: N/A (documentation)
  - **Ladder rung**: 7 (minimum)
  - **Test first**: N/A
  - **Verify**: manual review
