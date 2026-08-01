---
name: warpweave-init-unified
description: Set up the full unified environment in one flow. Use when the user wants to bootstrap a project or machine with Warpweave, RTK, Superpowers, and Ponytail in a single pass.
allowed-tools: Bash(warpweave:*)
license: MIT
compatibility: Requires warpweave CLI and RTK.
metadata:
  author: warpweave
  version: "1.0"
---

Perform the one-shot unified setup for a fresh project.

**Store selection:** If the user names a store (a store is a standalone Warpweave repo registered on this machine) or the work lives in one, run `warpweave store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `view`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `warpweave/` root.

**Input**: A target directory (defaults to the current project root). If a project is already initialized, confirm before re-running.

**Steps**

1. **Install the CLI**

   Run the fork's init in the target directory:
   ```bash
   rtk warpweave init
   ```
   Keep the default `spec-driven` schema.

2. **Copy unified config**

   Verify that `.unified/config/unified.toml` and `.unified/config/pipeline.yaml` were created, plus `AGENTS.md` and `.env.example` at the project root. If any are missing, copy them from the fork's `config/` and root.

3. **Select a profile**

   Ask the user to pick a unified profile:
   - **minimal** — solo developer
   - **standard** — small team (default)
   - **enterprise** — large team with strict gates

   Apply the choice via the profile mechanism (e.g., `UNIFIED_PROFILE=<name>` in `.env`).

4. **Install RTK**

   Install RTK and configure it for the agent:
   ```bash
   rtk install
   rtk init -g --opencode
   ```

5. **Add Superpowers and Ponytail**

   Add the agent plugins/skills to the tool config (`opencode.json` or the equivalent for the active tool):
   - Superpowers: `superpowers@git+https://github.com/obra/superpowers.git`
   - Ponytail: `@dietrichgebert/ponytail`

6. **Verify**

   Run a verification pass:
   ```bash
   rtk warpweave doctor
   ```
   Confirm the unified rules are active (read the generated `AGENTS.md`).

7. **Report**

   ```markdown
   ## Init Unified: <target>

   CLI: <ok>
   Config: <ok / missing: ...>
   Profile: <minimal / standard / enterprise>
   RTK: <ok>
   Plugins: <Superpowers ok / Ponytail ok>
   Verify: <PASS / FAIL — <step>>
   ```

**Heuristics**

- Never overwrite an existing `AGENTS.md` without asking
- On verification failure, report the failing step and the fix, not a generic error
- Keep the default profile standard unless the user chooses otherwise
