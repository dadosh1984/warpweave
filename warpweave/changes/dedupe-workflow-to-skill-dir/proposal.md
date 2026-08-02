## Why

`WORKFLOW_TO_SKILL_DIR` is duplicated: `src/core/init.ts:77` and `src/core/profile-sync-drift.ts:20` each maintain an independent, byte-identical 27-entry map. Release 1.4.0 only made the counts match (27=27) without removing the duplication — the next skill added will again be updated in one file but not the other, and the drift bug returns. Duplicated source of truth is the root cause; this change eliminates it once.

## What Changes

- `src/core/init.ts` stops defining its own `WORKFLOW_TO_SKILL_DIR` and **imports** the single source of truth from `src/core/profile-sync-drift.ts`.
- Add a regression test in `test/core/config-parity.test.ts` asserting both `init.ts` and `profile-sync-drift.ts` resolve the workflow→skill map from the single imported source (guards against re-introducing a duplicate).
- Observable `init` behavior is unchanged.

## Capabilities

### New Capabilities
(none — pure refactor; `skip_specs: true`)

### Modified Capabilities
(none)

## Impact

- `src/core/init.ts` — remove the local map, import the shared one.
- `src/core/profile-sync-drift.ts` — unchanged (remains the single source).
- `test/core/config-parity.test.ts` — new regression test.
- Verify no circular import is introduced between `init.ts` and `profile-sync-drift.ts`.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the duplicated map already caused one drift cycle; a single source + guard prevents recurrence at near-zero cost. |
| Existing code reuse? | Yes — reuse the already-typed map exported from `profile-sync-drift.ts` instead of a third definition. |
| Stdlib? | No — stdlib cannot deduplicate the map. |
| Native platform? | No. |
| New dependency? | No — plain import; no new dependency. |

## Complexity

Complexity: **minimal**
