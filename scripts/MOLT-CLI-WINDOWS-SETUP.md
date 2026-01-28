# Molt/Clawdbot CLI - Windows Setup (Source Build)

This guide installs the Molt (Clawdbot) CLI on Windows by building from source
with Cargo, bypassing the broken TLS on `molt.bot/install.cmd`.

## Prerequisites

| Tool | Minimum Version | Install From |
|------|----------------|--------------|
| Rust (rustc + cargo) | 1.70+ | https://rustup.rs/ |
| MSVC Build Tools | 2019 or 2022 | Visual Studio Installer |
| Git | 2.x | https://git-scm.com/ |

Ensure all three are on your `PATH`. Verify in **Command Prompt (cmd.exe)**:

```cmd
rustc --version
cargo --version
git --version
```

## Automated Setup

Run the batch script from Command Prompt:

```cmd
scripts\setup-molt-cli-windows.cmd
```

The script will:
1. Verify prerequisites (rustc, cargo, git)
2. Search `%USERPROFILE%` for existing cloned repos
3. Inspect `%USERPROFILE%\moltbot` for CLI source references
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
- Do **NOT** use PowerShell chaining (`&&`) -- use cmd.exe.
- If the build fails, the batch script captures and displays the last error output.
