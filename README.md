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

Full command list: `warpweave --help`

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
