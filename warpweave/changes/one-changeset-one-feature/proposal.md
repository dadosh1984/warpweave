## Why

Release 1.4.0 shipped **five unrelated features inside a single changeset** (auto-trigger, native security-scan, guardrails-in-core, release-compare, and a `WORKFLOW_TO_SKILL_DIR` bugfix). With the release process now automated, one-changeset-many-features is a recurring footgun: it garbles git blame and forces rolling back unrelated work together if one feature breaks. Now is the right time to lock in the convention.

## What Changes

- Add a documented release-process convention: **one changeset = one logical feature**.
- Where the rule lives (recommended): `AGENTS.md` (release/process section) and the release-related guidance (`docs/` release notes / changeset docs), plus a one-line note in the `CHANGELOG.md` contributing guideline if present.
- Allowed exception: a single changeset may group a pure bug fix that is strictly required to unblock its own feature; otherwise unrelated changes get separate changesets.
- No code or runtime behavior change.

## Capabilities

### New Capabilities
(none — process/convention documentation; `skip_specs: true`)

### Modified Capabilities
(none)

## Impact

- `AGENTS.md` (+ relevant `docs/` if present) — add the one-changeset-one-feature convention.
- No runtime code, no dependencies, no CI change.

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — the release pipeline is automated (changesets-driven) and has no guardrails telling the author to split; the convention is the missing guardrail. |
| Existing code reuse? | Yes — document the rule where release guidance already lives; no new tooling. |
| Stdlib? | No. |
| Native platform? | No. |
| New dependency? | No. |

## Complexity

Complexity: **minimal**
