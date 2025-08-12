# scripts/acceptance-only.ps1
# Run ONLY the acceptance suite with verbose diagnostics.
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/acceptance-only.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/acceptance-only.ps1 -Id C08
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/acceptance-only.ps1 -Install

param(
    [string]$Id = "",
    [switch]$Install = $false
)

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
    ); Resolve-Exe $candidates
}
function Resolve-Pnpm {
    $byCmd = (Get-Command pnpm -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)
    $candidates = @(
        $byCmd,
        (Join-Path $env:NVM_SYMLINK 'pnpm.cmd'),
        'D:\Program Files\nodejs\pnpm.cmd',
        'C:\Program Files\nodejs\pnpm.cmd'
    ); Resolve-Exe $candidates
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

# --- Resolve tools + prep PATH ---
$node = Resolve-Node
if (-not $node) { throw "NodeJS not found. Tried PATH, NVM_SYMLINK, D:\Program Files\nodejs, C:\Program Files\nodejs." }
$pnpm = Resolve-Pnpm
if (-not $pnpm) { throw "pnpm not found. Ensure Corepack pnpm is installed or pnpm.cmd exists near Node." }
$nodeDir = Split-Path -Parent $node
if ($env:Path -notlike "*$nodeDir*") { $env:Path += ";$nodeDir" }
try { Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force } catch { }

# --- Optional quick install (safe if already installed) ---
if ($Install) {
    Invoke-Checked $pnpm @('install')
    try { & $pnpm 'approve-builds' 'esbuild' } catch { }
}

# --- Acceptance run (verbose) ---
$vitestArgs = @('vitest', 'run', 'tests/acceptance/runner.spec.ts', '--reporter=verbose', '--silent=false')
if ($Id -and $Id.Trim().Length -gt 0) {
    $vitestArgs += @('-t', $Id.Trim())
}
Invoke-Checked $pnpm $vitestArgs

Write-Host "[DONE] Acceptance suite completed." -ForegroundColor Green
