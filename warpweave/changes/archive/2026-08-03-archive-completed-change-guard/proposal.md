## Why

Finding 3 in this batch: `fix-validate-release-tracking` was fully implemented (all tasks `[x]`, code landed in `.github/workflows/ci.yml`) and was archived, yet a live copy also remained in `warpweave/changes/fix-validate-release-tracking/` alongside the archived `archive/2026-08-02-fix-validate-release-tracking`. A completed change left unarchived (or duplicated) is invisible to any "done" signal: `warpweave list`/`status` can keep showing it as active, and nothing reminds the author to run `/ww:archive`. The same "looks complete but isn't sealed" pattern caused finding 1. This change adds a guard so a fully-completed change can't sit unarchived (or as a stale duplicate) without being surfaced.

## What Changes

- Surface completed-but-unarchived changes (all tasks `[x]` and no open blockers) in the relevant surfaces — e.g. `warpweave doctor` project self-check and/or `warpweave list`/`status` — with a reminder to run `/ww:archive`.
- Detect stale duplicates: a change name present in both `changes/` and `changes/archive/` SHALL be reported (one is a leftover) so it can be reconciled, rather than silently coexisting.
- Add a regression test (config-parity style) asserting the detection paths.
- As a follow-up housekeeping action, reconcile the current stale duplicate (`changes/fix-validate-release-tracking`) by archiving/removing the leftover after confirm.

## Capabilities

### New Capabilities
- `archive-hygiene`: completed-but-unarchived changes and stale `changes/`↔`archive/` duplicates SHALL be surfaced for reconciliation (delta spec).

### Modified Capabilities
(none)

## Impact

- A small detection module (shared with `doctor` project self-check from change 4, if present) or an addition to `list`/`status`.
- `test/` (config-parity style) — coverage for unarchived-completed and duplicate detection.
- Housekeeping: reconcile the stale `changes/fix-validate-release-tracking` duplicate.
- No new dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — a completed change left unarchived (or duplicated) is exactly the invisible-progress failure that let finding 1 and finding 3 slip; surfacing it is cheap. |
| Existing code reuse? | Yes — reuse `warpweave doctor` (change 4) and/or `list`/`status`; reuse task-completion parsing (`- [x]`) already used by archive. |
| Stdlib? | Yes — `fs` directory/content reads; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
