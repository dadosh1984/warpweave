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

## Automatic Triggers

Skills fire automatically when the situation demands them. You do not need to invoke them — the pipeline does:

| Trigger | Skill | When |
|---------|-------|------|
| Per-task | `drift-detection` | After each task in `/ww:apply` — checks spec/code alignment |
| Per-task | `security-scan` | After each task in `/ww:apply` — native scan over changed code |
| Per-task | `guardrails` | Before each commit — four gates (SPEC, TDD, LADDER, RTK) |
| Intercept | `dependency-check` | When a new dependency is proposed — walks the Ponytail ladder |
| Completion | `verify-change` | When all tasks are done — validates implementation against artifacts |
| Completion | `benchmark` | When all tasks are done — writes plan-vs-actual report |
| Release | `release-compare` | After each release — scores improvement against previous release |
| Always | `translator` | On any underspecified request — clarifies before implementing |
| Always | `ponytail-minimal-output` | On every line written — the YAGNI ladder |
| Always | `superpowers-tdd` | On every implementation task — RED-GREEN-REFACTOR |

Every auto-triggered skill also has a manual override (`/ww:<command>`) for when you want to run it explicitly.

**Token budget gates advisory auto-triggers.** Before firing completion-time auto-triggers (`verify-change`, `benchmark`) during `/ww:apply`, consult the change's token budget (`warpweave-token-budget` / `config/unified.toml`):

- If the budget is exhausted or within the configured reserve of the ceiling, **warn** and **skip or defer** `verify-change` and `benchmark` (advisory, completion-only) rather than silently consuming budget beyond the limit.
- The per-task `security-scan` and the pre-commit `guardrails` gates **always run** — they are safety gates, not budget-gated.
- An explicit `/ww:verify` or `/ww:benchmark` runs regardless of budget (manual override bypasses the gate).
- If no budget is configured, auto-triggers run exactly as today, with no new warnings.

## Release Process

- **One changeset = one logical feature.** Each released behavior change gets its own changeset, so git blame stays clean and a broken feature can be rolled back without reverting unrelated work.
- Grouping allowed only for: multiple changes of a single logical feature, or a pure bug fix strictly required to unblock its own feature in the same release.
- The release `release.yml` workflow consumes pending changesets via `pnpm changeset version`; splitting avoids a 1.4.0-style release where five unrelated features share one changeset.

## Context Hygiene

- Clear context before starting implementation
- One change at a time
- Read the code you touch before modifying it
- Lazy about the solution, never about reading
