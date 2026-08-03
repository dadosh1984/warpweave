## Why

`warpweave doctor` today reports only root/store relationship health. It does not run the cross-cutting self-check bridges that the maintainers currently do by hand on every visit: spec↔template parity, installed-skill↔source drift, and `pipeline.yaml` version↔`package.json` sync. Two of the three findings in this batch (budget behavior missing from the apply template; a parity test that cannot fire) are exactly the kind of "bridge" a pre-release self-check should surface deterministically. The user proposed a `doctor`-style self-check that runs these bridges — and since `warpweave doctor` already exists as the health surface, the minimal move is to extend it rather than invent a new command.

## What Changes

- Extend `warpweave doctor` with a **project self-check** section that reports the deterministic bridges in one read-only pass:
  - **spec↔template parity** (the curated keyword anchors from the `spec-template-parity` capability)
  - **installed security-scan skill↔distribution source** drift signal
  - **pipeline.yaml `version`** vs **package.json `version`** sync
- Keep it read-only and advisory: doctor reports findings and suggests a fix; it never repairs or blocks.
- Reuse existing deterministic checks already present in `config-parity.test.ts` semantics where possible, exposing them as a command surface rather than only tests.

## Capabilities

### New Capabilities
- `doctor-selfcheck`: `warpweave doctor` reports deterministic project self-check bridges (spec↔template, installed-skill↔source, version sync) in a read-only advisory pass (delta spec).

### Modified Capabilities
(none)

## Impact

- `src/commands/doctor.ts` — add a project self-check section to the doctor report.
- `src/core/` — a small self-check module shared with the config-parity test semantics (reuse, not duplication).
- `test/commands/doctor.test.ts` (or new) — cover the new section.
- No new dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the maintainer currently does these three bridges manually every visit; automating them in the existing doctor is the cheapest reliable pre-release check. |
| Existing code reuse? | Yes — extend the existing `warpweave doctor` command and reuse the deterministic check logic already proven in `config-parity.test.ts`/`parity-hash`. |
| Stdlib? | Yes — `fs` reads + string/JSON comparisons; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
