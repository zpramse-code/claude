#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
#  setup-molt-cli.sh
#
#  Install / build the Molt (Clawdbot) CLI from source using Cargo.
#  This script does NOT use https://molt.bot/install.cmd (TLS is broken).
#
#  Cross-platform equivalent of setup-molt-cli-windows.cmd for Linux/macOS.
#
#  Prerequisites: Rust (rustc + cargo), a C linker (gcc/clang), Git
# ============================================================================

echo "============================================================"
echo " Molt CLI - Source Build Installer"
echo " (bypasses broken TLS on molt.bot/install.cmd)"
echo "============================================================"
echo ""

# -------------------------------------------------------
#  STEP 1: Verify prerequisites
# -------------------------------------------------------
echo "[Step 1/6] Verifying prerequisites..."
echo ""

MISSING=0

echo "Checking rustc..."
if command -v rustc &>/dev/null; then
    echo "  $(rustc --version)"
else
    echo "  ERROR: rustc not found. Install Rust from https://rustup.rs/"
    MISSING=1
fi
echo ""

echo "Checking cargo..."
if command -v cargo &>/dev/null; then
    echo "  $(cargo --version)"
else
    echo "  ERROR: cargo not found. It should be installed with rustc."
    MISSING=1
fi
echo ""

echo "Checking git..."
if command -v git &>/dev/null; then
    echo "  $(git --version)"
else
    echo "  ERROR: git not found. Install Git from your package manager."
    MISSING=1
fi
echo ""

if [ "$MISSING" -ne 0 ]; then
    echo "One or more prerequisites are missing. Please install them and re-run."
    exit 1
fi

echo "All prerequisites found."
echo ""

# -------------------------------------------------------
#  STEP 2: Go to user home, list candidate repos
# -------------------------------------------------------
echo "[Step 2/6] Listing candidate repos in \$HOME..."
echo ""

cd "$HOME"
ls -d */ 2>/dev/null || echo "(no directories found)"
echo ""

# -------------------------------------------------------
#  STEP 3: Check $HOME/moltbot if it exists
# -------------------------------------------------------
echo "[Step 3/6] Searching for moltbot repo..."
echo ""

MOLTBOT_DIR="$HOME/moltbot"
FOUND_CARGO=0
BUILD_DIR=""

if [ -d "$MOLTBOT_DIR" ]; then
    echo "Found directory: $MOLTBOT_DIR"
    cd "$MOLTBOT_DIR"

    echo "Verifying git repo..."
    if git rev-parse --is-inside-work-tree &>/dev/null; then
        echo "  Valid git repository."
        echo ""

        echo "Searching for installer/CLI references..."

        echo "  Searching \"molt.bot/install\"..."
        if git grep -n "molt.bot/install" -- . &>/dev/null; then
            echo "    Found references to molt.bot/install (we will NOT use this)"
        else
            echo "    No match."
        fi

        echo "  Searching \"install.cmd\"..."
        if git grep -n "install.cmd" -- . &>/dev/null; then
            echo "    Found references to install.cmd"
        else
            echo "    No match."
        fi

        echo "  Searching \"clawdbot\"..."
        if git grep -n "clawdbot" -- . &>/dev/null; then
            echo "    Found references to clawdbot"
        else
            echo "    No match."
        fi

        echo "  Searching \"moltbot\"..."
        if git grep -n "moltbot" -- . &>/dev/null; then
            echo "    Found references to moltbot"
        else
            echo "    No match."
        fi
        echo ""
    else
        echo "  Not a git repository. Skipping."
    fi

    # -------------------------------------------------------
    #  STEP 4: Locate Cargo.toml files inside moltbot
    # -------------------------------------------------------
    echo "[Step 4/6] Searching for Cargo.toml in moltbot repo..."
    echo ""

    cd "$MOLTBOT_DIR"
    CARGO_FILES=()
    while IFS= read -r -d '' f; do
        CARGO_FILES+=("$f")
        echo "  Found: $f"
    done < <(find . -name "Cargo.toml" -print0 2>/dev/null)

    if [ "${#CARGO_FILES[@]}" -gt 0 ]; then
        echo ""
        echo "Found ${#CARGO_FILES[@]} Cargo.toml file(s). Attempting build..."
        echo ""

        # Prefer root-level Cargo.toml
        if [ -f "$MOLTBOT_DIR/Cargo.toml" ]; then
            BUILD_DIR="$MOLTBOT_DIR"
        else
            BUILD_DIR="$(dirname "${CARGO_FILES[-1]}")"
        fi
        FOUND_CARGO=1
    else
        echo "  No Cargo.toml found in moltbot repo."
        echo "  This repo is likely not the Rust CLI source."
        echo ""
    fi
else
    echo "Directory $MOLTBOT_DIR does not exist."
    echo ""
fi

# -------------------------------------------------------
#  STEP 5: Search for the correct CLI repo elsewhere
# -------------------------------------------------------
if [ "$FOUND_CARGO" -eq 0 ]; then
    echo "[Step 5/6] Searching for correct CLI repo..."
    echo ""

    cd "$HOME"
    CANDIDATE_DIRS="moltbot-cli clawdbot molt-cli molt clawdbot-cli"

    for d in $CANDIDATE_DIRS; do
        if [ -f "$HOME/$d/Cargo.toml" ]; then
            echo "Found Cargo.toml in $d"
            BUILD_DIR="$HOME/$d"
            FOUND_CARGO=1
            break
        fi
    done

    # Scan all immediate subdirs for Cargo.toml
    if [ "$FOUND_CARGO" -eq 0 ]; then
        for d in "$HOME"/*/; do
            if [ -f "$d/Cargo.toml" ]; then
                if grep -qi -e "moltbot" -e "clawdbot" -e "molt" "$d/Cargo.toml" 2>/dev/null; then
                    echo "Found Cargo.toml in $d"
                    echo "  Looks like a Molt/Clawdbot crate!"
                    BUILD_DIR="$d"
                    FOUND_CARGO=1
                    break
                fi
            fi
        done
    fi

    # If still not found, try cloning known candidate repos
    if [ "$FOUND_CARGO" -eq 0 ]; then
        echo "No local CLI repo found. Attempting to clone from GitHub..."
        echo ""

        CLONE_URLS="https://github.com/moltbot/cli https://github.com/moltbot/clawdbot https://github.com/moltbot/moltbot-cli"

        for url in $CLONE_URLS; do
            repo_name=$(basename "$url")
            echo "Trying: git clone $url ..."
            if git clone "$url" "$HOME/$repo_name" &>/dev/null; then
                if [ -f "$HOME/$repo_name/Cargo.toml" ]; then
                    echo "  Cloned $repo_name successfully and found Cargo.toml!"
                    BUILD_DIR="$HOME/$repo_name"
                    FOUND_CARGO=1
                    break
                else
                    found_sub=$(find "$HOME/$repo_name" -name "Cargo.toml" -print -quit 2>/dev/null)
                    if [ -n "$found_sub" ]; then
                        BUILD_DIR="$(dirname "$found_sub")"
                        FOUND_CARGO=1
                        echo "  Found Cargo.toml in subdirectory."
                        break
                    fi
                fi
            else
                echo "  Clone failed (repo may not exist)."
            fi
        done
    fi
fi

if [ "$FOUND_CARGO" -eq 0 ]; then
    echo ""
    echo "============================================================"
    echo " ERROR: Could not locate the Molt/Clawdbot CLI Cargo crate."
    echo ""
    echo " Manual steps to resolve:"
    echo "   1. Search GitHub for the correct repository:"
    echo '      - "moltbot cargo toml"'
    echo '      - "moltbot cli cargo"'
    echo '      - "clawdbot cargo"'
    echo "   2. Clone the repo to \$HOME"
    echo "   3. Re-run this script"
    echo "============================================================"
    exit 1
fi

# -------------------------------------------------------
#  BUILD: cargo build --release
# -------------------------------------------------------
echo ""
echo "============================================================"
echo " Building from: $BUILD_DIR"
echo "============================================================"
echo ""

cd "$BUILD_DIR"

echo "Running cargo metadata --no-deps to verify crate..."
if cargo metadata --no-deps &>/dev/null; then
    echo "  Valid Rust crate confirmed."
else
    echo "  WARNING: cargo metadata failed. The Cargo.toml may be invalid."
    echo "  Attempting build anyway..."
fi
echo ""

echo "Running: cargo build --release"
echo "(this may take several minutes on first build)"
echo ""

BUILD_ERRORS_FILE="$BUILD_DIR/build_errors.tmp"
if cargo build --release 2>"$BUILD_ERRORS_FILE"; then
    echo ""
    echo "Build succeeded!"
    echo ""
else
    BUILD_EXIT=$?
    echo ""
    echo "============================================================"
    echo " BUILD FAILED (exit code $BUILD_EXIT)"
    echo " Last 50 lines of error output:"
    echo "============================================================"
    echo ""
    if [ -f "$BUILD_ERRORS_FILE" ]; then
        tail -50 "$BUILD_ERRORS_FILE" | sed 's/^/  /'
    fi
    echo ""
    echo "Tip: Make sure build tools are installed:"
    echo "  - Linux: build-essential (gcc, make, etc.)"
    echo "  - macOS: Xcode Command Line Tools"
    exit 1
fi

# -------------------------------------------------------
#  Find and run the produced binary
# -------------------------------------------------------
echo "[Step 6/6] Locating built executable(s)..."
echo ""

CLI_EXE=""
RELEASE_DIR="$BUILD_DIR/target/release"

# Prefer specific names first
for name in clawdbot moltbot molt molt-cli moltbot-cli; do
    if [ -x "$RELEASE_DIR/$name" ]; then
        CLI_EXE="$RELEASE_DIR/$name"
        echo "Found preferred executable: $name"
        break
    fi
done

# Fall back to listing all executables in release dir
if [ -z "$CLI_EXE" ]; then
    echo "Listing executables in target/release/:"
    find "$RELEASE_DIR" -maxdepth 1 -type f -executable ! -name "*.d" ! -name "build-script-*" 2>/dev/null || true
    echo ""

    for f in "$RELEASE_DIR"/*; do
        if [ -x "$f" ] && [ -f "$f" ] && [[ "$f" != *.d ]] && [[ "$(basename "$f")" != build-script-* ]]; then
            CLI_EXE="$f"
            echo "Using: $(basename "$f")"
            break
        fi
    done
fi

if [ -z "$CLI_EXE" ]; then
    echo "ERROR: No executables found in target/release/."
    echo "The crate may be a library, not a binary."
    exit 1
fi

echo ""
echo "Testing CLI executable..."
echo "Running: \"$CLI_EXE\" --version"
echo ""
if "$CLI_EXE" --version; then
    :
else
    echo ""
    echo "WARNING: --version flag not recognized. Trying --help..."
    "$CLI_EXE" --help || true
fi

echo ""
echo "============================================================"
echo " SUCCESS: Molt CLI is installed!"
echo ""
echo " Executable: $CLI_EXE"
echo ""
echo " To add to PATH, run one of:"
echo "   export PATH=\"\$PATH:$RELEASE_DIR\""
echo "   cp \"$CLI_EXE\" \"\$HOME/.cargo/bin/\""
echo "============================================================"

# Clean up temp file
rm -f "$BUILD_ERRORS_FILE"

exit 0
