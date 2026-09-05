@echo off
setlocal
cd /d "%~dp0"
title Netzwerk-Leitstand V5.3.1 - FrameworkLauncher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\framework-launcher.ps1"
exit /b %ERRORLEVEL%
