/**
 * Skill Template Workflow Modules
 *
 * Init Unified: one-shot unified environment setup.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getInitUnifiedSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-init-unified',
    description: 'Set up the full unified environment in one flow. Use when the user wants to bootstrap a project or machine with Spectrix, RTK, Superpowers, and Ponytail in a single pass.',
    instructions: `Perform the one-shot unified setup for a fresh project.

${STORE_SELECTION_GUIDANCE}

**Input**: A target directory (defaults to the current project root). If a project is already initialized, confirm before re-running.

**Steps**

1. **Install the CLI**

   Run the fork's init in the target directory:
   \`\`\`bash
   rtk spectrix init
   \`\`\`
   Keep the default \`spec-driven\` schema.

2. **Copy unified config**

   Verify that \`.unified/config/unified.toml\` and \`.unified/config/pipeline.yaml\` were created, plus \`AGENTS.md\` and \`.env.example\` at the project root. If any are missing, copy them from the fork's \`config/\` and root.

3. **Select a profile**

   Ask the user to pick a unified profile:
   - **minimal** — solo developer
   - **standard** — small team (default)
   - **enterprise** — large team with strict gates

   Apply the choice via the profile mechanism (e.g., \`UNIFIED_PROFILE=<name>\` in \`.env\`).

4. **Install RTK**

   Install RTK and configure it for the agent:
   \`\`\`bash
   rtk install
   rtk init -g --opencode
   \`\`\`

5. **Add Superpowers and Ponytail**

   Add the agent plugins/skills to the tool config (\`opencode.json\` or the equivalent for the active tool):
   - Superpowers: \`superpowers@git+https://github.com/obra/superpowers.git\`
   - Ponytail: \`@dietrichgebert/ponytail\`

6. **Verify**

   Run a verification pass:
   \`\`\`bash
   rtk spectrix doctor
   \`\`\`
   Confirm the unified rules are active (read the generated \`AGENTS.md\`).

7. **Report**

   \`\`\`markdown
   ## Init Unified: <target>

   CLI: <ok>
   Config: <ok / missing: ...>
   Profile: <minimal / standard / enterprise>
   RTK: <ok>
   Plugins: <Superpowers ok / Ponytail ok>
   Verify: <PASS / FAIL — <step>>
   \`\`\`

**Heuristics**

- Never overwrite an existing \`AGENTS.md\` without asking
- On verification failure, report the failing step and the fix, not a generic error
- Keep the default profile standard unless the user chooses otherwise`,
    license: 'MIT',
    compatibility: 'Requires spectrix CLI and RTK.',
    metadata: { author: 'spectrix', version: '1.0' },
  };
}

export function getOpsxInitUnifiedCommandTemplate(): CommandTemplate {
  return {
    name: 'OTRIX: Init Unified',
    description: 'Set up the full unified environment in one flow',
    category: 'Setup',
    tags: ['setup', 'init', 'install', 'rtk', 'superpowers', 'ponytail'],
    content: `Perform the one-shot unified setup for a fresh project.

${STORE_SELECTION_GUIDANCE}

**Input**: A target directory after \`/otrix:init-unified\` (defaults to the current project root). If a project is already initialized, confirm before re-running.

**Steps**

1. **Install the CLI**

   Run the fork's init in the target directory:
   \`\`\`bash
   rtk spectrix init
   \`\`\`
   Keep the default \`spec-driven\` schema.

2. **Copy unified config**

   Verify that \`.unified/config/unified.toml\` and \`.unified/config/pipeline.yaml\` were created, plus \`AGENTS.md\` and \`.env.example\` at the project root. If any are missing, copy them from the fork's \`config/\` and root.

3. **Select a profile**

   Ask the user to pick a unified profile:
   - **minimal** — solo developer
   - **standard** — small team (default)
   - **enterprise** — large team with strict gates

   Apply the choice via the profile mechanism (e.g., \`UNIFIED_PROFILE=<name>\` in \`.env\`).

4. **Install RTK**

   Install RTK and configure it for the agent:
   \`\`\`bash
   rtk install
   rtk init -g --opencode
   \`\`\`

5. **Add Superpowers and Ponytail**

   Add the agent plugins/skills to the tool config (\`opencode.json\` or the equivalent for the active tool):
   - Superpowers: \`superpowers@git+https://github.com/obra/superpowers.git\`
   - Ponytail: \`@dietrichgebert/ponytail\`

6. **Verify**

   Run a verification pass:
   \`\`\`bash
   rtk spectrix doctor
   \`\`\`
   Confirm the unified rules are active (read the generated \`AGENTS.md\`).

7. **Report**

   \`\`\`markdown
   ## Init Unified: <target>

   CLI: <ok>
   Config: <ok / missing: ...>
   Profile: <minimal / standard / enterprise>
   RTK: <ok>
   Plugins: <Superpowers ok / Ponytail ok>
   Verify: <PASS / FAIL — <step>>
   \`\`\`

**Heuristics**

- Never overwrite an existing \`AGENTS.md\` without asking
- On verification failure, report the failing step and the fix, not a generic error
- Keep the default profile standard unless the user chooses otherwise`,
  };
}
