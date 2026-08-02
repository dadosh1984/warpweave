## Context

Warpweave currently checks spec/code alignment only at archive time. During the apply phase, tasks are executed sequentially but no intermediate verification occurs. The cc-spex project (github.com/rhuss/cc-spex) demonstrates a working approach with its `spex-evolve` command that reconciles spec/code drift mid-implementation.

The project uses TypeScript/Node.js ESM, Commander.js for CLI, and has an existing skill generation pipeline. Drift detection must work cross-platform and integrate into the existing apply workflow without breaking changes.

## Goals / Non-Goals

**Goals:**
- Create a `warpweave-drift-detection` skill that checks spec/code alignment
- Add `/ww:drift-check` CLI command for manual invocation
- Integrate drift check into the apply pipeline after each task
- Present clear diff and resolution options when drift is found

**Non-Goals:**
- Automated spec repair (user chooses the action)
- Real-time continuous monitoring (only at task boundaries and on demand)
- Static analysis of unreachable code (only spec scenario coverage)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Detection trigger | After each task in apply | Catches drift early, before it compounds across multiple tasks |
| Comparison method | AI-driven semantic analysis | Spec scenarios describe behavior, not code structure — regex/pattern matching is too brittle |
| Skill format | Agent Skills SKILL.md | Follows existing warpweave skill conventions, no new infrastructure |
| Command format | `/ww:drift-check` | Follows existing `/ww:*` naming convention |
| Resolution UX | Interactive prompt with 3 options | Gives user control without blocking progress entirely |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Drift check slows down apply | Check is lightweight (read specs + scan code); heavy analysis only on drift found |
| False positives from AI analysis | User always has final say; "continue" option bypasses without action |
| Spec files may not exist (skip_specs) | Drift check is skipped when change has no spec files |

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Skill file | 2 (Reuse) | Follows existing SKILL.md format in skills/ |
| CLI command | 2 (Reuse) | Follows existing `/ww:*` command pattern |
| Apply integration | 2 (Reuse) | Hook into existing apply workflow |
| Spec reading | 2 (Reuse) | Uses existing `warpweave show` and file reading |
| Drift analysis | 7 (Minimum) | AI-driven semantic comparison of spec scenarios vs code |
