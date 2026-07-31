# Design: Rename CLI and command namespace to Spectrix / OTRIX

## Decision 1 — Rename surface, keep the data format

Only the user-facing surface is renamed. `openspec/` directories, `OPENSPEC_*` env vars, `.openspec.yaml`, `format: 'openspec'`, skill IDs `openspec-*`, unified-config `[openspec]`/`system: openspec` sections, and upstream `Fission-AI/OpenSpec` provenance links remain. Rationale: the data format is a compatibility contract (existing projects keep working), while the command and the docs are the fork's brand.

## Decision 2 — Identifiers stay, strings change

Internal TypeScript identifiers (`classifyOpenSpecDir`, `getOpsxProposeCommandTemplate`, …) are implementation detail and were not renamed. Every user-visible string was. This mirrors the earlier `openspec` → `spectrix` rename in the same repo (option 1 of the agreed scope).

## Decision 3 — opsx → otrix is a mechanical namespace swap

The slash-command namespace is produced by `formatCommandInvocation` (`${prefix}otrix${separator}${commandId}`) and the adapters' `getFilePath` (`.claude/commands/otrix/<id>.md`). Renaming is a plain sweep: `opsx:` → `otrix:`, `opsx-` → `otrix-`, `'opsx'` → `'otrix'` (path segments), `OPSX:`/`OPSX ` → `OTRIX` (display names and glossary term), `opsx/` → `otrix/` (path strings), `#opsx` → `#otrix` (markdown anchors). No runtime branching on the old names remains; existing `commands/opsx/` directories in user projects are left untouched (they keep working under the old spelling in a tool's slash menu).

## Decision 4 — Generated artifacts must be regenerated

- Golden template parity hashes pin every workflow/command template; after the rename they were recomputed with `scripts/regen-parity-hashes.mjs` (build first — the script hard-errors on a stale `dist/`).
- `skills/` is generated output; the spectrix rename regenerated it via `pnpm generate:skills`. The otrix rename does not affect skill content (skill templates reference skill IDs, not slash commands).

## Decision 5 — Welcome screen width budget

The animation's cursor-up count assumes unwrapped lines at MIN_WIDTH = 60. `/otrix:continue` is one char longer than `/otrix:continue`, which pushed the quick-start row from 59 to 60. Fix: drop the `+ 1` from `command.padEnd(commandWidth + 1)` in `src/ui/welcome-screen.ts`; the row stays within budget with unchanged copy and unchanged `DESCRIPTION_BUDGET`.

## Decision 6 — Versioning and tags

User-facing renames ship as minor bumps (changeset convention): `1.9.0` for the CLI rename, `1.10.0` for the command-namespace rename. Tags `v1.9.0`/`v1.10.0` point at their publish commits; `v1.8.0` is not moved.

## Decision 7 — Spec record for this change

The rename is already applied to main specs (it shipped with the releases). This change records it as MODIFIED delta specs whose bodies match the current main specs; the sync step is therefore a no-op ("already synced").
