# Installation

## Prerequisites

- **Node.js 20.19.0 or higher** — Check your version: `node --version`

## Install with your AI assistant

Rather not do this by hand? Paste the prompt below into any coding assistant that can run shell commands — Claude Code, Codex, Cursor, Gemini CLI, Copilot, and the rest of the [supported tools](supported-tools.md). It installs the CLI, initializes this project, and reports back what actually happened.

The manual steps below are the source of truth — the prompt just runs them for you. If your assistant stops and hands something back, that's by design: it asks before anything privileged and never edits your shell startup files. Finish those bits yourself with [Package Managers](#package-managers) and [Troubleshooting](troubleshooting.md).

```text
Install Warpweave in this project and set it up for me. Follow these steps in
order, and stop where a step tells you to stop.

1. RUNTIME. Run `node --version`. Warpweave needs Node.js 20.19.0 or higher. If
   Node is missing or older, say so and stop — don't install Node, switch
   versions, or reconfigure my version manager for me.

2. INSTALL. Use whichever package manager is already on my PATH, preferring npm:
     npm install -g warpweave@latest
     pnpm add -g warpweave@latest
     bun add -g warpweave@latest
     yarn global add warpweave@latest   (Yarn 1.x only)
   Don't pick based on this project's lockfile — a global install has nothing to
   do with how this repo's own dependencies are installed. If none of those four
   is available, stop and tell me — don't improvise an install. (If I'm on Nix,
   point me at the Nix section of the Warpweave installation docs instead.)
   Show me the exact command and let me confirm before you run it; this installs
   software outside the project, and I may want a different package manager to
   own it.
   Stop and ask me again if the install needs sudo or admin rights, fails with a
   permissions error, or reports that its global bin directory is missing or
   unconfigured. Never edit my shell startup files (.bashrc, .zshrc, .profile,
   fish, PowerShell profile), and never run a setup command that edits them for
   me — show me the change and let me make it.

3. PATH. Run `warpweave --version`. If the command isn't found, it may just be
   missing from this shell: tell me where the package manager installed it and
   how to add that directory to PATH for my shell and OS, then stop until I
   confirm. If it prints an older version than the one the install just
   reported, an earlier copy is shadowing it on PATH — tell me both versions
   instead of continuing. If I use a version manager, say so rather than editing
   PATH around it: with nvm or fnm the CLI is tied to the Node version that was
   active when you installed it, and with asdf or volta a shim may need
   regenerating.

4. INITIALIZE. Ask me which AI coding tool or tools I use and map each to an id
   from `warpweave init --help` (Copilot is `github-copilot`, Zoo Code is
   `roocode`). `--tools` takes a comma-separated list, so name all of them.
   `warpweave init --tools <ids>` deletes leftovers from older Warpweave versions
   automatically, without asking — including `ww-*.md` prompt files in my home
   directory (Codex keeps them in ~/.codex/prompts). Before you run it, look for
   those: `.../commands/warpweave/` folders, Warpweave marker blocks in files like
   CLAUDE.md or AGENTS.md, and home-directory `ww-*.md` prompts. List whatever
   you find and wait for my go-ahead; if you find nothing, say so and carry on
   without asking. An existing `warpweave/` folder is not a problem — init
   refreshes it and leaves my specs and changes alone.
   Confirm I'm in the right folder too: init creates `warpweave/` wherever it
   runs, including inside a monorepo package.
   Then run: warpweave init --tools <ids>

5. REPORT. Don't assume what should exist — tell me what init actually printed:
   how many skills and/or commands it created and where, the config file line,
   any "Setup required" note, and what to restart or reload. Some tools are
   skills-only and correctly create zero command files, so missing commands is
   not a failure on its own. If init said nothing was generated, relay the fix
   it suggested instead of retrying. Finish by telling me how to invoke OpenSpec
   in my tool, and take the exact spelling from the files init created rather
   than from its summary line: the punctuation differs per tool (/ww:propose
   in some, /ww-propose in others, @ww-propose in Amazon Q), and tools that
   get skills instead of commands are invoked by skill name (/warpweave-propose,
   or $warpweave-propose in Codex, or /skill:warpweave-propose in Kimi Code).
```

Nothing in the prompt is vendor-specific: it's plain instructions plus the same commands documented on this page. It works on macOS, Linux, and Windows, and it deliberately stops rather than improvising when a step needs your permission. Your assistant does need to be able to run shell commands — a few IDE integrations can't.

## Package Managers

### npm

```bash
npm install -g warpweave@latest
```

### pnpm

```bash
pnpm add -g warpweave@latest
```

### yarn

```bash
yarn global add warpweave@latest
```

Yarn 2 and later (Berry) removed the `global` command. On those versions, install Warpweave with npm, pnpm, or bun instead — a global CLI doesn't need to share your project's package manager.

### deno

Deno sometimes has issues parsing the @latest tag, but we can specify a version while installing initially.
If that happens, you could try to change the @latest tag with the version, something like `@^1.3.1`

```bash
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.warpweave.dev \
  npm:warpweave@latest
# or
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.warpweave.dev \
  npm:warpweave@^1.3.1
```

Note: If your subcommands launch external tools, like config edit, feedback, or workspace open, you may need a scoped --allow-run=<program>.

### bun

Bun can install Warpweave globally, but Warpweave currently runs on Node.js.
You still need Node.js 20.19.0 or higher available on `PATH`.

```bash
bun add -g warpweave@latest
```

## Nix

Run Warpweave directly without installation:

```bash
nix run github:Fission-AI/OpenSpec -- init
```

Or install to your profile:

```bash
nix profile install github:Fission-AI/OpenSpec
```

Or add to your development environment in `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    warpweave.url = "github:Fission-AI/OpenSpec";
  };

  outputs = { nixpkgs, warpweave, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ warpweave.packages.x86_64-linux.default ];
    };
  };
}
```

## Verify Installation

```bash
warpweave --version
```

## Updating

Upgrade the package, then refresh each project's generated files:

```bash
npm install -g warpweave@latest   # or pnpm/yarn/bun equivalent
warpweave update                              # run inside each project
```

`warpweave update` regenerates the skill and command files for the tools you've configured, so your slash commands stay current with the installed version. It also checks whether a newer CLI has been published and offers to upgrade, since upgrading is what makes new workflows available in the first place — see [CLI Reference](cli.md#warpweave-update).

## Uninstalling

There's no `warpweave uninstall` command, because Warpweave is just a global package plus some files in your project. Removing it is a few manual steps, and nothing here touches your source code.

**1. Remove the global package:**

```bash
npm uninstall -g warpweave   # or: pnpm rm -g / yarn global remove / bun rm -g
```

**2. Remove Warpweave from a project (optional).** Delete the `warpweave/` directory if you no longer want its specs and changes:

```bash
rm -rf warpweave/
```

Think before you do this: `warpweave/specs/` and `warpweave/changes/archive/` are your record of how the system behaves and why it changed. If you might want that history, keep the folder (or keep it in git) even after uninstalling.

**3. Remove generated AI tool files (optional).** Warpweave writes skill and command files into per-tool directories like `.claude/skills/warpweave-*/`, `.cursor/commands/ww-*`, and so on. Delete the `warpweave-*` skills and `ww-*` commands for whichever tools you configured. The exact paths per tool are listed in [Supported Tools](supported-tools.md).

If you also have Warpweave marker blocks in files like `CLAUDE.md` or `AGENTS.md`, remove those blocks by hand; your own content in those files is yours to keep.

## Next Steps

After installing, initialize Warpweave in your project:

```bash
cd your-project
warpweave init
```

See [Getting Started](getting-started.md) for a full walkthrough.
