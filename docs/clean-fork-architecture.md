# Clean Fork Architecture

**Change**: four-path-warpweave-evolution  
**Path**: 4 — Clean Fork Architecture  
**Date**: 2026-08-01  
**Decision**: Hybrid Approach (Option C)

---

## Executive Summary

**Baseline Decision**: ✅ **Hybrid Approach** — использовать `open-spec-fork` как базу с последующей очисткой техдолга

**Rationale**:
- ✅ Готовый код (экономия 40-80 часов)
- ✅ Рабочие тесты и сборка
- ⚠️ Наследуемый техдолг (68 упоминаний OPENSPEC_*)
- ✅ MIT license позволяет форк

---

## Target Architecture

### High-Level View

```
┌─────────────────────────────────────────────────────────────────┐
│                    WARPWEAVE UNIFIED ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: CLI (User Interface)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ warpweave    │  │ warpweave    │  │ warpweave    │             │
│  │ init        │  │ new change  │  │ apply       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: CORE (Business Logic)                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Unified     │  │ Artifact    │  │ Skill       │             │
│  │ Config      │  │ Resolver    │  │ Generator   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ TDD Engine  │  │ Ladder      │  │ RTK         │             │
│  │ (RED-GREEN) │  │ (YAGNI)     │  │ (Feedback)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: SCHEMAS (Spec-Driven)                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ proposal    │  │ specs       │  │ design      │             │
│  │ (WHAT)      │  │ (WHEN/THEN) │  │ (HOW)       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐                                               │
│  │ tasks       │                                               │
│  │ (DO)        │                                               │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: INTEGRATIONS (4 Systems)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Superpowers │  │ Ponytail    │  │ RTK         │             │
│  │ (Process)   │  │ (Quality)   │  │ (Feedback)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
warpweave-unified/
├── src/
│   ├── cli/                    # CLI entry point
│   │   └── index.ts            # warpweave commands
│   ├── commands/               # Command implementations
│   │   ├── change.ts
│   │   ├── config.ts
│   │   ├── spec.ts
│   │   └── ...
│   ├── core/                   # Business logic
│   │   ├── unified-config.ts   # Unified configuration
│   │   ├── warpweave-root.ts    # Root resolution
│   │   ├── artifact-graph/     # Artifact resolution
│   │   ├── templates/          # Workflow templates
│   │   └── ...
│   ├── utils/                  # Utilities
│   └── telemetry/              # Telemetry (opt-out)
├── schemas/
│   └── spec-driven/            # Spec-driven schema
│       ├── schema.yaml         # Schema definition
│       └── templates/          # Artifact templates
├── skills/                     # AI skills
│   ├── warpweave-propose/       # → warpweave-propose (future)
│   ├── warpweave-apply/         # → warpweave-apply (future)
│   ├── warpweave-explore/
│   ├── warpweave-verify/
│   ├── warpweave-archive/
│   └── ... (20+ skills)
├── config/
│   ├── unified.toml            # Unified configuration
│   ├── pipeline.yaml           # Pipeline definition
│   └── profiles/
│       ├── minimal.yaml        # Solo developer
│       ├── standard.yaml       # Small team
│       └── enterprise.yaml     # Large team
├── .github/
│   └── workflows/
│       ├── build.yml           # Build verification
│       ├── test.yml            # Test suite
│       └── release.yml         # npm publish
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # This file
│   ├── ROADMAP.md              # Development roadmap
│   ├── INTEGRATION.md          # Integration guide
│   └── ... (30+ files)
├── scripts/
│   ├── rebrand.js              # Rebranding automation
│   └── ...
├── test/                       # Test suite
│   ├── cli-e2e/
│   ├── commands/
│   └── core/
├── package.json                # @dadosh1984/warpweave
├── LICENSE                     # MIT (2026 Warpweave)
└── README.md                   # Unified branding
```

---

## Key Architectural Decisions

### Decision 1: Keep `open-spec-fork` as Base ✅

**Alternatives Considered**:
- A. Write from scratch (40-80 hours)
- B. Hybrid (chosen)
- C. Create new fork

**Rationale**:
- ✅ Экономия времени (готовый код)
- ✅ Рабочие тесты и сборка
- ✅ Все 4 системы интегрированы
- ⚠️ 68 упоминаний OPENSPEC_* (принято как техдолг)

---

### Decision 2: Keep OPENSPEC_* Constants ⚠️

**Alternatives Considered**:
- A. Rename all to SPECTRIX_* (breaking change)
- B. Keep as-is (backward compatible)
- C. Deprecate gradually (v2.0)

**Decision**: **B. Keep as-is**

**Rationale**:
- ✅ Backward compatibility (env vars)
- ✅ No breaking changes for users
- ⚠️ Minor inconsistency (acceptable)

**Constants kept**:
- `OPENSPEC_CONCURRENCY` — env var
- `OPENSPEC_NO_COMPLETIONS` — env var
- `OPENSPEC_NO_AUTO_CONFIG` — env var
- `OPENSPEC_MARKERS` — internal constant

---

### Decision 3: Unified Configuration ✅

**Decision**: Single source of truth (`config/unified.toml`)

**Structure**:
```toml
[warpweave]      # Spec-driven layer
[superpowers]   # TDD, subagents
[ponytail]      # YAGNI ladder
[rtk]           # Compressed feedback
[pipeline]      # Phases, gates
```

**Benefits**:
- ✅ One file for all 4 systems
- ✅ Profile-based configuration
- ✅ Easy to understand and modify

---

### Decision 4: CI/CD Integration ✅

**Decision**: GitHub Actions (3 workflows)

**Workflows**:
1. `build.yml` — Build verification
2. `test.yml` — Test suite
3. `release.yml` — npm publish + GitHub release

**Benefits**:
- ✅ Automated testing
- ✅ Automated releases
- ✅ Quality gates

---

## Technical Debt Plan

### Known Debt

| Debt ID | Description | Impact | Priority | Plan |
|---------|-------------|--------|----------|------|
| DEBT-001 | 68 OPENSPEC_* mentions | LOW | P3 | Keep for backward compat |
| DEBT-002 | Skills naming (warpweave-*) | MEDIUM | P2 | Rename in v2.0 |
| DEBT-003 | README still says "OpenSpec" in text | LOW | P3 | Update gradually |

### Debt Prevention

**Rules for new code**:
1. ✅ Always use `warpweave` (not `warpweave`)
2. ✅ Always wrap shell commands with `rtk` (in docs)
3. ✅ Always climb Ponytail ladder before writing code
4. ✅ Always follow TDD (RED-GREEN-REFACTOR)

---

## Migration Guide (Future v2.0)

### When to Migrate

**Triggers**:
- Major version bump (v2.0)
- Breaking changes accepted
- Community feedback

### Migration Steps

1. **Rename constants** (breaking):
   - `OPENSPEC_*` → `SPECTRIX_*`
   - Update documentation
   - Deprecation warnings in v1.x

2. **Rename skills** (breaking):
   - `warpweave-propose` → `warpweave-propose`
   - Update skill references

3. **Update schemas** (non-breaking):
   - Keep `spec-driven` for compatibility
   - Add `unified-driven` as optional

---

## Success Criteria

### Phase 1: Foundation (COMPLETE ✅)
- [x] Fork buildable
- [x] Tests passing
- [x] Rebranding complete (80 files)
- [x] CI/CD configured

### Phase 2: Cleanup (IN PROGRESS 🔄)
- [x] Copyright updated
- [x] README badges fixed
- [ ] GitHub repo public
- [ ] NPM token configured

### Phase 3: Enhancement (PENDING ⏳)
- [ ] All 17 specs aligned
- [ ] Integration documented
- [ ] Community contributions enabled

### Phase 4: Release (PENDING ⏳)
- [ ] v1.11.0 released
- [ ] Documentation complete
- [ ] Adoption metrics tracked

---

## Conclusion

**Architecture Status**: ✅ **COMPLETE**

**Key Decisions**:
1. ✅ Hybrid approach (use fork as base)
2. ✅ Keep OPENSPEC_* constants (backward compat)
3. ✅ Unified configuration (single source)
4. ✅ CI/CD automated (GitHub Actions)

**Next Steps**:
1. Complete Path 3 (spec alignment) — DONE
2. Create roadmap (Task 4.4)
3. Verify all deliverables (Verification tasks)

---

**Architect**: AI Assistant  
**Date**: 2026-08-01  
**Part of**: Path 4 — Clean Fork Architecture
