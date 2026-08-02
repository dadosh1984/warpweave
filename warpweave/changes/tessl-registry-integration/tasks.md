## 1. Tessl Registry Resolver Module

- [x] 1.1 Create `src/core/tessl-registry/` module structure
  - **Spec scenario**: Resolver queries Tessl Registry by dependency name
  - **Ladder rung**: 7 (minimum — new module)
  - **Test first**: `test('creates tessl-registry directory structure', () => { ... })`
  - **Verify**: `rtk vitest test/core/tessl-registry/`

- [x] 1.2 Implement registry API client using `node:fetch`
  - **Spec scenario**: Successful query returns skill metadata
  - **Ladder rung**: 3 (stdlib — `node:fetch`)
  - **Test first**: `test('fetches skills from registry API', async () => { ... })`
  - **Verify**: `rtk vitest test/core/tessl-registry/resolver.test.ts`

- [x] 1.3 Implement local cache with TTL
  - **Spec scenario**: Cached result is returned without network call
  - **Ladder rung**: 2 (reuse — JSON file pattern)
  - **Test first**: `test('returns cached result without network call', async () => { ... })`
  - **Verify**: `rtk vitest test/core/tessl-registry/cache.test.ts`

- [x] 1.4 Implement dependency auto-detection from `package.json`
  - **Spec scenario**: Dependencies extracted from package.json
  - **Ladder rung**: 3 (stdlib — `fs` + `JSON.parse`)
  - **Test first**: `test('extracts dependencies from package.json', () => { ... })`
  - **Verify**: `rtk vitest test/core/tessl-registry/detector.test.ts`

- [x] 1.5 Handle empty/unknown library gracefully
  - **Spec scenario**: Unknown library returns empty result
  - **Ladder rung**: 7 (minimum — error handling)
  - **Test first**: `test('returns empty result for unknown library', async () => { ... })`
  - **Verify**: `rtk vitest test/core/tessl-registry/resolver.test.ts`

## 2. Registry Config Command

- [x] 2.1 Add `warpweave config registry` CLI command
  - **Spec scenario**: User can enable or disable registry integration
  - **Ladder rung**: 2 (reuse — extend existing `warpweave config` command)
  - **Test first**: `test('registers config registry subcommand', () => { ... })`
  - **Verify**: `rtk vitest test/commands/config-registry.test.ts`

- [x] 2.2 Implement enable/disable toggle
  - **Spec scenario**: Enable registry integration
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('enables registry integration', async () => { ... })`
  - **Verify**: `rtk vitest test/commands/config-registry.test.ts`

- [x] 2.3 Implement custom endpoint configuration
  - **Spec scenario**: Custom endpoint configured
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('sets custom API endpoint', async () => { ... })`
  - **Verify**: `rtk vitest test/commands/config-registry.test.ts`

- [x] 2.4 Implement auto-detect toggle
  - **Spec scenario**: User can toggle auto-detection
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('toggles auto-detection', async () => { ... })`
  - **Verify**: `rtk vitest test/commands/config-registry.test.ts`

## 3. Instruction Injection

- [x] 3.1 Inject resolved skills into `generateInstructions()` output
  - **Spec scenario**: Skills appear in instruction context
  - **Ladder rung**: 2 (reuse — single injection point)
  - **Test first**: `test('includes registry skills in instructions', () => { ... })`
  - **Verify**: `rtk vitest test/core/artifact-graph/instruction-loader.test.ts`

- [x] 3.2 Skip Registry Skills section when no skills resolved
  - **Spec scenario**: No skills found does not modify instructions
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('omits registry section when empty', () => { ... })`
  - **Verify**: `rtk vitest test/core/artifact-graph/instruction-loader.test.ts`

## 4. Init Integration

- [x] 4.1 Add optional Tessl setup step to `warpweave init`
  - **Spec scenario**: Optional Tessl setup during init
  - **Ladder rung**: 2 (reuse — extend existing init flow)
  - **Test first**: `test('prompts for Tessl setup during init', async () => { ... })`
  - **Verify**: `rtk vitest test/core/init.test.ts`

- [x] 4.2 Display resolved skills summary in init output
  - **Spec scenario**: Optional Tessl setup during init
  - **Ladder rung**: 7 (minimum)
  - **Test first**: `test('shows resolved skills in init output', async () => { ... })`
  - **Verify**: `rtk vitest test/core/init.test.ts`

## 5. Documentation

- [x] 5.1 Update README with registry integration section
  - **Spec scenario**: N/A (documentation)
  - **Ladder rung**: 7 (minimum)
  - **Test first**: N/A
  - **Verify**: manual review
