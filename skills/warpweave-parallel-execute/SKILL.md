---
name: warpweave-parallel-execute
description: Run independent tasks from tasks.md in parallel using subagents. Use when the user wants to speed up implementation of a change with independent work items.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI and RTK.
metadata:
  author: warpweave
  version: "1.0"
---

Break tasks.md into dependency layers and execute independent groups in parallel via subagents.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

**Input**: A change name. If omitted, infer from conversation context; if ambiguous, prompt for available changes.

**Steps**

1. **Select the change**

   ```bash
   warpweave status --change "<name>" --json
   ```

2. **Read and parse tasks.md**

   Collect every task with its:
   - Spec scenario
   - Ladder rung
   - Test-first description
   - Verification command

3. **Build the dependency graph**

   Add an edge from task A to task B when B:
   - Touches a file that A creates or modifies
   - Imports a symbol A introduces
   - Runs a verification that depends on A's output
   - Is otherwise implied by A's scenario

4. **Layering**

   - **Layer 0**: tasks with no dependencies (or only on already-finished work)
   - **Layer N**: tasks whose dependencies are all in layers < N
   - Tasks that would conflict on the same file in the same layer: serialize them (move to the next layer or queue within the layer)

5. **Execute layer by layer**

   For each layer, launch one subagent per independent group in parallel:
   - Give each subagent the task, its spec scenario, ladder rung, and test-first instruction
   - Instruct the subagent to follow the TDD cycle and RTK-wrap all shell commands
   - Do not start layer N+1 until every group in layer N reports done

   On any group failure, stop that group, report, and continue the remaining groups in the layer.

6. **Verify**

   After all layers complete, run the full suite:
   ```bash
   rtk jest   # or rtk vitest, rtk pytest, rtk cargo test
   ```
   Then run `rtk gain` to report token savings.

7. **Report**

   ```markdown
   ## Parallel Execute: <change-name>

   Layers: <L> (parallel groups: <G>)
   Outcomes: <done / failed per group>
   Full suite: <PASS / FAIL>
   RTK savings: <Z%>
   ```

**Heuristics**

- A task that shares a file with another task in the same layer must not run parallel to it
- Prefer fewer, larger groups over many tiny ones to limit context-switch overhead
- Never start a layer before the previous one fully completes
