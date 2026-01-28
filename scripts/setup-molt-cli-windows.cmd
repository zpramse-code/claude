@echo off
setlocal enabledelayedexpansion

REM ============================================================================
REM  setup-molt-cli-windows.cmd
REM
REM  Install / build the Molt (Clawdbot) CLI on Windows from source using Cargo.
REM  This script does NOT use https://molt.bot/install.cmd (TLS is broken).
REM
REM  Prerequisites: Rust (rustc + cargo), MSVC Build Tools, Git
REM  Shell: Run from Command Prompt (cmd.exe), NOT PowerShell.
REM ============================================================================

echo ============================================================
echo  Molt CLI - Windows Source Build Installer
echo  (bypasses broken TLS on molt.bot/install.cmd)
echo ============================================================
echo.

REM -------------------------------------------------------
REM  STEP 1: Verify prerequisites
REM -------------------------------------------------------
echo [Step 1/6] Verifying prerequisites...
echo.

echo Checking rustc...
rustc --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: rustc not found. Install Rust from https://rustup.rs/
    echo        Make sure %%USERPROFILE%%\.cargo\bin is on your PATH.
    exit /b 1
)
for /f "delims=" %%v in ('rustc --version 2^>nul') do echo   %%v
echo.

echo Checking cargo...
cargo --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: cargo not found. It should be installed with rustc.
    echo        Make sure %%USERPROFILE%%\.cargo\bin is on your PATH.
    exit /b 1
)
for /f "delims=" %%v in ('cargo --version 2^>nul') do echo   %%v
echo.

echo Checking git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: git not found. Install Git from https://git-scm.com/
    exit /b 1
)
for /f "delims=" %%v in ('git --version 2^>nul') do echo   %%v
echo.

echo All prerequisites found.
echo.

REM -------------------------------------------------------
REM  STEP 2: Go to user home, list candidate repos
REM -------------------------------------------------------
echo [Step 2/6] Listing candidate repos in %%USERPROFILE%%...
echo.

cd /d "%USERPROFILE%"
if errorlevel 1 (
    echo ERROR: Cannot cd to %%USERPROFILE%%.
    exit /b 1
)

dir /ad /b 2>nul
echo.

REM -------------------------------------------------------
REM  STEP 3: Check %USERPROFILE%\moltbot if it exists
REM -------------------------------------------------------
echo [Step 3/6] Searching for moltbot repo...
echo.

set "MOLTBOT_DIR=%USERPROFILE%\moltbot"
set "FOUND_CARGO=0"
set "BUILD_DIR="

if exist "%MOLTBOT_DIR%\" (
    echo Found directory: %MOLTBOT_DIR%
    cd /d "%MOLTBOT_DIR%"

    echo Verifying git repo...
    git rev-parse --is-inside-work-tree >nul 2>&1
    if errorlevel 1 (
        echo   Not a git repository. Skipping.
        goto :search_other_repos
    )
    echo   Valid git repository.
    echo.

    echo Searching for installer/CLI references...
    echo   Searching "molt.bot/install"...
    git grep -n "molt.bot/install" >nul 2>&1
    if not errorlevel 1 (
        echo     Found references to molt.bot/install (we will NOT use this)
    ) else (
        echo     No match.
    )

    echo   Searching "install.cmd"...
    git grep -n "install.cmd" >nul 2>&1
    if not errorlevel 1 (
        echo     Found references to install.cmd
    ) else (
        echo     No match.
    )

    echo   Searching "clawdbot"...
    git grep -n "clawdbot" >nul 2>&1
    if not errorlevel 1 (
        echo     Found references to clawdbot
    ) else (
        echo     No match.
    )

    echo   Searching "moltbot"...
    git grep -n "moltbot" >nul 2>&1
    if not errorlevel 1 (
        echo     Found references to moltbot
    ) else (
        echo     No match.
    )
    echo.

    REM -------------------------------------------------------
    REM  STEP 4: Locate Cargo.toml files inside moltbot
    REM -------------------------------------------------------
    echo [Step 4/6] Searching for Cargo.toml in moltbot repo...
    echo.

    cd /d "%MOLTBOT_DIR%"
    set "CARGO_COUNT=0"
    for /f "delims=" %%f in ('dir /s /b Cargo.toml 2^>nul') do (
        set /a CARGO_COUNT+=1
        set "CARGO_PATH=%%f"
        echo   Found: %%f
    )

    if !CARGO_COUNT! gtr 0 (
        echo.
        echo Found !CARGO_COUNT! Cargo.toml file(s). Attempting build...
        echo.

        REM Use the directory of the last found Cargo.toml
        REM (prefer root-level Cargo.toml if present)
        if exist "%MOLTBOT_DIR%\Cargo.toml" (
            set "BUILD_DIR=%MOLTBOT_DIR%"
        ) else (
            for %%f in ("!CARGO_PATH!") do set "BUILD_DIR=%%~dpf"
        )
        set "FOUND_CARGO=1"
        goto :do_build
    )

    echo   No Cargo.toml found in moltbot repo.
    echo   This repo is likely not the Rust CLI source.
    echo.
)

:search_other_repos
REM -------------------------------------------------------
REM  STEP 5: Search for the correct CLI repo elsewhere
REM -------------------------------------------------------
echo [Step 5/6] Searching for correct CLI repo...
echo.

REM Check other directories in USERPROFILE for Cargo.toml
cd /d "%USERPROFILE%"
set "CANDIDATE_DIRS=moltbot-cli clawdbot molt-cli molt clawdbot-cli"

for %%d in (%CANDIDATE_DIRS%) do (
    if exist "%USERPROFILE%\%%d\Cargo.toml" (
        echo Found Cargo.toml in %%d
        set "BUILD_DIR=%USERPROFILE%\%%d"
        set "FOUND_CARGO=1"
        goto :do_build
    )
)

REM Scan all immediate subdirs for Cargo.toml
for /d %%d in ("%USERPROFILE%\*") do (
    if exist "%%d\Cargo.toml" (
        echo Found Cargo.toml in %%d
        REM Check if it looks like a molt/clawdbot project
        findstr /i /c:"moltbot" /c:"clawdbot" /c:"molt" "%%d\Cargo.toml" >nul 2>&1
        if not errorlevel 1 (
            echo   Looks like a Molt/Clawdbot crate!
            set "BUILD_DIR=%%d"
            set "FOUND_CARGO=1"
            goto :do_build
        )
    )
)

REM If still not found, try cloning known candidate repos
echo No local CLI repo found. Attempting to clone from GitHub...
echo.

REM Try common GitHub organization/repo patterns
set "CLONE_URLS=https://github.com/moltbot/cli https://github.com/moltbot/clawdbot https://github.com/moltbot/moltbot-cli"

for %%u in (%CLONE_URLS%) do (
    echo Trying: git clone %%u ...
    git clone "%%u" >nul 2>&1
    if not errorlevel 1 (
        for %%r in ("%%u") do (
            REM Extract repo name from URL
            for /f "tokens=*" %%n in ("%%~nxr") do (
                if exist "%USERPROFILE%\%%n\Cargo.toml" (
                    echo   Cloned %%n successfully and found Cargo.toml!
                    set "BUILD_DIR=%USERPROFILE%\%%n"
                    set "FOUND_CARGO=1"
                    goto :do_build
                ) else (
                    REM Check subdirectories
                    for /f "delims=" %%f in ('dir /s /b "%USERPROFILE%\%%n\Cargo.toml" 2^>nul') do (
                        for %%p in ("%%f") do set "BUILD_DIR=%%~dpf"
                        set "FOUND_CARGO=1"
                        echo   Found Cargo.toml in subdirectory.
                        goto :do_build
                    )
                )
            )
        )
    ) else (
        echo   Clone failed (repo may not exist).
    )
)

if "!FOUND_CARGO!"=="0" (
    echo.
    echo ============================================================
    echo  ERROR: Could not locate the Molt/Clawdbot CLI Cargo crate.
    echo.
    echo  Manual steps to resolve:
    echo    1. Search GitHub for the correct repository:
    echo       - "moltbot cargo toml"
    echo       - "moltbot cli cargo"
    echo       - "clawdbot cargo"
    echo    2. Clone the repo to %%USERPROFILE%%
    echo    3. Re-run this script
    echo ============================================================
    exit /b 1
)

REM -------------------------------------------------------
REM  BUILD: cargo build --release
REM -------------------------------------------------------
:do_build
echo.
echo ============================================================
echo  Building from: !BUILD_DIR!
echo ============================================================
echo.

cd /d "!BUILD_DIR!"
if errorlevel 1 (
    echo ERROR: Cannot cd to !BUILD_DIR!
    exit /b 1
)

echo Running cargo metadata --no-deps to verify crate...
cargo metadata --no-deps >nul 2>&1
if errorlevel 1 (
    echo WARNING: cargo metadata failed. The Cargo.toml may be invalid.
    echo Attempting build anyway...
) else (
    echo   Valid Rust crate confirmed.
)
echo.

echo Running: cargo build --release
echo (this may take several minutes on first build)
echo.

cargo build --release 2>"!BUILD_DIR!\build_errors.tmp"
set "BUILD_EXIT=!errorlevel!"

if !BUILD_EXIT! neq 0 (
    echo.
    echo ============================================================
    echo  BUILD FAILED (exit code !BUILD_EXIT!)
    echo  Last 50 lines of error output:
    echo ============================================================
    echo.
    if exist "!BUILD_DIR!\build_errors.tmp" (
        REM Show last lines of build error
        for /f "usebackq delims=" %%l in ("!BUILD_DIR!\build_errors.tmp") do echo   %%l
    )
    echo.
    echo Tip: Make sure MSVC Build Tools are installed:
    echo   - Visual Studio Build Tools 2019/2022
    echo   - "Desktop development with C++" workload
    echo   - Windows 10/11 SDK
    exit /b 1
)

echo.
echo Build succeeded!
echo.

REM -------------------------------------------------------
REM  Find and run the produced EXE(s)
REM -------------------------------------------------------
echo [Step 6/6] Locating built executable(s)...
echo.

set "FOUND_EXE=0"
set "CLI_EXE="

REM Prefer specific names first
for %%e in (clawdbot.exe moltbot.exe molt.exe molt-cli.exe moltbot-cli.exe) do (
    if exist "!BUILD_DIR!\target\release\%%e" (
        set "CLI_EXE=!BUILD_DIR!\target\release\%%e"
        set "FOUND_EXE=1"
        echo Found preferred executable: %%e
        goto :run_exe
    )
)

REM Fall back to listing all EXEs in release dir
echo Listing all EXEs in target\release\:
dir "!BUILD_DIR!\target\release\*.exe" /b 2>nul
echo.

for /f "delims=" %%e in ('dir /b "!BUILD_DIR!\target\release\*.exe" 2^>nul') do (
    REM Skip build-script executables and deps
    echo %%e | findstr /i /c:"build-script" >nul 2>&1
    if errorlevel 1 (
        set "CLI_EXE=!BUILD_DIR!\target\release\%%e"
        set "FOUND_EXE=1"
        echo Using: %%e
        goto :run_exe
    )
)

if "!FOUND_EXE!"=="0" (
    echo ERROR: No .exe files found in target\release\.
    echo The crate may be a library, not a binary.
    exit /b 1
)

:run_exe
echo.
echo Testing CLI executable...
echo Running: "!CLI_EXE!" --version
echo.
"!CLI_EXE!" --version
if errorlevel 1 (
    echo.
    echo WARNING: --version flag not recognized. Trying --help...
    "!CLI_EXE!" --help
)

echo.
echo ============================================================
echo  SUCCESS: Molt CLI is installed!
echo.
echo  Executable: !CLI_EXE!
echo.
echo  To add to PATH permanently, run:
echo    setx PATH "%%PATH%%;!BUILD_DIR!\target\release"
echo.
echo  Or copy the exe to a directory already on your PATH:
echo    copy "!CLI_EXE!" "%%USERPROFILE%%\.cargo\bin\"
echo ============================================================

REM Clean up temp file
if exist "!BUILD_DIR!\build_errors.tmp" del "!BUILD_DIR!\build_errors.tmp"

endlocal
exit /b 0
