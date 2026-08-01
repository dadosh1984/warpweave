# Bug List — @dadosh1984/warpweave@1.10.0

**Change**: four-path-warpweave-evolution  
**Path**: 1 — Production Readiness  
**Date**: 2026-08-01

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| **BLOCKER** | 0 | — |
| **MAJOR** | 5 | Open |
| **MINOR** | 2 | Open |
| **INFO** | 1 | Open |

**Total**: 8 issues

---

## MAJOR Issues

### BUG-001: Incomplete Rebranding (108 → 524 mentions)

**Severity**: MAJOR  
**Category**: Code Quality  
**Files affected**: 524 lines in `src/**/*.ts`

**Description**:  
Код содержит 524 упоминания `warpweave` / `OpenSpec`, хотя пакет называется `@dadosh1984/warpweave`.

**Examples**:
```typescript
// src/commands/config.ts:192
const openspecDir = path.join(projectDir, OPENSPEC_DIR_NAME);

// src/core/archive.ts:10
import { resolveOpenSpecRoot, ... } from './root-selection.js';

// src/commands/feedback.ts:101
const repo = 'Fission-AI/OpenSpec';
```

**Impact**:
- Пользователи видят сообщения про `warpweave`, а не `warpweave`
- Путаница при чтении ошибок
- Несоответствие брендингу пакета

**Fix**: Автоматическая замена через `ast_edit` или `sed`:
- `warpweave` → `warpweave`
- `OpenSpec` → `Warpweave`
- `OPENSPEC_` → `SPECTRIX_`

**Estimated effort**: 2-3 часа (автоматически)

---

### BUG-002: LICENSE Copyright Outdated

**Severity**: MAJOR  
**Category**: Legal  
**File**: `LICENSE`

**Description**:  
Copyright header указывает на `OpenSpec Contributors`, должен указывать на `Warpweave Contributors`.

**Current**:
```
Copyright (c) 2024 OpenSpec Contributors
```

**Expected**:
```
Copyright (c) 2026 Warpweave Contributors
```

**Impact**:
- Юридическая неопределённость авторства
- Нарушение условий MIT (требуется корректный copyright)

**Fix**: Обновить первую строку LICENSE

**Estimated effort**: 5 минут

---

### BUG-003: README Badges Point to Wrong Repository

**Severity**: MAJOR  
**Category**: Documentation  
**File**: `README.md`

**Description**:  
Бейджи в README ссылаются на `Fission-AI/OpenSpec`, а не на `dadosh1984/warpweave`.

**Affected badges**:
1. CI status: `github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml`
2. Stars: `github.com/Fission-AI/OpenSpec`
3. Contributors: `github.com/Fission-AI/OpenSpec/graphs/contributors`

**Impact**:
- Вводит в заблуждение о принадлежности проекта
- Показывает чужие метрики (63k звёзд оригинала)

**Fix**: Заменить все URL в бейджах на `dadosh1984/warpweave`

**Estimated effort**: 15 минут

---

### BUG-004: Repository Visibility Unknown

**Severity**: MAJOR  
**Category**: Infrastructure  
**File**: N/A (GitHub settings)

**Description**:  
Репозиторий `github.com/dadosh1984/warpweave` не найден в поиске GitHub.

**Possible causes**:
- Репозиторий приватный (private)
- Репозиторий не существует
- Репозиторий новый, ещё не проиндексирован

**Impact**:
- Невозможно контрибьютить
- Невозможно проверить код
- Нет доверия к проекту

**Fix**:
1. Проверить существование репозитория
2. Сделать public (если private)
3. Добавить description и website link

**Estimated effort**: 10 минут

---

### BUG-005: CI/CD Not Configured

**Severity**: MAJOR  
**Category**: Infrastructure  
**Files**: `.github/workflows/` (отсутствуют)

**Description**:  
Отсутствуют GitHub Actions workflows для автоматизации.

**Expected workflows**:
- `build.yml` — сборка при push/PR
- `test.yml` — тесты при PR
- `release.yml` — публикация в npm при релизе

**Impact**:
- Нет автоматической проверки кода
- Ручная публикация релизов
- Возможны регрессии

**Fix**: Создать `.github/workflows/` с 3 файлами

**Estimated effort**: 1-2 часа

---

## MINOR Issues

### BUG-006: Package Author Field Outdated

**Severity**: MINOR  
**Category**: Metadata  
**File**: `package.json`

**Description**:  
Поле `author` указывает на `OpenSpec Contributors`.

**Current**:
```json
"author": "OpenSpec Contributors"
```

**Expected**:
```json
"author": "Warpweave Contributors"
```

**Fix**: Обновить поле `author`

**Estimated effort**: 2 минуты

---

### BUG-007: CLI Help Shows Wrong Command Names

**Severity**: MINOR  
**Category**: UX  
**Files**: `src/cli/index.ts`, `src/commands/**/*.ts`

**Description**:  
Некоторые сообщения об ошибках и help текст упоминают `warpweave` вместо `warpweave`.

**Example**:
```
src/commands/feedback.ts:101: const repo = 'Fission-AI/OpenSpec';
```

**Impact**:
- Пользователи видят неправильные команды в ошибках

**Fix**: Часть BUG-001 (автоматическая замена)

**Estimated effort**: Включено в BUG-001

---

## INFO Issues

### BUG-008: postinstall.js Mentions Wrong Command

**Severity**: INFO  
**Category**: UX  
**File**: `scripts/postinstall.js`

**Description**:  
Postinstall скрипт печатает подсказку про `warpweave completion install`.

**Current**:
```javascript
console.log(`\nTip: Run 'warpweave completion install' for shell completions`);
```

**Expected**:
```javascript
console.log(`\nTip: Run 'warpweave completion install' for shell completions`);
```

**Impact**:
- Пользователи запускают неправильную команду

**Fix**: Часть BUG-001

**Estimated effort**: Включено в BUG-001

---

## Verification

### Tests Run

```bash
# Security audit
✓ pnpm audit --json                    # 0 vulnerabilities
✓ grep -rn "eval" src/                 # 0 matches (legitimate execSync only)
✓ grep -rn "fetch|axios" src/          # 0 matches

# Functionality tests
✓ warpweave --version                   # Works
✓ warpweave --help                      # Works
✓ warpweave new change "test"           # Works
✓ warpweave status --change test        # Works

# Code quality
✓ grep -rn "warpweave" src/ | wc -l     # 524 matches
```

---

## Priority Order

1. **BUG-002** (LICENSE) — 5 минут, юридический риск
2. **BUG-006** (package.json author) — 2 минуты
3. **BUG-001** (Rebranding) — 2-3 часа, влияет на всё
4. **BUG-003** (README badges) — 15 минут
5. **BUG-004** (Repo visibility) — 10 минут
6. **BUG-005** (CI/CD) — 1-2 часа

**Total estimated effort**: 4-7 часов

---

**Generated by**: AI Assistant  
**Part of**: four-path-warpweave-evolution change  
**Next**: Path 2 — Fork Development (cleanup)
