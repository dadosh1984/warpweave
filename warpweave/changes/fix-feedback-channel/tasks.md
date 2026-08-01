## 1. Feedback command fallback (cli-feedback)

- [ ] 1.1 Add failing test: manual-submission fallback surfaces the canonical Discord channel
  - **Spec scenario**: Missing gh CLI with fallback; Unauthenticated gh CLI with fallback; gh CLI execution failure; Network failure
  - **Ladder rung**: 1 (test only, RED)
  - **Test first**: In `test/commands/feedback.test.ts`, extend the missing-gh, unauthenticated, and `gh issue create` failure tests (or add one) to assert `console.log` output contains `discord.gg/RHpQMYfje`. Existing assertions on `dadosh1984/warpweave/issues/new` stay — the pre-filled URL is retained.
  - **Verify**: `rtk vitest run test/commands/feedback.test.ts`
- [ ] 1.2 Append the Discord invite to the fallback output in `src/commands/feedback.ts`
  - **Spec scenario**: Missing gh CLI with fallback; Unauthenticated gh CLI with fallback; gh CLI execution failure; Network failure
  - **Ladder rung**: 2 (reuse existing `handleFallback`/`reportGhFailure` flow; append one channel line)
  - **Test first**: covered by 1.1 (fails until this task lands)
  - **Verify**: `rtk vitest run test/commands/feedback.test.ts`

## 2. init feedback link (cli-init, implementation-only)

- [ ] 2.1 Add test: `warpweave init` success output shows the canonical Discord invite as the feedback link
  - **Spec scenario**: cli-init - "Displaying success message" (links to documentation and feedback)
  - **Ladder rung**: 1 (test only, RED)
  - **Test first**: In `test/core/init.test.ts`, assert the post-init output's feedback line contains `discord.gg/RHpQMYfje`.
  - **Verify**: `rtk vitest run test/core/init.test.ts`
- [ ] 2.2 Swap the `Feedback:` URL in `src/core/init.ts` from `https://github.com/dadosh1984/warpweave/issues` to `https://discord.gg/RHpQMYfje`
  - **Spec scenario**: cli-init - "Displaying success message"
  - **Ladder rung**: 6 (one-liner string change)
  - **Test first**: covered by 2.1 (fails until this task lands)
  - **Verify**: `rtk vitest run test/core/init.test.ts`

## 3. Docs and README links

- [ ] 3.1 Replace the foreign Discord invite `discord.gg/YctCnvvshC` with `discord.gg/RHpQMYfje`
  - **Spec scenario**: n/a (documentation)
  - **Ladder rung**: 6 (mechanical text replacement)
  - **Test first**: n/a — docs carry no tests
  - **Verify**: `rtk grep YctCnvvshC` returns no matches across `README.md` and `docs/` (README.md, docs/README.md, docs/faq.md, docs/troubleshooting.md, docs/ww.md, docs/MIGRATION.md, docs/migration-guide.md)
- [ ] 3.2 Replace GitHub issues feedback links that point to restricted or foreign repositories with the canonical Discord channel
  - **Spec scenario**: n/a (documentation)
  - **Ladder rung**: 6 (mechanical text replacement)
  - **Test first**: n/a — docs carry no tests
  - **Verify**: `rtk grep` finds no `Fission-AI/OpenSpec/issues`, `Fission-AI/warpweave/issues`, or `dadosh1984/warpweave/issues` in `docs/`; keep `warpweave feedback` mentions, rewording "opens a GitHub issue" statements (docs/faq.md:151, docs/troubleshooting.md:190) so they no longer promise a working GitHub issue when creation is restricted

## 4. Full verification

- [ ] 4.1 Run the full test suite and lint
  - **Spec scenario**: all
  - **Ladder rung**: 7 (verification, no new code)
  - **Test first**: n/a
  - **Verify**: `rtk vitest` then `rtk npm run lint`
