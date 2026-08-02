## Why

Warpweave's philosophy is full automation: the agent should decide which skills to apply based on the situation, and the user only intervenes when strictly necessary. Today only drift-detection is wired into the apply loop; security-scan requires an external semgrep/Docker dependency and runs only when manually invoked, and verify/benchmark/dependency-check never fire automatically. This leaves core quality gates manual and breaks the "observe, don't drive" promise.

## What Changes

- Rewrite `security-scan` as a **native** (agent-driven, diff-scoped) scan with no semgrep/Docker dependency; give it the dual trigger "after each task during apply or manually via `/ww:security-scan`" (same pattern as drift-detection).
- Wire the **apply workflow** to run the new security check after each task (next to the existing drift check), intercept new dependency proposals through the Ponytail ladder, and on `all_done` automatically run `verify` + `benchmark` and show the reports before suggesting archive.
- Add `guardrails` to `CORE_WORKFLOWS` so the pre-commit gate ships by default (11 → 12 auto-installed skills); `token-budget` stays opt-in.
- Add a **`release-compare`** skill (opt-in): after each release it compares the project before vs after the change/release, scores the improvement on defined criteria (tests, spec compliance, security, simplicity, tokens), and — when the improvement falls below a configured threshold — warns with a "needs work" report instead of blocking the release. Runs on release events or manually via `/ww:release-compare`.
- Sync the `WORKFLOW_TO_SKILL_DIR` drift between `src/core/init.ts` (23 entries) and `src/core/profile-sync-drift.ts` (26 entries).
- Update `AGENTS.md` and `README.md` to document the automatic-trigger model (auto vs explicit skills).

## Capabilities

### New Capabilities
- `native-security-scan`: security scanning of changed code without external tools, diff-scoped, severity-flagged, auto-triggered during apply with a manual `/ww:security-scan` override.
- `skill-triggers`: the situation-based trigger model — which skills fire automatically (security per-task, dependency intercept, verify+benchmark at apply completion, guardrails pre-commit) and which remain explicit.
- `release-compare`: before/after project comparison on release, scoring improvement against defined criteria with a configurable advisory threshold (warns below threshold, never blocks).

### Modified Capabilities
- `default-quality-skills`: the default (core) workflow set grows from 11 to 12 skills with `guardrails` shipping by default; `token-budget` remains opt-in.

## Impact

- `src/core/templates/workflows/security-scan.ts` — full rewrite (skill + command templates).
- `src/core/templates/workflows/apply-change.ts` — add per-task security check, dependency intercept, `all_done` verify+benchmark wiring (skill + command templates, lines ~99/316).
- `src/core/templates/workflows/dependency-check.ts`, `verify-change.ts`, `benchmark.ts` — description/trigger wording to auto/intercept.
- `src/core/templates/workflows/release-compare.ts` — new skill + command template.
- `src/core/profiles.ts` — `CORE_WORKFLOWS` += `guardrails`; `ALL_WORKFLOWS` += `release-compare`.
- `src/core/init.ts` — fix local `WORKFLOW_TO_SKILL_DIR` to 26 entries.
- `src/core/shared/skill-generation.ts` — register `release-compare` in the skill registry.
- `src/utils/command-references.ts` — add `/ww:release-compare` mapping.
- `config/unified.toml` — add `[quality]` threshold (e.g. `min_improvement = 0.25`).
- Generated artifacts: `skills/` tree (via `generate:skills`), parity hashes (`skill-templates-parity.test.ts`), `.opencode/skills/` install.
- Docs: `AGENTS.md`, `README.md`, optionally `docs/UNIFIED.md`.
- Changeset (minor).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — core quality gates are currently manual and security depends on an external tool, against the automation philosophy |
| Existing code reuse? | Yes — clone the drift-detection dual-trigger pattern (`apply-change.ts:99`) and the ladder-audit diff-scoping shape; reuse existing severity schemes |
| Stdlib? | Yes — scan is agent judgment over `rtk git diff`, no new runtime packages |
| Native platform? | N/A — no platform feature replaces the agent-driven scan |
| New dependency? | No — removing the semgrep/Docker dependency is part of the change |

## Complexity

Complexity: **normal**
