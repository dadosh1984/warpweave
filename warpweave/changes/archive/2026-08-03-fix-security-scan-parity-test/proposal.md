## Why

The guard added by `native-security-scan-parity` — the config-parity test asserting the security-scan skill is native (no semgrep) — cannot actually fire in the place that matters. It reads `.opencode/skills/warpweave-security-scan/SKILL.md` and bails out with `if (!existsSync(installed)) return;` when the file is absent. But `.opencode/` is gitignored (`.gitignore` line 155), so on any clean clone and in any CI run the installed copy does not exist, the test silently passes, and it never checks anything. The guard only ever protects the one machine where someone manually re-synced the file — the exact scenario we just watched fail (change 1 shipped a spec whose behavior was never implemented; a stale installed skill can regress the same way, invisible to this test).

## What Changes

- Make the native-security-scan parity guard assert against the **committed distribution source** `skills/warpweave-security-scan/SKILL.md`, which is always present in the repo and deterministic, instead of (only) the gitignored installed copy.
- Keep a best-effort check of the installed copy when present, so a locally stale install is still caught — but the primary guarantee now comes from the committed source that CI always sees.
- Update the test name/description to reflect that it now guards the distribution source with an optional install check.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `native-security-scan`: the parity guard SHALL verify the security-scan skill (source of truth) is native and SHALL run unconditionally in CI (delta spec).

## Impact

- `test/core/config-parity.test.ts` — repoint the security-scan guard at the committed source; keep optional installed-copy check.
- No runtime code, no dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — a guard that cannot fire in CI is a silent hole; the same spec-vs-reality class of bug just slipped through twice. |
| Existing code reuse? | Yes — reuse the existing config-parity guard structure; only change the path it asserts against. |
| Stdlib? | Yes — `fs`/`existsSync`/`readFileSync`; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **minimal**
