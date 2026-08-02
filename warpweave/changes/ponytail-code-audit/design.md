## Context

The codebase is ~36k lines across 200 `src/` TS files plus ~41k lines of tests (128 files) and 5 `scripts/*.mjs`. See proposal.md - Why for motivation. The audit must be read-only: no product behavior changes, no source edits. Existing machinery already encodes the ladder and the debt-marker format, so the audit reuses them rather than inventing a parallel methodology.

## Goals / Non-Goals

**Goals:**
- Produce a single structured report (`docs/ponytail-audit.md`) that classifies codebase findings against the Ponytail ladder rungs 1–7
- Anchor every finding to file/line so it is verifiable and actionable
- Rank recommendations by effort and impact so a follow-up change can be scoped cheaply
- Reuse existing ladder/debt conventions (`ladder-audit` skill, `// ponytail:` markers) so the report is consistent with how the project already reasons about minimality

**Non-Goals:**
- Changing product behavior or editing any source file
- Writing a new audit tool, dependency, or CLI command
- Fixing the findings (deferred to a separate change)
- Modifying specs or adding capabilities (`skip_specs: true`)

## Decisions

**D1 — Report output location and format.**
Report lives at `docs/ponytail-audit.md`, Markdown. Rationale: it is a human/agent-consumed deliverable, not a machine artifact; Markdown is renderable and diffable, and `docs/` is where project documentation lives. Alternative considered: writing into the change directory — rejected because the report is a long-lived artifact that outlives the change archive.

**D2 — Methodology reuses the ladder-audit skill, not a new one.**
The existing `ladder-audit` skill template (`src/core/templates/workflows/ladder-audit.ts`) already asks "Would the senior engineer with the ponytail delete this?" per changed line. The audit applies the same question across the whole tree. Alternative considered: building a new audit command — rejected on rung 2 (reuse) and YAGNI: no product behavior changes, so no new command is justified.

**D3 — Findings reference `// ponytail:` conventions for the deferrable subset.**
When a finding is a *deliberate simplification* (fast path skipped, case deliberately unhandled, copied style), the report proposes the exact `// ponytail: <reason>` marker to add later. This ties the audit to the existing `debt-ledger` flow, which already scans for that marker. Rationale: keeps the eventual fix change mechanical. Alternative considered: inventing a new finding taxonomy — rejected; the ladder rungs plus the existing marker format already cover it.

**D4 — Scanning is read-only and uses existing tooling.**
`rg`/`grep` for dead code, duplicate blocks, and unused imports; `node` for quick counts. No new binaries. Cross-platform by construction (these run on all three OSes; the audit is executed by the agent, not shipped).

## Risks / Trade-offs

- [Report size] → ~36k + ~41k lines is a lot of surface; the audit may produce many findings → group by rung and prioritize; cap detail on high-signal findings, collapse noise into counts.
- [False positives on "dead code"] → static scanning cannot prove a symbol is unused across dynamic usage (e.g., CLI-registered commands) → verify each candidate with a targeted grep before listing it; mark uncertain ones as "verify".
- [No spec coverage] → because `skip_specs: true`, there is no spec to drift-check against → the report itself is the deliverable; completion is defined by the report existing and being reviewed, not by spec compliance.
- [Staleness] → the report is a snapshot; code will move on → date it, and note that the follow-up fix change should re-verify line references before editing.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Audit methodology | 2 (Reuse) | Use existing `ladder-audit` skill template instead of a new tool (D2) |
| Finding format | 6 (One-liner) | `// ponytail: <reason>` marker reused from `debt-ledger` (D3) |
| Scanning | 3 (Stdlib) | `rg`/`grep`/`node` already installed; no new dependency (D4) |
| Report | 7 (Minimum) | Single Markdown file `docs/ponytail-audit.md`; no schema, no CLI (D1) |
