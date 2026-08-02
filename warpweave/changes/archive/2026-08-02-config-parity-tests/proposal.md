## Why

The rebrand regressions in `config/unified.toml` and `config/pipeline.yaml` (stale `[openspec]` section, dead `/opsx:` namespace, nonexistent skill names, jest reference) went undetected because `init.test.ts` only asserts the config files *exist* after `init` — it never validates their *content*. Without content-level coverage, stale names slip through silently. This change adds a parity test that guards the shipped config content against the canonical command namespace and shipped skill names.

## What Changes

- Add `test/core/config-parity.test.ts` (or extend `unified-config.test.ts`) that:
  - Loads `config/unified.toml` and asserts it declares a `[warpweave]` section (not `[openspec]`).
  - Loads `config/pipeline.yaml` and asserts:
    - no `/opsx:` references anywhere (namespace must be `/ww:`);
    - the plan/execute phase skill names resolve to real shipped skills (checked against `src/core/templates/workflows/` template names);
    - no `jest` reference (the runner is vitest);
    - the pipeline `version` equals `package.json` version.
  - Uses `path.join()`/`import.meta.url` to resolve the `config/` dir cross-platform, mirroring `src/core/init.ts:copyUnifiedConfig` resolution.
- Assert that any skill identifier appearing in the pipeline resolves to an existing template in `src/core/templates/workflows/` (guards future renames).

No production code changes — test-only.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- (none — test-only change, `skip_specs: true`)

## Impact

- `test/core/config-parity.test.ts` (new) or `test/core/unified-config.test.ts` (extended).
- Reference: canonical namespace in `src/utils/command-references.ts`, template names in `src/core/templates/workflows/`.
- CI runs the full vitest suite, so this guards every future config edit.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the config regression escaped twice; content coverage is the fix |
| Existing code reuse? | Yes — pattern-mirror `skillssh-parity.test.ts` / `skill-templates-parity.test.ts`; reuse `command-references.ts` |
| Stdlib? | Yes — `node:fs` + `node:assert` for reading/asserting files |
| Native platform? | Yes — resolve `config/` via `import.meta.url` like the production code does |
| New dependency? | No — vitest already present |

## Complexity

Complexity: **normal**
