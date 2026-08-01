/**
 * Skill Template Workflow Modules
 *
 * Ladder Audit: scans the diff of the current change and checks every line
 * against the Ponytail ladder.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getLadderAuditSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-ladder-audit',
    description: 'Audit the current change\'s diff against the Ponytail ladder. Use when the user wants to find deletable code, over-engineering, or unjustified dependencies before committing or archiving.',
    instructions: `Audit the current change's diff against the Ponytail ladder.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a change name or path. If omitted, audit the current uncommitted diff.

**Steps**

1. **Establish the diff**

   If a change name is provided, resolve it with:
   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`
   Otherwise diff the working tree:
   \`\`\`bash
   rtk git diff HEAD
   \`\`\`
   For a change already committed to a branch:
   \`\`\`bash
   rtk git diff origin/main...HEAD
   \`\`\`

2. **Climb the ladder per line**

   For each changed file and each added line, ask: "Would the senior engineer with the ponytail delete this?"

   Stop at the first rung that holds:
   1. **YAGNI** — does this line need to exist at all? (deleted code, dead branches)
   2. **Reuse** — is this already implemented elsewhere in the codebase? (duplication)
   3. **Stdlib** — does the standard library already provide this?
   4. **Native** — does the platform feature already exist?
   5. **Dependency** — is a new dependency added that an existing one covers?
   6. **One-liner** — could this be a single expression?
   7. **Minimum** — is this the smallest correct implementation?

3. **Flag findings by severity**

   - **CRITICAL**: Line is dead or duplicate; deleting it cannot break a spec scenario
   - **HIGH**: New dependency without ladder justification (rung 5 skipped)
   - **MEDIUM**: Over-engineered abstraction, unused import, premature optimization
   - **LOW**: Style/formatting opportunity

4. **Produce the report**

   \`\`\`markdown
   ## Ladder Audit: <change-name>

   ### Findings

   <file>:<line>
     ⚠ <SEVERITY>: <reason>. Can be deleted or simplified.

   ### Summary
   - X critical, Y high, Z medium, W low
   - Lines that can be removed: ~N
   - Dependencies that can be dropped: ~M
   \`\`\`

5. **Recommend**

   - Fix CRITICAL and HIGH findings before commit
   - Re-run \`rtk gain\` after deletions to report token savings

**Heuristics**

- Prefer SUGGESTION over CRITICAL when uncertain
- Never flag a line that a spec scenario depends on
- Every finding must name a concrete file:line and a concrete simplification`,
    license: 'MIT',
    compatibility: 'Requires warpweave CLI and RTK.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}

export function getOpsxLadderAuditCommandTemplate(): CommandTemplate {
  return {
    name: 'OTRIX: Ladder Audit',
    description: 'Audit the current diff against the Ponytail ladder',
    category: 'Quality',
    tags: ['quality', 'ponytail', 'ladder', 'audit'],
    content: `Audit the current change's diff against the Ponytail ladder.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a change name after \`/otrix:ladder-audit\` (e.g., \`/otrix:ladder-audit add-auth\`). If omitted, audit the current uncommitted diff.

**Steps**

1. **Establish the diff**

   If a change name is provided, resolve it with:
   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`
   Otherwise diff the working tree:
   \`\`\`bash
   rtk git diff HEAD
   \`\`\`
   For a change already committed to a branch:
   \`\`\`bash
   rtk git diff origin/main...HEAD
   \`\`\`

2. **Climb the ladder per line**

   For each changed file and each added line, ask: "Would the senior engineer with the ponytail delete this?"

   Stop at the first rung that holds:
   1. **YAGNI** — does this line need to exist at all? (deleted code, dead branches)
   2. **Reuse** — is this already implemented elsewhere in the codebase? (duplication)
   3. **Stdlib** — does the standard library already provide this?
   4. **Native** — does the platform feature already exist?
   5. **Dependency** — is a new dependency added that an existing one covers?
   6. **One-liner** — could this be a single expression?
   7. **Minimum** — is this the smallest correct implementation?

3. **Flag findings by severity**

   - **CRITICAL**: Line is dead or duplicate; deleting it cannot break a spec scenario
   - **HIGH**: New dependency without ladder justification (rung 5 skipped)
   - **MEDIUM**: Over-engineered abstraction, unused import, premature optimization
   - **LOW**: Style/formatting opportunity

4. **Produce the report**

   \`\`\`markdown
   ## Ladder Audit: <change-name>

   ### Findings

   <file>:<line>
     ⚠ <SEVERITY>: <reason>. Can be deleted or simplified.

   ### Summary
   - X critical, Y high, Z medium, W low
   - Lines that can be removed: ~N
   - Dependencies that can be dropped: ~M
   \`\`\`

5. **Recommend**

   - Fix CRITICAL and HIGH findings before commit
   - Re-run \`rtk gain\` after deletions to report token savings

**Heuristics**

- Prefer SUGGESTION over CRITICAL when uncertain
- Never flag a line that a spec scenario depends on
- Every finding must name a concrete file:line and a concrete simplification`,
  };
}
