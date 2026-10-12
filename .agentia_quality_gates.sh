@echo off
setlocal
cd /d "%~dp0"

echo Running ReleasePilot AI tests...
call npm test
if errorlevel 1 exit /b 1

echo Quality gates passed.
exit /b 0