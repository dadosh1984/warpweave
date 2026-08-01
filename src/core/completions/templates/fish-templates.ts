/**
 * Static template strings for Fish completion scripts.
 * These are Fish-specific helper functions that never change.
 */

export const FISH_STATIC_HELPERS = `# Helper function to check if a subcommand is present
function __fish_warpweave_using_subcommand
    set -l cmd (commandline -opc)
    set -e cmd[1]
    for i in $argv
        if contains -- $i $cmd
            return 0
        end
    end
    return 1
end

function __fish_warpweave_no_subcommand
    set -l cmd (commandline -opc)
    test (count $cmd) -eq 1
end`;

export const FISH_DYNAMIC_HELPERS = `# Dynamic completion helpers

function __fish_warpweave_changes
    warpweave __complete changes 2>/dev/null | while read -l id desc
        printf '%s\\t%s\\n' "$id" "$desc"
    end
end

function __fish_warpweave_specs
    warpweave __complete specs 2>/dev/null | while read -l id desc
        printf '%s\\t%s\\n' "$id" "$desc"
    end
end

function __fish_warpweave_items
    __fish_warpweave_changes
    __fish_warpweave_specs
end

function __fish_warpweave_schemas
    warpweave __complete schemas 2>/dev/null | while read -l id desc
        printf '%s\\t%s\\n' "$id" "$desc"
    end
end`;
