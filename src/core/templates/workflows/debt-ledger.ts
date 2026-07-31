/**
 * Skill Template Workflow Modules
 *
 * Debt Ledger: collects `// ponytail:` markers from the codebase into a
 * structured backlog of deferred simplifications.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getDebtLedgerSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-debt-ledger',
    description: 'Collect `// ponytail:` markers from the codebase into a structured debt backlog. Use when the user wants to review deferred simplifications or decide which technical debt to pay off now.',
    instructions: `Collect every deliberate simplification marked \`// ponytail:\` into a structured backlog.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally narrow to a directory or change name. If omitted, scan the whole codebase.

**Steps**

1. **Scan for markers**

   Search the codebase for ponytail markers:
   \`\`\`bash
   rtk grep -rn "ponytail:" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" --include="*.rs" .
   \`\`\`
   Include other source extensions present in the repo.

2. **Parse each marker**

   For each match, extract:
   - **File**: path relative to repo root
   - **Line**: line number
   - **Reason**: the reason after \`ponytail:\` (e.g., \`ponytail: duplicate of .card shadow, simplify later\`)
   - **Cancellation condition**: an optional \`when <condition>\` suffix the author left for when the simplification can be applied

3. **Group by status**

   - **Deferred**: markers whose cancellation condition has not been met
   - **Fixable now**: markers whose condition is met, or that duplicate existing code, or whose reason names a simpler alternative
   - **Orphaned**: markers pointing at files or lines that no longer exist (dead debt)

4. **Estimate savings**

   For each item, estimate the lines that could be removed or simplified. Sum per status group.

5. **Produce the ledger**

   \`\`\`markdown
   ## Debt Ledger: <scope>

   ### Deferred (N)
   <file>:<line> — <reason>. Unblock when: <condition>.

   ### Fixable now (M)
   <file>:<line> — <reason>. Can simplify to: <alternative>.

   ### Orphaned (K)
   <file>:<line> — marker points at removed code.

   ### Summary
   - Items: N deferred, M fixable now, K orphaned
   - Estimated lines removable: ~L
   \`\`\`

6. **Recommend**

   - Propose paying off the "fixable now" items as a follow-up change
   - Suggest deleting orphaned markers
   - Re-run \`rtk gain\` after any cleanup to report token savings

**Heuristics**

- A marker is deferred unless its condition is met or it duplicates existing code
- Prefer deleting orphaned markers over rewriting dead references
- Never silently drop a marker; list it as orphaned so the decision is explicit`,
    license: 'MIT',
    compatibility: 'Requires spectrix CLI and RTK.',
    metadata: { author: 'spectrix', version: '1.0' },
  };
}

export function getOpsxDebtLedgerCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Debt Ledger',
    description: 'Collect ponytail markers into a structured debt backlog',
    category: 'Quality',
    tags: ['quality', 'ponytail', 'debt', 'ledger', 'backlog'],
    content: `Collect every deliberate simplification marked \`// ponytail:\` into a structured backlog.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally narrow to a directory or change name after \`/opsx:debt-ledger\` (e.g., \`/opsx:debt-ledger src/core\`). If omitted, scan the whole codebase.

**Steps**

1. **Scan for markers**

   Search the codebase for ponytail markers:
   \`\`\`bash
   rtk grep -rn "ponytail:" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" --include="*.rs" .
   \`\`\`
   Include other source extensions present in the repo.

2. **Parse each marker**

   For each match, extract:
   - **File**: path relative to repo root
   - **Line**: line number
   - **Reason**: the reason after \`ponytail:\` (e.g., \`ponytail: duplicate of .card shadow, simplify later\`)
   - **Cancellation condition**: an optional \`when <condition>\` suffix the author left for when the simplification can be applied

3. **Group by status**

   - **Deferred**: markers whose cancellation condition has not been met
   - **Fixable now**: markers whose condition is met, or that duplicate existing code, or whose reason names a simpler alternative
   - **Orphaned**: markers pointing at files or lines that no longer exist (dead debt)

4. **Estimate savings**

   For each item, estimate the lines that could be removed or simplified. Sum per status group.

5. **Produce the ledger**

   \`\`\`markdown
   ## Debt Ledger: <scope>

   ### Deferred (N)
   <file>:<line> — <reason>. Unblock when: <condition>.

   ### Fixable now (M)
   <file>:<line> — <reason>. Can simplify to: <alternative>.

   ### Orphaned (K)
   <file>:<line> — marker points at removed code.

   ### Summary
   - Items: N deferred, M fixable now, K orphaned
   - Estimated lines removable: ~L
   \`\`\`

6. **Recommend**

   - Propose paying off the "fixable now" items as a follow-up change
   - Suggest deleting orphaned markers
   - Re-run \`rtk gain\` after any cleanup to report token savings

**Heuristics**

- A marker is deferred unless its condition is met or it duplicates existing code
- Prefer deleting orphaned markers over rewriting dead references
- Never silently drop a marker; list it as orphaned so the decision is explicit`,
  };
}
