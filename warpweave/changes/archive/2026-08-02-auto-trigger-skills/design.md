## Context

The skill templates are plain-Markdown instructions with no auto-trigger field (`SkillTemplate`: name, description, instructions, license?, compatibility?, metadata?). Automatic invocation is achieved by wiring a call into the parent workflow's instructions — the proven pattern is `drift-detection`, invoked from `apply-change.ts:99/316` ("Run drift check: invoke `/ww:drift-check`") after each task. See proposal.md - Why. Specs are at `warpweave/changes/auto-trigger-skills/specs/`.

## Goals / Non-Goals

**Goals:**
- Rewrite `security-scan` to be native (agent-judgment over `rtk git diff`, no semgrep/Docker), diff-scoped, severity-flagged, read-only, with a dual auto+manual trigger identical to drift-detection.
- Wire the auto triggers into the apply workflow: per-task security check, dependency intercept, `all_done` verify+benchmark.
- Add `guardrails` to `CORE_WORKFLOWS` (11 → 12).
- Sync the `WORKFLOW_TO_SKILL_DIR` drift.
- Keep every generated artifact (`skills/`, parity hashes, installed `.opencode/skills/`) in sync by regenerating.

**Non-Goals:**
- No new native CLI command (`warpweave security-check`) — the spec requires the scan to work without external tools via agent judgment + `rtk git diff`; a CLI command would be a separate capability.
- No schema change to `SkillTemplate` (no auto-trigger field) — the trigger model is enforced through instruction text + wiring, consistent with the existing codebase.
- `token-budget` stays opt-in.

## Decisions

**D1 — security-scan becomes a native agent-driven scan (rung 2/3/7).**
Rewrite `security-scan.ts` (skill + command templates) to: establish scope via `warpweave status --change "<name>" --json` → `changeRoot` + `rtk git diff origin/main...HEAD` restricted to changed files; check the vulnerability classes already enumerated in `ponytail-minimal-output.ts:68-73` (hardcoded secrets, injection, unsafe eval/deserialization, missing validation); classify ERROR/WARNING/INFO reusing `security-scan.ts:57-60` and the cautious downgrade rule from `ladder-audit.ts:80`; read-only; pause-and-offer-resolution on findings. Description becomes: "Run a native security scan over changed code… Use after each task during apply or manually via `/ww:security-scan`." Remove all semgrep/pip/brew/Docker references and the `compatibility: 'Requires semgrep…'` line.
*Alternatives:* keep semgrep (rejected — external dependency, manual-only, violates automation); delete the skill (rejected — security is a non-negotiable per AGENTS.md).

**D2 — apply wires per-task security check + dependency intercept (rung 2).**
Clone the drift-check wiring: in `apply-change.ts` step 6 (skill line ~99, command line ~316), add `- **Run security check**: invoke /ww:security-scan over the task's diff. If ERROR findings, pause and offer resolution (fix / review / continue).` Add a dependency-intercept bullet in the same loop: "If a new dependency is proposed, run `/ww:dependency-check` first." No changes to the TDD/ladder/RTK sections.

**D3 — apply runs verify + benchmark at all_done (rung 2).**
In `apply-change.ts` step 7 / completion output, add: when all tasks are complete, run `/ww:verify` and `/ww:benchmark` automatically, show both reports, then suggest `/ww:archive`. Update the completion output block.

**D4 — guardrails promoted to core (rung 2).**
Append `'guardrails'` to `CORE_WORKFLOWS` in `profiles.ts:14`. `guardrails.ts` description gains auto-trigger wording ("Use after each task before committing or manually via `/ww:guardrails`"). `UNIFIED_PROFILE_PRESETS` `minimal` already includes guardrails, so no change needed there (it spreads `CORE_WORKFLOWS` + extras).

**D5 — sync WORKFLOW_TO_SKILL_DIR (rung 7).**
`init.ts:77-101` local copy has 23 entries; add the missing `translator`, `ponytail-minimal-output`, `superpowers-tdd` so `removeSkillDirs` matches `profile-sync-drift.ts` (26).

**D6 — regenerate artifacts (rung 2).**
`pnpm build && pnpm generate:skills` regenerates `skills/`; `pnpm build && pnpm regen:parity-hashes` regenerates the golden hashes in `skill-templates-parity.test.ts`. Both are required after any template edit.

**D7 — docs reflect the trigger model.**
`AGENTS.md`: add the automatic-trigger rules (security per-task, dependency intercept, verify+benchmark at completion, guardrails pre-commit) to the four layers. `README.md`: update the "ships by default" count 11 → 12 and describe the auto-trigger model. `docs/UNIFIED.md` if it lists the default skills.

**D8 — new `release-compare` skill (rung 2).**
New workflow id `release-compare` → skill `warpweave-release-compare`, command `/ww:release-compare`, opt-in (NOT in `CORE_WORKFLOWS` — release-level analysis, not per-task; users who want it add it). Registered in: `profiles.ts` `ALL_WORKFLOWS`, `skill-generation.ts` registry, `command-references.ts` `COMMAND_TO_SKILL_NAME`, both `WORKFLOW_TO_SKILL_DIR` maps (init.ts local + profile-sync-drift.ts), and `COMMAND_IDS`/`tool-detection.ts` if it drives command generation. Template `release-compare.ts` (skill + command):
- **Baseline**: previous release tag via `rtk git tag --sort=-version:refname` (or `warpweave status` root); first release → establish baseline, "no comparison possible".
- **Criteria** (weighted): test pass rate/coverage, spec compliance (`warpweave drift-check`), security findings (native scan), code size & dependency deltas (`rtk git diff <prev>...HEAD --stat` + manifest diff), token savings (`rtk gain`), plus an agent-judged **user-value** dimension (features delivered vs promised, docs, UX).
- **Score**: weighted 0–100 delta; report per-criterion before/after, flag regressions explicitly.
- **Threshold**: read `min_improvement` from `config/unified.toml` `[quality]` (default 0.25); below → advisory warning + list of dragging criteria + recommendation, never a block.
- **Output**: write `warpweave/metrics/release-compare/<release>.md` (persistent, advisory), show summary, read-only (no project file modifications).
*Alternatives:* extend `benchmark` (rejected — benchmark is per-change plan-vs-actual; release-compare is cross-release project-level, distinct scope); native CLI command (rejected per D1 — YAGNI, skill runs on agent judgment + `rtk git`/`rtk gain`); hard gate (rejected by user — advisory only).

## Risks / Trade-offs

[Agent-driven scan is heuristic, not SAST-grade] → Severity is cautious by design (downgrade uncertain findings, ERROR only for confident issues); the diff-scoped check is fast so it can run per-task; users who need real SAST keep `semgrep` available as an out-of-band tool — this change only stops depending on it in the pipeline.

[More auto-triggers consume more tokens] → Each trigger is diff-scoped and fires on rare events (new dependency, task boundary, change completion); verify+benchmark are single-run at `all_done`, not per-task.

[Regenerated parity hashes can mask template mistakes] → `regen:parity-hashes` is a deliberate command; the `skillssh-parity` test still byte-matches `skills/` against the generator, and `config-parity.test.ts` still checks pipeline wiring.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| security-scan rewrite | 2 | Reuse drift-detection dual-trigger + ladder-audit diff-scope + existing severity scheme; agent judgment needs no new package |
| apply per-task security | 2 | Reuse the existing drift-check invocation slot |
| apply verify+benchmark at all_done | 2 | Reuse existing verify/benchmark skills, no new code |
| guardrails in core | 7 | One-line constant change in `profiles.ts` |
| release-compare | 2 | Reuse benchmark criteria + learn history + drift-check/security native signals + `rtk git`/`rtk gain`; no new package |
| WORKFLOW_TO_SKILL_DIR sync | 7 | Add 3 missing entries to existing constant |
| token-budget | 1 | YAGNI — stays opt-in, no change |
| native `security-check` CLI | 1 | YAGNI — spec satisfied by agent judgment over `rtk git diff` |
