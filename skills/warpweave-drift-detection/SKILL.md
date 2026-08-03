---
name: warpweave-drift-detection
description: Check whether the implemented code has drifted from approved specifications. Use after each task during apply or manually via /ww:drift-check or warpweave drift-check to catch mismatches early when they are cheap to fix.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI.
metadata:
  author: warpweave
  version: "1.0"
---

Check whether the implemented code has drifted from approved specifications.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`, `drift-check`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

**Input**: Optionally specify a change name. If omitted, infer from context or list available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise infer from context or list available changes with `warpweave list --json`.

2. **Run the native drift check**

   ```bash
   warpweave drift-check --change "<name>" --json
   ```

   This mechanically scans each spec scenario against the codebase and emits findings with file/line references. Use it as the base signal, then refine with semantic judgment below.

3. **Read spec files**

   From the drift-check output, note which scenarios need closer inspection. Read the delta spec files for the change (`warpweave status --change "<name>" --json` → `artifactPaths.specs.existingOutputPaths`) and the main specs at `warpweave/specs/<capability>/spec.md`.

4. **Scan the codebase**

   For each spec scenario in the spec files, check whether the described behavior exists in the codebase:

   - Read the spec's `#### Scenario:` blocks
   - For each scenario, extract the `**WHEN**` and `**THEN**` conditions
   - Search the codebase for implementations matching those conditions
   - Use `grep`, `rg`, or read relevant source files

5. **Report findings**

   For each spec scenario, report one of:
   - **Compliant** — the behavior exists in the code as specified
   - **Missing** — the behavior described in the spec is not found in the code
   - **Drifted** — the behavior exists but differs from the spec

   For Missing and Drifted findings, show:
   - The spec file and scenario name
   - What the spec expects
   - What the code actually does (or that it is absent)
   - A suggested fix direction

6. **Offer resolution**

   A **Missing** finding is a hard block: `warpweave drift-check` exits non-zero on missing scenarios, so the apply flow must not continue until the missing behavior is implemented (or the user explicitly runs `--no-fail-on-missing` for a report-only pass). **Drifted** findings stay advisory.

   Present the user with options:
   - **Fix code** — align the implementation with the spec
   - **Update spec** — update the spec to match the actual implementation
   - **Continue** — acknowledge the drift and proceed without action (only for Drifted/advisory findings)

**Output**

```markdown
## Drift Check: <change-name>

### Compliant (<count>)
| Scenario | Status |
|----------|--------|
| <scenario-name> | ✓ Compliant |

### Issues (<count>)
| Scenario | Status | File | Details |
|----------|--------|------|---------|
| <scenario-name> | Missing/Drifted | <spec-file> | <what-spec-expects-vs-what-code-does> |

**Resolution:**
1. Fix code to match spec
2. Update spec to match code
3. Continue without action
```

**Guardrails**
- Never modify spec files or code without user confirmation
- If no spec files exist for the change, report "No specs to check against" and exit
- If the change has `skip_specs: true`, skip drift check entirely
- Keep the report concise — group compliant scenarios, detail only issues
