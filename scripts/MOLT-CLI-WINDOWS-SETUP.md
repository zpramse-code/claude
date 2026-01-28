# Molt/Clawdbot CLI - Source Build Setup

This guide installs the Molt (Clawdbot) CLI by building from source
with Cargo, bypassing the broken TLS on `molt.bot/install.cmd`.

## Scripts

| Script | Platform | Description |
|--------|----------|-------------|
| `setup-molt-cli-windows.cmd` | Windows (cmd.exe) | Automated source build for Windows |
| `setup-molt-cli.sh` | Linux / macOS | Automated source build for Unix |
| `find-and-run-setup.sh` | Linux / macOS | Locates the setup script and runs it |

## Prerequisites

### Windows

| Tool | Minimum Version | Install From |
|------|----------------|--------------|
| Rust (rustc + cargo) | 1.70+ | https://rustup.rs/ |
| MSVC Build Tools | 2019 or 2022 | Visual Studio Installer |
| Git | 2.x | https://git-scm.com/ |

Verify in **Command Prompt (cmd.exe)**:

```cmd
rustc --version
cargo --version
git --version
```

### Linux / macOS

| Tool | Minimum Version | Install From |
|------|----------------|--------------|
| Rust (rustc + cargo) | 1.70+ | https://rustup.rs/ |
| C compiler (gcc/clang) | any | `apt install build-essential` or Xcode CLI Tools |
| Git | 2.x | Package manager |

Verify in a terminal:

```bash
rustc --version
cargo --version
git --version
```

## Automated Setup

### Windows (cmd.exe)

Run the batch script using its **full path** (running from `%USERPROFILE%` will
fail unless you qualify the path to the repo):

```cmd
REM Option 1: cd into the repo first
cd %USERPROFILE%\claude
scripts\setup-molt-cli-windows.cmd

REM Option 2: use the full path directly
"%USERPROFILE%\claude\scripts\setup-molt-cli-windows.cmd"

REM Option 3: search for it if you don't know the repo location
dir /s /b %USERPROFILE%\setup-molt-cli-windows.cmd
REM then run the path it prints, in quotes
```

### Linux / macOS

```bash
# Option 1: run directly from the repo
bash scripts/setup-molt-cli.sh

# Option 2: use the locator (searches $HOME, cwd, /home/user)
bash scripts/find-and-run-setup.sh
```

Both scripts follow the same workflow:
1. Verify prerequisites (rustc, cargo, git)
2. Search the user home directory for existing cloned repos
3. Inspect the `moltbot` directory for CLI source references
4. Locate `Cargo.toml` files and build with `cargo build --release`
5. Fall back to cloning from GitHub if no local source is found
6. Run the built executable with `--version` to confirm success

## Manual Steps

If you prefer to run the steps manually in **cmd.exe**:

### 1. Verify Prerequisites

```cmd
rustc --version
cargo --version
git --version
```

### 2. Check for Existing Repos

```cmd
cd %USERPROFILE%
dir
```

### 3. Inspect the moltbot Folder (if present)

```cmd
cd %USERPROFILE%\moltbot
git rev-parse --is-inside-work-tree
git grep -n "molt.bot/install"
git grep -n "install.cmd"
git grep -n "clawdbot"
git grep -n "moltbot"
```

### 4. Locate Cargo.toml and Build

```cmd
dir /s /b Cargo.toml
```

For each `Cargo.toml` found:

```cmd
cd <directory-containing-Cargo.toml>
cargo metadata --no-deps
cargo build --release
dir target\release\*.exe
target\release\<exe_name> --version
```

### 5. If No Cargo.toml Found Locally

Search GitHub for the correct repo:
- `"moltbot cargo toml"`
- `"moltbot cli cargo"`
- `"clawdbot cargo"`

Then clone and build:

```cmd
cd %USERPROFILE%
git clone <correct_repo_url>
cd <repo>
dir /s /b Cargo.toml
cargo build --release
dir target\release\*.exe
target\release\<exe_name> --version
```

### 6. Add to PATH

After a successful build, either:

```cmd
REM Option A: Add release directory to PATH
setx PATH "%PATH%;%USERPROFILE%\<repo>\target\release"

REM Option B: Copy exe to cargo bin (already on PATH)
copy target\release\<exe_name>.exe %USERPROFILE%\.cargo\bin\
```

## Troubleshooting

### Script not found when running from `%USERPROFILE%` / `$HOME`

The scripts live inside the cloned repo's `scripts/` directory, not directly
in your home folder. Either `cd` into the repo first or use the full path:

**Windows:**
```cmd
REM Find it first:
dir /s /b %USERPROFILE%\setup-molt-cli-windows.cmd
REM Then run the full path it prints:
"C:\Users\you\claude\scripts\setup-molt-cli-windows.cmd"
```

**Linux/macOS:**
```bash
# Use the locator helper:
bash /path/to/repo/scripts/find-and-run-setup.sh
# Or find it manually:
find "$HOME" -name "setup-molt-cli.sh" -type f
```

### Build fails with linker errors
Install the "Desktop development with C++" workload via Visual Studio Installer,
which includes the MSVC linker and Windows SDK.

### `cargo` or `rustc` not found
Run `%USERPROFILE%\.cargo\env.bat` or add `%USERPROFILE%\.cargo\bin` to PATH:
```cmd
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
```

### Build errors with missing dependencies
Some crates require system libraries. Check the build output for hints about
required packages and install them via vcpkg or manually.

### TLS / network errors during cargo build
If `cargo build` fails fetching crate dependencies, check your network/proxy
settings. You can configure cargo to use a specific proxy in
`%USERPROFILE%\.cargo\config.toml`:
```toml
[http]
proxy = "http://your-proxy:port"
```

## Important Notes

- Do **NOT** run any scripts downloaded from `molt.bot` (TLS is broken).
- On Windows, use **cmd.exe** (not PowerShell) since the `.cmd` script uses CMD-specific syntax.
- On Linux/macOS, use the `.sh` script or the `find-and-run-setup.sh` locator.
- If the build fails, the scripts capture and display the error output.
- The `.cmd` script cannot run on Linux/macOS and vice versa.
