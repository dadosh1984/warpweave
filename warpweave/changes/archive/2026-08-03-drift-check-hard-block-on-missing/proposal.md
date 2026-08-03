## Why

In the drift-check hierarchy, `missing` (zero term matches for a scenario across the whole source) is a nearly deterministic signal — far louder and more reliable than `drifted`, which legitimately needs an agent's judgment to tell "wording drifted" from "behavior absent". Yet today `warpweave drift-check` always exits 0 and merely asks the agent to "pause and offer resolution": a weak model can ignore it and continue, exactly the model-dependence this project rejects. `archive.ts` already proves the pattern — it *blocks* (non-zero, `ArchiveBlockedError`) on incomplete checkboxes. The `auto-trigger-token-budget` failure showed the cost: a spec requirement with no code evidence sat in `missing`-equivalent limbo and shipped anyway. Making `missing` a hard CLI block (like archive does with checkboxes) gives the deterministic layer real teeth.

## What Changes

- Make `drift-check` exit non-zero when any scenario is `missing` (zero term matches), so it behaves as a hard gate — mirroring `archive.ts`'s non-zero block on incomplete tasks — rather than always exiting 0.
- Keep `drifted` advisory: it still surfaces in the report for agent judgment, but does not hard-block by default (it is not a deterministic enough signal).
- Add an opt-out (`--no-fail-on-missing` or config) so a user can run drift-check as a pure report, consistent with the project's advisory-by-default philosophy for non-deterministic signals — but the default is to block on `missing`.
- Ensure `--json` reflects the blocking state (e.g. a `blocked` field) so automation can rely on exit codes, and the human path prints the blocking findings clearly.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `drift-check-command`: a `missing` scenario SHALL cause the drift check to exit non-zero and block (delta spec), while `drifted` stays advisory.

## Impact

- `src/commands/drift-check.ts` — add exit-code logic (non-zero on `missing`), `--no-fail-on-missing` option, and JSON `blocked` field.
- `src/core/templates/workflows/drift-detection.ts` and `apply-change.ts` — reference the hard-block behavior where drift is checked during apply.
- `test/commands/drift-check.test.ts` — cover missing-blocks, drifted-advisory, `--no-fail-on-missing` override.
- No new dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — `missing` is a deterministic, high-confidence signal; refusing to block on it leaves a gate that only strong models honor. |
| Existing code reuse? | Yes — mirror `archive.ts`'s non-zero block semantics; extend the existing `drift-check` command and its `classifyScenario` status. |
| Stdlib? | Yes — `process.exitCode`; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
