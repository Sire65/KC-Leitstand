@echo off
setlocal
cd /d "%~dp0"
title FrameworkBuildCore - Vollbuild V5.3.1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\framework-build-core.ps1" -Mode All
if errorlevel 1 (echo.&echo VOLLBILD FEHLGESCHLAGEN - keine Pakete freigegeben.&pause&exit /b 1)
echo.&echo CANDIDATE UND INSTALLATIONSVERSION BESTANDEN UND GEGENPRUEFT.
pause
