## Context

`warpweave doctor` (`src/commands/doctor.ts`) today is the read-only relationship-health surface (root + store + references). It never repairs. This change adds a project self-check section reusing the deterministic bridges already proven in `test/core/config-parity.test.ts` (spec↔template anchors from change 3, installed-skill↔source, version sync) and `src/core/shared/` (skill templates). See proposal.md - Why and the `spec-template-parity` spec.

## Goals / Non-Goals

**Goals:**
- Expose the three bridges (spec↔template, installed-skill↔source, version sync) as a read-only doctor section.
- Reuse existing deterministic logic rather than duplicating it.

**Non-Goals:**
- No fixing/repairing behavior (doctor stays advisory).
- No new command; doctor already exists.
- Not re-running the whole test suite.

## Decisions

**Decision D1 — Self-check is a section of the existing `warpweave doctor`.**
Add a project self-check section to `printHumanHealth` / the JSON output rather than a separate command.
- Rationale: `doctor` is the established health surface; a distinct command would duplicate its root resolution and output plumbing.
- Alternative: separate `warpweave selfcheck` — rejected (duplication, two entry points).

**Decision D2 — Reuse a shared core module for the bridge checks.**
Add `src/core/project-selfcheck.ts` exporting deterministic check functions (e.g. `checkSpecTemplateParity`, `checkInstalledSkillDrift`, `checkVersionSync`) that read files and return `{ ok, message, fix }`. The doctor command and the config-parity-style test both call it.
- Rationale: single source of truth; the same logic powers the test-time and command-time surfaces (mirrors how the spectre check is shared).
- Alternative: inline in command + duplicate in test — rejected (drift risk between test and command).

**Decision D3 — Installed-copy bridge reports absence, does not skip.**
The skill-drift check always evaluates the distribution source; the installed copy is evaluated when present and reported as absent otherwise.
- Rationale: directly fixes the "test that cannot fire" failure mode discovered in this batch.

## Risks / Trade-offs

- Adding I/O to doctor could slow it → checks are small, deterministic file reads; acceptable.
- Findings could be noisy on non-repo setups → self-check section reports only on a healthy project root.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Self-check section | 2 (Reuse) | Extend existing `doctor` command. |
| Bridge checks module | 2 (Reuse) | Reuse parity logic from `config-parity.test.ts`/spec-template-parity. |
| Installed-copy handling | 7 (Minimum) | Report absent rather than skip. |
| Dependencies | 5→none | No new dependency. |
