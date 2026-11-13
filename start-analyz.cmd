@echo off
setlocal
cd /d "%~dp0"
set "ANALYZ_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%ANALYZ_NODE%" (
  "%ANALYZ_NODE%" tools\launch.mjs %*
) else (
  node tools\launch.mjs %*
)
if errorlevel 1 pause
endlocal
