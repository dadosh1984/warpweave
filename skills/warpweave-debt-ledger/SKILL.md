---
name: warpweave-debt-ledger
description: Collect `// ponytail:` markers from the codebase into a structured debt backlog. Use when the user wants to review deferred simplifications or decide which technical debt to pay off now.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI and RTK.
metadata:
  author: warpweave
  version: "1.0"
---

Collect every deliberate simplification marked `// ponytail:` into a structured backlog.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`, `drift-check`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

**Input**: Optionally narrow to a directory or change name. If omitted, scan the whole codebase.

**Steps**

1. **Scan for markers**

   Search the codebase for ponytail markers:
   ```bash
   rtk grep -rn "ponytail:" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" --include="*.rs" .
   ```
   Include other source extensions present in the repo.

2. **Parse each marker**

   For each match, extract:
   - **File**: path relative to repo root
   - **Line**: line number
   - **Reason**: the reason after `ponytail:` (e.g., `ponytail: duplicate of .card shadow, simplify later`)
   - **Cancellation condition**: an optional `when <condition>` suffix the author left for when the simplification can be applied

3. **Group by status**

   - **Deferred**: markers whose cancellation condition has not been met
   - **Fixable now**: markers whose condition is met, or that duplicate existing code, or whose reason names a simpler alternative
   - **Orphaned**: markers pointing at files or lines that no longer exist (dead debt)

4. **Estimate savings**

   For each item, estimate the lines that could be removed or simplified. Sum per status group.

5. **Produce the ledger**

   ```markdown
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
   ```

6. **Recommend**

   - Propose paying off the "fixable now" items as a follow-up change
   - Suggest deleting orphaned markers
   - Re-run `rtk gain` after any cleanup to report token savings

**Heuristics**

- A marker is deferred unless its condition is met or it duplicates existing code
- Prefer deleting orphaned markers over rewriting dead references
- Never silently drop a marker; list it as orphaned so the decision is explicit
