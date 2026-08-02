# Ponytail Code Audit

**Snapshot:** 2026-08-02 · **warpweave:** 1.3.1 · **Scope:** `src/`, `test/`, `scripts/`

Audit against the Ponytail YAGNI ladder (rungs 1–7). This is a read-only analysis — no source files were modified. Findings are grouped by ladder rung and ranked in the [Priority table](#priority-table) at the end.

## Inventory

| Area | Files | Lines |
|------|------:|------:|
| `src/` | 200 | 41,204 |
| `test/` | 128 | 48,972 |
| `scripts/` | 6 | 558 |
| **Total** | **334** | **90,734** |

Largest `src/` files: `store/operations.ts` (1230), `init.ts` (1174), `update.ts` (1062), `commands/schema.ts` (1018), `legacy-cleanup.ts` (991).

## Findings by Ladder Rung

### Rung 1 — YAGNI (does this need to exist?)

**No dead files found in `src/`.** Every candidate export/file flagged by the scan (barrel `index.ts` files, `core/config.ts`, `utils/match.ts`, `utils/interactive.ts`, `validation/types.ts`, `store/errors.ts`, `store/index.ts`, `schemas/index.ts`, `change-metadata/index.ts`, `tessl-registry/types.ts`) is referenced — either directly via `.js` ESM imports or re-exported through a barrel. The `tessl-registry/types.ts` file is imported only through `tessl-registry/index.ts` but is a live type module.

**No dead test helpers.** All 7 `test/helpers/*.ts` files are imported: `run-cli` (21), `temp-cleanup` (11), `openspec-fixtures` (10), `fs-snapshot` (6), `store-git` (5), `fake-tool` (2), `path-env` (1).

**No unreachable branches spotted** in the `if/return` guard-clause scans.

> **Verdict:** Rung 1 is clean. The tree is genuinely free of dead files.

### Rung 2 — Reuse (already in this codebase?)

**F1 · Duplicate `printJson`** — `src/commands/workflow/shared.ts:74` is an identical copy of `src/commands/shared-output.ts:9`. The `workflow/shared.ts` copy is imported only by `src/commands/workflow/new-change.ts:24`. The canonical home is `shared-output.ts` (used by `doctor`, `context`, `workset`, `drift-check`, `store`).
> **Fix direction:** have `new-change.ts` import `printJson` from `shared-output.js` and delete the duplicate. **Effort:** one-liner.

**F2 · Duplicated `DEFAULT_SCHEMA` constant** — `'spec-driven'` is defined three times:
- `src/commands/workflow/shared.ts:68` — exported, re-exported through `workflow/index.ts:26`
- `src/core/init.ts:72` — local copy
- `src/utils/change-utils.ts:14` — local copy

And inlined as a literal in `src/core/root-selection.ts:66,127` and `src/core/unified-config.ts:54`.
> **Fix direction:** import the exported `DEFAULT_SCHEMA` from `workflow/index.js` (or move it to a shared constants module) instead of re-declaring it. **Effort:** low, touches 5 files.

**No other duplicate logic blocks found.** The `resolve*`/`build*`/`format*` function groups showed no repeated definitions. `validateChangeExists`/`getAvailableChanges` in `workflow/shared.ts` are single definitions imported by several commands — correct reuse.

### Rung 3 — Stdlib

**Dependencies do not reimplement stdlib.** Reviewed all 10 production dependencies:
- `smol-toml` — Node stdlib has no TOML parser; used in `unified-config.ts:3`. Justified.
- `yaml` — same, YAML parsing. Justified.
- `fast-glob` — glob patterns (`specs/**/*.md`) are not stdlib; used in `artifact-graph/outputs.ts:3`. Justified.
- `cross-spawn` — resolves npm's shim on Windows (`version-check.ts:525`); Node's `child_process.spawn` needs the shell shim workaround. Justified.
- `chalk`, `commander`, `ora`, `zod`, `@inquirer/*` — UI/CLI/validation layers with no stdlib equivalent.

### Rung 4 — Native platform

**No hardcoded-slash path bugs found.** POSIX-form relative paths (`warpweave/specs`, `warpweave/changes/archive` in `core/warpweave-root.ts:15-17,34-38`) are used strictly as identifiers and display strings — every filesystem access goes through `path.join(storeRoot, rel.*)` (e.g., `warpweave-root.ts:130,165,187,252`), and display paths pass through `FileSystemUtils.toPosixPath`. `version-check.ts:407` correctly uses `path.sep`. `specs-apply.ts:54` and `validator.ts:292` split capability ids on `/` (logical separators), not filesystem paths.

> **Verdict:** cross-platform discipline is well-maintained (205 `path.join`, 37 `path.resolve`).

### Rung 6 — One-liner

**No anti-patterns found.** No `return x ? true : false`, no `.filter(...).length > 0` (would be `.some(...)`), no redundant ternaries. Guard-clause style (`if (x) return false;`) is consistent and idiomatic. `isGhInstalled`/`isGhAuthenticated` (`commands/feedback.ts:13-33`) are idiomatic try/catch → boolean, not collapsible without losing clarity.

### Rung 7 — Minimum

**Ceremony around simple lookups is absent.** Lookups use explicit `.find()`/`.includes()` on lists (`task-progress.ts:74-80`, `change-status-policy.ts:66`, `schema.ts:811`) and a single source of truth for store-aware command lists (`templates/workflows/store-selection.ts`). The one prefix match on a path category — `generates.startsWith('specs/')` in `instruction-loader.ts:283` — is justified (it targets a category of generated paths, not a fixed list).

## Cross-cutting observation

**Zero `// ponytail:` markers exist in the codebase.** The debt-marker convention is defined in the `warpweave-ponytail-minimal-output` and `warpweave-debt-ledger` skills, but no deliberate simplification has ever been marked. For the two findings above, the follow-up fix should carry markers:

```ts
// ponytail: printJson duplicated in workflow/shared.ts, import from shared-output.js instead
// ponytail: DEFAULT_SCHEMA re-declared in init.ts / change-utils.ts, import the shared constant
```

## Priority Table

| # | Finding | Rung | Effort | Impact | Confidence |
|---|---------|:----:|:------:|:------:|:----------:|
| F1 | Duplicate `printJson` in `workflow/shared.ts:74` | 2 | one-liner | low (dead-by-copy, 1 importer) | high |
| F2 | `DEFAULT_SCHEMA` re-declared in 3 places + 2 literals | 2 | low (5 files) | low-medium (drift risk on rename) | high |
| — | No `// ponytail:` markers anywhere | 6/7 | — | process (debt invisible) | high |

## Recommendations

1. **F1 (do first):** delete `printJson` from `workflow/shared.ts` and import it from `shared-output.js` in `new-change.ts`. Pure removal, no behavior change; `rtk vitest run` to confirm.
2. **F2:** consolidate `DEFAULT_SCHEMA` into the exported constant from `workflow/index.js` (or move to a shared constants module) and import everywhere. Low risk, mechanical.
3. **Process:** adopt `// ponytail:` markers for future deliberate simplifications and run `/ww-debt-ledger` periodically so deferred debt is visible.

> All line references are from the 2026-08-02 snapshot and may drift with later commits — re-verify with `rtk grep -n "<finding>" <file>` before acting.
