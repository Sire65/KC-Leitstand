@echo off
setlocal
cd /d "%~dp0"
title FrameworkBuildCore - Candidate V5.3.1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\framework-build-core.ps1" -Mode Candidate
if errorlevel 1 (echo.&echo BUILD FEHLGESCHLAGEN - kein Paket freigegeben.&pause&exit /b 1)
echo.&echo BUILD BESTANDEN. Candidate wurde nach ZIP-Gegenpruefung erzeugt.
pause
