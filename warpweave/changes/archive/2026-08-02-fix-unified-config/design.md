## Context

See `proposal.md` — Why. The `config/` directory is the repo-local source of truth for unified-mode template files; `src/core/init.ts:copyUnifiedConfig()` copies `unified.toml` and `pipeline.yaml` verbatim into every `.unified/config/` on `warpweave init`. The generated `skills/` tree is produced from `src/core/templates/workflows/*.ts` (guarded by parity tests), so the drift-detection fix must edit the template, not the generated copy.

## Goals / Non-Goals

**Goals:**
- Make the shipped config content match the actual CLI surface (command namespace, shipped skill names, test runner, version).
- Fix the duplicated step number in the drift-detection skill template at its source.
- Keep behavior identical — zero changes to parsing/runtime code paths.

**Non-Goals:**
- No renaming of internal function names like `getOpsxExploreCommandTemplate` (0 occurrences confirmed on current code — nothing to do).
- No restructuring of the unified config schema, no `[openspec]` backward-compat shim. The `[openspec]` section is dead config: `formatUnifiedConfigSummary` reads `config.warpweave`, and no reader consumes `config.openspec`, so renaming is safe and additive.
- No parity test in this change (separate change `config-parity-tests`).

## Decisions

**D1 — Rename `[openspec]` → `[warpweave]` in `config/unified.toml`.**
`src/core/unified-config.ts` reads `config.warpweave.schema` / `.profile`; the shipped file declares `[openspec]` so `warpweave config list` silently drops the `schema:`/`profile:` line. Renaming restores it. Alternative (add a `[warpweave]` section alongside `[openspec]`) rejected: it leaves dead config and two sources of truth. Verified: `rg "[openspec]"` across `src/` shows no reader of the old key.

**D2 — Replace stale identifiers in `config/pipeline.yaml`.**
- `/opsx:explore OR /opsx:propose` → `/ww:explore OR /ww:propose` (canonical namespace per `src/utils/command-references.ts` and README).
- `skill: writing-plans` → `warpweave-propose` (real shipped planning skill).
- execute `skills: [subagent-driven-development, test-driven-development, quality-ladder]` → `[warpweave-superpowers-tdd, warpweave-ponytail-minimal-output]` (verified template names).
- `npm_test: "rtk jest OR rtk vitest"` → `"rtk vitest"` (project uses vitest; jest is absent).
- `version: "1.0.0"` → `"1.3.1"` (matches package.json).

**D3 — Fix duplicated step number in `src/core/templates/workflows/drift-detection.ts`.**
The template contains two bodies (skill-bundled and command-bundled), each with a "5. Report findings" and "5. Offer resolution". Renumber the second to "6." in both bodies. The generated `skills/` copy regenerates on next `warpweave update --force`; parity tests will keep them in sync.

## Risks / Trade-offs

- [Any consumer parsing `[openspec]` from a previously-init'd project] → Mitigation: no reader of `config.openspec` exists in `src/`; the rename only affects newly-copied files going forward.
- [Drift between template and generated skills until regeneration] → Mitigation: parity tests (`skillssh-parity.test.ts`, `skill-templates-parity.test.ts`) fail if they diverge; run `warpweave update --force` after merge to regenerate.
- [`rtk vitest` string could drift if runner changes] → Mitigation: acceptable; runner change would be a larger change touching pipeline semantics.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Config rename | 2 | Reuse existing `config.warpweave` key the parser already reads; no new schema |
| Slash commands | 2 | Reuse canonical `/ww:` namespace already in `command-references.ts` |
| Skill names | 2 | Reuse real shipped skill names verified from templates |
| Version bump | 2 | Reuse package.json version as source of truth |
| Step renumber | 6 | One-line edits in template bodies |
