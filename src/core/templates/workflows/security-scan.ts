/**
 * Skill Template Workflow Modules
 *
 * Security Scan: runs semgrep against the codebase to find vulnerabilities.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getSecurityScanSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-security-scan',
    description: 'Run a security scan against the codebase using semgrep. Use when the user wants to find vulnerabilities, hardcoded secrets, or insecure patterns before committing or deploying.',
    instructions: `Run a security scan against the codebase using semgrep.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a path or file pattern to scan. If omitted, scan the whole project.

**Steps**

1. **Check semgrep is installed**

   \`\`\`bash
   semgrep --version
   \`\`\`

   If not found, install it:
   - macOS/Linux: \`pip install semgrep\` or \`brew install semgrep\`
   - Windows: \`pip install semgrep\`
   - Docker: \`docker run --rm -v "\${PWD}:/src" returntocorp/semgrep semgrep ...\`

   If the user prefers not to install, offer to run via Docker.

2. **Run the scan**

   \`\`\`bash
   semgrep --config=auto --output=semgrep-report.txt --metrics=off "<path>"
   \`\`\`

   This runs semgrep's auto mode which downloads and applies the community ruleset (SAST, secrets, supply chain) tuned to the project's language.

   If the user specified a change name, scope the scan to the change's diff:
   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`
   Then scan only the changed files:
   \`\`\`bash
   semgrep --config=auto --output=semgrep-report.txt --metrics=off --include="<changeRoot>/**"
   \`\`\`

3. **Read and present results**

   \`\`\`bash
   cat semgrep-report.txt
   \`\`\`

   Group findings by severity:
   - **ERROR** — fix before commit
   - **WARNING** — review and fix if applicable
   - **INFO** — consider addressing

   For each finding, show:
   - File and line
   - Rule ID and message
   - The offending code snippet
   - A suggested fix

4. **Recommend next steps**

   - If critical findings exist: "Fix the ERROR-level findings before committing. Run \`/ww:security-scan\` again to verify."
   - If only warnings: "Review the WARNING-level findings. Most are worth fixing."
   - If clean: "No vulnerabilities found. The codebase is clean."

**Output**

\`\`\`markdown
## Security Scan: <path>

<summary of findings by severity>

### ERROR (<count>)
| File | Line | Rule | Message |
|------|------|------|---------|
| <file> | <line> | <rule-id> | <message> |

### WARNING (<count>)
...

### INFO (<count>)
...

**Recommendation:** <next steps>
\`\`\`

**Guardrails**
- Never run semgrep with \`--config=auto\` on untrusted input from the user (the path argument is a filesystem path, not a config source — safe)
- If semgrep is not installed and the user declines Docker, report the limitation and suggest manual installation
- Do not modify any files — this is a read-only scan
- If the report is large, summarize by severity and offer the full file`,
    license: 'MIT',
    compatibility: 'Requires semgrep (pip install semgrep) or Docker.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}

export function getOpsxSecurityScanCommandTemplate(): CommandTemplate {
  return {
    name: 'WW: Security Scan',
    description: 'Run a security scan against the codebase using semgrep',
    category: 'Workflow',
    tags: ['workflow', 'security', 'quality'],
    content: `Run a security scan against the codebase using semgrep.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a path or file pattern to scan. If omitted, scan the whole project.

**Steps**

1. **Check semgrep is installed**

   \`\`\`bash
   semgrep --version
   \`\`\`

   If not found, install it:
   - macOS/Linux: \`pip install semgrep\` or \`brew install semgrep\`
   - Windows: \`pip install semgrep\`
   - Docker: \`docker run --rm -v "\${PWD}:/src" returntocorp/semgrep semgrep ...\`

   If the user prefers not to install, offer to run via Docker.

2. **Run the scan**

   \`\`\`bash
   semgrep --config=auto --output=semgrep-report.txt --metrics=off "<path>"
   \`\`\`

   This runs semgrep's auto mode which downloads and applies the community ruleset (SAST, secrets, supply chain) tuned to the project's language.

   If the user specified a change name, scope the scan to the change's diff:
   \`\`\`bash
   warpweave status --change "<name>" --json
   \`\`\`
   Then scan only the changed files:
   \`\`\`bash
   semgrep --config=auto --output=semgrep-report.txt --metrics=off --include="<changeRoot>/**"
   \`\`\`

3. **Read and present results**

   \`\`\`bash
   cat semgrep-report.txt
   \`\`\`

   Group findings by severity:
   - **ERROR** — fix before commit
   - **WARNING** — review and fix if applicable
   - **INFO** — consider addressing

   For each finding, show:
   - File and line
   - Rule ID and message
   - The offending code snippet
   - A suggested fix

4. **Recommend next steps**

   - If critical findings exist: "Fix the ERROR-level findings before committing. Run \`/ww:security-scan\` again to verify."
   - If only warnings: "Review the WARNING-level findings. Most are worth fixing."
   - If clean: "No vulnerabilities found. The codebase is clean."

**Output**

\`\`\`markdown
## Security Scan: <path>

<summary of findings by severity>

### ERROR (<count>)
| File | Line | Rule | Message |
|------|------|------|---------|
| <file> | <line> | <rule-id> | <message> |

### WARNING (<count>)
...

### INFO (<count>)
...

**Recommendation:** <next steps>
\`\`\`

**Guardrails**
- Never run semgrep with \`--config=auto\` on untrusted input from the user (the path argument is a filesystem path, not a config source — safe)
- If semgrep is not installed and the user declines Docker, report the limitation and suggest manual installation
- Do not modify any files — this is a read-only scan
- If the report is large, summarize by severity and offer the full file`
  };
}
