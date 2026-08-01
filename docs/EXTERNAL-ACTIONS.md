# External Actions (Manual)

**These actions require manual execution by the repository owner.**

---

## ✅ Completed (Automated)

- [x] package.json updated (name: warpweave, version: 1.0.0)
- [x] NOTICE.md created
- [x] bin/ww.js created (renamed from spectrix.js)
- [x] src/ rebranded (1189 mentions)
- [x] docs/ rebranded (38 files)
- [x] skills/ renamed (openspec-* → warpweave-*)
- [x] README.md updated
- [x] CI/CD workflows updated
- [x] Dual support for constants (OPENSPEC_* + WARPWEAVE_*)
- [x] Build successful ✅
- [x] CLI works (`ww --help`, `ww --version`) ✅
- [x] Migration guide created
- [x] grep verification passed

---

## ⚠️ Manual Actions Required

### 1. GitHub Repository Rename

**Action**: Rename GitHub repository from `dadosh1984/spectrix` to `dadosh1984/warpweave`

**Method A: GitHub CLI** (if installed)
```bash
gh repo rename warpweave --repo dadosh1984/spectrix
```

**Method B: GitHub Web UI**
1. Go to https://github.com/dadosh1984/spectrix/settings
2. Scroll to "Danger Zone"
3. Click "Change repository name"
4. Enter `warpweave`
5. Confirm

**Result**: 
- Repository renamed to `dadosh1984/warpweave`
- GitHub creates automatic redirect from old URL
- Update local git remote:
  ```bash
  git remote set-url origin https://github.com/dadosh1984/warpweave.git
  ```

---

### 2. npm Publish (New Package)

**Action**: Publish `warpweave@1.0.0` to npm

**Prerequisites**:
- Be logged in to npm: `npm login`
- Have publish access to `dadosh1984` scope (or publish as unscoped `warpweave`)

**Command**:
```bash
cd E:\SYSTEM\Desktop\AI_Projects\open-spec-fork
npm publish --access public
```

**Expected Output**:
```
+ warpweave@1.0.0
```

**Verify**:
- Visit https://www.npmjs.com/package/warpweave
- Should show version 1.0.0

---

### 3. npm Deprecate (Old Package)

**Action**: Deprecate `@dadosh1984/spectrix` with migration message

**Command**:
```bash
npm deprecate @dadosh1984/spectrix "Package renamed to warpweave: npm install -g warpweave"
```

**Result**:
- Old package shows deprecation warning
- Users see migration message when installing

**Verify**:
```bash
npm view @dadosh1984/spectrix
# Should show deprecation message
```

---

### 4. Update GitHub Repository Metadata

**Action**: Update repository description and topics

**Steps**:
1. Go to https://github.com/dadosh1984/warpweave
2. Click "About" section (right sidebar)
3. Update description:
   ```
   Spec-driven development with Ponytail, Superpowers, and RTK — one organism, four systems, zero waste
   ```
4. Add topics (tags):
   ```
   warpweave, openspec, spec-driven, ai, cli, typescript, ponytail, superpowers, rtk, development-tools
   ```
5. Save changes

---

### 5. Update CI/CD Secrets (if needed)

**Action**: Ensure NPM_TOKEN secret is configured for releases

**Steps**:
1. Go to https://github.com/dadosh1984/warpweave/settings/secrets/actions
2. Add or verify `NPM_TOKEN` secret exists
3. Get token from https://www.npmjs.com/settings/YOUR_USERNAME/tokens
4. Token needs "Read and Publish" permissions

---

## Verification Checklist

After completing manual actions:

- [ ] GitHub repo renamed to `dadosh1984/warpweave`
- [ ] npm package published: `warpweave@1.0.0`
- [ ] Old package deprecated: `@dadosh1984/spectrix`
- [ ] Repository metadata updated (description, topics)
- [ ] NPM_TOKEN secret configured
- [ ] Local git remote updated

---

## Post-Migration Announcements

Consider announcing the rebrand:

1. **Discord**: Post in your Discord server
2. **Twitter/X**: Tweet about the rebrand
3. **GitHub Release**: Create a release for v1.0.0 with migration notes
4. **npm README**: Update npm package README with migration info

---

## Timeline

**Estimated time**: 15-20 minutes

| Action | Time |
|--------|------|
| GitHub rename | 2 min |
| npm publish | 3 min |
| npm deprecate | 1 min |
| Metadata update | 5 min |
| Secrets verification | 5 min |
| Announcements | 5-10 min |

---

**Created**: 2026-08-01  
**Part of**: warpweave-rebrand change
