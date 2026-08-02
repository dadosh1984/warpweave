<p align="center">
  <strong>Warpweave</strong>
</p>

<p align="center">
  <a href="https://github.com/dadosh1984/warpweave/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/dadosh1984/warpweave/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/warpweave"><img alt="npm version" src="https://img.shields.io/npm/v/warpweave?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
</p>

## Warpweave

**Spec-driven minimalism with compressed feedback loops. One organism, four systems, zero waste.**

An AI assistant left to its own defaults will happily skip planning, ship code it never tested, over-build the implementation, and flood your context with raw command output — four failure modes, four separate opinions needed to stop them. Warpweave fuses four independently-proven systems into a single enforced pipeline, so no layer has to be remembered or configured by hand:

| Layer | Role | Source |
|-------|------|--------|
| **Spec** | WHAT to build | **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** |
| **Process** | HOW to build | [Superpowers](https://github.com/obra/superpowers) |
| **Quality** | HOW MUCH to write | [Ponytail](https://github.com/DietrichGebert/ponytail) |
| **Feedback** | HOW FAST to iterate | [RTK](https://github.com/rtk-ai/rtk) |

## Philosophy

Warpweave doesn't add one opinion on top of your AI assistant — it runs every change through four, one per phase, and never skips a layer:

```text
USER INTENT
  → SPEC GATE   (Spec)     — proposal, specs, design, tasks; you approve
  → PLAN        (Process)  — tasks decomposed to file-level granularity
  → EXECUTE     (Quality)  — RED → GREEN → REFACTOR, climbing the Ladder
  → FEEDBACK    (Feedback) — every shell command compressed through RTK
  → REVIEW      (Process)  — two-stage review, archive, spec sync
```

Four hard gates back this up, and none of them are optional:

1. **No code without spec** — implementation is blocked until specs are approved.
2. **No commit without test** — the RED → GREEN TDD cycle has to pass first.
3. **No merge without review** — a two-stage review (spec compliance, then code quality) runs before archive.
4. **No raw output without RTK** — every shell command is compressed before it reaches context, so signal survives and noise doesn't.

**The Ladder** governs how much gets written, not just whether it works. Before a line of code exists, it climbs seven rungs and stops at the first one that holds: YAGNI → reuse → stdlib → native → dependency → one-liner → minimum. Validation, error handling, security, and accessibility are never sacrificed to climb higher — deliberate shortcuts get logged as `// ponytail: <reason>` instead of disappearing silently into the diff.

**What running everything through four layers gets you, instead of one:**
- A plan you both read before code exists, instead of finding out what the AI assumed after it already wrote it.
- Every line justified against the ladder, instead of a codebase that grows because nothing stopped it.
- Every task built test-first, instead of code that "looks right" until it doesn't.
- Every shell command's output compressed before it hits context, instead of noise crowding out the one line that mattered.

## Quick Start

```bash
npm install -g warpweave@latest
cd your-project
warpweave init
```

Then, in your AI assistant's chat:

```text
/ww:explore                   →  (optional) think it through with the AI first
/ww:propose add-dark-mode     →  AI drafts proposal, specs, design, tasks
        (you read and adjust the plan)
/ww:apply                     →  AI builds it, checking off tasks
/ww:archive                   →  specs updated, change archived
```

Full command list: `warpweave --help`. Setup runs in your terminal; the four commands above are slash commands typed in your AI assistant's chat — if that split is unfamiliar, see [How Commands Work](docs/how-commands-work.md).

The `core` profile installs **twelve skills** automatically — the six core-loop skills below plus the three quality skills and three check skills that run without configuration. Three of them work in the background without ever being invoked:

- **`warpweave-translator`** — works like a secretary at the intake. When a request is underspecified, it asks 1–5 short multiple-choice clarifying questions (reply e.g. `1b 2a` or `defaults`) before implementation starts, so the AI never guesses wrong or over-asks.
- **`warpweave-superpowers-tdd`** — RED-GREEN-REFACTOR, subagent-driven development, and a two-stage review (spec compliance, then code quality) on every implementation task.
- **`warpweave-ponytail-minimal-output`** — the YAGNI ladder (skip → reuse → stdlib → native → dependency → one-liner → minimum) plus `// ponytail:` debt markers, so every line earns its place.

## Every skill — and what you get

Warpweave ships **27 skills**. Twelve install automatically with the default `core` profile; the rest are opt-in, invoked as slash commands (`/ww:*`) or CLI subcommands when you need them. Any tool that supports [skills.sh](https://skills.sh) can install all of them at once: `npx skills add dadosh1984/warpweave`.

### Core loop — installed by default

| Skill | Command | What you get |
|-------|---------|---------------|
| `warpweave-explore` | `/ww:explore` | A no-stakes thinking partner. Reads your code, lays out options, turns a fuzzy idea into a concrete plan — before any change file exists. |
| `warpweave-propose` | `/ww:propose` | One command drafts the whole plan — proposal, specs, design, tasks — including a Ladder Decision table showing what options were weighed and why. |
| `warpweave-apply-change` | `/ww:apply` | Implements `tasks.md` task by task, checking off progress, with TDD and the minimal-output ladder running underneath automatically. |
| `warpweave-update-change` | `/ww:update` | Revise the plan mid-change — fold in a new decision, fix a scope mistake — without touching code and without artifacts drifting out of sync with each other. |
| `warpweave-sync-specs` | `/ww:sync` | Fold a change's delta specs into your main specs whenever you want, without archiving the change yet. |
| `warpweave-archive-change` | `/ww:archive` | Closes the loop: merges delta specs into the source of truth, moves the change to `changes/archive/`, reports token savings. |

### Ships by default — implementation quality

| Skill | Runs | What you get |
|-------|------|---------------|
| `warpweave-translator` | Automatically, on any underspecified request | Never lets the AI silently guess your intent — asks a handful of quick multiple-choice questions instead. |
| `warpweave-superpowers-tdd` | Automatically, during `/ww:apply` | Test-first implementation with RED-GREEN-REFACTOR and a two-stage review, instead of code that "looks right." |
| `warpweave-ponytail-minimal-output` | Automatically, during `/ww:apply` | Guards against over-engineering on every task; deliberate shortcuts get logged as `// ponytail:` markers instead of silently accumulating. |

### Ships by default — checks

| Skill | Command | What you get |
|-------|---------|---------------|
| `warpweave-security-scan` | `/ww:security-scan` (also runs automatically after each task during `/ww:apply`) | A native security scan over changed code — hardcoded secrets, injection surfaces, unsafe patterns — without semgrep or Docker. |
| `warpweave-drift-detection` | `/ww:drift-check` (also runs automatically after each task during `/ww:apply`) | Catches spec/code mismatches while they're still a one-line fix, not a surprise at archive time. You choose: fix the code, fix the spec, or note it and continue. |
| `warpweave-guardrails` | `/ww:guardrails` (also runs automatically before each commit) | One check before you commit: all four pipeline gates (SPEC, TDD, LADDER, RTK) at once, instead of trusting that everything's fine. |

### Expanded workflow — opt-in

| Skill | Command | What you get |
|-------|---------|---------------|
| `warpweave-ff-change` | `/ww:ff` | The same artifacts as `propose`, minus the Ladder Decision analysis — the fastest path from idea to code when you don't need the extra thinking. |
| `warpweave-new-change` | `/ww:new` | Start a change scaffold now, fill in each artifact as you're ready, instead of generating everything up front. |
| `warpweave-continue-change` | `/ww:continue` | Picks the next ready artifact and creates exactly that one — for step-by-step rather than all-at-once workflows. |
| `warpweave-verify-change` | `/ww:verify` (also runs automatically when all tasks are complete in `/ww:apply`) | Checks the finished implementation against specs, tasks, and design before you archive, so drift doesn't reach production unnoticed. |
| `warpweave-bulk-archive-change` | `/ww:bulk-archive` | Archive several parallel changes at once, with conflict detection and per-delta spec sync — no one-by-one babysitting. |
| `warpweave-onboard` | `/ww:onboard` | A guided, narrated walkthrough of the whole workflow that does one real cycle of work in your own codebase, not a toy example. |

### Quality & analysis — opt-in

| Skill | Command | What you get |
|-------|---------|---------------|
| `warpweave-ladder-audit` | `/ww:ladder-audit` | Finds deletable code, over-engineering, and unjustified dependencies in the current diff before someone else has to. |
| `warpweave-debt-ledger` | `/ww:debt-ledger` | Every `// ponytail:` marker you've left behind, collected into a structured backlog you can actually triage instead of grepping for later. |
| `warpweave-token-budget` | `/ww:token-budget` | Set a token ceiling per change and track consumption across pipeline phases — cost becomes visible instead of a surprise at the end. |
| `warpweave-learn` | `/ww:learn` | Mines your own archived changes for trends — estimation accuracy, discipline patterns — that no single change would show you on its own. |
| `warpweave-parallel-execute` | `/ww:parallel-execute` | Splits `tasks.md` into independent layers and runs them concurrently via subagents, instead of one task at a time. |
| `warpweave-release-compare` | `/ww:release-compare` | Compares the project before vs after a release, scores the improvement on defined criteria, and warns when a change falls short of the minimum improvement threshold. |

### Setup

| Skill | Command | What you get |
|-------|---------|---------------|
| `warpweave-init-unified` | `/ww:init-unified` | Bootstraps the full environment in one pass — Warpweave, RTK, Superpowers, and Ponytail together — instead of four separate installs. |

## Fast Lane

Small changes skip the ceremony. When the AI detects a change touches ≤3 files and <30 lines (or is a pure style/config/typo fix), it sets `complexity: minimal` in the change metadata. This auto-completes `design.md` and `tasks.md` — the change goes straight from proposal → specs → apply. No manual flags, no extra config. For normal changes, the full artifact chain runs as always.

| Signal | Complexity | Artifacts |
|--------|-----------|-----------|
| ≤3 files, <30 lines, or style/config fix | **minimal** | proposal → specs → apply |
| 4+ files, new component, new API | **normal** | proposal → specs → design → tasks → apply |

## Tessl Registry Integration

Warpweave can pull verified library skills from the [Tessl Registry](https://tessl.io/registry) — a catalog of 10,000+ evaluated, versioned instructions for popular libraries. This reduces AI hallucination by giving agents accurate, up-to-date API knowledge instead of relying on stale training data.

Enable it during `warpweave init` (you'll be prompted) or manually:

```bash
warpweave config registry --enable
```

Once enabled, Warpweave automatically scans your `package.json` dependencies, queries the Tessl Registry, caches matching skills locally, and injects them into agent instructions as a `## Registry Skills` section. No manual configuration needed per library.

| Command | Description |
|---------|-------------|
| `warpweave config registry --status` | Show current configuration |
| `warpweave config registry --enable` | Enable registry integration |
| `warpweave config registry --disable` | Disable and clear cache |
| `warpweave config registry --endpoint <url>` | Set custom API endpoint |
| `warpweave config registry --auto-detect` | Enable auto-scanning of dependencies |
| `warpweave config registry --no-auto-detect` | Disable auto-scanning |
| `warpweave config registry --clear-cache` | Clear cached skills |

Integration is opt-in and disabled by default. No new runtime dependencies — uses built-in `node:fetch`.

## Documentation

- **[Core Concepts at a Glance](docs/overview.md)** — the whole mental model on one screen
- **[Getting Started](docs/getting-started.md)** — first steps
- **[Cheat Sheet](docs/cheatsheet.md)** — situation-first map of every command
- **[How Commands Work](docs/how-commands-work.md)** — using slash commands
- **[Concepts](docs/concepts.md)** — the long version of the philosophy above
- **[All Docs](docs/README.md)** — complete documentation index

## Contributing

- **Small fixes** — submit PRs directly
- **Large changes** — create a change proposal first

AI-generated code is welcome if tested and verified.

### Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT License — see [LICENSE](LICENSE).

Warpweave is a fork of [OpenSpec](https://github.com/Fission-AI/OpenSpec), Copyright (c) 2024 OpenSpec Contributors.
Modifications Copyright (c) 2026 dadosh1984.

<p align="center">
  <a href="https://github.com/dadosh1984/warpweave">GitHub</a> ·
  <a href="https://npmjs.com/package/warpweave">npm</a> ·
  <a href="https://discord.gg/RHpQMYfje">Discord</a>
</p>
