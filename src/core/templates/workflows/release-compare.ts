/**
 * Skill Template Workflow Modules
 *
 * Release Compare: compares the project before vs after a release, scores the
 * improvement on defined criteria, and warns (advisory, never blocking) when
 * the change falls below a configured minimum improvement threshold.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
import { STORE_SELECTION_GUIDANCE } from './store-selection.js';

export function getReleaseCompareSkillTemplate(): SkillTemplate {
  return {
    name: 'warpweave-release-compare',
    description: 'Compare the project before vs after a release and score the improvement on defined criteria. Use after each release or manually via /ww:release-compare to measure whether a change is a real improvement for the end user.',
    instructions: `Compare the project's state after a release against the previous release, score the improvement, and warn when it falls short of a configured minimum threshold.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a release tag or version. If omitted, use the most recent release and its previous release from the repository tags.

**Steps**

1. **Establish the baseline**

   Find the previous and current release tags:
   \`\`\`bash
   rtk git tag --sort=-version:refname
   \`\`\`
   - Current release: the newest tag.
   - Baseline: the previous tag in the list.

   If this is the project's first release (only one tag exists):
   - Report "First release — establishing baseline, no comparison possible yet."
   - Write the current state to \`warpweave/metrics/release-compare/<release>.md\` as the new baseline.
   - Stop.

2. **Measure the criteria**

   For the change between the baseline and the current release (\`rtk git diff <baseline>...<current>\`), measure each criterion:

   - **Tests** — pass rate and coverage: \`rtk vitest run\` (or the project's test command)
   - **Spec compliance** — run \`warpweave drift-check\` on the changes in this release; count compliant vs missing/drifted scenarios
   - **Security** — run the native security scan over the diff; count ERROR/WARNING/INFO findings
   - **Code size** — LOC added/removed: \`rtk git diff <baseline>...<current> --stat\`
   - **Dependencies** — diff the project manifests (\`package.json\`, \`cargo.toml\`, \`go.mod\`, ...); count added/removed
   - **Tokens** — \`rtk gain\` for the release's shell usage. **Budget effect**: when changes carry token-budget data (\`warpweave-token-budget\`), record per-change budget facts (budget set, tokens measured, near/over-ceiling events, skipped advisory triggers) and report the release's **average token spend per change** and its delta vs the previous release. Flag a regression if average spend per change worsened. If a release has no budget data, omit this subsection (no fabricated numbers, mark "n/a").
   - **User value** — agent judgment: which features the release delivered vs what was promised, clarity of the public API/UI, documentation accuracy, and the real benefit for the end user

   Record before/after values per criterion. Never fabricate a metric — mark missing data "n/a".

3. **Compute the improvement score**

   Score each criterion on a 0-100 scale for the current release and for the baseline. Compute the weighted improvement:
   - \`score_delta = score_after - score_before\` per criterion
   - Overall \`improvement\` = weighted average of the deltas (default weights: tests 25%, spec 20%, security 20%, code size 10%, dependencies 10%, tokens 5%, user value 10%)

   Report per-criterion before/after and the overall score.

4. **Check the threshold**

   Read the minimum improvement threshold:
   \`\`\`bash
   rtk grep "min_improvement" config/unified.toml
   \`\`\`
   Default: \`0.25\` (25%). If the project configures \`[quality] min_improvement\`, use that value.

   - If \`improvement >= threshold\`: report the improvement as satisfactory.
   - If \`improvement < threshold\`: flag the release as needing work, list which criteria dragged the score down, and recommend the changes to make before the next release. This is advisory — do NOT block the release.

5. **Write the report**

   Write the full report to:
   \`\`\`
   warpweave/metrics/release-compare/<release>.md
   \`\`\`
   Use this structure:

   \`\`\`markdown
   ## Release Compare: <release>

   **Baseline:** <previous-release>
   **Improvement:** <+X% or -X%> (threshold: <min_improvement>)

   | Criterion | Before | After | Delta | Weight |
   |-----------|--------|-------|-------|--------|
   | Tests | <n> | <n> | <±%> | 25% |
   | ... | | | | |

   ### Regressions
   - <criterion> worsened: <detail>

   ### User Value
   - <agent assessment of real user-facing benefit>

   **Verdict:** Satisfactory / Needs work — <reason>
   **Recommendation:** <what to do before the next release>
   \`\`\`

**Guardrails**
- Never modify project code, specs, or change artifacts — read-only except writing the release-compare report under \`warpweave/metrics/\`
- Never fabricate a metric; mark missing data "n/a"
- Report regressions explicitly — do not only surface improvements
- A below-threshold result warns and recommends; it never blocks a release
- If no previous release exists, establish the baseline and stop instead of comparing`,
    license: 'MIT',
    compatibility: 'Requires warpweave CLI and RTK.',
    metadata: { author: 'warpweave', version: '1.0' },
  };
}

export function getOpsxReleaseCompareCommandTemplate(): CommandTemplate {
  return {
    name: 'WW: Release Compare',
    description: 'Compare project before vs after a release and score the improvement',
    category: 'Metrics',
    tags: ['metrics', 'release', 'improvement', 'threshold', 'analytics'],
    content: `Compare the project's state after a release against the previous release, score the improvement, and warn when it falls short of a configured minimum threshold.

${STORE_SELECTION_GUIDANCE}

**Input**: Optionally specify a release tag or version after \`/ww:release-compare\` (e.g., \`/ww:release-compare v1.4.0\`). If omitted, use the most recent release and its previous release from the repository tags.

**Steps**

1. **Establish the baseline**

   Find the previous and current release tags:
   \`\`\`bash
   rtk git tag --sort=-version:refname
   \`\`\`
   - Current release: the newest tag.
   - Baseline: the previous tag in the list.

   If this is the project's first release (only one tag exists):
   - Report "First release — establishing baseline, no comparison possible yet."
   - Write the current state to \`warpweave/metrics/release-compare/<release>.md\` as the new baseline.
   - Stop.

2. **Measure the criteria**

   For the change between the baseline and the current release (\`rtk git diff <baseline>...<current>\`), measure each criterion:

   - **Tests** — pass rate and coverage: \`rtk vitest run\` (or the project's test command)
   - **Spec compliance** — run \`warpweave drift-check\` on the changes in this release; count compliant vs missing/drifted scenarios
   - **Security** — run the native security scan over the diff; count ERROR/WARNING/INFO findings
   - **Code size** — LOC added/removed: \`rtk git diff <baseline>...<current> --stat\`
   - **Dependencies** — diff the project manifests (\`package.json\`, \`cargo.toml\`, \`go.mod\`, ...); count added/removed
   - **Tokens** — \`rtk gain\` for the release's shell usage. **Budget effect**: when changes carry token-budget data (\`warpweave-token-budget\`), record per-change budget facts (budget set, tokens measured, near/over-ceiling events, skipped advisory triggers) and report the release's **average token spend per change** and its delta vs the previous release. Flag a regression if average spend per change worsened. If a release has no budget data, omit this subsection (no fabricated numbers, mark "n/a").
   - **User value** — agent judgment: which features the release delivered vs what was promised, clarity of the public API/UI, documentation accuracy, and the real benefit for the end user

   Record before/after values per criterion. Never fabricate a metric — mark missing data "n/a".

3. **Compute the improvement score**

   Score each criterion on a 0-100 scale for the current release and for the baseline. Compute the weighted improvement:
   - \`score_delta = score_after - score_before\` per criterion
   - Overall \`improvement\` = weighted average of the deltas (default weights: tests 25%, spec 20%, security 20%, code size 10%, dependencies 10%, tokens 5%, user value 10%)

   Report per-criterion before/after and the overall score.

4. **Check the threshold**

   Read the minimum improvement threshold:
   \`\`\`bash
   rtk grep "min_improvement" config/unified.toml
   \`\`\`
   Default: \`0.25\` (25%). If the project configures \`[quality] min_improvement\`, use that value.

   - If \`improvement >= threshold\`: report the improvement as satisfactory.
   - If \`improvement < threshold\`: flag the release as needing work, list which criteria dragged the score down, and recommend the changes to make before the next release. This is advisory — do NOT block the release.

5. **Write the report**

   Write the full report to:
   \`\`\`
   warpweave/metrics/release-compare/<release>.md
   \`\`\`
   Use this structure:

   \`\`\`markdown
   ## Release Compare: <release>

   **Baseline:** <previous-release>
   **Improvement:** <+X% or -X%> (threshold: <min_improvement>)

   | Criterion | Before | After | Delta | Weight |
   |-----------|--------|-------|-------|--------|
   | Tests | <n> | <n> | <±%> | 25% |
   | ... | | | | |

   ### Regressions
   - <criterion> worsened: <detail>

   ### User Value
   - <agent assessment of real user-facing benefit>

   **Verdict:** Satisfactory / Needs work — <reason>
   **Recommendation:** <what to do before the next release>
   \`\`\`

**Guardrails**
- Never modify project code, specs, or change artifacts — read-only except writing the release-compare report under \`warpweave/metrics/\`
- Never fabricate a metric; mark missing data "n/a"
- Report regressions explicitly — do not only surface improvements
- A below-threshold result warns and recommends; it never blocks a release
- If no previous release exists, establish the baseline and stop instead of comparing`
  };
}
