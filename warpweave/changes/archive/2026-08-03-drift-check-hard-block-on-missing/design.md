## Context

`warpweave drift-check` (`src/commands/drift-check.ts`) currently always exits 0: it classifies each scenario via `classifyScenario` (compliant/missing/drifted) and prints a report, then returns normally regardless of findings. The `missing` status (zero term matches across source) is a high-confidence deterministic signal. `archive.ts` already demonstrates the non-zero-block pattern for incomplete checkboxes. See proposal.md - Why and the `drift-check-command` spec delta.

## Goals / Non-Goals

**Goals:**
- `missing` → non-zero exit (hard block) by default, mirroring archive's checkbox block.
- `drifted` → advisory only (no block by default).
- Opt-out (`--no-fail-on-missing`) for report-only use.
- Reflect blocking state in JSON (`blocked`).

**Non-Goals:**
- No change to the classification algorithm (`classifyScenario` stays as-is).
- No blocking on `drifted` (needs agent judgment).
- Not changing per-task drift usage in apply beyond referencing the new exit semantics.

## Decisions

**Decision D1 — Non-zero exit on `missing`, advisory on `drifted`.**
After building findings, if any `missing` exists and `--no-fail-on-missing` is not set, set `process.exitCode = 1` (after printing the report). `drifted` alone keeps exit 0.
- Rationale: `missing` is near-deterministic (zero matches); `drifted` is not, so only `missing` blocks. Mirrors archive's checkbox block.
- Alternative: block on both missing and drifted — rejected (drifted needs agent judgment and would false-block on wording variance).

**Decision D2 — `--no-fail-on-missing` opt-out (report-only).**
A flag (and/or a config value) turns the hard block back into a pure report. Default is to block.
- Rationale: preserves a scripted/read-only use while making the safe default deterministic.
- Alternative: always block with no escape — rejected (removes a legitimate report-only use and contradicts advisory-by-default for edge tooling).

**Decision D3 — JSON reflects blocking.**
The JSON output includes a `blocked: boolean` summarizing whether the check would fail (any missing and not opted out), so automation keys off both exit code and payload.
- Rationale: the `--json` format already exists for automation; adding `blocked` keeps it self-describing.

## Risks / Trade-offs

- False `missing` on a scenario whose terms are unusual → loud, agent-addressable; opt-out is available.
- Blocking mid-apply could stall → the finding is printed with `expected`/`actual` and the user/agent fixes or opts out.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Non-zero on missing | 2 (Reuse) | Mirror `archive.ts` block; `process.exitCode`. |
| Opt-out flag | 7 (Minimum) | One boolean option in the existing command. |
| JSON `blocked` | 7 (Minimum) | Add a field to existing JSON output. |
| Dependencies | 5→none | No new dependency. |
