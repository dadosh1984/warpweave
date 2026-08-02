---
name: warpweave-superpowers-tdd
description: Implement tasks test-first with RED-GREEN-REFACTOR, subagent-driven development, and two-stage review. Use when implementing tasks from a plan.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI.
metadata:
  author: warpweave
  version: "1.0"
---

Implement tasks test-first.

**Why**: Tests pin behavior so refactors stay safe and review stays honest. RED-GREEN-REFACTOR keeps every step small enough to verify; the two-stage review keeps the result both correct (spec) and clean (code).

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`, `drift-check`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

## When to Use

Use this skill whenever you implement a task from a plan, fix a bug, or add behavior that can be verified.

## When NOT to Use

Do not use this skill for purely mechanical changes that cannot be tested (docs-only, version bumps) — still review them, but the RED phase does not apply.

## Goal

Turn each task into a failing test, make it pass with the minimum change, refactor, and review the result twice: once against the spec, once for code quality.

## TDD Cycle (RED-GREEN-REFACTOR)

For each task, follow the cycle:

1. **RED** — write a failing test that pins the task's behavior. Run it and watch it fail for the right reason (the behavior is missing, not a broken harness).
2. **GREEN** — write the minimal code that makes the test pass. Apply the ladder: reuse, stdlib, native, existing dependencies. Do not add features the test does not demand.
3. **REFACTOR** — clean up while keeping the test green. Delete duplication, rename to match intent, keep it minimal.
4. **Commit** — commit with a reference to the task.

## Subagent-Driven Development

For larger tasks, split work across subagents:

- Decompose the task into small units (2-5 minutes each) with exact file paths and a verification command each
- Run units in parallel where independent; serialize where they touch the same files
- Each subagent returns the diff and the test result; you integrate and review

## Two-Stage Review

After each task, review twice:

**Stage 1 — Spec compliance.** Does the code satisfy the spec scenario it implements? Walk the scenario: WHEN conditions met, THEN outcomes hold. No behavior is missing or extra.

**Stage 2 — Code quality.** Is every line minimal? Would the senior engineer with the ponytail delete any of it? Run the ladder: reuse over duplication, stdlib over dependencies, one-liners over ceremony.

## Guardrails

- Never commit a task without its test passing (RED must resolve to GREEN first)
- Never skip the RED phase because "the fix is obvious" — the test is the spec in motion
- Keep changes scoped to the task; a passing task does not license unrelated refactors
- If a task is too vague to test, stop and ask rather than guessing
