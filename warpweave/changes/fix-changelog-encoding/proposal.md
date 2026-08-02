## Why

The 1.4.0 `CHANGELOG.md` entry contains a real U+FFFD (replacement character) — `...changed code �? no semgrep or Docker required.` — a UTF-8 em-dash was already lost before the changeset was committed and cannot be recovered. Without a guard, mis-encoded characters silently re-enter release notes and docs. (The source `skills/warpweave-security-scan/SKILL.md` was checked and is valid UTF-8; the perceived corruption there was a terminal rendering artifact.)

## What Changes

- Manually fix the broken character in `CHANGELOG.md` (1.4.0 entry) to the proper em-dash.
- Add a CI validation that `.changeset/*.md` and `CHANGELOG.md` contain no invalid UTF-8 / replacement characters (`U+FFFD`), mirroring the existing `config-parity` pattern — fails the build if a stray replacement character appears.
- No runtime behavior change.

## Capabilities

### New Capabilities
(none — docs + CI tooling; `skip_specs: true`)

### Modified Capabilities
(none)

## Impact

- `CHANGELOG.md` — fix `U+FFFD` in 1.4.0 entry.
- A CI validation (e.g., `test/core/config-parity.test.ts`) that scans changeset/doc files for `U+FFFD`.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — char corruption is recurring (two instances already); a cheap check prevents silently broken docs. |
| Existing code reuse? | Yes — reuse the `config-parity.test.ts` pattern already in the repo for byte/encoding validation instead of a new mechanism. |
| Stdlib? | Yes — Node `Buffer`/string decoding to detect `U+FFFD`; no library needed. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **minimal**
