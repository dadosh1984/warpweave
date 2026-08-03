## Context

`one-changeset-one-feature` documented the convention in AGENTS.md but added no CI enforcement. The `validate-changesets` job in `.github/workflows/ci.yml` already computes the changed changeset file list (`steps.changed-changesets.outputs.files`) and validates them with `changeset status`. This change adds a lightweight, advisory heuristic on top of that existing file list. See proposal.md - Why and the `ci-changeset-convention` spec.

## Goals / Non-Goals

**Goals:**
- A non-blocking advisory CI warning when a changeset may bundle multiple unrelated features.
- Reuse the existing changeset file list; small, plain-Node heuristic.

**Non-Goals:**
- Not a binding gate — it must never fail a legitimate PR.
- Not a semantic/LLM analysis of changesets — a simple heuristic.
- No runtime change to warpweave.

## Decisions

**Decision D1 — Reuse the existing changed-changesets file list.**
The convention check runs in the `validate-changesets` job using the `files` output already computed, so no new change-detection logic.
- Rationale: cheapest integration; single source of the changeset set.
- Alternative: independent detection — rejected (duplication).

**Decision D2 — A small Node heuristic script, advisory-only.**
A `scripts/changeset-convention-check.js` reads each changed changeset, and flags one when its summary splits into multiple distinct release-note bullets/concerns (a simple heuristic, e.g. multiple `-` bullets or multiple top-level feature phrases), emitting `::warning::`. Exit code 0 regardless (never blocks).
- Rationale: plain Node, stdlib only, matches project style; advisory semantics are explicit.
- Alternative: rely on `changeset status` — it validates well-formedness, not scoping; not a substitute.

**Decision D3 — Never blocks.**
The script always exits 0; warnings are informational.
- Rationale: spec requires advisory behavior; a hard fail would risk bogging the release cadence on a heuristic.

## Risks / Trade-offs

- Heuristic false-positives → advisory-only (never blocks) plus quoted summary for easy judgment.
- Under-detection → acceptable; the point is a tripwire, not a proof.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Changed-changeset list | 2 (Reuse) | Reuse `steps.changed-changesets.outputs.files`. |
| Heuristic script | 7 (Minimum) | Plain Node, stdlib, exit 0. |
| Job wiring | 7 (Minimum) | One step in existing job. |
| Dependencies | 5→none | No new dependency. |
