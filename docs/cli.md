# CLI Reference

The Spectrix CLI (`spectrix`) provides terminal commands for project setup, validation, status inspection, and management. These commands complement the AI slash commands (like `/otrix:propose`) documented in [Commands](commands.md).

## Summary

| Category | Commands | Purpose |
|----------|----------|---------|
| **Setup** | `init`, `update` | Initialize and update Spectrix in your project |
| **Stores (standalone Spectrix repos)** | `store setup`, `store register`, `store unregister`, `store remove`, `store list`, `store doctor` | Manage stores — standalone Spectrix repos you've registered |
| **Health** | `doctor` | Report relationship health for the resolved root |
| **Working context** | `context` | Assemble the working set (root + referenced stores) |
| **Personal worksets** | `workset create`, `workset list`, `workset open`, `workset remove` | Keep and open personal, local working views in your tool |
| **Browsing** | `list`, `view`, `show` | Explore changes and specs |
| **Validation** | `validate` | Check changes and specs for issues |
| **Lifecycle** | `archive` | Finalize completed changes |
| **Workflow** | `new change`, `status`, `instructions`, `templates`, `schemas` | Artifact-driven workflow support |
| **Schemas** | `schema init`, `schema fork`, `schema validate`, `schema which` | Create and manage custom workflows |
| **Config** | `config` | View and modify settings |
| **Utility** | `feedback`, `completion` | Feedback and shell integration |

---

## Human vs Agent Commands

Most CLI commands are designed for **human use** in a terminal. Some commands also support **agent/script use** via JSON output.

### Human-Only Commands

These commands are interactive and designed for terminal use:

| Command | Purpose |
|---------|---------|
| `spectrix init` | Initialize project (interactive prompts) |
| `spectrix view` | Interactive dashboard |
| `spectrix workset open <name>` | Open a saved workset (editor window or terminal agent session) |
| `spectrix config edit` | Open config in editor |
| `spectrix feedback` | Submit feedback via GitHub |
| `spectrix completion install` | Install shell completions |

### Agent-Compatible Commands

These commands support `--json` output for programmatic use by AI agents and scripts:

| Command | Human Use | Agent Use |
|---------|-----------|-----------|
| `spectrix list` | Browse changes/specs | `--json` for structured data |
| `spectrix show <item>` | Read content | `--json` for parsing |
| `spectrix validate` | Check for issues | `--all --json` for bulk validation |
| `spectrix status` | See artifact progress | `--json` for structured status |
| `spectrix instructions` | Get next steps | `--json` for agent instructions |
| `spectrix templates` | Find template paths | `--json` for path resolution |
| `spectrix schemas` | List available schemas | `--json` for schema discovery |
| `spectrix store setup <id>` | Create and register a local store | `--json` with explicit inputs for structured setup output |
| `spectrix store register <path>` | Register an existing store | `--json` for structured registration output |
| `spectrix store unregister <id>` | Forget a local store registration | `--json` for structured cleanup output |
| `spectrix store remove <id>` | Delete a registered local store folder | `--yes --json` for non-interactive deletion |
| `spectrix store list` | Browse registered stores | `--json` for structured registrations |
| `spectrix store doctor` | Check local store setup | `--json` for structured diagnostics |
| `spectrix new change <id>` | Create repo-local change scaffolding | `--json`, plus `--store <id>` to use a registered store as the Spectrix root |
| `spectrix workset create [name]` | Compose a personal working view | `--member <path> --json` for non-interactive composition |
| `spectrix workset list` | Browse saved worksets | `--json` for structured views |
| `spectrix workset remove <name>` | Delete a saved view | `--yes --json` for non-interactive removal |

---

## Global Options

These options work with all commands:

| Option | Description |
|--------|-------------|
| `--version`, `-V` | Show version number |
| `--no-color` | Disable color output |
| `--help`, `-h` | Display help for command |

---

## Setup Commands

### `spectrix init`

Initialize Spectrix in your project. Creates the folder structure and configures AI tool integrations.

Default behavior uses global config defaults: profile `core`, delivery `both`, workflows `propose, explore, apply, update, sync, archive`.

```
spectrix init [path] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `path` | No | Target directory (default: current directory) |

**Options:**

| Option | Description |
|--------|-------------|
| `--tools <list>` | Configure AI tools non-interactively. Use `all`, `none`, or comma-separated list |
| `--force` | Auto-cleanup legacy files without prompting |
| `--profile <profile>` | Override global profile for this init run (`core` or `custom`) |
| `--no-animation` | Show a static welcome screen instead of the animated one |

`--profile custom` uses whatever workflows are currently selected in global config (`spectrix config profile`).

The welcome animation is also skipped when the `OPENSPEC_NO_ANIMATION` environment variable is set (any value, including empty), when `NO_COLOR` is set to a non-empty value, or when the OS reduced-motion preference is enabled (macOS Reduce Motion, GNOME animations disabled).

**Supported tool IDs (`--tools`)** — `windsurf` is also accepted, as an alias for `devin`: `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `zcode`, `agents`

> This list mirrors `AI_TOOLS` in `src/core/config.ts`. See [Supported Tools](supported-tools.md) for each tool's skill and command paths.

**Examples:**

```bash
# Interactive initialization
spectrix init

# Initialize in a specific directory
spectrix init ./my-project

# Non-interactive: configure for Claude and Cursor
spectrix init --tools claude,cursor

# Configure for all supported tools
spectrix init --tools all

# Override profile for this run
spectrix init --profile core

# Skip prompts and auto-cleanup legacy files
spectrix init --force
```

**What it creates:**

```
openspec/
├── specs/              # Your specifications (source of truth)
├── changes/            # Proposed changes
└── config.yaml         # Project configuration

.claude/skills/         # Claude Code skills (if claude selected)
.cursor/skills/         # Cursor skills (if cursor selected)
.cursor/commands/       # Cursor OTRIX commands (if delivery includes commands)
.agents/skills/         # Shared skills for AGENTS.md-compatible tools (if agents selected)
... (other tool configs)
```

---

### `spectrix update`

Update Spectrix instruction files after upgrading the CLI. Re-generates AI tool configuration files using your current global profile, selected workflows, and delivery mode.

```
spectrix update [path] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `path` | No | Target directory (default: current directory) |

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Force update even when files are up to date |

**Example:**

```bash
# Update instruction files after npm upgrade
npm install -g @dadosh1984/spectrix@latest
spectrix update
```

Upgrade the package first. Instruction files are generated by the installed CLI, so running `spectrix update` against a stale install reports everything up to date without adding the workflows newer releases ship.

To make that visible, `spectrix update` asks the npm registry whether a newer CLI has been published. When yours is behind, it offers to upgrade:

```text
A newer Spectrix CLI is available (v1.6.0 → v1.7.0).
  Running from: /usr/local/lib/node_modules/@dadosh1984/spectrix
? Upgrade to v1.7.0 now? (Y/n)
```

Answer yes and it runs `npm install -g @dadosh1984/spectrix@latest`, then re-runs the update with the new CLI so the new workflows land in the same command. It confirms the upgrade by asking the installed binary its version rather than trusting npm's exit code, so if another install earlier on your `PATH` is still answering, it tells you instead of claiming success. Answer no and it prints the command and updates with the CLI you have. Ctrl-C stops the command.

The offer appears only in an interactive terminal, and only when npm owns the install — the one case `npm install -g` actually fixes. Everything else gets the command that matches how it was installed instead:

| How Spectrix is installed | What you get |
|---------------------------|--------------|
| Global npm install | The prompt, and the upgrade run for you — in an interactive terminal; piped output gets the printed command instead |
| Global pnpm, bun, yarn, or volta install | That manager's own command: `pnpm add -g …@latest`, `bun add -g …@latest`, `yarn global add …@latest`, or `volta install …@latest` |
| A dependency of the project | A note to update the dependency, since its package manager owns the lockfile |
| An `npx` / `dlx` cache | `npx @dadosh1984/spectrix@latest update` — that command is the update, so there is no second step |
| A git clone | Nothing — your version is whatever the branch says |

Whenever anything is printed, it names the directory the running CLI was loaded from — the thing to check when you did upgrade but a stale shim still owns your `PATH`.

It asks the registry in `npm_config_registry` when npm exports it, and `https://registry.npmjs.org` otherwise. No `.npmrc` is read: letting file contents choose where an outbound request goes is a flow worth avoiding, and a project's `.npmrc` travels with the repository. On a private mirror, export `npm_config_registry` — or set `OPENSPEC_NO_UPDATE_CHECK` to skip the check entirely. The check is skipped when `CI` is set to anything but an explicit off-value (`false`, `0`, `no`, `off`, or empty), under `NODE_ENV=test`, and whenever `OPENSPEC_NO_UPDATE_CHECK` (any value), `DO_NOT_TRACK=1`, or `OPENSPEC_TELEMETRY=0` is set. It runs before the update and can delay it by at most 1.5 seconds — it gives up after that even when the network drops packets silently, and stays quiet when the registry is unreachable.

**How "up to date" is decided:** skill files record the version that generated
them, so Spectrix compares that against the installed CLI. Command files carry no
version stamp, so for a tool that has commands but no skills (delivery
`commands`), Spectrix compares the file contents against what it would generate
now — edits to those files count as drift and are overwritten. With delivery
`skills` or `both`, only the recorded version is checked, so a hand-edited file
whose version still matches is left alone; use `--force` to rewrite it. Either
way, generated files are Spectrix's to own — keep your own instructions
elsewhere.

---

## Stores (standalone Spectrix repos)

> **Beta.** Stores and the features built on them (references, working context, worksets) are new; command names, flags, file formats, and JSON output may change shape between releases. For the problem-first walkthrough, see the [stores guide](stores-beta/user-guide.md).

A store is a standalone Spectrix repo you've registered on this machine — for example a planning repo or a contracts repo. Registering a store lets normal commands (`list`, `show`, `status`, `validate`, `new change`, `archive`, ...) act in it from anywhere by passing `--store <id>`.

### `spectrix store setup`

Create and register a local store. With no arguments in a terminal,
Spectrix guides the user through setup. Agents and scripts should pass explicit
inputs and use `--json`.

```bash
spectrix store setup [id] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--path <path>` | Folder where the store should live (for example `~/openspec/<id>`) |
| `--remote <url>` | Record the canonical remote in the new store's `store.yaml` |
| `--init-git` | Initialize a Git repository with an initial commit (default) |
| `--no-init-git` | Skip every Git action: no init, no initial commit |
| `--json` | Output JSON |

Non-interactive runs (`--json`, scripts, agents) must pass both the store id and `--path`. In an interactive terminal, setup prompts for the location with an editable suggestion in a visible, user-owned place (for example `~/openspec/<id>`); it never defaults to Spectrix's managed data directory.

Examples:

```bash
spectrix store setup
spectrix store setup team-context
spectrix store setup team-context --path ~/openspec/team-context --no-init-git
spectrix store setup team-context --path ~/openspec/team-context --no-init-git --json
```

### `spectrix store register`

Register an existing local store folder. During the stores beta, a root may be
registered before any changes exist, specs have been applied, or changes have
been archived; in that case `openspec/changes/`, `openspec/specs/`, and
`openspec/changes/archive/` may be absent until normal commands create them.
A config-only repo that declares `store: <id>` remains a pointer to another
store and is not registered as a store root unless that pointer is removed.

```bash
spectrix store register [path] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--id <id>` | Store id; defaults to store metadata or folder name |
| `--yes` | Confirm creating store identity metadata for a healthy Spectrix root |
| `--json` | Output JSON |

### `spectrix store unregister`

Forget a local store registration without deleting files.

```bash
spectrix store unregister <id> [--json]
```

Use this when a store was moved, cloned somewhere else, or should no longer be
shown by Spectrix on this machine.

### `spectrix store remove`

Forget a local store registration and delete its local folder.

```bash
spectrix store remove <id> [--yes] [--json]
```

`remove` shows the exact folder before deleting in an interactive terminal.
Agents, scripts, and JSON callers must pass `--yes` to confirm deletion.
Spectrix refuses to delete a folder that does not contain matching
store metadata.

### `spectrix store list`

List locally registered stores.

```bash
spectrix store list [--json]
spectrix store ls [--json]
```

### `spectrix store doctor`

Check local store registration, metadata, and Git presence.

```bash
spectrix store doctor [id] [--json]
```

Doctor is diagnostic-only; it reports missing roots, metadata mismatches, and invalid local registry state without modifying the store.

### Referencing stores from a project

A project repo can declare which stores its work draws on in `openspec/config.yaml`:

```yaml
schema: spec-driven
references:
  - team-context
```

From then on, `spectrix instructions` output in that repo (both the per-artifact and `apply` surfaces, JSON and human modes) carries an index of each referenced store's specs — spec ids, a one-line summary from each spec's Purpose section, and the fetch command (`spectrix show <spec-id> --type spec --store <id>`). The index is built live from the registered checkout on every run; spec content is never copied into the output.

References are read-only context. They never change where commands act: work stays in the repo's own root, and writing to a referenced store remains an explicit `--store` action. A reference that cannot be resolved (for example, a store not registered on this machine) degrades to a warning in the index with the exact fix, and instructions still generate. `spectrix doctor` reports reference health in one place.

### Recording where a store is cloned from

A store can record its canonical clone source in its committed identity file, so onboarding never dead-ends at "register the store":

```bash
spectrix store setup team-context --path ~/openspec/team-context \
  --remote git@github.com:acme/team-context.git
```

The remote lands in `.openspec-store/store.yaml` inside the initial commit, so every clone is born knowing it. For an existing store, edit `store.yaml` by hand and commit. `store doctor` shows the recorded remote (and the checkout's observed Git origin); setup/register sharing guidance names it; and register records the checkout's origin in the machine-local registry.

A reference declaration can carry the clone source too, so a teammate who doesn't have the store yet gets a complete, pasteable fix (`git clone <remote> <path> && spectrix store register <path> --id <id>`):

```yaml
references:
  - { id: team-context, remote: "git@github.com:acme/team-context.git" }
```

Recording a remote is not sync: Spectrix never clones, pulls, or pushes on its own.

### Declaring a default store

A repo whose planning is fully externalized — no local `openspec/specs/` or `openspec/changes/` — can declare its store once instead of passing `--store` on every command:

```yaml
# openspec/config.yaml (the only file under openspec/)
store: team-context
```

Normal commands then resolve to the declared store automatically; the root banner and JSON `root` block report `source: "declared"` with the store id, and printed hints still carry `--store <id>`. The declaration is a fallback, never an override: explicit `--store` always wins, and a directory with real planning folders ignores the pointer (with a warning). To convert a pointer repo into a local Spectrix root, remove the `store:` line and run `spectrix init` — init refuses to scaffold while the declaration is present.

A machine-level variant covers every repo at once: `spectrix config set defaultStore <id>` (see Configuration). It is consulted only after `--store`, a local root, and a project pointer have all failed to resolve; the root banner and JSON `root` block then report `source: "global_default"`.

## Doctor (relationship health)

One read-only question, one place: is the Spectrix root healthy, and are the stores it references available on this machine?

```bash
spectrix doctor [--store <id>] [--json]
```

The report separates root health, store metadata health (including a note when the recorded remote and the checkout's origin diverge, and a note when the store checkout has drifted behind its last-fetched upstream tracking ref), and reference health (the same diagnostics instructions show, with clone fixes for unresolved references). Health findings of any severity exit 0 — agents read the `status` arrays; only command failures (no root, unknown store) exit 1. Doctor never clones, syncs, or repairs. To get the assembled set itself rather than its health, use `spectrix context`.

## Working context (the assembled set)

Everything this work relates to through Spectrix declarations, in one working set: the Spectrix root and the stores it references.

```bash
spectrix context [--store <id>] [--json] [--code-workspace <path> [--force]]
```

The JSON brief is agent-consumable (each available referenced store carries its fetch recipe; unresolved members carry the same fixes instructions and doctor show). `--code-workspace` additionally writes a VS Code workspace file containing the root plus the available referenced stores (`ref:<id>` folders) — the one write this command performs, refused without `--force` if the file exists. Unavailable members are reported, never guessed at.

"Working context" is the assembled set; the `context:` field in `openspec/config.yaml` is project background injected into instructions — two different things. `spectrix doctor` answers whether the set is healthy; `spectrix context` answers what the set is.

## Personal worksets

> **Beta.** Worksets are part of the new beta surface; commands, flags, and file formats may change shape between releases. For the walkthrough, see the [stores guide](stores-beta/user-guide.md#worksets-reopen-the-folders-you-work-on-together).

A workset is a personal, named view of the folders you work on together — a planning root plus whatever else you choose — kept on your machine and reopened by name in your tool. It is purely local: never committed, never shared, never derived from declarations, and removing one never touches a member folder.

```bash
spectrix workset create [name] [--member <path> | --member <name>=<path>]... [--tool <id>] [--json]
spectrix workset list [--json]
spectrix workset open <name> [--tool <id>]
spectrix workset remove <name> [--yes] [--json]
```

`create` runs a short guided flow (or takes `--member` flags non-interactively; the first member is the primary — sessions start there). `open` launches the chosen tool: editors (VS Code, Cursor) open a window with every member and return; CLI agents (Claude Code, codex) take over this terminal as a session with every member attached and no prompt pre-filled, ending when you exit. A member folder missing at open time is skipped with a note; the rest opens. The saved tool preference is overridable per open with `--tool`.

Supporting a new tool is configuration, not code. Every tool is one of two launch styles — `workspace-file` (launched with the generated `.code-workspace`) or `attach-dirs` (one attach flag per member) — and the `openers` key in the global `config.json` (open it with `spectrix config edit`) adds tools or adjusts built-ins per field:

```json
{
  "openers": {
    "zed": { "style": "workspace-file" },
    "claude": { "attach_flag": "--dir" }
  }
}
```

All workset state lives under the global data dir's `worksets/` folder (the saved views plus the generated `<name>.code-workspace` files, regenerated on every open); deleting that folder removes every trace.

---

## Browsing Commands

### `spectrix list`

List changes or specs in your project.

```
spectrix list [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--specs` | List specs instead of changes |
| `--changes` | List changes (default) |
| `--sort <order>` | Sort by `recent` (default) or `name` |
| `--json` | Output as JSON |

**Examples:**

```bash
# List all active changes
spectrix list

# List all specs
spectrix list --specs

# JSON output for scripts
spectrix list --json
```

**Output (text):**

```
Changes:
  add-dark-mode     No tasks      just now
```

---

### `spectrix view`

Display an interactive dashboard for exploring specs and changes.

```
spectrix view
```

Opens a terminal-based interface for navigating your project's specifications and changes.

---

### `spectrix show`

Display details of a change or spec.

```
spectrix show [item-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `item-name` | No | Name of change or spec (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--type <type>` | Specify type: `change` or `spec` (auto-detected if unambiguous) |
| `--json` | Output as JSON |
| `--no-interactive` | Disable prompts |

**Change-specific options:**

| Option | Description |
|--------|-------------|
| `--deltas-only` | Show only delta specs (JSON mode) |

**Spec-specific options:**

| Option | Description |
|--------|-------------|
| `--requirements` | Show only requirements, exclude scenarios (JSON mode) |
| `--no-scenarios` | Exclude scenario content (JSON mode) |
| `-r, --requirement <id>` | Show specific requirement by 1-based index (JSON mode) |

**Examples:**

```bash
# Interactive selection
spectrix show

# Show a specific change
spectrix show add-dark-mode

# Show a specific spec
spectrix show auth --type spec

# JSON output for parsing
spectrix show add-dark-mode --json
```

---

## Validation Commands

### `spectrix validate`

Validate changes and specs for structural issues, and check a change's MODIFIED requirements against the main specs they would replace.

```
spectrix validate [item-name] [options]
```

A change with zero spec deltas fails validation unless its `.openspec.yaml` declares `skip_specs: true` (for pure refactors, tooling, or docs work — see [Recipe 5](examples.md#recipe-5-a-refactor-with-no-behavior-change)).

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `item-name` | No | Specific item to validate (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | Validate all changes and specs |
| `--changes` | Validate all changes |
| `--specs` | Validate all specs |
| `--type <type>` | Specify type when name is ambiguous: `change` or `spec` |
| `--strict` | Enable strict validation mode |
| `--json` | Output as JSON |
| `--concurrency <n>` | Max parallel validations (default: 6, or `OPENSPEC_CONCURRENCY` env) |
| `--no-interactive` | Disable prompts |

**Examples:**

```bash
# Interactive validation
spectrix validate

# Validate a specific change
spectrix validate add-dark-mode

# Validate all changes
spectrix validate --changes

# Validate everything with JSON output (for CI/scripts)
spectrix validate --all --json

# Strict validation with increased parallelism
spectrix validate --all --strict --concurrency 12
```

**Output (text):**

```
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
```

**Output (JSON):**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## Lifecycle Commands

### `spectrix archive`

Archive a completed change and merge delta specs into main specs.

```
spectrix archive [change-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `change-name` | No | Change to archive (prompts if omitted; required when nothing can answer the prompt) |

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts. Required when nothing can answer them — an AI agent, a CI job, or any run with stdin closed |
| `--skip-specs` | Skip spec updates for one archive run. A change that permanently has no spec deltas should declare `skip_specs: true` in its `.openspec.yaml` instead — it archives with no flag |
| `--no-validate` | Skip validation (requires confirmation) |

**Examples:**

```bash
# Interactive archive (asks which change, then confirms)
spectrix archive

# Archive specific change
spectrix archive add-dark-mode

# Archive without prompts (agents, CI, scripts)
spectrix archive add-dark-mode --yes

# Archive a tooling change that doesn't affect specs
spectrix archive update-ci-config --skip-specs
```

**What it does:**

1. Validates the change (unless `--no-validate`)
2. Prompts for confirmation (unless `--yes`)
3. Merges delta specs into `openspec/specs/`
4. Moves change folder to `openspec/changes/archive/YYYY-MM-DD-<name>/`

**Without a terminal:** an AI agent, a CI job, or any run with stdin closed cannot
answer step 2, so archive stops before touching anything, exits 1, and names the
command to rerun — `spectrix archive <name> --yes`, carrying whatever other flags
you passed. Pass `--yes` (and the change name) up front to skip the round trip.

---

## Workflow Commands

These commands support the artifact-driven OTRIX workflow. They're useful for both humans checking progress and agents determining next steps.

### `spectrix new change`

Create a change directory and optional checked-in metadata in the resolved Spectrix root.

```bash
spectrix new change <name> [options]
```

Change names must use lowercase kebab-case: lowercase letters, numbers, and
single hyphens. They cannot contain spaces, underscores, uppercase letters,
consecutive hyphens, or leading/trailing hyphens. A leading number is allowed,
so you can prefix names to order or tier changes, for example `100-add-feature`
or `00001-add-auth`.

**Options:**

| Option | Description |
|--------|-------------|
| `--description <text>` | Description to add to `README.md` |
| `--goal <text>` | Optional goal metadata to store with the change |
| `--schema <name>` | Workflow schema to use |
| `--store <id>` | Store id to use as the Spectrix root (a store is a standalone Spectrix repo you've registered) |
| `--json` | Output JSON |

Examples:

```bash
spectrix new change add-billing-api
spectrix new change add-billing-api --store team-context --json
```

### `spectrix status`

Display artifact completion status for a change.

```
spectrix status [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--change <id>` | Change name (prompts if omitted) |
| `--schema <name>` | Schema override (auto-detected from change's config) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Interactive status check
spectrix status

# Status for specific change
spectrix status --change add-dark-mode

# JSON for agent use
spectrix status --change add-dark-mode --json
```

**Output (text):**

```
Change: add-dark-mode
Schema: spec-driven
Progress: 2/4 artifacts complete

[x] proposal
[x] specs
[ ] design
[-] tasks (blocked by: design)
```

A change that declares `skip_specs: true` shows its specs stage as `[~] specs (skipped: change declares skip_specs)` and excludes it from the progress count.

**Output (JSON):**

```json
{
  "changeName": "add-dark-mode",
  "schemaName": "spec-driven",
  "isComplete": false,
  "applyRequires": ["tasks"],
  "artifacts": [
    {"id": "proposal", "outputPath": "proposal.md", "status": "done", "requires": []},
    {"id": "specs", "outputPath": "specs/**/*.md", "status": "done", "requires": ["proposal"]},
    {"id": "design", "outputPath": "design.md", "status": "ready", "requires": ["proposal"]},
    {"id": "tasks", "outputPath": "tasks.md", "status": "blocked", "requires": ["specs", "design"], "missingDeps": ["design"]}
  ]
}
```

Artifacts are listed in dependency order - a dependency never appears after
something that requires it - and artifacts that become ready at the same time
(spec-driven's `specs` and `design` both need only `proposal`) keep the order the
schema declares them rather than an alphabetical one. So the first `ready` entry
is the artifact to write next.

---

### `spectrix instructions`

Get enriched instructions for creating an artifact or applying tasks. Used by AI agents to understand what to create next.

```
spectrix instructions [artifact] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `artifact` | No | Artifact ID, or workflow input surface: `apply` or `archive` |

**Options:**

| Option | Description |
|--------|-------------|
| `--change <id>` | Change name (required in non-interactive mode) |
| `--schema <name>` | Schema override |
| `--json` | Output as JSON |

**Special cases:** Use `apply` to get task implementation instructions. Use
`archive` to fetch current, read-only archive inputs (`context` and
`operationGuidance`) for a valid change; it does not archive or mutate anything.

**Examples:**

```bash
# Get instructions for next artifact
spectrix instructions --change add-dark-mode

# Get specific artifact instructions
spectrix instructions design --change add-dark-mode

# Get apply/implementation instructions
spectrix instructions apply --change add-dark-mode

# Get current archive operation inputs without archiving
spectrix instructions archive --change add-dark-mode --json

# JSON for agent consumption
spectrix instructions design --change add-dark-mode --json
```

**Output includes:**

- Template content for the artifact
- Project context from config
- Content from dependency artifacts
- Per-artifact rules from config
- Current project context and matching operation guidance for `apply`/`archive`

Operation inputs are read from the resolved repo or selected store on every
invocation. Project context is a required prompt-level input: agents read it and
apply relevant project facts, conventions, and constraints. Operation guidance is
optional additive advice: agents consider every entry and follow only entries that
are applicable and compatible with the built-in workflow. Both fields remain
separate from explicit user choices, CLI-controlled state, built-in instructions,
and artifact rules. Conflicting context is reported; conflicting or inapplicable
guidance is not followed and the reason is explained. These are behavioral
contracts for generated agents, not enforceable CLI checks. `instructions archive`
returns only the selected change, optional inputs, and root metadata; it does not
include the static archive workflow.

For an artifact skipped via `skip_specs: true`, the output is a warning only (JSON adds `skipped`/`warning` fields) — the artifact must not be created.

---

### `spectrix templates`

Show resolved template paths for all artifacts in a schema.

```
spectrix templates [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--schema <name>` | Schema to inspect (default: `spec-driven`) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Show template paths for default schema
spectrix templates

# Show templates for custom schema
spectrix templates --schema my-workflow

# JSON for programmatic use
spectrix templates --json
```

**Output (text):**

```
Schema: spec-driven

Templates:
  proposal  → ~/.openspec/schemas/spec-driven/templates/proposal.md
  specs     → ~/.openspec/schemas/spec-driven/templates/specs.md
  design    → ~/.openspec/schemas/spec-driven/templates/design.md
  tasks     → ~/.openspec/schemas/spec-driven/templates/tasks.md
```

---

### `spectrix schemas`

List available workflow schemas with their descriptions and artifact flows.

```
spectrix schemas [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Example:**

```bash
spectrix schemas
```

**Output:**

```
Available schemas:

  spec-driven (package)
    The default spec-driven development workflow
    Flow: proposal → specs → design → tasks

  my-custom (project)
    Custom workflow for this project
    Flow: research → proposal → tasks
```

---

## Schema Commands

Commands for creating and managing custom workflow schemas.

### `spectrix schema init`

Create a new project-local schema.

```
spectrix schema init <name> [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Schema name (kebab-case) |

**Options:**

| Option | Description |
|--------|-------------|
| `--description <text>` | Schema description |
| `--artifacts <list>` | Comma-separated artifact IDs (default: `proposal,specs,design,tasks`) |
| `--default` | Set as project default schema |
| `--no-default` | Don't prompt to set as default |
| `--force` | Overwrite existing schema |
| `--json` | Output as JSON |

**Examples:**

```bash
# Interactive schema creation
spectrix schema init research-first

# Non-interactive with specific artifacts
spectrix schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**What it creates:**

```
openspec/schemas/<name>/
├── schema.yaml           # Schema definition
└── templates/
    ├── proposal.md       # Template for each artifact
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `spectrix schema fork`

Copy an existing schema to your project for customization.

```
spectrix schema fork <source> [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `source` | Yes | Schema to copy |
| `name` | No | New schema name (default: `<source>-custom`) |

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing destination |
| `--json` | Output as JSON |

**Example:**

```bash
# Fork the built-in spec-driven schema
spectrix schema fork spec-driven my-workflow
```

---

### `spectrix schema validate`

Validate a schema's structure and templates.

```
spectrix schema validate [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Schema to validate (validates all if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--verbose` | Show detailed validation steps |
| `--json` | Output as JSON |

**Example:**

```bash
# Validate a specific schema
spectrix schema validate my-workflow

# Validate all schemas
spectrix schema validate
```

---

### `spectrix schema which`

Show where a schema resolves from (useful for debugging precedence).

```
spectrix schema which [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Schema name |

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | List all schemas with their sources |
| `--json` | Output as JSON |

**Example:**

```bash
# Check where a schema comes from
spectrix schema which spec-driven
```

**Output:**

```
spec-driven resolves from: package
  Source: /usr/local/lib/node_modules/@dadosh1984/spectrix/schemas/spec-driven
```

**Schema precedence:**

1. Project: `openspec/schemas/<name>/`
2. User: `~/.local/share/openspec/schemas/<name>/`
3. Package: Built-in schemas

---

## Configuration Commands

### `spectrix config`

View and modify global Spectrix configuration.

```
spectrix config <subcommand> [options]
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `path` | Show config file location |
| `list` | Show all current settings |
| `get <key>` | Get a specific value |
| `set <key> <value>` | Set a value |
| `unset <key>` | Remove a key |
| `reset` | Reset to defaults |
| `edit` | Open in `$EDITOR` |
| `profile [preset]` | Configure workflow profile interactively or via preset |

**Examples:**

```bash
# Show config file path
spectrix config path

# List all settings
spectrix config list

# Get a specific value
spectrix config get telemetry.enabled

# Set a value
spectrix config set telemetry.enabled false

# Set a string value explicitly
spectrix config set user.name "My Name" --string

# Remove a custom setting
spectrix config unset user.name

# Set a machine-level default store (fallback root when no --store,
# local root, or project store: pointer resolves)
spectrix config set defaultStore team-plans

# Reset all configuration
spectrix config reset --all --yes

# Edit config in your editor
spectrix config edit

# Configure profile with action-based wizard
spectrix config profile

# Fast preset: switch workflows to core (keeps delivery mode)
spectrix config profile core
```

`spectrix config profile` starts with a current-state summary, then lets you choose:
- Change delivery + workflows
- Change delivery only
- Change workflows only
- Keep current settings (exit)

If you keep current settings, no changes are written and no update prompt is shown.
If there are no config changes but the current project files are out of sync with your global profile/delivery, Spectrix will show a warning and suggest `spectrix update`.
Pressing `Ctrl+C` also cancels the flow cleanly (no stack trace) and exits with code `130`.
In the workflow checklist, `[x]` means the workflow is selected in global config. To apply those selections to project files, run `spectrix update` (or choose `Apply changes to this project now?` when prompted inside a project).

**Interactive examples:**

```bash
# Delivery-only update
spectrix config profile
# choose: Change delivery only
# choose delivery: Skills only

# Workflows-only update
spectrix config profile
# choose: Change workflows only
# toggle workflows in the checklist, then confirm
```

---

## Utility Commands

### `spectrix feedback`

Submit feedback about Spectrix. Creates a GitHub issue.

```
spectrix feedback <message> [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `message` | Yes | Feedback message |

**Options:**

| Option | Description |
|--------|-------------|
| `--body <text>` | Detailed description |

**Requirements:** GitHub CLI (`gh`) must be installed and authenticated.

**Example:**

```bash
spectrix feedback "Add support for custom artifact types" \
  --body "I'd like to define my own artifact types beyond the built-in ones."
```

---

### `spectrix completion`

Manage shell completions for the Spectrix CLI.

```
spectrix completion <subcommand> [shell]
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `generate [shell]` | Output completion script to stdout |
| `install [shell]` | Install completion for your shell |
| `uninstall [shell]` | Remove installed completions |

**Supported shells:** `bash`, `zsh`, `fish`, `powershell`

**Examples:**

```bash
# Install completions (auto-detects shell)
spectrix completion install

# Install for specific shell
spectrix completion install zsh

# Generate script for manual installation
spectrix completion generate bash > ~/.bash_completion.d/openspec

# Uninstall
spectrix completion uninstall
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failure, missing files, etc.) |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENSPEC_TELEMETRY` | Set to `0` to disable telemetry and the `spectrix update` version check |
| `DO_NOT_TRACK` | Set to `1` to disable telemetry and the `spectrix update` version check (standard DNT signal) |
| `OPENSPEC_CONCURRENCY` | Default concurrency for bulk validation (default: 6) |
| `EDITOR` or `VISUAL` | Editor for `spectrix config edit` |
| `NO_COLOR` | Disable color output when set |
| `OPENSPEC_NO_ANIMATION` | Disable the `spectrix init` welcome animation when set |
| `OPENSPEC_NO_UPDATE_CHECK` | Disable the `spectrix update` check for a newer published CLI when set (any value, including empty). Also skipped when `CI` is set (unless `false`/`0`/`no`/`off`) or `NODE_ENV=test` |
| `npm_config_registry` | Registry the `spectrix update` version check asks. Must be an `http(s)` URL or it falls back to `https://registry.npmjs.org`. No `.npmrc` file is read |

---

## Related Documentation

- [Commands](commands.md) - AI slash commands (`/otrix:propose`, `/otrix:apply`, etc.)
- [Workflows](workflows.md) - Common patterns and when to use each command
- [Customization](customization.md) - Create custom schemas and templates
- [Getting Started](getting-started.md) - First-time setup guide
