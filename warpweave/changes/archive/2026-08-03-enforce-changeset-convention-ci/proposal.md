## Why

The "one changeset = one logical feature" convention currently lives only as prose in `AGENTS.md` and was documented (not enforced) by the archived `one-changeset-one-feature` change. With no CI signal, a changeset that bundles unrelated features ships silently — and this batch showed the cost of trusting prose contracts: two of the three findings were exactly "promised-in-text behavior that was never implemented/seen." The convention deserves, at minimum, a light **advisory** CI check (warn, not block) so a bundling changeset is called out instead of merged unnoticed.

## What Changes

- Add an **advisory** CI step to `.github/workflows/ci.yml` in the `validate-changesets` job ("Validate Release Tracking") that inspects the changed changesets and emits a warning (non-blocking, `::warning::`) when a single changeset appears to describe multiple unrelated features (e.g. its summary mentions several distinct concerns / lists multiple release-note bullets).
- The check is deliberately heuristic and advisory: it flags a *possible* violation and prints the changeset summary for human review, never fails the job. It is not a binding guard.
- Keep it opt-in-simple and maintainable: a small Node script under `.github/` or `scripts/` that reads the changed changeset files and reports a warning heuristic.

## Capabilities

### New Capabilities
- `ci-changeset-convention`: CI emits a non-blocking advisory warning when a changed changeset may bundle multiple unrelated features (delta spec).

### Modified Capabilities
(none)

## Impact

- `.github/workflows/ci.yml` — add advisory changeset-convention check to the validate-changesets job.
- A small `scripts/changeset-convention-check.js` (or under `.github/`) — the heuristic.
- No runtime code, no new dependencies.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the human-authored convention alone just failed us twice; an advisory CI signal is the cheapest tripwire. |
| Existing code reuse? | Yes — reuse the existing `validate-changesets` job and changeset file list it already computes. |
| Stdlib? | Yes — a plain Node script; no library. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **normal**
