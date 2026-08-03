## 1. Add the whole-spec mechanical verify pass

- [x] 1.1 Add `src/core/verify.ts` (thin orchestrator): given a change, gather its delta-spec files, run `extractSpecScenarios`, classify each with `classifyScenario` against the project root, and return `{ scenarios, findings }`
  - **Spec scenario**: Whole-spec scenarios classified
  - **Ladder rung**: 2 (Reuse — reuse `extractSpecScenarios` + `classifyScenario` from `drift-check.ts`)
  - **Test first**: `verifyChangeSpecs(changeDir, projectRoot)` on a fixture change with delta specs returns one finding per scenario with a valid status
  - **Verify**: `rtk vitest run test/core/verify.test.ts`
- [x] 1.2 Ensure the pass scans the whole project source for each scenario's terms (not per-task diff), surfacing `missing` when zero evidence exists
  - **Spec scenario**: Missing scenario is surfaced regardless of task diffs / Whole spec, not per-task diff
  - **Ladder rung**: 2 (Reuse — `classifyScenario` already scans whole source)
  - **Test first**: a fixture spec scenario whose terms exist nowhere in source (mimicking a budget requirement with no template implementation) → status `missing`
  - **Verify**: `rtk vitest run test/core/verify.test.ts`
- [x] 1.3 Make `missing` findings first-class in the verify output (reported, must be addressed)
  - **Spec scenario**: Verify report combines mechanical and agent layers
  - **Ladder rung**: 7 (Minimum — surface status in the report shape)
  - **Test first**: verify output for a missing scenario names it as missing
  - **Verify**: `rtk vitest run test/core/verify.test.ts`

## 2. Merge mechanical status into the verify report

- [x] 2.1 Update `src/core/templates/workflows/verify-change.ts` (both variants) so the verify report shows, per scenario, the mechanical status (compliant/missing/drifted) alongside the agent's assessment, and instructs addressing `missing` findings before verified
  - **Spec scenario**: Verify report shows mechanical status and agent assessment
  - **Ladder rung**: 2 (Reuse — edit the existing verify template)
  - **Test first**: template text assertion that the report includes the mechanical classification and "missing" handling
  - **Verify**: `rtk vitest run test/core/templates/skill-templates-parity.test.ts`
- [x] 2.2 Run build + lint + typecheck + full suite
  - **Spec scenario**: All scenarios
  - **Ladder rung**: 7 (Minimum)
  - **Test first**: n/a
  - **Verify**: `rtk pnpm run build`, `rtk pnpm run lint`, `rtk pnpm run typecheck`, `rtk vitest run test/`
