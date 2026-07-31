# Supported Tools

Spectrix works with many AI coding assistants. When you run `spectrix init`, Spectrix configures selected tools using your active profile/workflow selection and delivery mode.

## How It Works

For each selected tool, Spectrix can install:

1. **Skills** (if delivery includes skills): `.../skills/openspec-*/SKILL.md`
2. **Commands** (if delivery includes commands): tool-specific `otrix-*` command files

Codex is skills-only: Spectrix installs `.codex/skills/openspec-*/SKILL.md` for Codex even when delivery is set to `commands`, and it does not generate Codex custom prompt files.

By default, Spectrix uses the `core` profile, which includes:
- `propose`
- `explore`
- `apply`
- `update`
- `sync`
- `archive`

You can enable expanded workflows (`new`, `continue`, `ff`, `verify`, `bulk-archive`, `onboard`) via `spectrix config profile`, then run `spectrix update`.

## How To Invoke

These docs use `/otrix:propose` as the canonical name, but each tool spells it the
way it loads the file Spectrix wrote. Find your tool's command path in the
[Tool Directory Reference](#tool-directory-reference) below, then match its shape here.

| Command file Spectrix writes | You type | Tools |
|------------------------------|----------|-------|
| `.../commands/otrix/<id>.*` — an `otrix/` folder namespaces it | `/otrix:<id>` | Claude Code, CodeBuddy, Crush, Gemini CLI, Lingma, Qoder, ZCode |
| `.../otrix-<id>.*` — the filename is the command | `/otrix-<id>` | Every other tool with generated command files, except Amazon Q and Devin |
| `.devin/workflows/otrix-<id>.md` — read by only one of Devin's two agents | `/otrix-<id>` on Devin Desktop, `/openspec-<skill>` on Devin Local | Devin Desktop\*\*\*\* |
| `.amazonq/prompts/otrix-<id>.md` — a prompt, not a command | `@otrix-<id>` | Amazon Q Developer |
| none — skills only | `/openspec-<skill>` | CodeArts, ForgeCode, Hermes, Mistral Vibe, shared `.agents` |
| none — Kimi Code | `/skill:openspec-<skill>` | Kimi Code |
| none — Codex CLI | `$openspec-<skill>` | Codex ([`/openspec-<skill>` is not recognized](https://github.com/openai/codex/issues/11817)) |

So `/otrix:propose` is `/otrix-propose` in Cursor, `@otrix-propose` in Amazon Q, and
`$openspec-propose` in Codex.

Two things vary independently, which is why the rows do not collapse:

- **The name.** Rows 1–2 differ only in how the file names the command, and the
  `otrix-<id>` / `otrix:<id>` stem is the same for every tool with generated
  command files.
- **The wrapper.** Amazon Q loads its files into a prompt library invoked with
  `@`. Skills-only tools generate no command files at all, so their last three
  rows use *skill* names — listed under
  [Generated Skill Names](#generated-skill-names) — which do not map one-to-one
  onto command ids (`/otrix:apply` is the `openspec-apply-change` skill).

The command path patterns above are extension-neutral (`.*`) on purpose: the
extension is the tool's (`.toml` for Gemini CLI, `.prompt` for Continue,
`.prompt.md` for Kiro and GitHub Copilot), and a few tools show the name with
its extension in the picker. Match the directory shape, not the extension.

The files Spectrix generates, and the "Getting started" hint printed after setup,
already use the right form for the tools you selected — so the fastest answer is
to read the hint.

## Tool Directory Reference

| Tool (ID) | Skills path pattern | Command path pattern |
|-----------|---------------------|----------------------|
| Amazon Q Developer (`amazon-q`) | `.amazonq/skills/openspec-*/SKILL.md` | `.amazonq/prompts/otrix-<id>.md` |
| Antigravity (`antigravity`) | `.agent/skills/openspec-*/SKILL.md` | `.agent/workflows/otrix-<id>.md` |
| Auggie (`auggie`) | `.augment/skills/openspec-*/SKILL.md` | `.augment/commands/otrix-<id>.md` |
| IBM Bob Shell (`bob`) | `.bob/skills/openspec-*/SKILL.md` | `.bob/commands/otrix-<id>.md` |
| Claude Code (`claude`) | `.claude/skills/openspec-*/SKILL.md` | `.claude/commands/otrix/<id>.md` |
| Cline (`cline`) | `.cline/skills/openspec-*/SKILL.md` | `.clinerules/workflows/otrix-<id>.md` |
| CodeArts (`codeartsagent`) | `.codeartsdoer/skills/openspec-*/SKILL.md` | Not generated (no command adapter; use skill-based `/openspec-*` invocations) |
| CodeBuddy (`codebuddy`) | `.codebuddy/skills/openspec-*/SKILL.md` | `.codebuddy/commands/otrix/<id>.md` |
| Codex (`codex`) | `.codex/skills/openspec-*/SKILL.md` | Not generated (skills-only; use `.codex/skills/openspec-*`) |
| Devin Desktop, formerly Windsurf (`devin`) | `.devin/skills/openspec-*/SKILL.md` | `.devin/workflows/otrix-<id>.md`\*\*\*\* |
| ForgeCode (`forgecode`) | `.forge/skills/openspec-*/SKILL.md` | Not generated (no command adapter; use skill-based `/openspec-*` invocations) |
| Continue (`continue`) | `.continue/skills/openspec-*/SKILL.md` | `.continue/prompts/otrix-<id>.prompt` |
| CoStrict (`costrict`) | `.cospec/skills/openspec-*/SKILL.md` | `.cospec/openspec/commands/otrix-<id>.md` |
| Crush (`crush`) | `.crush/skills/openspec-*/SKILL.md` | `.crush/commands/otrix/<id>.md` |
| Cursor (`cursor`) | `.cursor/skills/openspec-*/SKILL.md` | `.cursor/commands/otrix-<id>.md` |
| Factory Droid (`factory`) | `.factory/skills/openspec-*/SKILL.md` | `.factory/commands/otrix-<id>.md` |
| Gemini CLI (`gemini`) | `.gemini/skills/openspec-*/SKILL.md` | `.gemini/commands/otrix/<id>.toml` |
| GitHub Copilot (`github-copilot`) | `.github/skills/openspec-*/SKILL.md` | `.github/prompts/otrix-<id>.prompt.md`\*\* |
| Hermes Agent (`hermes`) | `.hermes/skills/openspec-*/SKILL.md`\*\*\* | Not generated (no command adapter; use skill-based `/openspec-*` invocations) |
| iFlow (`iflow`) | `.iflow/skills/openspec-*/SKILL.md` | `.iflow/commands/otrix-<id>.md` |
| Junie (`junie`) | `.junie/skills/openspec-*/SKILL.md` | `.junie/commands/otrix-<id>.md` |
| Kilo Code (`kilocode`) | `.kilocode/skills/openspec-*/SKILL.md` | `.kilocode/workflows/otrix-<id>.md` |
| Kimi Code (`kimi`) | `.kimi-code/skills/openspec-*/SKILL.md` | Not generated (no command adapter; use skill-based `/skill:openspec-*` invocations) |
| Kiro (`kiro`) | `.kiro/skills/openspec-*/SKILL.md` | `.kiro/prompts/otrix-<id>.prompt.md` |
| Lingma (`lingma`) | `.lingma/skills/openspec-*/SKILL.md` | `.lingma/commands/otrix/<id>.md` |
| Mistral Vibe (`vibe`) | `.vibe/skills/openspec-*/SKILL.md` | Not generated (no command adapter; use skill-based `/openspec-*` invocations) |
| Oh My Pi (`oh-my-pi`) | `.omp/skills/openspec-*/SKILL.md` | `.omp/commands/otrix-<id>.md` |
| OpenCode (`opencode`) | `.opencode/skills/openspec-*/SKILL.md` | `.opencode/commands/otrix-<id>.md` |
| Pi (`pi`) | `.pi/skills/openspec-*/SKILL.md` | `.pi/prompts/otrix-<id>.md` |
| Qoder (`qoder`) | `.qoder/skills/openspec-*/SKILL.md` | `.qoder/commands/otrix/<id>.md` |
| Qwen Code (`qwen`) | `.qwen/skills/openspec-*/SKILL.md` | `.qwen/commands/otrix-<id>.md` |
| [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (`roocode`) | `.roo/skills/openspec-*/SKILL.md` | `.roo/commands/otrix-<id>.md` |
| Trae (`trae`) | `.trae/skills/openspec-*/SKILL.md` | `.trae/commands/otrix-<id>.md` |
| ZCode (`zcode`) | `.zcode/skills/openspec-*/SKILL.md` | `.zcode/commands/otrix/<id>.md` |
| Shared `.agents` skills (`agents`) | `.agents/skills/openspec-*/SKILL.md` | Not generated (no command adapter; use skill-based `/openspec-*` invocations) |

\*\* GitHub Copilot prompt files are recognized as custom slash commands in IDE extensions (VS Code, JetBrains, Visual Studio). Copilot CLI does not currently consume `.github/prompts/*.prompt.md` directly.

\*\*\* Hermes loads skills from `~/.hermes/skills/` by default. To use project-local Spectrix skills, add the project `.hermes/skills/` directory to `skills.external_dirs` in `~/.hermes/config.yaml`; Hermes then exposes skills with user-facing slash invocations such as `/openspec-propose`.

\*\*\*\* Windsurf was [rebranded to Devin Desktop](https://docs.devin.ai/desktop/devin-desktop-faq) on June 2, 2026, and its config directory moved: `.devin/` is the preferred read + write location, `.windsurf/` a legacy read-only fallback. Spectrix follows the rename — the tool id is `devin`, and `--tools windsurf` still resolves to it so existing setup scripts keep working. A project still holding Spectrix files in `.windsurf/` is offered the move on the next `spectrix update`; declining leaves them in place, and files you wrote yourself are never touched. Workflows are invoked by filename, so `.devin/workflows/otrix-apply.md` is `/otrix-apply`. The [Devin Local agent does not support workflows](https://docs.devin.ai/desktop/devin-local) — only skills, and it does not read `.windsurf/` at all — so whenever Spectrix writes Devin skills it keeps their bodies, and the getting-started hint, on `/openspec-*` skill invocations, which work on both agents. Under commands-only delivery no skills are written and both fall back to `/otrix-*`.

### When to pick the shared `.agents` target

`agents` is the vendor-neutral option: it writes skills to `.agents/skills/`, the
shared root many agent tools read, instead of a tool-specific directory.

| Situation | Pick |
|-----------|------|
| Your tool has its own row above | Its own ID — you get that tool's integration, including slash commands where it supports them |
| Several agents on one repo, all reading `.agents/skills` | `agents` — one skill tree instead of one per tool |
| Your tool isn't listed yet but reads `.agents/skills` | `agents` |

Selecting it alongside a tool-specific ID is fine; each writes to its own root.
Spectrix also offers it automatically once a project has a `.agents/skills/`
directory — a bare `.agents/` is not enough, since tools use that root for rules
and subagent definitions too. Note `.agents` is not `.agent`: the singular
directory belongs to Antigravity.

Two things to know:

- **Skills only.** No command adapter exists, so no `otrix-*` command files are
  written; with a commands-inclusive delivery mode `spectrix init` lists `agents`
  among the tools it reports under `Commands skipped for: … (no adapter)`.
  Invoke the workflows by skill name —
  most assistants that read `.agents/skills` spell that `/openspec-propose`, the form
  Spectrix's setup hint prints. The target is vendor-neutral, so check your
  assistant's own docs if it uses another form.
- **No `AGENTS.md` is created or edited.** The target is the `.agents/` directory.
  If your root `AGENTS.md` still carries Spectrix marker blocks from an older
  version, `spectrix update` strips them — see the [Migration Guide](migration-guide.md).

Because `.agents/skills/` is shared, it is worth knowing what Spectrix claims there:
it writes, refreshes, and removes only the `openspec-*` skill directories for your
selected workflows. Anything else in that directory is left alone. Treat the
`openspec-*` names as Spectrix's — edits inside them are replaced on the next
`spectrix update`, the same as for every other tool.

## Non-Interactive Setup

For CI/CD or scripted setup, use `--tools` (and optionally `--profile`):

```bash
# Configure specific tools
spectrix init --tools claude,cursor

# Configure all supported tools
spectrix init --tools all

# Skip tool configuration
spectrix init --tools none

# Override profile for this init run
spectrix init --profile core
```

**Available tool IDs (`--tools`)** — `windsurf` is also accepted, as an alias for `devin`: `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `zcode`, `agents`

## Workflow-Dependent Installation

Spectrix installs workflow artifacts based on selected workflows:

- **Core profile (default):** `propose`, `explore`, `apply`, `update`, `sync`, `archive`
- **Custom selection:** any subset of all workflow IDs:
  `propose`, `explore`, `new`, `continue`, `apply`, `update`, `ff`, `sync`, `archive`, `bulk-archive`, `verify`, `onboard`

In other words, skill/command counts are profile-dependent and delivery-dependent, not fixed.

## Generated Skill Names

When selected by profile/workflow config, Spectrix generates these skills:

- `openspec-propose`
- `openspec-explore`
- `openspec-new-change`
- `openspec-continue-change`
- `openspec-apply-change`
- `openspec-update-change`
- `openspec-ff-change`
- `openspec-sync-specs`
- `openspec-archive-change`
- `openspec-bulk-archive-change`
- `openspec-verify-change`
- `openspec-onboard`

See [Commands](commands.md) for command behavior and [CLI](cli.md) for `init`/`update` options.

## Related

- [CLI Reference](cli.md) — Terminal commands
- [Commands](commands.md) — Slash commands and skills
- [Getting Started](getting-started.md) — First-time setup
