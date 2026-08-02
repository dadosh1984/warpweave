## Context

See `proposal.md`. The shipped `config/` files are copied verbatim by `src/core/init.ts:copyUnifiedConfig()` into every unified project. The CLI parser already reads `config.warpweave`, and the canonical command namespace lives in `src/utils/command-references.ts`; shipped skill names come from `src/core/templates/workflows/*.ts` (exposed via `getSkillTemplates()` in `src/core/shared/skill-generation.ts`). Existing parity tests (`test/core/templates/skillssh-parity.test.ts`) already read repo files cross-platform via `import.meta.url`-derived `repoRoot`.

> **Ordering dependency:** this change's guards assert the *fixed* config content. It must be applied AFTER `fix-unified-config` (or together, config fix first); applied alone, the test fails on the currently-broken `[openspec]`/`/opsx:` content. The failing test is the RED of the TDD cycle for `fix-unified-config`.

## Goals / Non-Goals

**Goals:**
- Guard `config/unified.toml` + `config/pipeline.yaml` content against rebrand regressions.
- Reuse existing resolution helpers and parity-test patterns rather than inventing new detection.

**Non-Goals:**
- No changes to production parsing code.
- No new dependencies.
- No validation of profile YAML files under `config/profiles/` (out of scope — separate concern).

## Decisions

**D1 — New dedicated test file `test/core/config-parity.test.ts`.**
A separate file (rather than extending `unified-config.test.ts`) mirrors the existing template-parity tests' structure and keeps config-content guards discoverable. It resolves `config/` the same way production does: `join(repoRoot, 'config')` where `repoRoot` is derived from `import.meta.url` (pattern from `skillssh-parity.test.ts:15`).

**D2 — Validate skill identifiers against real templates.**
Parse `pipeline.yaml` with the already-installed `yaml` parser, collect every `*skill*` value, and assert each matches a name from `getSkillTemplates()` (dirName or `name` field). This makes the test fail on any future nonexistent skill reference, not just the current `writing-plans`/`subagent-driven-development` set. Alternative (hardcoded allow-list) rejected: it would itself rot.

**D3 — Validate namespace via explicit asserts, not regex sprawl.**
Assert: no `/opsx:` substring in the file; the spec-phase `entry` contains `/ww:`; no `jest` in `commands_rewritten.npm_test`. Simple `.toContain`/`.not.toContain` matches, matching the codebase's explicit-lookup style (per design rules: prefer explicit lookups over regex).

**D4 — Version equality against package.json.**
Read `package.json` version and assert `pipeline.version === packageJson.version`, so the two cannot drift.

## Risks / Trade-offs

- [Pipeline gains a legitimately-named-but-unshipped skill] → Mitigation: test checks against `getSkillTemplates()`; adding a new workflow template ships it, so the test passes after adding the template. New skill + config update must land together.
- [yaml parse of a future non-YAML file] → Mitigation: read + parse in try/catch with a clear assertion message.
- [Test becomes brittle if config intentionally references external skills] → Mitigation: acceptable today — pipeline references only warpweave skills.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Test file | 2 | Reuse parity-test structure and repoRoot derivation |
| YAML parse | 5 | Reuse installed `yaml` dependency |
| Skill-name validation | 2 | Reuse `getSkillTemplates()` from shared skill-generation |
| Paths | 3 | `node:path` join + `import.meta.url` (stdlib) |
| Asserts | 6 | Explicit `toContain`/`not.toContain` |
