/**
 * Skill Template Workflow Modules
 *
 * Learn: scans archived changes, aggregates metrics, shows trends, and gives
 * recommendations.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getLearnSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-learn',
    description: 'Analyze archived changes for trends and recommendations. Use when the user wants to review project history, estimation accuracy, or ladder discipline across past changes.',
    instructions: `Scan archived changes, aggregate metrics, and surface trends and recommendations.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally limit to a date range or a number of most-recent changes. If omitted, analyze all archives.

**Steps**

1. **Find archives**

   List archived changes:
   \`\`\`bash
   spectrix list --archived --json
   \`\`\`
   If archives are on disk under \`openspec/changes/archive/\`, list them directly.

2. **Aggregate metrics per change**

   For each archived change, collect:
   - **Lines**: from the change's git diff (LOC added/removed), if the repo history is available
   - **Tokens**: from any \`rtk gain\` figures recorded at archive time
   - **Ladder rungs**: distribution from tasks.md (rung per task)
   - **Phases**: which pipeline artifacts were produced and their sizes
   - **Tasks**: planned vs. actual count from tasks.md and benchmark.md

3. **Trend across changes**

   Order by archive date and show:
   - Lines and tasks over time
   - Rung distribution over time (are lower rungs becoming more common?)
   - Token savings trend
   - Estimation drift (planned vs. actual per change)

4. **Give recommendations**

   Based on the trends:
   - Estimation accuracy: tighten or loosen planning estimates
   - Rung discipline: call out rung skips without justification
   - Token usage: flag changes that blew their budget
   - Debt: flag archived changes that left ponytail markers behind

5. **Produce the report**

   \`\`\`markdown
   ## Learn: <scope>

   Changes analyzed: <N> (<date range>)

   | Change | LOC | Tokens | Rung dist | Tasks (plan/act) |
   |--------|-----|--------|-----------|------------------|
   | <name> | <n> | <n> | <counts> | <p>/<a> |

   Trends:
   - <observation>

   Recommendations:
   - <recommendation>
   \`\`\`

**Heuristics**

- Never fabricate a metric; mark missing data "n/a"
- Use dates from archive filenames or the change root, not from memory
- Recommendations must trace to a concrete trend in the data`,
    license: 'MIT',
    compatibility: 'Requires spectrix CLI.',
    metadata: { author: 'spectrix', version: '1.0' },
  };
}

export function getOpsxLearnCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Learn',
    description: 'Analyze archived changes for trends and recommendations',
    category: 'Metrics',
    tags: ['metrics', 'learn', 'trends', 'archives', 'analytics'],
    content: `Scan archived changes, aggregate metrics, and surface trends and recommendations.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally limit to a date range or a number of most-recent changes after \`/opsx:learn\`. If omitted, analyze all archives.

**Steps**

1. **Find archives**

   List archived changes:
   \`\`\`bash
   spectrix list --archived --json
   \`\`\`
   If archives are on disk under \`openspec/changes/archive/\`, list them directly.

2. **Aggregate metrics per change**

   For each archived change, collect:
   - **Lines**: from the change's git diff (LOC added/removed), if the repo history is available
   - **Tokens**: from any \`rtk gain\` figures recorded at archive time
   - **Ladder rungs**: distribution from tasks.md (rung per task)
   - **Phases**: which pipeline artifacts were produced and their sizes
   - **Tasks**: planned vs. actual count from tasks.md and benchmark.md

3. **Trend across changes**

   Order by archive date and show:
   - Lines and tasks over time
   - Rung distribution over time (are lower rungs becoming more common?)
   - Token savings trend
   - Estimation drift (planned vs. actual per change)

4. **Give recommendations**

   Based on the trends:
   - Estimation accuracy: tighten or loosen planning estimates
   - Rung discipline: call out rung skips without justification
   - Token usage: flag changes that blew their budget
   - Debt: flag archived changes that left ponytail markers behind

5. **Produce the report**

   \`\`\`markdown
   ## Learn: <scope>

   Changes analyzed: <N> (<date range>)

   | Change | LOC | Tokens | Rung dist | Tasks (plan/act) |
   |--------|-----|--------|-----------|------------------|
   | <name> | <n> | <n> | <counts> | <p>/<a> |

   Trends:
   - <observation>

   Recommendations:
   - <recommendation>
   \`\`\`

**Heuristics**

- Never fabricate a metric; mark missing data "n/a"
- Use dates from archive filenames or the change root, not from memory
- Recommendations must trace to a concrete trend in the data`,
  };
}
