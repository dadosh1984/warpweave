## Context

See proposal.md - Why. State that shapes the approach:

- Tracked planning dir is `openspec/` (real `config.yaml` with `context`/`rules` + 36 main specs); `warpweave/` exists only as a local untracked scaffold (empty `specs/`, template `config.yaml`, `changes/`).
- `resolvePlanningDirName` (planning-home.ts:38-46) prefers `warpweave/` over legacy `openspec/` and creates `warpweave/` on new installs. The code already treats `warpweave/` as canonical and `openspec/` as a supported legacy name (`LEGACY_WARPWEAVE_DIR_NAME = 'openspec'`, config.ts:6).
- ~25 of the 36 main specs carry `openspec/` path references that describe the canonical layout and are stale; a minority describe genuine legacy support and must not be renamed.

## Goals / Non-Goals

**Goals:**
- A single canonical `warpweave/` planning layout in this repo that the CLI actually reads (`warpweave view` shows all specs).
- Spec content consistent with canonical naming; no tool behavior change; history preserved.

**Non-Goals:**
- Removing legacy `openspec/` support from the tool itself (other projects may still use it).
- Migrating any other project; this change touches this repository only.
- Rewriting spec prose that intentionally documents legacy `openspec/` support.

## Decisions

1. **Relocate with `git mv`, not plain moves.**
   `git mv openspec/specs/<cap>/spec.md warpweave/specs/<cap>/spec.md` for all 36 capabilities, and `git mv openspec/config.yaml warpweave/config.yaml`. Preserves history; plain `Move-Item` would make the new tree appear as brand-new files.
2. **`skip_specs: true` - corrections are direct edits, not deltas.**
   Tool behavior is unchanged, so no behavior contract changes; the main-spec content corrections are done in place and documented as tasks, avoiding 25 MODIFIED deltas and archive scenario-loss churn.
3. **Intent-scoped reference sweep.**
   Only rewrite references that describe this repo's canonical layout. Keep `openspec/` in tests/fixtures/spec prose that exercise legacy support (e.g. `legacy-cleanup`, `root-selection`, `schema-resolution` legacy rows). Discriminator: code comments and scenario wording ("legacy", "pre-rename", "upstream OpenSpec").
4. **Config content is migrated, not dropped.**
   The real `context`/`rules` from `openspec/config.yaml` replace the scaffold comments in `warpweave/config.yaml`; verify nothing is lost before deleting `openspec/`.
5. **Delete `openspec/` last**, after the full suite passes against the moved tree.

## Risks / Trade-offs

- [Tests still assert `openspec/` as canonical] → Update layout-asserting tests in the same change; full `vitest` gate; legacy-support tests are exempt by design.
- [Config content lost when scaffold is overwritten] → Copy real content first, diff-check, then delete.
- [Blind rename misdocuments legacy behavior] → Intent rule (Decision 3) keeps legacy mentions.
- [Windows move/history issues] → `git mv` per spec dir; no shell-unescaped paths.

## Migration Plan

1. `git mv` all 36 spec dirs and `config.yaml` into `warpweave/`.
2. Overwrite `warpweave/config.yaml` scaffold with the real content; verify diff.
3. Sweep repo-internal references (`docs/`, `AGENTS.md`, `test/AGENTS.md`, schema template) `openspec/` → `warpweave/` where they describe this repo's layout.
4. Correct path references inside the moved main specs with the intent rule.
5. Delete `openspec/`; run full suite + lint; commit.
6. Rollback: revert the single commit restores `openspec/` in full.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Spec relocation | 2 (Reuse) | `git mv` preserves history; reuse the CLI's existing dual-name resolution. |
| Config content migration | 6 (One-liner) | Copy real content over the scaffold. |
| Reference sweep | 6 (One-liner) | rg-based mechanical rename, intent-scoped. |
| Main-spec path corrections | 6 (One-liner) | Targeted replacements with a legacy-exemption rule. |
