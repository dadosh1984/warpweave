## Context

`warpweave archive` already parses task completion (`- [x]`) before archiving, and the planning home resolves `changes/` + `changes/archive/`. This change surfaces hygiene gaps (completed-but-unarchived; stale duplicate) rather than adding new archival behavior. See proposal.md - Why and the `archive-hygiene` spec. Detection hooks into the `doctor` self-check surfaces from change 4 (or `list`/`status`) — see that design for the shared module pattern.

## Goals / Non-Goals

**Goals:**
- Surface completed-but-unarchived changes and stale `changes/`↔`archive/` duplicates.
- Reuse existing task-completion and path resolution.

**Non-Goals:**
- No change to archiving behavior itself.
- No auto-archive (advisory surfacing only).
- No runtime dependency additions.

## Decisions

**Decision D1 — Detection is a shared read-only module reported by the health/list surfaces.**
A small module (e.g. `src/core/archive-hygiene.ts`) exports `findCompletedUnarchived(root)` and `findStaleDuplicates(root)` returning findings. The `doctor` self-check (from change 4) and/or `list`/`status` render them.
- Rationale: single source of truth; advisory (never repairs).
- Alternative: embed detection in `archive` only — misses surfacing before the author thinks to archive.

**Decision D2 — Duplicate matching ignores the archived date prefix.**
Compare the active change name to the archived name with the `YYYY-MM-DD-` prefix stripped.
- Rationale: archive (per spec) prepends the date; a duplicate must match on the base name.
- Alternative: exact string match — would miss the common dated-archive case.

**Decision D3 — Completed detection reuses `- [x]` semantics.**
A change is "completed-but-unarchived" when it has a `tasks.md` whose tasks are all `- [x]` (and no `- [ ]` remain). No tasks.md → not flagged (mirrors archive's all-or-none behavior).
- Rationale: consistent with the existing archive task-completion check.

## Risks / Trade-offs

- False "completed" if tasks.md format varies → reuse the same parser as archive for consistency.
- Duplicate matching edge cases (name substrings) → match on exact base name after stripping the date prefix.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Detection module | 2 (Reuse) | Reuse task parser + planning-home path resolution. |
| Duplicate matching | 7 (Minimum) | Strip date prefix, exact base-name compare. |
| Surfacing | 2 (Reuse) | Rendered by existing doctor/list/status surfaces. |
| Dependencies | 5→none | No new dependency. |
