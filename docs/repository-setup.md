# Repository Setup Guide

**Change**: four-path-warpweave-evolution  
**Path**: 2 — Fork Development  
**Task**: 2.4 + 2.5 — CI/CD + Repository Visibility

---

## CI/CD Workflows Created ✅

Three GitHub Actions workflows have been created in `.github/workflows/`:

### 1. `build.yml` — Build Verification

**Triggers**: Push to `main`, Pull Requests

**What it does**:
- Sets up Node.js 20.19.0
- Installs pnpm 9.15.9
- Runs `pnpm install --no-frozen-lockfile`
- Runs `pnpm build`
- Verifies `dist/` directory exists

**Status**: ✅ Ready to use

---

### 2. `test.yml` — Test Suite

**Triggers**: Push to `main`, Pull Requests

**What it does**:
- Sets up Node.js 20.19.0
- Installs pnpm 9.15.9
- Runs `pnpm install --no-frozen-lockfile`
- Runs `pnpm test`
- Uploads test results as artifact (if available)

**Status**: ✅ Ready to use

---

### 3. `release.yml` — npm Publish + GitHub Release

**Triggers**: Tag push (e.g., `v1.10.1`)

**What it does**:
- Sets up Node.js 20.19.0 with npm registry
- Installs pnpm 9.15.9
- Runs `pnpm install --no-frozen-lockfile`
- Runs `pnpm build`
- Runs `pnpm test`
- Publishes to npm (`@dadosh1984/warpweave`)
- Creates GitHub Release with auto-generated notes

**Required Secrets**:
- `NPM_TOKEN` — npm publish token (get from npmjs.com → Account → Access Tokens)

**Status**: ✅ Ready to use (after adding NPM_TOKEN secret)

---

## Repository Visibility Setup

### Step 1: Make Repository Public

**If repository is currently private**:

1. Go to `https://github.com/dadosh1984/warpweave/settings`
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Make public"
5. Confirm

**Verification**:
- Visit `https://github.com/dadosh1984/warpweave` without logging in
- Should be visible

---

### Step 2: Add Repository Metadata

**Recommended additions**:

1. **Description** (in repo header):
   ```
   Spec-driven development with Ponytail, Superpowers, and RTK — one organism, four systems, zero waste
   ```

2. **Website**:
   ```
   https://www.npmjs.com/package/@dadosh1984/warpweave
   ```

3. **Topics** (tags):
   ```
   warpweave, warpweave, spec-driven, ai, cli, typescript, ponytail, superpowers, rtk
   ```

---

### Step 3: Add NPM Token Secret

**For release workflow**:

1. Go to `https://www.npmjs.com/settings/YOUR_USERNAME/tokens`
2. Create new token:
   - Name: `GitHub Actions Release`
   - Expiration: Never (or set expiry)
   - Permissions: `Read and Publish`
3. Copy the token (e.g., `npm_XXXXXXXXXXXXXXXXXXXX`)
4. Go to `https://github.com/dadosh1984/warpweave/settings/secrets/actions`
5. Click "New repository secret"
6. Add:
   - Name: `NPM_TOKEN`
   - Value: `<paste token>`
7. Click "Add secret"

**Verification**:
- Trigger a test release by creating a tag:
  ```bash
  git tag v1.10.1-test
  git push origin v1.10.1-test
  ```
- Check Actions tab for release workflow

---

## Quick Start Checklist

- [x] CI/CD workflows created (build.yml, test.yml, release.yml)
- [ ] Repository made public
- [ ] Repository description added
- [ ] Repository topics added
- [ ] NPM_TOKEN secret added
- [ ] Test release triggered

---

## Troubleshooting

### Build fails with "ENOLOCK"

**Error**: `pnpm install` fails with "Cannot install with frozen-lockfile"

**Fix**: The workflow already uses `--no-frozen-lockfile` flag. If still failing:
- Check `pnpm-lock.yaml` is committed
- Ensure Node.js version matches (20.19.0)

### Tests fail on CI but pass locally

**Possible causes**:
- Different environment (Windows vs your local)
- Missing environment variables
- File path differences (Windows `\` vs Unix `/`)

**Fix**:
- Check test output in Actions tab
- Add `console.log` debugging
- Ensure tests are cross-platform compatible

### Release workflow doesn't trigger

**Check**:
- Tag format: must be `v*` (e.g., `v1.10.1`)
- Tag pushed to `origin`: `git push origin v1.10.1`
- NPM_TOKEN secret exists

---

## Next Steps

After CI/CD is working:

1. **Enable branch protection** (Settings → Branches → Add rule):
   - Branch name pattern: `main`
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Select `build` and `test` as required checks

2. **Set up npm provenance** (optional):
   - Add to `package.json`:
     ```json
     "publishConfig": {
       "provenance": true
     }
     ```

3. **Add release automation** (optional):
   - Use Changesets for version management
   - Auto-generate CHANGELOG.md

---

**Created by**: AI Assistant  
**Date**: 2026-08-01  
**Status**: ✅ CI/CD workflows ready, awaiting GitHub setup
