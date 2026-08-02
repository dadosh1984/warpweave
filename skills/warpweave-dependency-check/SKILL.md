---
name: warpweave-dependency-check
description: Check a proposed new dependency against the Ponytail ladder before adding it. Use when the user wants to add a dependency or verify that an existing one is justified.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI.
metadata:
  author: warpweave
  version: "1.0"
---

Intercept any proposed new dependency and walk the Ponytail ladder before approving it.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`, `drift-check`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

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

   ```markdown
   ## Dependency Check: <package>

   Need: <statement of the need>
   Ladder: <rung reached, with evidence>
   Verdict: <REJECT / ALTERNATIVE / APPROVE>

   <For ALTERNATIVE>
   Use instead: <existing code / stdlib / package with reference>
   Saved: <size, count, maintenance>

   <For APPROVE>
   Justification: <why no lower rung holds>
   ```

5. **Recommend**

   - On REJECT: propose deleting the request or the already-added dependency
   - On ALTERNATIVE: apply the replacement and drop the proposed dependency
   - On APPROVE: pin the version and document the ladder rung in the change

**Heuristics**

- A dependency without a named need cannot be approved
- Prefer "existing dependency" over a new one when the gap is small
- Never approve a dependency to satisfy a YAGNI need
