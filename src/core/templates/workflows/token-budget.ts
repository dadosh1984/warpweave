/**
 * Skill Template Workflow Modules
 *
 * Token Budget: sets a per-change token limit and tracks consumption across
 * pipeline phases using RTK savings.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getTokenBudgetSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-token-budget',
    description: 'Set a token limit for a change and track consumption across pipeline phases. Use when the user wants to constrain cost, project remaining budget, or review RTK savings per change.',
    instructions: `Track and constrain token consumption for a change across the pipeline phases.

${STORE_SELECTION_GUIDANCE}

**Input**: A change name, plus an optional budget. If no budget is given, read it from \`unified.toml\` (\`[warpweave]\` / budget section) or default to a sensible limit.

**Steps**

1. **Establish the budget**

   - Use the explicit budget if provided
   - Otherwise read from \`config/unified.toml\` (e.g., \`[rtk]\` or a budget key) in the project
   - Otherwise default: 100k tokens per change (adjust with the user)
   - Record the limit in \`warpweave/changes/<name>/\` as \`budget.md\` if none exists

   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`

2. **Track phase spend**

   Maintain a table with one row per pipeline phase:
   - proposal, specs, design, tasks, apply
   - For each phase record estimated tokens consumed (count responses/prompts during that phase; when unknown, estimate conservatively)

3. **Fold in RTK savings**

   RTK reduces token consumption on shell output. Measure and report savings:
   \`\`\`bash
   rtk gain
   \`\`\`
   Express savings as a percentage of the tokens that would have been spent without RTK wrapping.

4. **Project the remainder**

   Given spend so far and phases remaining, project whether the budget holds:
   - If on track: report remaining budget and headroom
   - If over budget: flag the overrun and propose where to cut (fewer iterations, tighter diffs, subagent delegation)

5. **Produce the report**

   \`\`\`markdown
   ## Token Budget: <change-name>

   Budget: <limit> tokens
   Spent: <X> tokens (<Y%>)
   Phases: proposal <p> | specs <s> | design <d> | tasks <t> | apply <a>
   RTK savings: <Z%> of shell output
   Remaining: <R> tokens
   Projection: <on track | over budget by <N>>
   \`\`\`

6. **Recommend**

   - Continue if on track
   - If over budget, propose the cheapest path back under the limit
   - Re-run \`rtk gain\` at change end for the final savings figure

**Heuristics**

- Prefer a conservative estimate when phase spend is unknown
- Never hide an overrun; report it with a recovery path
- Treat the RTK savings line as informational, not as budget credit`,
    license: 'MIT',
    compatibility: 'Requires warpweave CLI and RTK.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}

export function getOpsxTokenBudgetCommandTemplate(): CommandTemplate {
  return {
    name: 'WW: Token Budget',
    description: 'Track token consumption against a per-change budget',
    category: 'Metrics',
    tags: ['metrics', 'rtk', 'tokens', 'budget', 'cost'],
    content: `Track and constrain token consumption for a change across the pipeline phases.

${STORE_SELECTION_GUIDANCE}

**Input**: A change name after \`/ww:token-budget\` (e.g., \`/ww:token-budget add-auth 50000\`), plus an optional budget. If no budget is given, read it from \`unified.toml\` (\`[warpweave]\` / budget section) or default to a sensible limit.

**Steps**

1. **Establish the budget**

   - Use the explicit budget if provided
   - Otherwise read from \`config/unified.toml\` (e.g., \`[rtk]\` or a budget key) in the project
   - Otherwise default: 100k tokens per change (adjust with the user)
   - Record the limit in \`warpweave/changes/<name>/\` as \`budget.md\` if none exists

   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`

2. **Track phase spend**

   Maintain a table with one row per pipeline phase:
   - proposal, specs, design, tasks, apply
   - For each phase record estimated tokens consumed (count responses/prompts during that phase; when unknown, estimate conservatively)

3. **Fold in RTK savings**

   RTK reduces token consumption on shell output. Measure and report savings:
   \`\`\`bash
   rtk gain
   \`\`\`
   Express savings as a percentage of the tokens that would have been spent without RTK wrapping.

4. **Project the remainder**

   Given spend so far and phases remaining, project whether the budget holds:
   - If on track: report remaining budget and headroom
   - If over budget: flag the overrun and propose where to cut (fewer iterations, tighter diffs, subagent delegation)

5. **Produce the report**

   \`\`\`markdown
   ## Token Budget: <change-name>

   Budget: <limit> tokens
   Spent: <X> tokens (<Y%>)
   Phases: proposal <p> | specs <s> | design <d> | tasks <t> | apply <a>
   RTK savings: <Z%> of shell output
   Remaining: <R> tokens
   Projection: <on track | over budget by <N>>
   \`\`\`

6. **Recommend**

   - Continue if on track
   - If over budget, propose the cheapest path back under the limit
   - Re-run \`rtk gain\` at change end for the final savings figure

**Heuristics**

- Prefer a conservative estimate when phase spend is unknown
- Never hide an overrun; report it with a recovery path
- Treat the RTK savings line as informational, not as budget credit`,
  };
}
