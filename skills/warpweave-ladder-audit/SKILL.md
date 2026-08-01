---
name: warpweave-ladder-audit
description: Audit the current change's diff against the Ponytail ladder. Use when the user wants to find deletable code, over-engineering, or unjustified dependencies before committing or archiving.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI and RTK.
metadata:
  author: warpweave
  version: "1.0"
---

Audit the current change's diff against the Ponytail ladder.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

**Input**: Optionally specify a change name or path. If omitted, audit the current uncommitted diff.

**Steps**

1. **Establish the diff**

   If a change name is provided, resolve it with:
   ```bash
   warpweave status --change "<name>" --json
   ```
   Otherwise diff the working tree:
   ```bash
   rtk git diff HEAD
   ```
   For a change already committed to a branch:
   ```bash
   rtk git diff origin/main...HEAD
   ```

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

   ```markdown
   ## Ladder Audit: <change-name>

   ### Findings

   <file>:<line>
     ⚠ <SEVERITY>: <reason>. Can be deleted or simplified.

   ### Summary
   - X critical, Y high, Z medium, W low
   - Lines that can be removed: ~N
   - Dependencies that can be dropped: ~M
   ```

5. **Recommend**

   - Fix CRITICAL and HIGH findings before commit
   - Re-run `rtk gain` after deletions to report token savings

**Heuristics**

- Prefer SUGGESTION over CRITICAL when uncertain
- Never flag a line that a spec scenario depends on
- Every finding must name a concrete file:line and a concrete simplification
