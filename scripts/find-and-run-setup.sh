#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
#  find-and-run-setup.sh
#
#  Locates the Molt CLI setup script within cloned repositories under $HOME,
#  then runs it. Solves the problem of running the script from the wrong
#  directory (e.g. running "scripts/setup-molt-cli-windows.cmd" from $HOME
#  when the script lives inside a repo subdirectory).
#
#  Usage:  bash find-and-run-setup.sh
# ============================================================================

echo "============================================================"
echo " Molt CLI Setup Script Locator"
echo "============================================================"
echo ""

# Step 1: Confirm home directory
echo "[1] Home directory: $HOME"
echo "[1] Current directory: $(pwd)"
echo ""

# Step 2: Search recursively for the setup scripts
#   Search $HOME, current directory, and /home/user to cover common layouts.
SCRIPT_NAME_BASH="setup-molt-cli.sh"
SCRIPT_NAME_CMD="setup-molt-cli-windows.cmd"
FOUND_SCRIPT=""

# Build a deduplicated list of search roots
declare -A SEEN_ROOTS
SEARCH_ROOTS=()
for candidate in "$HOME" "$(pwd)" "/home/user"; do
    real="$(realpath "$candidate" 2>/dev/null || echo "$candidate")"
    if [ -d "$real" ] && [ -z "${SEEN_ROOTS[$real]+_}" ]; then
        SEEN_ROOTS["$real"]=1
        SEARCH_ROOTS+=("$real")
    fi
done

for root in "${SEARCH_ROOTS[@]}"; do
    echo "[2] Searching for setup scripts under $root ..."
    while IFS= read -r -d '' match; do
        echo "  Found: $match"
        if [[ "$match" == *"/$SCRIPT_NAME_BASH" ]]; then
            FOUND_SCRIPT="$match"
        fi
    done < <(find "$root" -maxdepth 5 \( -name "$SCRIPT_NAME_BASH" -o -name "$SCRIPT_NAME_CMD" \) -print0 2>/dev/null)
done

echo ""

if [ -z "$FOUND_SCRIPT" ]; then
    # No bash script found; check if we at least found the CMD version
    CMD_SCRIPT=""
    for root in "${SEARCH_ROOTS[@]}"; do
        CMD_SCRIPT=$(find "$root" -maxdepth 5 -name "$SCRIPT_NAME_CMD" -print -quit 2>/dev/null)
        [ -n "$CMD_SCRIPT" ] && break
    done
    if [ -n "$CMD_SCRIPT" ]; then
        echo "============================================================"
        echo " Found Windows script: $CMD_SCRIPT"
        echo ""
        echo " This is a .cmd batch file for Windows Command Prompt."
        echo " It cannot run on $(uname -s)."
        echo ""
        echo " The bash equivalent (setup-molt-cli.sh) was not found."
        echo " Check that the repo is up to date:"
        REPO_DIR="$(dirname "$(dirname "$CMD_SCRIPT")")"
        echo "   cd \"$REPO_DIR\" && git pull"
        echo "============================================================"
        exit 1
    fi

    echo "============================================================"
    echo " ERROR: No setup script found."
    echo ""
    echo " Searched: ${SEARCH_ROOTS[*]}"
    echo ""
    echo " Expected to find one of:"
    echo "   - $SCRIPT_NAME_BASH"
    echo "   - $SCRIPT_NAME_CMD"
    echo ""
    echo " Make sure the repository is cloned somewhere accessible."
    echo "============================================================"
    exit 1
fi

# Step 3: Run the found script
echo "============================================================"
echo " Running: $FOUND_SCRIPT"
echo "============================================================"
echo ""

chmod +x "$FOUND_SCRIPT"
exec bash "$FOUND_SCRIPT"
