# Tasks: Rename CLI and command namespace to Spectrix / OTRIX

> All implementation shipped before this change was recorded (commits `b7a0e08`, `da11fd8`, `b8e0052`, tags `v1.9.0`, `v1.10.0`). Every task below is complete.

## 1. CLI rename `openspec` → `spectrix` (1.9.0)

- [x] 1.1 Rename `bin/openspec.js` → `bin/spectrix.js`; root command name `spectrix`; fallback/root-skip paths updated.
- [x] 1.2 Rename every user-facing string: help/errors/deprecations, completion scripts (bash/fish/zsh/powershell), docs/, website, README, AGENTS.md, SECURITY.md, `.env.example`.
- [x] 1.3 Regenerate `skills/` via `pnpm generate:skills`; update golden parity hashes.
- [x] 1.4 Publish `@dadosh1984/spectrix@1.9.0`; smoke from registry: `npx spectrix --version` → 1.9.0, `spectrix init` → `.unified/`.

## 2. Command namespace rename `opsx` → `otrix` (1.10.0)

- [x] 2.1 Rename command IDs (`/otrix:*`), display names (`OTRIX: *`), generated paths (`.claude/commands/otrix/`), mention form (`@otrix-*`) in adapters, invocation code, templates, tests.
- [x] 2.2 Rename docs: `docs/otrix.md` → `docs/otrix.md`, glossary term, markdown anchors, website, README, AGENTS.md.
- [x] 2.3 Rename spec dirs `openspec/specs/otrix-{archive,onboard,verify}-skill` → `otrix-*` (main specs and the live `extend-config-injection-to-apply-archive` change).
- [x] 2.4 Fix welcome-screen width budget regression (padEnd) and regenerate parity hashes.
- [x] 2.5 Publish `@dadosh1984/spectrix@1.10.0`; smoke from registry: `npx spectrix init --tools claude .` → `.claude/commands/otrix/` with `name: "OTRIX: Propose"`.

## 3. Verification

- [x] 3.1 `pnpm build` — clean.
- [x] 3.2 `pnpm test` — 3453 passed / 7 failed / 24 skipped, identical to the pre-rename baseline (the 7 are Windows symlink tests).
- [x] 3.3 `check:pack-version` OK on Windows (npm via shell, node.exe direct, packed path `@dadosh1984/spectrix`).
- [x] 3.4 `openspec validate --specs` on the fork — 36 passed, 0 failed.

## 4. This change record

- [x] 4.1 Record the rename as a change with MODIFIED delta specs for the 8 affected main specs.
- [x] 4.2 Sweep remaining `opsx` references out of other active changes (archive records stay historical).
