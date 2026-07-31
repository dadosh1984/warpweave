# Proposal: Rename CLI and command namespace to Spectrix / OTRIX

## Why

The fork is published as `@dadosh1984/spectrix` and its repository is `dadosh1984/spectrix`, but the CLI command, the docs, and the slash-command namespace still spelled the upstream names (`openspec`, `/otrix:*`). The user asked for the visible surface to carry the fork's own brand:

1. The CLI command and all user-facing text must read `spectrix`, not `openspec` ("должен быть spectrix init, а не openspec init").
2. The skill / slash-command namespace must read `otrix`, not `opsx` ("вместо opsx необходимо переименовать на otrix").

This change records that work after the fact: the implementation shipped as `@dadosh1984/spectrix@1.9.0` (CLI rename) and `@dadosh1984/spectrix@1.10.0` (command namespace rename). The delta specs below capture the resulting main-spec state.

## What Changes

Two renames, applied to the fork after the initial 1.8.0 publish:

1. **`openspec` → `spectrix`** (user-facing surface only): `bin/openspec.js` → `bin/spectrix.js`, commander root name, every help/error/deprecation string, completion scripts (bash/fish/zsh/powershell), docs, website, README, AGENTS.md, generated `skills/` content (regenerated via `pnpm generate:skills`), golden parity hashes. The data format is untouched: `openspec/` directories, `OPENSPEC_*` env vars, `.openspec.yaml`, `format: 'openspec'`, skill IDs `openspec-*`, and upstream `Fission-AI/OpenSpec` links all stay.

2. **`opsx` → `otrix`** (slash-command namespace): command IDs (`/opsx:propose` → `/otrix:propose`), display names (`OPSX: Propose` → `OTRIX: Propose`), generated paths (`.claude/commands/opsx/<id>.md` → `.claude/commands/otrix/<id>.md` and per-tool equivalents), mention form (`@opsx-*` → `@otrix-*`), docs/website/specs/tests, spec dirs `opsx-{archive,onboard,verify}-skill` → `otrix-*`, glossary term, and markdown anchors. Internal `Opsx*` TypeScript template-class identifiers are kept as implementation detail (same convention as the spectrix rename: identifiers stay, user-facing surface changes).

Notable follow-on fixes that the renames surfaced:

- `check:pack-version` did not run on Windows (npm requires a shell, `node.exe` must not get one); fixed with per-call `useShell` and the packed-CLI path now points at `@dadosh1984/spectrix`.
- The welcome screen's quick-start row grew past the 59-char width budget once `/otrix:continue` became `/otrix:continue` (one char longer); fixed by dropping `padEnd(commandWidth + 1)`.
- Golden template parity hashes regenerated after the workflow/command templates changed.

## Capabilities

### New Capabilities

None — this is a rename, not a new feature.

### Modified Capabilities

The following main specs are modified by the rename (see delta specs in `specs/`):

- `command-generation` — adapter file paths and frontmatter names now use `otrix` (`/otrix:<id>`, `.claude/commands/otrix/`, `.cursor/commands/otrix-<id>.md`, …).
- `cli-init`, `cli-update`, `legacy-cleanup` — help/instructions and generated-command references now spell `otrix`.
- `otrix-archive-skill`, `otrix-onboard-skill`, `otrix-verify-skill` — renamed from `otrix-*`; all `/otrix:` references now `/otrix:`.
- `specs-sync-skill` — command references updated.

### Deliberately not changed

- Data layout and config namespaces: `openspec/` change dirs, `OPENSPEC_*` env, `.openspec.yaml`, `[openspec]`/`system: openspec` in unified configs.
- Skill IDs `openspec-*` (a skill registry namespace, not the CLI command).
- Upstream provenance: `Fission-AI/OpenSpec` links, historical CHANGELOG entries, archived change records.
- Published tag placement: `v1.8.0` stays on its publish commit; `v1.9.0` and `v1.10.0` are separate publish tags.
