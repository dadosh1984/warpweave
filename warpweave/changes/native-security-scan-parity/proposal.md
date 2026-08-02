## Why

The native security-scan rewrite (1.4.0) shipped in the **distribution** source `skills/warpweave-security-scan/SKILL.md`, but the **installed** copy at `.opencode/skills/warpweave-security-scan/SKILL.md` is stale and still describes the old semgrep/Docker approach (`fc /b` confirms the files differ). Anyone running the actually-installed skill still gets the semgrep instructions, so the "no semgrep/Docker dependencies" improvement never reached the installed surface — a silent regression. Without a guard, installed skills can drift from source again.

## What Changes

- Re-sync the installed `security-scan` skill so the installed copy reflects the native source (copy the native content over the stale installed copy).
- Add a drift guard (config-parity style) asserting that the **installed** `security-scan` skill reflects the native contract — not requiring semgrep/Docker — so a stale semgrep-instruction installed copy fails in CI instead of silently regressing. (A blanket byte-equality check across all skills is intentionally avoided: installed skills are machine-generated and legitimately differ from the `skills/` source.)
- Verify and document detection **parity**: confirm the native skill still covers the same categories the semgrep version covered (hardcoded secrets, injection surfaces, insecure patterns) — confirmed present; note any category the native version no longer claims.
- No change to the detection approach itself; this is about install drift + documented parity.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `native-security-scan`: the installed security-scan skill SHALL match the distribution source and SHALL cover the established detection categories (delta spec).

### Additional context
- The stale installed copy is the concrete defect this change fixes.

## Impact

- `.opencode/skills/warpweave-security-scan/SKILL.md` — re-sync to native source.
- Distribution source `skills/warpweave-security-scan/SKILL.md` — record/documented detection parity.
- `test/core/config-parity.test.ts` (or a new parity test) — add installed-vs-source skill drift guard.
- No runtime code, no dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — a stale installed skill is a real user-facing regression (users still see semgrep instructions); the drift guard prevents recurrence cheaply. |
| Existing code reuse? | Yes — reuse the `config-parity.test.ts` pattern already used for the `WORKFLOW_TO_SKILL_DIR`-style guards; reuse init's copy step to re-sync rather than a new installer. |
| Stdlib? | Yes — file equality check via Node `fs`/Buffer; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
