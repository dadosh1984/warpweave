## 1. Relocate specs and config

- [x] 1.1 Move all 36 main specs with `git mv` from `openspec/specs/<cap>/spec.md` to `warpweave/specs/<cap>/spec.md`
  - **Spec scenario**: n/a (repo restructure; design - Decision 1)
  - **Ladder rung**: 2 (reuse - `git mv` preserves history)
  - **Test first**: n/a - move is verified by `git status` rename detection
  - **Verify**: `rtk git status` shows `R` (renamed) entries; `warpweave/specs` holds 36 capability dirs
- [x] 1.2 Migrate the real config content: replace the `warpweave/config.yaml` scaffold with the content of `openspec/config.yaml` (keep `context`/`rules`)
  - **Spec scenario**: n/a (design - Decision 4)
  - **Ladder rung**: 6 (one-liner content copy)
  - **Test first**: n/a - verified by diff before deletion
  - **Verify**: `rtk git diff --no-index warpweave/config.yaml openspec/config.yaml` shows only the scaffold comments removed, no `context`/`rules` lost
- [x] 1.3 Delete the legacy `openspec/` directory after content is verified
  - **Spec scenario**: n/a (design - Decision 5)
  - **Ladder rung**: 6 (removal)
  - **Test first**: n/a
  - **Verify**: `rtk git status` shows `openspec/` fully removed and `warpweave/specs` populated

## 2. Update repo-internal references

- [x] 2.1 Update root `AGENTS.md` and `test/AGENTS.md` so layout references to this repo use `warpweave/`
  - **Spec scenario**: n/a (docs)
  - **Ladder rung**: 6 (mechanical replace)
  - **Test first**: n/a - docs carry no tests
  - **Verify**: `rtk rg -n "openspec" AGENTS.md test/AGENTS.md` shows only legacy-intent mentions (if any)
- [x] 2.2 Update `schemas/spec-driven/templates/proposal.md` so its template guidance references `warpweave/`
  - **Spec scenario**: n/a (template)
  - **Ladder rung**: 6 (one-line replace)
  - **Test first**: n/a
  - **Verify**: `rtk rg -n "openspec" schemas/` returns no canonical-layout references
- [x] 2.3 Update docs layout references (`docs/*.md`) `openspec/` → `warpweave/` where they describe this repo, keeping upstream/legacy examples intact
  - **Spec scenario**: n/a (docs)
  - **Ladder rung**: 6 (mechanical replace, intent-scoped)
  - **Test first**: n/a
  - **Verify**: `rtk rg -n "openspec/" docs/` shows only legacy-descriptive mentions
- [x] 2.4 Update tests that assert the canonical layout (`init`, `update`, `root-selection`, `list`, `view-store-resolution`, etc.) to expect `warpweave/`; leave legacy-support tests (`legacy-cleanup.test.ts`, schema legacy rows) unchanged
  - **Spec scenario**: cli-init - "Creating Warpweave structure"; cli-update - related scenarios
  - **Ladder rung**: 2 (reuse existing assertions, change expected dir)
  - **Test first**: `rtk vitest` — layout-asserting tests fail (RED) against the moved tree
  - **Verify**: `rtk vitest`

## 3. Correct main-spec path references

- [x] 3.1 Replace canonical-layout `openspec/` references inside the moved main specs with `warpweave/`; keep explicit legacy mentions (`legacy-cleanup`, `schema-resolution` legacy rows, upstream OpenSpec notes)
  - **Spec scenario**: the affected capability scenarios (e.g. config-loading - "Load project config", cli-init - "Directory Creation", schema-resolution - "Project-local schemas")
  - **Ladder rung**: 6 (targeted replace with legacy-exemption rule)
  - **Test first**: n/a - spec prose; verified by grep
  - **Verify**: `rtk rg -n "openspec/" warpweave/specs` shows only intentional legacy-descriptive mentions
- [x] 3.2 Validate the moved main specs parse cleanly
  - **Spec scenario**: n/a (validation)
  - **Ladder rung**: 7 (verification)
  - **Test first**: n/a
  - **Verify**: `rtk warpweave validate --specs`

## 4. Final verification

- [x] 4.1 Confirm the CLI now sees the canonical tree and the full suite passes
  - **Spec scenario**: n/a (verification)
  - **Ladder rung**: 7 (verification)
  - **Test first**: n/a
  - **Verify**: `rtk warpweave view` reports 36 specs; `rtk vitest`; `rtk npm run lint`
- [x] 4.2 Commit the migration as a single commit (enables one-command rollback)
  - **Spec scenario**: n/a
  - **Ladder rung**: 7 (verification)
  - **Test first**: n/a
  - **Verify**: `rtk git log --oneline -1` shows the migration commit; `rtk git status` clean
