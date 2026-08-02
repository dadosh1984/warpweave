<p align="center">
  <strong>Warpweave</strong>
</p>

<p align="center">
  <a href="https://github.com/dadosh1984/warpweave/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/dadosh1984/warpweave/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/warpweave"><img alt="npm version" src="https://img.shields.io/npm/v/warpweave?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
</p>

## Warpweave

**Spec-driven development for AI-powered teams.**

Warpweave integrates four systems into one workflow:

| Layer | Role | Source |
|-------|------|--------|
| **Spec** | WHAT to build | **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** |
| **Process** | HOW to build | [Superpowers](https://github.com/obra/superpowers) |
| **Quality** | HOW MUCH to write | [Ponytail](https://github.com/DietrichGebert/ponytail) |
| **Feedback** | HOW FAST to iterate | [RTK](https://github.com/rtk-ai/rtk) |

## Quick Start

```bash
npm install -g warpweave@latest
cd your-project
warpweave init
```

Then use slash commands in your AI assistant:
- `/ww:propose "feature"` — create a change proposal
- `/ww:apply` — implement the change
- `/ww:archive` — archive and update specs

The Translator skill (`warpweave-translator`) ships by default with every install. It works like a secretary at the intake: when a request is underspecified, it asks 1–5 short multiple-choice clarifying questions (reply e.g. `1b 2a` or `defaults`) before implementation, so the AI never guesses wrong or over-asks.

Two more quality skills ship by default and are installed for every supported agent, so no manual configuration is needed:
- `warpweave-superpowers-tdd` — RED-GREEN-REFACTOR, subagent-driven development, and two-stage review (spec compliance, then code quality)
- `warpweave-ponytail-minimal-output` — the YAGNI ladder (skip → reuse → stdlib → native → dependency → one-liner → minimum) and `// ponytail:` debt markers, so every line earns its place

## Fast Lane

Small changes skip the ceremony. When the AI detects a change touches ≤3 files and <30 lines (or is a pure style/config/typo fix), it sets `complexity: minimal` in the change metadata. This auto-completes `design.md` and `tasks.md` — the change goes straight from proposal → specs → apply. No manual flags, no extra config. For normal changes, the full artifact chain runs as always.

| Signal | Complexity | Artifacts |
|--------|-----------|-----------|
| ≤3 files, <30 lines, or style/config fix | **minimal** | proposal → specs → apply |
| 4+ files, new component, new API | **normal** | proposal → specs → design → tasks → apply |

Full command list: `warpweave --help`

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

## Drift Detection

Warpweave can check whether implemented code has drifted from approved specifications — not just at archive time, but continuously during development. The `warpweave-drift-detection` skill ("Сторож") runs automatically after each task during `/ww:apply` and compares the codebase against the change's spec files.

When drift is found, you choose the action: fix the code to match the spec, update the spec to match the code, or continue with a note. Catching mismatches early is cheaper than finding them at the end.

| Command | Description |
|---------|-------------|
| `/ww:drift-check` | Manually run a drift check for the current change |
| `warpweave drift-check --json` | Run drift check with JSON output for automation |

Drift detection is enabled by default for all changes with spec files. It is skipped automatically when a change declares `skip_specs: true`.

## Documentation

- **[Getting Started](docs/getting-started.md)** — first steps
- **[How Commands Work](docs/how-commands-work.md)** — using slash commands
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
