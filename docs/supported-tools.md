# Supported Tools

Warpweave works with many AI coding assistants. When you run `warpweave init`, Warpweave configures selected tools using your active profile/workflow selection and delivery mode.

## How It Works

For each selected tool, Warpweave can install:

1. **Skills** (if delivery includes skills): `.../skills/warpweave-*/SKILL.md`
2. **Commands** (if delivery includes commands): tool-specific `ww-*` command files

Codex is skills-only: Warpweave installs `.codex/skills/warpweave-*/SKILL.md` for Codex even when delivery is set to `commands`, and it does not generate Codex custom prompt files.

By default, Warpweave uses the `core` profile, which includes:
- `propose`
- `explore`
- `apply`
- `update`
- `sync`
- `archive`

You can enable expanded workflows (`new`, `continue`, `ff`, `verify`, `bulk-archive`, `onboard`) via `warpweave config profile`, then run `warpweave update`.

## How To Invoke

These docs use `/ww:propose` as the canonical name, but each tool spells it the
way it loads the file Warpweave wrote. Find your tool's command path in the
[Tool Directory Reference](#tool-directory-reference) below, then match its shape here.

| Command file Warpweave writes | You type | Tools |
|------------------------------|----------|-------|
| `.../commands/ww/<id>.*` — an `ww/` folder namespaces it | `/ww:<id>` | Claude Code, CodeBuddy, Crush, Gemini CLI, Lingma, Qoder, ZCode |
| `.../ww-<id>.*` — the filename is the command | `/ww-<id>` | Every other tool with generated command files, except Amazon Q and Devin |
| `.devin/workflows/ww-<id>.md` — read by only one of Devin's two agents | `/ww-<id>` on Devin Desktop, `/warpweave-<skill>` on Devin Local | Devin Desktop\*\*\*\* |
| `.amazonq/prompts/ww-<id>.md` — a prompt, not a command | `@ww-<id>` | Amazon Q Developer |
| none — skills only | `/warpweave-<skill>` | CodeArts, ForgeCode, Hermes, Mistral Vibe, shared `.agents` |
| none — Kimi Code | `/skill:warpweave-<skill>` | Kimi Code |
| none — Codex CLI | `$warpweave-<skill>` | Codex ([`/warpweave-<skill>` is not recognized](https://github.com/openai/codex/issues/11817)) |

So `/ww:propose` is `/ww-propose` in Cursor, `@ww-propose` in Amazon Q, and
`$warpweave-propose` in Codex.

Two things vary independently, which is why the rows do not collapse:

- **The name.** Rows 1–2 differ only in how the file names the command, and the
  `ww-<id>` / `ww:<id>` stem is the same for every tool with generated
  command files.
- **The wrapper.** Amazon Q loads its files into a prompt library invoked with
  `@`. Skills-only tools generate no command files at all, so their last three
  rows use *skill* names — listed under
  [Generated Skill Names](#generated-skill-names) — which do not map one-to-one
  onto command ids (`/ww:apply` is the `warpweave-apply-change` skill).

The command path patterns above are extension-neutral (`.*`) on purpose: the
extension is the tool's (`.toml` for Gemini CLI, `.prompt` for Continue,
`.prompt.md` for Kiro and GitHub Copilot), and a few tools show the name with
its extension in the picker. Match the directory shape, not the extension.

The files Warpweave generates, and the "Getting started" hint printed after setup,
already use the right form for the tools you selected — so the fastest answer is
to read the hint.

## Tool Directory Reference

| Tool (ID) | Skills path pattern | Command path pattern |
|-----------|---------------------|----------------------|
| Amazon Q Developer (`amazon-q`) | `.amazonq/skills/warpweave-*/SKILL.md` | `.amazonq/prompts/ww-<id>.md` |
| Antigravity (`antigravity`) | `.agent/skills/warpweave-*/SKILL.md` | `.agent/workflows/ww-<id>.md` |
| Auggie (`auggie`) | `.augment/skills/warpweave-*/SKILL.md` | `.augment/commands/ww-<id>.md` |
| IBM Bob Shell (`bob`) | `.bob/skills/warpweave-*/SKILL.md` | `.bob/commands/ww-<id>.md` |
| Claude Code (`claude`) | `.claude/skills/warpweave-*/SKILL.md` | `.claude/commands/ww/<id>.md` |
| Cline (`cline`) | `.cline/skills/warpweave-*/SKILL.md` | `.clinerules/workflows/ww-<id>.md` |
| CodeArts (`codeartsagent`) | `.codeartsdoer/skills/warpweave-*/SKILL.md` | Not generated (no command adapter; use skill-based `/warpweave-*` invocations) |
| CodeBuddy (`codebuddy`) | `.codebuddy/skills/warpweave-*/SKILL.md` | `.codebuddy/commands/ww/<id>.md` |
| Codex (`codex`) | `.codex/skills/warpweave-*/SKILL.md` | Not generated (skills-only; use `.codex/skills/warpweave-*`) |
| Devin Desktop, formerly Windsurf (`devin`) | `.devin/skills/warpweave-*/SKILL.md` | `.devin/workflows/ww-<id>.md`\*\*\*\* |
| ForgeCode (`forgecode`) | `.forge/skills/warpweave-*/SKILL.md` | Not generated (no command adapter; use skill-based `/warpweave-*` invocations) |
| Continue (`continue`) | `.continue/skills/warpweave-*/SKILL.md` | `.continue/prompts/ww-<id>.prompt` |
| CoStrict (`costrict`) | `.cospec/skills/warpweave-*/SKILL.md` | `.cospec/warpweave/commands/ww-<id>.md` |
| Crush (`crush`) | `.crush/skills/warpweave-*/SKILL.md` | `.crush/commands/ww/<id>.md` |
| Cursor (`cursor`) | `.cursor/skills/warpweave-*/SKILL.md` | `.cursor/commands/ww-<id>.md` |
| Factory Droid (`factory`) | `.factory/skills/warpweave-*/SKILL.md` | `.factory/commands/ww-<id>.md` |
| Gemini CLI (`gemini`) | `.gemini/skills/warpweave-*/SKILL.md` | `.gemini/commands/ww/<id>.toml` |
| GitHub Copilot (`github-copilot`) | `.github/skills/warpweave-*/SKILL.md` | `.github/prompts/ww-<id>.prompt.md`\*\* |
| Hermes Agent (`hermes`) | `.hermes/skills/warpweave-*/SKILL.md`\*\*\* | Not generated (no command adapter; use skill-based `/warpweave-*` invocations) |
| iFlow (`iflow`) | `.iflow/skills/warpweave-*/SKILL.md` | `.iflow/commands/ww-<id>.md` |
| Junie (`junie`) | `.junie/skills/warpweave-*/SKILL.md` | `.junie/commands/ww-<id>.md` |
| Kilo Code (`kilocode`) | `.kilocode/skills/warpweave-*/SKILL.md` | `.kilocode/workflows/ww-<id>.md` |
| Kimi Code (`kimi`) | `.kimi-code/skills/warpweave-*/SKILL.md` | Not generated (no command adapter; use skill-based `/skill:warpweave-*` invocations) |
| Kiro (`kiro`) | `.kiro/skills/warpweave-*/SKILL.md` | `.kiro/prompts/ww-<id>.prompt.md` |
| Lingma (`lingma`) | `.lingma/skills/warpweave-*/SKILL.md` | `.lingma/commands/ww/<id>.md` |
| Mistral Vibe (`vibe`) | `.vibe/skills/warpweave-*/SKILL.md` | Not generated (no command adapter; use skill-based `/warpweave-*` invocations) |
| Oh My Pi (`oh-my-pi`) | `.omp/skills/warpweave-*/SKILL.md` | `.omp/commands/ww-<id>.md` |
| OpenCode (`opencode`) | `.opencode/skills/warpweave-*/SKILL.md` | `.opencode/commands/ww-<id>.md` |
| Pi (`pi`) | `.pi/skills/warpweave-*/SKILL.md` | `.pi/prompts/ww-<id>.md` |
| Qoder (`qoder`) | `.qoder/skills/warpweave-*/SKILL.md` | `.qoder/commands/ww/<id>.md` |
| Qwen Code (`qwen`) | `.qwen/skills/warpweave-*/SKILL.md` | `.qwen/commands/ww-<id>.md` |
| [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (`roocode`) | `.roo/skills/warpweave-*/SKILL.md` | `.roo/commands/ww-<id>.md` |
| Trae (`trae`) | `.trae/skills/warpweave-*/SKILL.md` | `.trae/commands/ww-<id>.md` |
| ZCode (`zcode`) | `.zcode/skills/warpweave-*/SKILL.md` | `.zcode/commands/ww/<id>.md` |
| Shared `.agents` skills (`agents`) | `.agents/skills/warpweave-*/SKILL.md` | Not generated (no command adapter; use skill-based `/warpweave-*` invocations) |

\*\* GitHub Copilot prompt files are recognized as custom slash commands in IDE extensions (VS Code, JetBrains, Visual Studio). Copilot CLI does not currently consume `.github/prompts/*.prompt.md` directly.

\*\*\* Hermes loads skills from `~/.hermes/skills/` by default. To use project-local Warpweave skills, add the project `.hermes/skills/` directory to `skills.external_dirs` in `~/.hermes/config.yaml`; Hermes then exposes skills with user-facing slash invocations such as `/warpweave-propose`.

\*\*\*\* Windsurf was [rebranded to Devin Desktop](https://docs.devin.ai/desktop/devin-desktop-faq) on June 2, 2026, and its config directory moved: `.devin/` is the preferred read + write location, `.windsurf/` a legacy read-only fallback. Warpweave follows the rename — the tool id is `devin`, and `--tools windsurf` still resolves to it so existing setup scripts keep working. A project still holding Warpweave files in `.windsurf/` is offered the move on the next `warpweave update`; declining leaves them in place, and files you wrote yourself are never touched. Workflows are invoked by filename, so `.devin/workflows/ww-apply.md` is `/ww-apply`. The [Devin Local agent does not support workflows](https://docs.devin.ai/desktop/devin-local) — only skills, and it does not read `.windsurf/` at all — so whenever Warpweave writes Devin skills it keeps their bodies, and the getting-started hint, on `/warpweave-*` skill invocations, which work on both agents. Under commands-only delivery no skills are written and both fall back to `/ww-*`.

### When to pick the shared `.agents` target

`agents` is the vendor-neutral option: it writes skills to `.agents/skills/`, the
shared root many agent tools read, instead of a tool-specific directory.

| Situation | Pick |
|-----------|------|
| Your tool has its own row above | Its own ID — you get that tool's integration, including slash commands where it supports them |
| Several agents on one repo, all reading `.agents/skills` | `agents` — one skill tree instead of one per tool |
| Your tool isn't listed yet but reads `.agents/skills` | `agents` |

Selecting it alongside a tool-specific ID is fine; each writes to its own root.
Warpweave also offers it automatically once a project has a `.agents/skills/`
directory — a bare `.agents/` is not enough, since tools use that root for rules
and subagent definitions too. Note `.agents` is not `.agent`: the singular
directory belongs to Antigravity.

Two things to know:

- **Skills only.** No command adapter exists, so no `ww-*` command files are
  written; with a commands-inclusive delivery mode `warpweave init` lists `agents`
  among the tools it reports under `Commands skipped for: … (no adapter)`.
  Invoke the workflows by skill name —
  most assistants that read `.agents/skills` spell that `/warpweave-propose`, the form
  Warpweave's setup hint prints. The target is vendor-neutral, so check your
  assistant's own docs if it uses another form.
- **No `AGENTS.md` is created or edited.** The target is the `.agents/` directory.
  If your root `AGENTS.md` still carries Warpweave marker blocks from an older
  version, `warpweave update` strips them — see the [Migration Guide](migration-guide.md).

Because `.agents/skills/` is shared, it is worth knowing what Warpweave claims there:
it writes, refreshes, and removes only the `warpweave-*` skill directories for your
selected workflows. Anything else in that directory is left alone. Treat the
`warpweave-*` names as Warpweave's — edits inside them are replaced on the next
`warpweave update`, the same as for every other tool.

## Non-Interactive Setup

For CI/CD or scripted setup, use `--tools` (and optionally `--profile`):

```bash
# Configure specific tools
warpweave init --tools claude,cursor

# Configure all supported tools
warpweave init --tools all

# Skip tool configuration
warpweave init --tools none

# Override profile for this init run
warpweave init --profile core
```

**Available tool IDs (`--tools`)** — `windsurf` is also accepted, as an alias for `devin`: `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `zcode`, `agents`

## Workflow-Dependent Installation

Warpweave installs workflow artifacts based on selected workflows:

- **Core profile (default):** `propose`, `explore`, `apply`, `update`, `sync`, `archive`
- **Custom selection:** any subset of all workflow IDs:
  `propose`, `explore`, `new`, `continue`, `apply`, `update`, `ff`, `sync`, `archive`, `bulk-archive`, `verify`, `onboard`, `security-scan`

In other words, skill/command counts are profile-dependent and delivery-dependent, not fixed.

## Generated Skill Names

When selected by profile/workflow config, Warpweave generates these skills:

- `warpweave-propose`
- `warpweave-explore`
- `warpweave-new-change`
- `warpweave-continue-change`
- `warpweave-apply-change`
- `warpweave-update-change`
- `warpweave-ff-change`
- `warpweave-sync-specs`
- `warpweave-archive-change`
- `warpweave-bulk-archive-change`
- `warpweave-verify-change`
- `warpweave-onboard`
- `warpweave-security-scan`

See [Commands](commands.md) for command behavior and [CLI](cli.md) for `init`/`update` options.

## Related

- [CLI Reference](cli.md) — Terminal commands
- [Commands](commands.md) — Slash commands and skills
- [Getting Started](getting-started.md) — First-time setup
