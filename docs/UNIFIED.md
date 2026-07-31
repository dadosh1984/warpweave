# OpenSpec Unified

**Spec-driven minimalism with compressed feedback loops.** One organism. Four systems. Zero waste.

OpenSpec Unified is a fork of [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) that embeds three tools into the existing `spec-driven` pipeline. The artifact structure (`proposal → specs → design → tasks`) stays exactly the same — each phase of the pipeline gains built-in support for the three tools.

## The Four Systems

| Layer | Question | System | Effect |
|-------|----------|--------|--------|
| Spec | WHAT to build | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | requirements with GIVEN/WHEN/THEN scenarios |
| Process | HOW to build | [Superpowers](https://github.com/obra/superpowers) | TDD, subagent-driven development, two-stage review |
| Quality | HOW MUCH to write | [Ponytail](https://github.com/DietrichGebert/ponytail) | -54% lines, YAGNI ladder |
| Feedback | HOW FAST to iterate | [RTK](https://github.com/rtk-ai/rtk) | -70% tokens on command output |

Every action passes through all four layers. Never skip a layer.

## The Pipeline

```text
USER INTENT
  → PHASE 1: SPEC GATE  (OpenSpec)      — proposal, specs, design, tasks; human approves
  → PHASE 2: PLAN       (Superpowers)   — tasks decomposed, file-level granularity
  → PHASE 3: EXECUTE    (Ponytail + Superpowers TDD) — RED → GREEN → REFACTOR, ladder rungs
  → PHASE 4: FEEDBACK   (RTK)           — every shell command runs through `rtk`
  → PHASE 5: REVIEW     (Superpowers + OpenSpec) — two-stage review, archive, spec sync
```

### Gates

The pipeline enforces four hard gates:

1. **No code without spec** — implementation blocked until specs are approved
2. **No commit without test** — TDD cycle must pass (RED → GREEN)
3. **No merge without review** — two-stage review (spec compliance, then code quality)
4. **No raw output without RTK** — every shell command is `rtk`-wrapped

## The Ladder (Ponytail)

Before writing each line, climb the ladder. Stop at the first rung that holds:

| Rung | Check |
|------|-------|
| 1 | YAGNI — does this need to exist at all? |
| 2 | Reuse — already in this codebase? |
| 3 | Stdlib — standard library covers it? |
| 4 | Native — platform feature exists? |
| 5 | Dependency — installed package does it? |
| 6 | One-liner — single expression? |
| 7 | Minimum — smallest correct implementation |

Never cut: validation, error handling, security, accessibility. Mark deliberate simplifications with `// ponytail: <reason>`.

### Where the ladder lives in artifacts

- **proposal.md** — `Ladder Decision` table: considered options and verdicts
- **design.md** — `Ladder Trace` table: component → rung → decision
- **tasks.md** — each task carries `Spec scenario`, `Ladder rung`, `Test first`, `Verify`

## TDD Cycle (Superpowers)

Each task follows RED-GREEN-REFACTOR:

1. Write failing test (RED)
2. Observe failure
3. Write minimal code (GREEN) — apply ladder rung
4. Observe pass
5. Refactor if needed (still minimal)
6. Commit with task reference

## RTK Wrapping (RTK)

All shell commands run through RTK:

| Command | RTK form |
|---------|----------|
| `git status` | `rtk git status` |
| `npm test` | `rtk jest` / `rtk vitest` |
| `cargo test` | `rtk cargo test` |
| `ls` | `rtk ls` |
| `grep` | `rtk grep` |

You receive compressed output. Act on signal, ignore noise. On command failure, RTK saves full output to tee logs at `~/.local/share/rtk/tee/`.

## Configuration

`openspec init` copies the unified configuration into your project:

| Source | Destination |
|--------|-------------|
| `config/unified.toml` | `.unified/config/unified.toml` |
| `config/pipeline.yaml` | `.unified/config/pipeline.yaml` |
| `AGENTS.md` | project root |
| `.env.example` | project root |

### `unified.toml`

Single source of truth for all four systems:

```toml
[openspec]     # schema, profile, auto_archive, require_approval
[superpowers]  # tdd_mode, subagent_review, task_max_minutes
[ponytail]     # mode, yagni_strict, prefer_stdlib
[rtk]          # auto_rewrite, ultra_compact, tee_mode, hooks
[pipeline]     # phases, gates, max_concurrent_tasks
```

### Profiles

Three profiles tune the pipeline for team size:

| Profile | Audience | Key settings |
|---------|----------|--------------|
| `minimal` | Solo developer | relaxed TDD, ultra ponytail, gate_plan off, gate_review off |
| `standard` | Small team | strict TDD, full ponytail, all gates on |
| `enterprise` | Large team | strict TDD, parallel agents, tee always, two reviewers |

Select a profile with the `UNIFIED_PROFILE` environment variable (see `.env.example`).

## Installation

```bash
npm install -g @fission-ai/openspec-unified@latest
brew install rtk
cd your-project
openspec init
rtk init -g --opencode
```

Add Superpowers and Ponytail to `opencode.json`:

```json
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@dietrichgebert/ponytail"
  ]
}
```

## Commands

The unified workflow uses the standard OpenSpec commands:

| Command | Purpose |
|---------|---------|
| `/opsx:explore` | Thinking partner before you commit to a plan |
| `/opsx:propose` | Create a change: proposal, specs, design, tasks |
| `/opsx:apply` | Implement tasks with TDD and ladder rungs |
| `/opsx:archive` | Archive the change, sync specs |

Your tool may spell `/opsx:propose` as `/opsx-propose`, `@opsx-propose`, or `$openspec-propose` — `openspec init` prints the right form for the tools you picked.

## FAQ

**Do I need to change how I use OpenSpec?** No. The artifact structure and commands are identical. The three tools are embedded as instructions, templates, and suggestions.

**Does OpenSpec Unified change the schema?** No. The schema stays `spec-driven`. We modify the existing `instruction` blocks, templates, and skill generator.

**What if I don't want RTK/Superpowers/Ponytail?** They are suggestions, not requirements. The spec-driven pipeline works standalone; the unified tooling layers on top.

## Agent Instructions

For the agent-side rules, see [AGENTS.md](../AGENTS.md) — the four layers, the unified rules, and context hygiene that every agent should follow.
