# Cheat Sheet: Which Command When

A situation-first map of Warpweave commands. Don't know which button to press? Find your situation.

## Start here (core profile — installed by default)

| When you want to… | Use this | What it does |
|---|---|---|
| Think through a fuzzy idea before committing | `/ww:explore` | No-stakes thinking partner. Reads your codebase, compares options, sharpens the idea. No change created. |
| Create a plan with quality analysis (default) | `/ww:propose` | Creates the change + all artifacts (proposal, specs, design, tasks) in one step. Includes the Ladder Decision table in the proposal. |
| Implement the plan | `/ww:apply` | Reads tasks.md and implements each task. |
| Revise the plan mid-change | `/ww:update` | Edits existing artifacts and keeps them coherent. Never edits code. |
| Merge delta specs into main specs | `/ww:sync` | Applies the change's spec deltas to the main `warpweave/specs/`. |
| Archive a completed change | `/ww:archive` | Moves the change to archive, syncs specs, reports token savings. |

## Expanded workflow (opt-in)

| When you want to… | Use this | What it does |
|---|---|---|
| Create a plan fast, skip the quality analysis | `/ww:ff` | Same as propose but without the Ladder Decision table. Speed over analysis. |
| Start a change scaffold, then build step by step | `/ww:new` | Creates the change folder. Then use `/ww:continue` to create one artifact at a time. |
| Create the next artifact | `/ww:continue` | Picks the next ready artifact and creates it. One per invocation. |
| Verify implementation matches the plan | `/ww:verify` | Checks code against specs, tasks, and design. |
| Archive multiple changes at once | `/ww:bulk-archive` | Batch archive with conflict detection and per-delta spec sync. |
| Walk through the whole workflow as a tutorial | `/ww:onboard` | Guided tour with narration and real work in your codebase. |

## Quality & analysis skills

| When you want to… | Use this | What it does |
|---|---|---|
| Check the four pipeline gates before committing | `/ww:guardrails` | Checks SPEC, TDD, LADDER, RTK gates. |
| Audit the current diff against the Ponytail ladder | `/ww:ladder-audit` | Finds deletable code, over-engineering, unjustified dependencies. |
| Review deferred `// ponytail:` simplifications | `/ww:debt-ledger` | Collects all ponytail markers into a structured debt backlog. |
| Set a token budget and track consumption | `/ww:token-budget` | Constrains cost across pipeline phases. |
| Compare plan vs actual for a change | `/ww:benchmark` | Measures estimation accuracy, code size, ladder discipline. |
| Analyze trends across archived changes | `/ww:learn` | Aggregates metrics, surfaces patterns, gives recommendations. |
| Check a dependency before adding it | `/ww:dependency-check` | Walks the Ponytail ladder before approving a new dependency. |
| Run independent tasks in parallel | `/ww:parallel-execute` | Splits tasks.md into dependency layers, executes groups via subagents. |
| Run a security scan against the codebase | `/ww:security-scan` | Uses semgrep to find vulnerabilities, hardcoded secrets, and insecure patterns. |

## Implementation skills

| When you want to… | Use this | What it does |
|---|---|---|
| Write the minimum that works | `warpweave-ponytail-minimal-output` | YAGNI ladder for every implementation task. Marks deliberate simplifications with `// ponytail:`. |
| Implement test-first with RED-GREEN-REFACTOR | `warpweave-superpowers-tdd` | Subagent-driven TDD with two-stage review. |
| Clarify a vague request before implementing | `warpweave-translator` | Turns underspecified requests into clearly-specified ones. |

## Setup

| When you want to… | Use this | What it does |
|---|---|---|
| Bootstrap a project with everything | `warpweave init-unified` | One-shot setup: Warpweave, RTK, Superpowers, Ponytail. |

## Quick flow: the most common path

```text
/ww:explore  ──►  /ww:propose  ──►  /ww:apply  ──►  /ww:archive
(optional)        (plan)             (build)          (done)
```

## See also

- [Workflows](workflows.md) — workflow patterns and when to use each
- [Commands](commands.md) — full command reference
- [Examples & Recipes](examples.md) — real changes start to finish
