/**
 * Static template strings for Bash completion scripts.
 * These are Bash-specific helper functions that never change.
 */

export const BASH_DYNAMIC_HELPERS = `# Dynamic completion helpers

_warpweave_complete_changes() {
  local changes
  changes=$(warpweave __complete changes 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$changes" -- "$cur"))
}

_warpweave_complete_specs() {
  local specs
  specs=$(warpweave __complete specs 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$specs" -- "$cur"))
}

_warpweave_complete_items() {
  local items
  items=$(warpweave __complete changes 2>/dev/null | cut -f1; warpweave __complete specs 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$items" -- "$cur"))
}

_warpweave_complete_schemas() {
  local schemas
  schemas=$(warpweave __complete schemas 2>/dev/null | cut -f1)
  COMPREPLY=($(compgen -W "$schemas" -- "$cur"))
}`;
