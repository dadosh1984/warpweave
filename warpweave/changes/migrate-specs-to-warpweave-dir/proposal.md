## Why

The repo's tracked planning directory is `openspec/` (real config with context/rules + 36 main specs), but the CLI treats `warpweave/` as canonical: `resolvePlanningDirName` prefers `warpweave/` over legacy `openspec/`, and new installs create `warpweave/`. A local untracked `warpweave/` directory (scaffolded by `init`/`new change`) now shadows the tracked `openspec/`, so `warpweave view` reports 0 specs, MODIFIED-delta validation and archive would run against an empty main-spec tree, and spec content still describes the old `openspec/` layout (e.g. `openspec/config.yaml`, `openspec/schemas/...`) that no longer matches the code's canonical `warpweave/` naming.

## What Changes

- Move main specs `openspec/specs/` → `warpweave/specs/` (36 capabilities).
- Migrate the real config content from `openspec/config.yaml` into `warpweave/config.yaml` (replacing the empty scaffold) - the real `context`/`rules` must not be lost.
- Delete the legacy `openspec/` directory.
- Update this repo's references to its own layout (`openspec/` → `warpweave/`) in docs, `AGENTS.md`, schema templates, and tests that assert the canonical layout. Tests exercising legacy `openspec/` support (e.g. `legacy-cleanup`, `root-selection`) keep their fixtures.
- Correct path references inside the moved main specs so canonical examples and requirements say `warpweave/`, while explicit legacy-support mentions of `openspec/` remain where the code still supports them.
- Verify `warpweave view` shows all specs and the full test suite passes.

No tool behavior changes: the CLI already resolves `warpweave/` as canonical and supports `openspec/` as legacy. This change relocates and corrects this repository's own specs/docs to match that reality, so it sets `skip_specs: true`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None. Behavior is unchanged - this is a repo restructure plus spec-documentation correction, expressed as `skip_specs: true` in `.warpweave.yaml`.

## Impact

- **Moved**: `openspec/specs/*` → `warpweave/specs/*`; real config content `openspec/config.yaml` → `warpweave/config.yaml`.
- **Deleted**: `openspec/` (legacy, after move).
- **Edited**: root `AGENTS.md` and `test/AGENTS.md`, docs referencing the layout, schema template `schemas/spec-driven/templates/proposal.md`, the moved main specs (~25 carry `openspec/` path references), and tests asserting the canonical layout (`init`, `update`, `root-selection`, `list`, `view`, etc.).
- **Verification**: `warpweave view` (spec count), `warpweave validate`, full vitest suite, `npm run lint`.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No - the CLI currently reports 0 specs and future archives would mis-sync against an empty tree. |
| Existing code reuse? | Yes - use `git mv` for relocation; the CLI already reads both directory names. |
| Stdlib? | Yes - filesystem/git operations only, no new dependency. |
| Native platform? | No - no platform feature applies. |
| New dependency? | No - none required. |
