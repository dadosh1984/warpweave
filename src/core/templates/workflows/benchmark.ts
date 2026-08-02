/**
 * Skill Template Workflow Modules
 *
 * Benchmark: compares plan vs. actual for a change and persists the report.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getBenchmarkSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-benchmark',
    description: 'Compare plan vs. actual for a change and save the report to benchmark.md. Use when all tasks of a change are complete (auto-run at apply completion) or manually via /ww:benchmark to measure estimation accuracy, code size, or ladder discipline after implementation.',
    instructions: `Compare what was planned for a change with what was actually delivered.

${STORE_SELECTION_GUIDANCE}

**Input**: A change name. If omitted, infer from conversation context; if ambiguous, prompt for available changes.

**Steps**

1. **Select the change**

   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`

2. **Collect the plan (estimate)**

   From \`warpweave/changes/<name>/tasks.md\`:
   - Number of tasks
   - Expected lines of code, if documented (Ladder Decision / estimates)
   - Expected tests, dependencies, and ladder rungs per task

3. **Collect the actuals**

   - Lines of code added and removed:
   \`\`\`bash
   rtk git diff origin/main...HEAD --stat
   \`\`\`
   - Tests: count test files and cases added in the change's commits
   - Dependencies: diff package manifests (\`package.json\`, \`cargo.toml\`, \`go.mod\`, ...)
   - Tokens: \`rtk gain\` for the change's shell usage
   - Time: wall-clock from change start to now

4. **Compare**

   Build a table per metric:

   | Metric | Plan | Actual | Delta |
   |--------|------|--------|-------|
   | Tasks | <n> | <n> | <+/-> |
   | LOC added | <n> | <n> | <+/-> |
   | Tests | <n> | <n> | <+/-> |
   | Dependencies | <n> | <n> | <+/-> |
   | Tokens | <n> | <n> | <+/-> |

5. **Show ladder rung distribution**

   From the tasks, count how many implemented each rung (1-7) and note any task that skipped a rung without justification.

6. **Persist the report**

   Write the full report to \`warpweave/changes/<name>/benchmark.md\`:

   \`\`\`markdown
   ## Benchmark: <change-name>

   <comparison table>

   Ladder rungs: rung1 <n> | rung2 <n> | ... | rung7 <n>
   Unjustified rung skips: <count>

   Estimated lines removable: ~L
   RTK token savings: <Z%>
   \`\`\`

7. **Recommend**

   - Flag metrics where actual diverged most from plan
   - Recommend tightening estimates or rung discipline for the next change

**Heuristics**

- Never fabricate an estimate; if tasks.md lacks one, mark it "not planned"
- Actual LOC comes from the diff, not from memory
- A rung skip without a documented reason counts as unjustified`,
    license: 'MIT',
    compatibility: 'Requires warpweave CLI and RTK.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}

export function getOpsxBenchmarkCommandTemplate(): CommandTemplate {
  return {
    name: 'WW: Benchmark',
    description: 'Compare plan vs. actual and save the benchmark report',
    category: 'Metrics',
    tags: ['metrics', 'benchmark', 'plan', 'ladder', 'rtk'],
    content: `Compare what was planned for a change with what was actually delivered.

${STORE_SELECTION_GUIDANCE}

**Input**: A change name after \`/ww:benchmark\` (e.g., \`/ww:benchmark add-auth\`). If omitted, infer from conversation context; if ambiguous, prompt for available changes.

**Steps**

1. **Select the change**

   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`

2. **Collect the plan (estimate)**

   From \`warpweave/changes/<name>/tasks.md\`:
   - Number of tasks
   - Expected lines of code, if documented (Ladder Decision / estimates)
   - Expected tests, dependencies, and ladder rungs per task

3. **Collect the actuals**

   - Lines of code added and removed:
   \`\`\`bash
   rtk git diff origin/main...HEAD --stat
   \`\`\`
   - Tests: count test files and cases added in the change's commits
   - Dependencies: diff package manifests (\`package.json\`, \`cargo.toml\`, \`go.mod\`, ...)
   - Tokens: \`rtk gain\` for the change's shell usage
   - Time: wall-clock from change start to now

4. **Compare**

   Build a table per metric:

   | Metric | Plan | Actual | Delta |
   |--------|------|--------|-------|
   | Tasks | <n> | <n> | <+/-> |
   | LOC added | <n> | <n> | <+/-> |
   | Tests | <n> | <n> | <+/-> |
   | Dependencies | <n> | <n> | <+/-> |
   | Tokens | <n> | <n> | <+/-> |

5. **Show ladder rung distribution**

   From the tasks, count how many implemented each rung (1-7) and note any task that skipped a rung without justification.

6. **Persist the report**

   Write the full report to \`warpweave/changes/<name>/benchmark.md\`:

   \`\`\`markdown
   ## Benchmark: <change-name>

   <comparison table>

   Ladder rungs: rung1 <n> | rung2 <n> | ... | rung7 <n>
   Unjustified rung skips: <count>

   Estimated lines removable: ~L
   RTK token savings: <Z%>
   \`\`\`

7. **Recommend**

   - Flag metrics where actual diverged most from plan
   - Recommend tightening estimates or rung discipline for the next change

**Heuristics**

- Never fabricate an estimate; if tasks.md lacks one, mark it "not planned"
- Actual LOC comes from the diff, not from memory
- A rung skip without a documented reason counts as unjustified`,
  };
}
