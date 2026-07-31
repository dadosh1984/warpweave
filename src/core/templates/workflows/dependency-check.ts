/**
 * Skill Template Workflow Modules
 *
 * Dependency Check: intercepts proposed new dependencies and walks the
 * Ponytail ladder before approving them.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getDependencyCheckSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-dependency-check',
    description: 'Check a proposed new dependency against the Ponytail ladder before adding it. Use when the user wants to add a dependency or verify that an existing one is justified.',
    instructions: `Intercept any proposed new dependency and walk the Ponytail ladder before approving it.

${STORE_SELECTION_GUIDANCE}

**Input**: A proposed dependency (package name, crate, module, or service). If omitted, check the last dependency added or asked about in context.

**Steps**

1. **Identify the need**

   State the concrete need the dependency is meant to satisfy. If the need is vague, ask for clarification before walking the ladder.

2. **Climb the ladder**

   Stop at the first rung that holds:
   1. **YAGNI** — does the codebase need this feature at all? If not, reject.
   2. **Reuse** — is this already implemented in the codebase? Point at the existing code.
   3. **Stdlib** — does the standard library already provide it?
   4. **Native** — does the platform/runtime feature already exist?
   5. **Existing dependency** — does a package already installed cover it? (Check the manifest.)
   6. **One-liner** — could the need be met in a single expression instead?
   7. **Justified** — only then approve the new dependency.

3. **Compare alternatives**

   When a lower rung holds, propose the alternative and estimate the cost saved:
   - Bundle/install size
   - Dependency count
   - Maintenance surface (version bumps, CVEs, API churn)

4. **Produce the verdict**

   \`\`\`markdown
   ## Dependency Check: <package>

   Need: <statement of the need>
   Ladder: <rung reached, with evidence>
   Verdict: <REJECT / ALTERNATIVE / APPROVE>

   <For ALTERNATIVE>
   Use instead: <existing code / stdlib / package with reference>
   Saved: <size, count, maintenance>

   <For APPROVE>
   Justification: <why no lower rung holds>
   \`\`\`

5. **Recommend**

   - On REJECT: propose deleting the request or the already-added dependency
   - On ALTERNATIVE: apply the replacement and drop the proposed dependency
   - On APPROVE: pin the version and document the ladder rung in the change

**Heuristics**

- A dependency without a named need cannot be approved
- Prefer "existing dependency" over a new one when the gap is small
- Never approve a dependency to satisfy a YAGNI need`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxDependencyCheckCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Dependency Check',
    description: 'Check a proposed dependency against the Ponytail ladder',
    category: 'Quality',
    tags: ['quality', 'ponytail', 'ladder', 'dependency', 'deps'],
    content: `Intercept any proposed new dependency and walk the Ponytail ladder before approving it.

${STORE_SELECTION_GUIDANCE}

**Input**: A proposed dependency after \`/opsx:dependency-check\` (e.g., \`/opsx:dependency-check lodash\`). If omitted, check the last dependency added or asked about in context.

**Steps**

1. **Identify the need**

   State the concrete need the dependency is meant to satisfy. If the need is vague, ask for clarification before walking the ladder.

2. **Climb the ladder**

   Stop at the first rung that holds:
   1. **YAGNI** — does the codebase need this feature at all? If not, reject.
   2. **Reuse** — is this already implemented in the codebase? Point at the existing code.
   3. **Stdlib** — does the standard library already provide it?
   4. **Native** — does the platform/runtime feature already exist?
   5. **Existing dependency** — does a package already installed cover it? (Check the manifest.)
   6. **One-liner** — could the need be met in a single expression instead?
   7. **Justified** — only then approve the new dependency.

3. **Compare alternatives**

   When a lower rung holds, propose the alternative and estimate the cost saved:
   - Bundle/install size
   - Dependency count
   - Maintenance surface (version bumps, CVEs, API churn)

4. **Produce the verdict**

   \`\`\`markdown
   ## Dependency Check: <package>

   Need: <statement of the need>
   Ladder: <rung reached, with evidence>
   Verdict: <REJECT / ALTERNATIVE / APPROVE>

   <For ALTERNATIVE>
   Use instead: <existing code / stdlib / package with reference>
   Saved: <size, count, maintenance>

   <For APPROVE>
   Justification: <why no lower rung holds>
   \`\`\`

5. **Recommend**

   - On REJECT: propose deleting the request or the already-added dependency
   - On ALTERNATIVE: apply the replacement and drop the proposed dependency
   - On APPROVE: pin the version and document the ladder rung in the change

**Heuristics**

- A dependency without a named need cannot be approved
- Prefer "existing dependency" over a new one when the gap is small
- Never approve a dependency to satisfy a YAGNI need`,
  };
}
