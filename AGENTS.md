# warpweave Unified — Agent Instructions

> This file is BOTH the workflow philosophy the shipped CLI installs for users
> (kept in `files` on publish) AND the operating contract for agents working in
> **this repo** (the warpweave CLI implementation). Sections 1-6 + release
> process are the user-facing doctrine; the **"Developing warpweave itself"**
> section below is repo-specific and changes how you actually work here.

You operate as a single organism with four integrated systems.
Every action passes through all four layers. Never skip a layer.

## Layer 1: SPEC GATE (warpweave)

Before writing ANY code:
1. Check if an approved spec exists in `warpweave/changes/<name>/specs/`
2. If no spec: run `/ww:propose` first. No exceptions.
3. Specs are plain Markdown with GIVEN/WHEN/THEN scenarios.
4. The human approves specs before implementation begins.

## Layer 2: PROCESS (Superpowers)

After spec approval:
1. Decompose into tasks (2-5 minutes each)
2. Each task has: exact file paths, spec scenario, ladder rung, test, RTK verify
3. Execute via subagent-driven-development
4. TDD cycle: write failing test → watch it fail → minimal code → pass → commit
5. Two-stage review after each task: spec compliance, then code quality

## Layer 3: MINIMAL OUTPUT (Ponytail)

Before writing each line, climb the ladder. Stop at the first rung that holds:
1. Does this need to exist? No → skip (YAGNI)
2. Already in this codebase? → reuse
3. Stdlib does it? → use stdlib
4. Native platform feature? → use it
5. Installed dependency? → use it
6. One line? → one line
7. Only then: the minimum that works

Never cut: validation, error handling, security, accessibility.
Mark deliberate simplifications: `// ponytail: <reason>`

## Layer 4: COMPRESSED FEEDBACK (RTK)

All shell commands run through RTK:
- `git status` → `rtk git status`
- `cargo test` → `rtk cargo test`
- `npm test` → `rtk jest` / `rtk vitest`
- `ls` → `rtk ls`
- `grep` → `rtk grep`

You receive compressed output. Act on signal, ignore noise.
If a command fails, RTK saves full output to tee logs. Read those.

## Unified Rules

1. No code without an approved spec.
2. No implementation without a plan.
3. No line without climbing the ladder.
4. No raw shell output without RTK.
5. No merge without two-stage review.
6. No archive without spec sync.

## Automatic Triggers

Skills fire automatically when the situation demands them. You do not need to invoke them — the pipeline does:

| Trigger | Skill | When |
|---------|-------|------|
| Per-task | `drift-detection` | After each task in `/ww:apply` — checks spec/code alignment |
| Per-task | `security-scan` | After each task in `/ww:apply` — native scan over changed code |
| Per-task | `guardrails` | Before each commit — four gates (SPEC, TDD, LADDER, RTK) |
| Intercept | `dependency-check` | When a new dependency is proposed — walks the Ponytail ladder |
| Completion | `verify-change` | When all tasks are done — validates implementation against artifacts |
| Completion | `benchmark` | When all tasks are done — writes plan-vs-actual report |
| Release | `release-compare` | After each release — scores improvement against previous release |
| Always | `translator` | On any underspecified request — clarifies before implementing |
| Always | `ponytail-minimal-output` | On every line written — the YAGNI ladder |
| Always | `superpowers-tdd` | On every implementation task — RED-GREEN-REFACTOR |

Every auto-triggered skill also has a manual override (`/ww:<command>`) for when you want to run it explicitly.

**Token budget gates advisory auto-triggers.** Before firing completion-time auto-triggers (`verify-change`, `benchmark`) during `/ww:apply`, consult the change's token budget (`warpweave-token-budget` / `config/unified.toml`):

- If the budget is exhausted or within the configured reserve of the ceiling, **warn** and **skip or defer** `verify-change` and `benchmark` (advisory, completion-only) rather than silently consuming budget beyond the limit.
- The per-task `security-scan` and the pre-commit `guardrails` gates **always run** — they are safety gates, not budget-gated.
- An explicit `/ww:verify` or `/ww:benchmark` runs regardless of budget (manual override bypasses the gate).
- If no budget is configured, auto-triggers run exactly as today, with no new warnings.

## Release Process

- **One changeset = one logical feature.** Each released behavior change gets its own changeset, so git blame stays clean and a broken feature can be rolled back without reverting unrelated work.
- Grouping allowed only for: multiple changes of a single logical feature, or a pure bug fix strictly required to unblock its own feature in the same release.
- The release `release.yml` workflow consumes pending changesets via `pnpm changeset version`; splitting avoids a 1.4.0-style release where five unrelated features share one changeset.

## Developing warpweave itself

This repo is the **warpweave CLI implementation** (a fork of OpenSpec). The philosophy sections above are what the tool ships to users; these are the facts that change how you work *here*.

### Commands
- Install: `pnpm install` (pnpm ≥9, Node ≥22.12). `packageManager: pnpm@9.15.9`.
- Build: `pnpm build` (runs `build.js`, which cleans `dist/` then `tsc`). **Always build after editing `src/`** — `bin/ww.js` and `bin/ww` load `dist/cli/index.js`, and focused CLI tests resolve the built bundle.
- Verify order that mirrors CI: `pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm build` → `pnpm test`.
- Full suite: `pnpm test` (vitest). Focused file: `pnpm exec vitest run test/<path>.test.ts`. Focused case: `pnpm exec vitest run <file> -t "case name"`. Watch: `pnpm test:watch`.
- `vitest.setup.ts` runs `ensureCliBuilt()` (globalSetup) and `terminateActiveCliChildren()` (teardown).
- Type check separately: `pnpm exec tsc --noEmit` (the `build` script compiles but CI runs `tsc --noEmit` too).

### Gotchas an agent will trip on
- **`@inquirer/*` must be imported with dynamic `import()`**, never a static import, or ESLint fails (`no-restricted-imports`, #367) — static inquirer imports can hang Node when stdin is piped. The exception is `src/core/init.ts`, which is dynamically imported at CLI start. Use `const { select } = await import('@inquirer/prompts')`.
- **Editing a workflow template** (`src/core/templates/workflows/*.ts`) breaks two parity suites. After changing a template, run:
  - `pnpm run generate:skills` — regenerates the committed `skills/**/SKILL.md` tree (checked by `test/core/templates/skillssh-parity.test.ts` and `skill-templates-parity.test.ts`), and
  - `pnpm run regen:parity-hashes` — updates the pinned template hashes in `test/core/templates/skill-templates-parity.test.ts` (`EXPECTED_GENERATED_SKILL_CONTENT_HASHES`, `EXPECTED_FUNCTION_HASHES`).
  - You can also run `vitest` and read the diff to copy the new hash values directly.
- **Version is synced in three places**: `package.json`, `CHANGELOG.md`, and `config/pipeline.yaml` (`version:`). `test/core/config-parity.test.ts` asserts pipeline.version === package.json version; the doctor version-sync check does too. Bump all three together.
- **Windows is a first-class CI target** (matrix: linux-bash, macos-bash, windows-pwsh). Never hardcode path separators; build expected paths with `path.join(...)`/`FileSystemUtils.joinPath(...)`. For path identity assertions, canonicalize with `FileSystemUtils.canonicalizeExistingPath()` (project) / `fs.realpathSync.native()` (tests).
- `.opencode/` and `.unified/` are gitignored (local session install artifacts) — never commit them. Committed skills live under `skills/`.
- `src/` is TS compiled to ESM (`type: "module"`); source imports use `.js` extensions for relative modules (NodeNext).

### Architecture
- Entrypoints: `src/index.ts` → `src/cli/index.ts` (Commander program; `register*Command` per command) and `src/core/index.ts`. Bin shim `bin/ww.js` → `dist/cli/index.js`.
- `src/commands/` = CLI wiring; `src/core/` = logic (root-selection, planning-home, archive, drift-check, verify, skill-generation, templates); `src/utils/` = shared helpers (`task-progress`, `spec-discovery`); `src/core/templates/workflows/*.ts` = the agent-facing skill/instruction strings.
- **Root selection** precedence: `--store <id>` → nearest warpweave root (planning shape / declared pointer) → global default store → implicit/scaffold. Machine-readable JSON contract and EVERY command's `--json` shape + exit codes are documented in **`docs/agent-contract.md`** — read it before touching `--json` behavior, and keep it in sync when you change output shapes.
- Changes lifecycle is spec-driven: `warpweave/changes/<name>/{proposal,specs,design,tasks}.md`, archived under `warpweave/changes/archive/`. Main specs live in `warpweave/specs/<capability>/spec.md`; `pnpm exec warpweave archive` applies delta→main and moves the change (existing docs `docs/ww.md`, `docs/agent-contract.md` cover the contract details).

### Tests
- `test/helpers/run-cli.ts` boots the compiled CLI in-process; gitignored temp dirs from `test/helpers/temp-cleanup.ts`. Existing test-specific guidance is in `test/AGENTS.md` (cross-platform paths, canonicalization) — follow it when touching path logic.
- The suite can be slow (many spawned CLI subprocesses, forks pool, workers capped); don't run the whole suite to check one change — run the focused file first.

### Doctrinal divorce
- The four layers, ladder, and RTK in the sections above are the **product doctrine** this tool installs for end users. Follow them when building features that praise the philosophy, but they are process guidance, not a substitute for the repo-specific build/test facts above.

## Context Hygiene

- Clear context before starting implementation
- One change at a time
- Read the code you touch before modifying it
- Lazy about the solution, never about reading
