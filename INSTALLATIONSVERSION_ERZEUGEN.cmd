@echo off
setlocal
cd /d "%~dp0"
title FrameworkBuildCore - Installation V5.3.1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\framework-build-core.ps1" -Mode Installer
if errorlevel 1 (echo.&echo ERZEUGUNG FEHLGESCHLAGEN - kein Paket freigegeben.&pause&exit /b 1)
echo.&echo INSTALLATIONSVERSION BESTANDEN UND GEGENPRUEFT.
pause
