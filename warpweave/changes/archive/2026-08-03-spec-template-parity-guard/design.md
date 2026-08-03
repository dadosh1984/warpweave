## Context

The project already has `test/core/config-parity.test.ts`, which works because it compares deterministic file content (TOML, YAML, template identity via `parity-hash`, `getSkillTemplates()`). The gap: no bridge between a **spec requirement** (English prose in `warpweave/specs/<capability>/spec.md`) and the **template** that must implement it (e.g. `src/core/templates/workflows/*.ts`). See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- A light, deterministic spec↔template keyword-parity guard (config-parity style).
- Explicit, curated mapping so it stays maintainable and doesn't become a regex/scoring engine.

**Non-Goals:**
- No semantic/NLP interpretation of specs.
- No auto-generation of the mapping from every spec.
- Not a runtime or CLI feature — a test-time guard.

## Decisions

**Decision D1 — Curated explicit mapping table, not pattern matching.**
Define a small typed table in the test: each row is `{ specPhrase, capability, templateFile, anchor }`. The test reads each template file and asserts it contains `anchor`. Additions are explicit entries, matching the "prefer explicit lookups over regex" rule.
- Rationale: deterministic, auditable, extends per requirement; mirrors how `config-parity` already works.
- Alternative: scan all spec requirements and guess anchors — rejected (fragile, over-reaching).

**Decision D2 — Keyword co-occurrence anchor, not exact spec copy.**
The `anchor` is a short distinctive substring (e.g. for budget gating: the template must contain a "budget" term near skip/defer of verify/benchmark). The guard is deliberately light.
- Rationale: catches the "spec says X but template never mentions X at all" failure; avoids brittle whole-text equality.

**Decision D3 — First mapped pair: budget gating in apply-change.ts.**
Anchor the `skill-triggers` budget requirement against `apply-change.ts`.
- Rationale: the exact divergence that shipped in this batch; other pairs add over time.

## Risks / Trade-offs

- Anchor wording drift causes false pass → anchors use strong spec-derived phrases; harmless to tighten.
- Mapping can go stale → explicit table is trivially reviewed in the test file.
- No semantic validation → acceptable; it targets the specific slipped class.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Parity mapping table | 2 (Reuse) | Reuse `config-parity.test.ts` structure; no new framework. |
| Anchor check | 7 (Minimum) | `fs` read + `includes`; single assertion loop. |
| First anchor (budget) | 2 (Reuse) | Reuses the `skill-triggers`/`apply-change` pair already relevant. |
| Dependencies | 5→none | No new dependency. |
