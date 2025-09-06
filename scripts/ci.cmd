:: scripts/ci.cmd
:: Simple wrapper to run the PowerShell CI script with NoProfile/Bypass
@echo off
setlocal
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%ci.ps1" %*
endlocal
