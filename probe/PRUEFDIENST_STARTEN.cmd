@echo off
cd /d "%~dp0"
title Netzwerk-Leitstand V4.0 Pruefdienst
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Netzwerk_Pruefdienst_V4.ps1"
if errorlevel 1 pause
