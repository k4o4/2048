# scripts/ci.ps1
param([switch]$InstallBrowsers = $false)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Resolve-Exe([string[]]$candidates) {
    foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
    return $null
}

function Resolve-Node {
    $byCmd = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)
    $candidates = @(
        $byCmd,
        (Join-Path $env:NVM_SYMLINK 'node.exe'),
        'D:\Program Files\nodejs\node.exe',
        'C:\Program Files\nodejs\node.exe'
    )
    return (Resolve-Exe $candidates)
}

function Resolve-Pnpm {
    $byCmd = (Get-Command pnpm -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)
    $candidates = @(
        $byCmd,
        (Join-Path $env:NVM_SYMLINK 'pnpm.cmd'),
        'D:\Program Files\nodejs\pnpm.cmd',
        'C:\Program Files\nodejs\pnpm.cmd'
    )
    return (Resolve-Exe $candidates)
}

function Resolve-Npx {
    $byCmd = (Get-Command npx -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)
    $candidates = @(
        $byCmd,
        (Join-Path $env:NVM_SYMLINK 'npx.cmd'),
        'D:\Program Files\nodejs\npx.cmd',
        'C:\Program Files\nodejs\npx.cmd'
    )
    return (Resolve-Exe $candidates)
}

function Invoke-Checked([string]$exe, [string[]]$argv) {
    Write-Host ("==> {0} {1}" -f $exe, ($argv -join ' ')) -ForegroundColor Cyan
    & $exe @argv
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        throw ("Command failed with exit code {0}: {1} {2}" -f $code, $exe, ($argv -join ' '))
    }
    Write-Host ("<== OK ({0}, exit {1})" -f $exe, $code) -ForegroundColor Cyan
}

# --- Resolve tools ---
$node = Resolve-Node
if (-not $node) { throw "NodeJS not found. Tried: PATH, NVM_SYMLINK, D:\Program Files\nodejs, C:\Program Files\nodejs." }

$pnpm = Resolve-Pnpm
if (-not $pnpm) { throw "pnpm not found. Ensure Corepack pnpm is installed or pnpm.cmd exists near Node." }

$npx = Resolve-Npx
if (-not $npx) { $npx = 'npx' }  # fallback to PATH if needed

# Ensure their dir is on PATH for this session
$nodeDir = Split-Path -Parent $node
if ($env:Path -notlike "*$nodeDir*") { $env:Path += ";$nodeDir" }
try { Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force } catch { }

# --- Versions ---
Invoke-Checked $node @('--version')
Invoke-Checked $pnpm @('-v')

# --- Install deps ---
Invoke-Checked $pnpm @('install')
try { & $pnpm 'approve-builds' 'esbuild' } catch { }

# Optional: Playwright browsers on fresh machines
if ($InstallBrowsers) {
    Invoke-Checked $npx @('playwright', 'install')
}

# --- Tests ---
Invoke-Checked $pnpm @('test')   # Vitest + coverage
Invoke-Checked $pnpm @('e2e')    # Playwright

Write-Host "[DONE] All tests passed." -ForegroundColor Green
