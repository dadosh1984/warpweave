## Context

Skills are installed by copying the distribution `skills/**` tree into the tool's skills dir (`.opencode/skills/` for opencode — see `init.ts` `path.join(projectPath, tool.skillsDir, 'skills')`). The 1.4.0 native rewrite updated `skills/warpweave-security-scan/SKILL.md` but the installed `.opencode/skills/warpweave-security-scan/SKILL.md` was not regenerated and still contains the semgrep instructions. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Installed security-scan skill reflects the native contract (no semgrep/Docker).
- CI fails if the installed security-scan skill is stale (semgrep-based).
- Record detection parity (secrets + injection, no semgrep/Docker).

**Non-Goals:**
- No change to the native detection approach/quality itself (only install sync + guard).
- No byte-equality requirement across all skills: installed skills are machine-generated during init and legitimately differ from `skills/*` source (observed: 10/12 differ), so the guard targets the native *contract* of the one stale skill, not generic equality.
- No new installer; reuse init's copy path.

## Decisions

**Decision D1 — Re-sync the stale installed copy via the existing install/copy step.**
Restore `.opencode/skills/warpweave-security-scan/SKILL.md` from the native source by copying `skills/warpweave-security-scan/SKILL.md` → `.opencode/skills/warpweave-security-scan/SKILL.md`.
- Rationale: fixes the live machine's stale semgrep copy using the same content as the source it should match.
- Alternative considered: a general byte-equality sync of every skill — rejected (installed skills are generated per-install and legitimately differ from source).

**Decision D2 — Add a targeted installed-skill parity guard (config-parity style), not generic equality.**
In `test/core/config-parity.test.ts`, add a test that, when `.opencode/skills/warpweave-security-scan/SKILL.md` exists, asserts it reflects the native contract: it must not declare "Requires semgrep" and must not be the semgrep/Docker version. Skip the assertion when the installed skill directory is absent (CI). Paths built with `path.join` (cross-platform).
- Rationale: catches the exact regression (stale semgrep instructions reaching the installed surface) without false positives from legitimate machine-generated differences across other skills.
- Rules: explicit lookup of the security-scan skill, not pattern matching.

**Decision D3 — Document detection parity in the skill.**
Confirm the native SKILL.md lists secrets and injection categories (already present) and retains "no semgrep/Docker required"; record that as the parity contract in the spec.

## Risks / Trade-offs

- A future skill intentionally differs between dist and installed (e.g. tool-specific tweaks) would trip the guard → scope the guard to skills that ship identically; document any intended-different skills as an explicit exclude list if one appears.
- Re-syncing overwrites any local hand-edit of the installed skill → acceptable: installed skills are machine-generated copies.

## Migration Plan

- Apply: fix source char (via change 2), re-sync installed copy, add parity test. Rollback: since installed copy is generated, re-running init or reverting the test restores state; the guard only fails on drift.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Re-sync installed skill | 2 (Reuse) | Reuse init's copy/install path; no new installer. |
| Parity guard | 2 (Reuse) | Reuse `config-parity.test.ts` pattern; `path.join` for cross-platform. |
| Parity check | 3 (Stdlib) | Node `fs`/Buffer equality; no dependency. |
