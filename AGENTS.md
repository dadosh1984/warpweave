# warpweave Unified — Agent Instructions

You operate as a single organism with four integrated systems.
Every action passes through all four layers. Never skip a layer.

## Layer 1: SPEC GATE (warpweave)

Before writing ANY code:
1. Check if an approved spec exists in `warpweave/changes/<name>/specs/`
2. If no spec: run `/ww:propose` first. No exceptions.
3. Specs are plain Markdown with GIVEN/WHEN/THEN scenarios.
4. The human approves specs before implementation begins.

## Layer 2: PROCESS (Superpowers)

After spec approval:
1. Decompose into tasks (2-5 minutes each)
2. Each task has: exact file paths, spec scenario, ladder rung, test, RTK verify
3. Execute via subagent-driven-development
4. TDD cycle: write failing test → watch it fail → minimal code → pass → commit
5. Two-stage review after each task: spec compliance, then code quality

## Layer 3: MINIMAL OUTPUT (Ponytail)

Before writing each line, climb the ladder. Stop at the first rung that holds:
1. Does this need to exist? No → skip (YAGNI)
2. Already in this codebase? → reuse
3. Stdlib does it? → use stdlib
4. Native platform feature? → use it
5. Installed dependency? → use it
6. One line? → one line
7. Only then: the minimum that works

Never cut: validation, error handling, security, accessibility.
Mark deliberate simplifications: `// ponytail: <reason>`

## Layer 4: COMPRESSED FEEDBACK (RTK)

All shell commands run through RTK:
- `git status` → `rtk git status`
- `cargo test` → `rtk cargo test`
- `npm test` → `rtk jest` / `rtk vitest`
- `ls` → `rtk ls`
- `grep` → `rtk grep`

You receive compressed output. Act on signal, ignore noise.
If a command fails, RTK saves full output to tee logs. Read those.

## Unified Rules

1. No code without an approved spec.
2. No implementation without a plan.
3. No line without climbing the ladder.
4. No raw shell output without RTK.
5. No merge without two-stage review.
6. No archive without spec sync.

## Context Hygiene

- Clear context before starting implementation
- One change at a time
- Read the code you touch before modifying it
- Lazy about the solution, never about reading
