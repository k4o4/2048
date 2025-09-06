:: scripts/acceptance-only.cmd
:: Wrapper to run the PowerShell acceptance-only script without profile hassles
@echo off
setlocal
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%acceptance-only.ps1" %*
endlocal
