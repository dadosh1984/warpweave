# Migrating from Spectrix to Warpweave

**Version**: 1.0.0  
**Date**: 2026-08-01

## Quick Migration

```bash
# Uninstall old package
npm uninstall -g @dadosh1984/spectrix

# Install new package
npm install -g warpweave

# Verify installation
ww --version  # Should show 1.0.0
ww --help     # Should show "Warpweave"
```

## What Changed

### Package Name
- **Old**: `@dadosh1984/spectrix`
- **New**: `warpweave` (unscoped)

### CLI Command
- **Old**: `spectrix <command>`
- **New**: `ww <command>` (shorter!)

### Version
- **Old**: 1.10.0
- **New**: 1.0.0 (symbolic fresh start)

## Command Changes

All commands work the same, just use `ww` instead of `spectrix`:

| Old Command | New Command |
|-------------|-------------|
| `spectrix init` | `ww init` |
| `spectrix new change` | `ww new change` |
| `spectrix apply` | `ww apply` |
| `spectrix list` | `ww list` |
| `spectrix status` | `ww status` |
| `spectrix archive` | `ww archive` |
| `spectrix config` | `ww config` |
| `spectrix update` | `ww update` |

## Configuration Changes

### Environment Variables

We now support **dual naming** for backward compatibility:

| Old (deprecated) | New (recommended) |
|------------------|-------------------|
| `OPENSPEC_CONCURRENCY` | `WARPWEAVE_CONCURRENCY` |
| `OPENSPEC_NO_COMPLETIONS` | `WARPWEAVE_NO_COMPLETIONS` |
| `OPENSPEC_NO_AUTO_CONFIG` | `WARPWEAVE_NO_AUTO_CONFIG` |

**Note**: Old names still work but will show deprecation warnings.

### Project Directories

- **Old**: `.spectrix/` or `openspec/`
- **New**: `warpweave/`

Existing projects will continue to work - Warpweave detects legacy directory names automatically.

## AI Tools Integration

If you configured AI tools with Spectrix skills, update your configs:

### Skill Names
- **Old**: `openspec-propose`, `openspec-apply`, etc.
- **New**: `warpweave-propose`, `warpweave-apply`, etc.

### Example: Claude Code
```json
// .claude/commands.json
{
  "skills": [
    "warpweave-propose",
    "warpweave-apply",
    "warpweave-explore"
  ]
}
```

## What Stayed the Same

- `/otrix:*` commands (e.g., `/otrix:propose`, `/otrix:apply`) - unchanged
- External integrations: Ponytail, Superpowers, RTK - names unchanged
- Spec format: `spec-driven` schema - unchanged
- Core functionality - all features work the same

## Troubleshooting

### "ww: command not found"
Make sure you installed globally:
```bash
npm install -g warpweave
```

### Old skills still referenced
Regenerate skills in your project:
```bash
ww update
```

### Config directory issues
Warpweave automatically detects legacy `.spectrix/` and `openspec/` directories. No action needed.

## Why the Rebrand?

**Warpweave** (warp + weave) better represents the spec-driven development process:
- **Warp**: The vertical threads (specs) - the foundation
- **Weave**: The horizontal threads (implementation) - building on the foundation

Together, they create the fabric of your software.

## Need Help?

- **Documentation**: `ww --help` or visit docs/
- **Issues**: https://github.com/dadosh1984/warpweave/issues
- **Discord**: https://discord.gg/YctCnvvshC

---

**Last Updated**: 2026-08-01  
**Version**: 1.0.0
