---
name: warpweave-security-scan
description: Run a native security scan over the code changed by a task to find hardcoded secrets, injection surfaces, or insecure patterns. Use after each task during apply or manually via /ww:security-scan to catch issues before committing.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI and RTK.
metadata:
  author: warpweave
  version: "1.0"
---

Run a native security scan over the code changed by a task. No semgrep, Docker, or external security tools are required — the review is agent judgment over the repository diff.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`, `drift-check`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Establish the review scope**

   Get the change's scope:
   ```bash
   warpweave status --change "<name>" --json
   ```
   Parse `changeRoot` from the JSON to know which files the change owns.

   Identify the code changed by the current task using the repository diff:
   ```bash
   rtk git diff origin/main...HEAD
   ```
   If the diff is empty or the task's changes are uncommitted, use `rtk git diff HEAD` and, when present, the task's own diff. Restrict the review to the files and lines actually changed — never scan the whole codebase.

2. **Check for security-relevant patterns**

   For each changed file, read the added lines and check for the standard vulnerability classes:

   - **Hardcoded secrets** — API keys, tokens, passwords, credentials, private keys embedded in source or config
   - **Injection** — SQL, shell, template, or path-traversal sinks fed by untrusted input without validation
   - **Unsafe evaluation** — `eval`, dynamic `Function`, `exec`, unvalidated deserialization
   - **Missing validation** — untrusted input reaching a sensitive operation (network, filesystem, auth) without a check

   Only flag lines the task actually touched. Do not report pre-existing issues outside the diff.

3. **Classify findings by severity**

   - **ERROR** — fix before commit: confident, exploitable issue (e.g. a hardcoded credential or an injectable sink)
   - **WARNING** — review and fix if applicable: plausible issue, or a sensitive pattern without visible validation
   - **INFO** — consider addressing: defensible but worth noting

   For each finding show: file, line, the pattern, the offending code snippet, and a suggested fix.

4. **Present the report**

   ```markdown
   ## Security Scan: <change-name>

   <summary of findings by severity>

   ### ERROR (<count>)
   | File | Line | Pattern | Finding | Suggested fix |
   |------|------|---------|---------|---------------|
   | <file> | <line> | <pattern> | <detail> | <fix> |

   ### WARNING (<count>)
   ...

   ### INFO (<count>)
   ...

   **Recommendation:** <next steps>
   ```

5. **Recommend next steps**

   - If ERROR findings exist: report "Fix the ERROR-level findings before committing. Run `/warpweave-security-scan` again to verify."
   - If only warnings: report "Review the WARNING-level findings. Most are worth fixing."
   - If clean: report "No security issues found in the changed code."

**Guardrails**
- Never modify any files — this is a read-only scan
- Restrict the review to the diff; do not scan the whole codebase
- Only flag lines the task touched; leave pre-existing issues out of the report
- When uncertain, prefer INFO over WARNING and WARNING over ERROR — never raise a false-critical alarm
- Do not flag a line that a spec scenario explicitly requires
- If the change has `skip_specs: true`, still run the scan — security is independent of spec sync
- If the report is large, summarize by severity and offer the full detail
