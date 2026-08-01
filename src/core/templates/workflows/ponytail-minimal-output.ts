/**
 * Skill Template Workflow Modules
 *
 * Ponytail Minimal Output: the YAGNI ladder that keeps output minimal,
 * marking deliberate simplifications with `// ponytail:` debt markers.
 */
import type { SkillTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getPonytailMinimalOutputSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-ponytail-minimal-output',
    description: 'Write the minimum that works using the YAGNI ladder. Use for every implementation task to avoid over-engineering, and mark deliberate simplifications with `// ponytail:` debt markers.',
    instructions: `Write the minimum that works.

**Why**: The best code is the code you never wrote. Every line is a liability — it has to be read, tested, and maintained. Climb the ladder before writing each line, and stop at the first rung that holds. Mark the simplifications you make deliberately so future-you can revisit them.

${STORE_SELECTION_GUIDANCE}

## When to Use

Use this skill for every implementation task, before writing each line of code, refactors, dependency choices, and diff reviews.

## When NOT to Use

Do not use this skill as an excuse to cut validation, error handling, security, accessibility, or any line a spec scenario depends on.

## Goal

Produce the smallest correct implementation that satisfies the requirements. Never cut correctness or safety; only cut everything else.

## The Ladder

Before writing each line, climb the ladder. Stop at the first rung that holds:

| Rung | Check |
|------|-------|
| 1 | **YAGNI** — does this need to exist at all? If not, skip it |
| 2 | **Reuse** — is it already in this codebase? Use that |
| 3 | **Stdlib** — does the standard library cover it? Use it |
| 4 | **Native** — does the platform feature exist? Use it |
| 5 | **Dependency** — is an installed dependency doing this? Use it |
| 6 | **One-liner** — could this be a single expression? Make it one |
| 7 | **Minimum** — only then, the smallest correct implementation |

## Workflow

### 1) Climb before you type

For every line you are about to add, ask: "Would the senior engineer with the ponytail delete this?" If yes, do not write it.

### 2) Mark what you deliberately leave out

When you consciously simplify, leave a trace so the debt is visible and repayable:

\`\`\`ts
// ponytail: <reason>
\`\`\`

Examples of what gets marked:
- A case you deliberately do not handle (duplicate of an existing branch, simplify later)
- A shared style you copy instead of abstracting
- A fast path you skip because the general path already covers it

### 3) Never cut the non-negotiables

The ladder never authorizes dropping:
- **Validation** — invalid input handling
- **Error handling** — failures are reported, not swallowed
- **Security** — auth, secrets, injection, permissions
- **Accessibility** — keyboard, screen-reader, contrast

If the minimal version would cut one of these, it is not minimal — it is broken. Keep it.

### 4) Review each diff against the ladder

After writing, re-read the diff line by line. For each added line, climb the ladder again. Delete anything that fails the ladder.

## Anti-patterns

- Don't build abstractions for one use site (YAGNI)
- Don't add a dependency when stdlib or existing code covers it (rung 3/2)
- Don't leave duplicate code when a one-liner reuse exists (rung 6)
- Don't mark critical cuts as ponytail debt — those are bugs, not simplifications`,
    license: 'MIT',
    compatibility: 'Requires warpweave CLI.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}
