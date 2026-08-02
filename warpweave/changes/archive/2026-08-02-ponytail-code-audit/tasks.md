## 1. Inventory & Baseline

- [x] 1.1 Build a file inventory of `src/`, `test/`, and `scripts/` with line counts per file
  - **Spec scenario**: N/A — skip_specs change (audit deliverable, no product spec)
  - **Ladder rung**: 3 (stdlib — `node:fs`/`node:path` for traversal, `rg` for counts)
  - **Test first**: N/A — read-only audit, no code under test
  - **Verify**: `rtk node -e "..."` counts match file counts from `Get-ChildItem` on Windows / `find` on POSIX
- [x] 1.2 Record the audit snapshot date and `warpweave --version` in the report header
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 6 (one-liner — header line in Markdown)
  - **Test first**: N/A
  - **Verify**: `rtk warpweave --version`

## 2. Rung 1 — YAGNI (does this need to exist?)

- [x] 2.1 Scan for dead exports, unused files, and unreachable branches in `src/`
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 2 (reuse — `ladder-audit` skill methodology, rung 1 check)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "<candidate>" src/` returns no cross-file references before listing; mark uncertain hits as "verify"
- [x] 2.2 Scan `test/` for dead or duplicated test fixtures and helpers
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 1 (YAGNI — flag helpers with no consumers)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "<helper-name>" test/ src/` confirms zero references

## 3. Rung 2 — Reuse (already in this codebase?)

- [x] 3.1 Find duplicated logic blocks in `src/` (candidates: similar `print*`/`resolve*`/`build*` functions)
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 2 (reuse — same codebase)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "function <name>" src/` shows duplicate sites; list both file:line refs
- [x] 3.2 Check `src/utils/*` and `src/core/shared/*` for already-existing utilities the audit should flag as "reuse instead"
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 2 (reuse)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "from '../../utils" src/` cross-references shared helpers

## 4. Rungs 3–5 — Stdlib / Native / Dependency

- [x] 4.1 Identify dependencies in `package.json` that reimplement stdlib or are lightly used
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 3 (stdlib) / 5 (dependency — flag candidates, do not remove)
  - **Test first**: N/A
  - **Verify**: `rtk node -e "..."` counts `import` occurrences of each flagged dependency in `src/`
- [x] 4.2 Flag Windows-path handling that hardcodes slashes or assumes forward slashes
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 4 (native — `path.join`/`path.resolve` are the platform-correct choice)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "'/" src/ test/` and manual review for path joins built by string concatenation

## 5. Rung 6–7 — One-liner & Minimum

- [x] 5.1 Flag verbose blocks that could be single expressions (candidates: multi-step `if/else` returning booleans, redundant ternaries)
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 6 (one-liner)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "if (.*) return true" src/` plus visual scan of flagged sites
- [x] 5.2 Identify ceremony around simple lookups (explicit list lookups vs. pattern-matching on generated artifacts)
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 7 (minimum)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "startsWith\|includes(" src/core/templates/` review

## 6. Deliberate Simplifications (debt markers)

- [x] 6.1 For each finding that is a deliberate simplification, propose the exact `// ponytail: <reason>` marker
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 2 (reuse — `debt-ledger` marker convention)
  - **Test first**: N/A
  - **Verify**: `rtk grep -rn "ponytail:" src/` shows existing marker style to match

## 7. Report & Priority

- [x] 7.1 Write `docs/ponytail-audit.md` with sections per ladder rung, file/line refs, and a findings summary table
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 7 (minimum — single Markdown deliverable, see design D1)
  - **Test first**: N/A
  - **Verify**: `rtk node -e "require('fs').readFileSync('docs/ponytail-audit.md')"` file exists and parses
- [x] 7.2 Rank recommendations by effort × impact; flag "verify" items explicitly
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 1 (YAGNI — only include findings worth acting on)
  - **Test first**: N/A
  - **Verify**: manual review of the report's priority table
- [x] 7.3 Cross-check report file/line references still resolve (re-run after any concurrent commits)
  - **Spec scenario**: N/A — skip_specs change
  - **Ladder rung**: 3 (stdlib — `rg -n` to re-anchor)
  - **Test first**: N/A
  - **Verify**: `rtk grep -n "<finding-text>" <file>` for each listed finding
