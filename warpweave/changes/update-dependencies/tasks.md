## 1. Runtime dependencies

- [x] 1.1 Bump `@inquirer/core` 10.3.2 → 11.2.1 and `@inquirer/prompts` 7.10.1 → 8.5.2 in `package.json` and `pnpm-lock.yaml`
  - **Spec scenario**: n/a (skip_specs — dependency maintenance)
  - **Ladder rung**: 5 (installed dependency; Dependabot delta reuse)
  - **Test first**: existing prompt/interactive test suites pass after bump (no new test needed unless a prompt API changes)
  - **Verify**: `rtk vitest run test/core` and `rtk vitest run test/commands`
- [x] 1.2 Bump `commander` 14.0.3 → 15.0.0 in `package.json` and `pnpm-lock.yaml`
  - **Spec scenario**: n/a (skip_specs — dependency maintenance; commander 15 is ESM-only, repo is already ESM)
  - **Ladder rung**: 5 (installed dependency)
  - **Test first**: full CLI suite must stay green; add regression assertion if any `--no-*` flag semantics changed
  - **Verify**: `rtk vitest run test/cli/index.test.ts` then full `rtk vitest run`
- [x] 1.3 Verify paired `--opt`/`--no-opt` flags (`--init-git`/`--no-init-git` in `store.ts`, `--default`/`--no-default` in `schema.ts`) still default correctly under commander 15
  - **Spec scenario**: n/a (skip_specs — regression guard)
  - **Ladder rung**: 7 (minimum — assertion-level verification)
  - **Test first**: targeted test asserting `--init-git`/`--default` remain the default and negation opts out
  - **Verify**: `rtk vitest run test/commands/store.test.ts` and `rtk vitest run test/commands/schema.test.ts`

## 2. Dev dependencies

- [x] 2.1 Bump `eslint` 10.7.0 → 10.8.0 in `package.json` and `pnpm-lock.yaml`
  - **Spec scenario**: n/a (skip_specs — dev tooling)
  - **Ladder rung**: 5 (installed dependency)
  - **Test first**: lint run is the verification; no new test
  - **Verify**: `rtk npm run lint`
- [x] 2.2 Bump `@types/node` 20.19.43 → 26.1.0 in `package.json` and `pnpm-lock.yaml`
  - **Spec scenario**: n/a (skip_specs — dev types)
  - **Ladder rung**: 5 (installed dependency)
  - **Test first**: `tsc` build must pass with new types; fix any type errors introduced
  - **Verify**: `rtk pnpm build` (or `rtk npm run build`) and `rtk vitest run`

## 3. Node engine and CI alignment

- [x] 3.1 Raise `engines.node` in `package.json` from `>=20.19.0` to `>=22.12.0`
  - **Spec scenario**: n/a (skip_specs — runtime constraint)
  - **Ladder rung**: 6 (one-line version change)
  - **Test first**: n/a — metadata change; CI on 22.12 is the verification
  - **Verify**: `rtk node -p "require('./package.json').engines.node"`
- [x] 3.2 Align `node-version` to `22.12.0` in every workflow (`.github/workflows/ci.yml` ×3, `test.yml`, `build.yml`, `release.yml`, `security.yml`)
  - **Spec scenario**: n/a (skip_specs — CI alignment; includes Windows job)
  - **Ladder rung**: 6 (mechanical replacement)
  - **Test first**: n/a — workflow config
  - **Verify**: `rtk rg -n "node-version" .github/workflows/` shows `22.12.0` everywhere

## 4. CI actions (Dependabot PR #7)

- [x] 4.1 Bump `actions/checkout` 4 → 7 and `actions/setup-node` 4 → 7 in all workflows
  - **Spec scenario**: n/a (skip_specs — CI actions)
  - **Ladder rung**: 5 (dependency — reuse Dependabot diff)
  - **Test first**: n/a — exercised by CI
  - **Verify**: `rtk rg -n "actions/(checkout|setup-node)" .github/workflows/`
- [x] 4.2 Bump `pnpm/action-setup` 2 → 6 (keep `version: 9.15.9` matching `packageManager`), `actions/upload-artifact` 4 → 7, `softprops/action-gh-release` 1 → 3
  - **Spec scenario**: n/a (skip_specs — CI actions)
  - **Ladder rung**: 5 (dependency — reuse Dependabot diff)
  - **Test first**: n/a — exercised by CI
  - **Verify**: `rtk rg -n "pnpm/action-setup|actions/upload-artifact|softprops/action-gh-release" .github/workflows/`

## 5. Full verification

- [x] 5.1 Regenerate `pnpm-lock.yaml` cleanly and confirm no stray changes
  - **Spec scenario**: n/a (skip_specs — lockfile hygiene)
  - **Ladder rung**: 5 (dependency — pnpm install)
  - **Test first**: `git diff pnpm-lock.yaml` reviewed
  - **Verify**: `rtk pnpm install --lockfile-only` then `rtk git status`
- [x] 5.2 Run full test suite, lint, and build
  - **Spec scenario**: all (regression)
  - **Ladder rung**: 7 (verification)
  - **Test first**: n/a
  - **Verify**: `rtk vitest run` then `rtk npm run lint` then `rtk npm run build`
- [x] 5.3 Commit with task references and open a PR to `main`
  - **Spec scenario**: n/a (delivery)
  - **Ladder rung**: 7 (minimum)
  - **Test first**: n/a
  - **Verify**: `rtk gh pr create`
