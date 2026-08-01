/**
 * Skill Template Workflow Modules
 *
 * Guardrails: enforces the four pipeline gates before every commit.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getGuardrailsSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-guardrails',
    description: 'Check the four pipeline gates (SPEC, TDD, LADDER, RTK) before committing. Use when the user wants to verify a change is safe to commit or merge.',
    instructions: `Check the four pipeline gates before a commit.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, run \`warpweave list --json\` and ask the user

   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`

2. **Gate 1 — SPEC**

   Check that a spec exists and is approved:
   - \`warpweave/changes/<name>/specs/\` contains at least one \`*.md\` spec
   - The change's tasks reference spec scenarios
   - The human approved the specs (not just auto-generated)

   Report: ✓ spec exists, approved / ✗ no spec or unapproved

3. **Gate 2 — TDD**

   Check the test-first discipline:
   - Each task in \`tasks.md\` has a "Test first" entry
   - Tests exist in the codebase covering the change's scenarios
   - Run the tests and confirm they pass:
   \`\`\`bash
   rtk jest   # or rtk vitest, rtk pytest, rtk cargo test
   \`\`\`

   Report: ✓ N/N tasks have tests, RED→GREEN / ✗ tests missing or failing

4. **Gate 3 — LADDER**

   Check the Ponytail ladder:
   - Each task in \`tasks.md\` documents a "Ladder rung"
   - The design's Ladder Trace is filled in
   - No unjustified new dependencies (a new dependency without a ladder rung 5 entry)
   - Scan for obvious over-engineering in the diff:
   \`\`\`bash
   rtk git diff origin/main...HEAD
   \`\`\`

   Report: ✓ all rungs documented, 0 unjustified deps / ✗ missing rung or unjustified dependency

5. **Gate 4 — RTK**

   Check compressed feedback:
   - All shell commands used were RTK-wrapped
   - Run \`rtk gain\` to report token savings for this change

   Report: ✓ all commands wrapped, gain: -X% / ✗ raw commands used

6. **Produce the gate report**

   \`\`\`markdown
   ## Guardrails: <change-name>

   Gate 1: SPEC   ✓/✗ spec exists, approved
   Gate 2: TDD    ✓/✗ N/N tests written first, RED→GREEN
   Gate 3: LADDER ✓/✗ all rungs documented, 0 unjustified deps
   Gate 4: RTK    ✓/✗ all commands wrapped, gain: -X%

   STATUS: 4/4 gates GREEN — commit allowed
   \`\`\`

   If any gate is RED, list the fixes required to turn it green before the commit is allowed.

**Heuristics**

- A gate is GREEN only when its check actually passed, not when it was skipped
- If a task lacks a "Test first" entry, Gate 2 is RED regardless of existing tests
- Never mark Gate 1 GREEN on a spec the human has not reviewed`,
    license: 'MIT',
    compatibility: 'Requires warpweave CLI and RTK.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}

export function getOpsxGuardrailsCommandTemplate(): CommandTemplate {
  return {
    name: 'WW: Guardrails',
    description: 'Check the four pipeline gates before committing',
    category: 'Quality',
    tags: ['quality', 'gates', 'pipeline', 'pre-commit'],
    content: `Check the four pipeline gates before a commit.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a change name after \`/ww:guardrails\` (e.g., \`/ww:guardrails add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, run \`warpweave list --json\` and ask the user

   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`

2. **Gate 1 — SPEC**

   Check that a spec exists and is approved:
   - \`warpweave/changes/<name>/specs/\` contains at least one \`*.md\` spec
   - The change's tasks reference spec scenarios
   - The human approved the specs (not just auto-generated)

   Report: ✓ spec exists, approved / ✗ no spec or unapproved

3. **Gate 2 — TDD**

   Check the test-first discipline:
   - Each task in \`tasks.md\` has a "Test first" entry
   - Tests exist in the codebase covering the change's scenarios
   - Run the tests and confirm they pass:
   \`\`\`bash
   rtk jest   # or rtk vitest, rtk pytest, rtk cargo test
   \`\`\`

   Report: ✓ N/N tasks have tests, RED→GREEN / ✗ tests missing or failing

4. **Gate 3 — LADDER**

   Check the Ponytail ladder:
   - Each task in \`tasks.md\` documents a "Ladder rung"
   - The design's Ladder Trace is filled in
   - No unjustified new dependencies (a new dependency without a ladder rung 5 entry)
   - Scan for obvious over-engineering in the diff:
   \`\`\`bash
   rtk git diff origin/main...HEAD
   \`\`\`

   Report: ✓ all rungs documented, 0 unjustified deps / ✗ missing rung or unjustified dependency

5. **Gate 4 — RTK**

   Check compressed feedback:
   - All shell commands used were RTK-wrapped
   - Run \`rtk gain\` to report token savings for this change

   Report: ✓ all commands wrapped, gain: -X% / ✗ raw commands used

6. **Produce the gate report**

   \`\`\`markdown
   ## Guardrails: <change-name>

   Gate 1: SPEC   ✓/✗ spec exists, approved
   Gate 2: TDD    ✓/✗ N/N tests written first, RED→GREEN
   Gate 3: LADDER ✓/✗ all rungs documented, 0 unjustified deps
   Gate 4: RTK    ✓/✗ all commands wrapped, gain: -X%

   STATUS: 4/4 gates GREEN — commit allowed
   \`\`\`

   If any gate is RED, list the fixes required to turn it green before the commit is allowed.

**Heuristics**

- A gate is GREEN only when its check actually passed, not when it was skipped
- If a task lacks a "Test first" entry, Gate 2 is RED regardless of existing tests
- Never mark Gate 1 GREEN on a spec the human has not reviewed`,
  };
}
