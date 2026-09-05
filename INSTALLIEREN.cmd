@echo off
setlocal
cd /d "%~dp0"
title Netzwerk-Leitstand V5.3.1 Installation
set "STARTPFAD=%~dp0"
set "ZIPSTART=0"
if not exist "%~dp0app\index.html" set "ZIPSTART=1"
if not exist "%~dp0tools\install-leitstand.ps1" set "ZIPSTART=1"
echo(%STARTPFAD%| findstr /I /C:"\AppData\Local\Temp\Rar$" /C:"\AppData\Local\Temp\7z" /C:"\AppData\Local\Temp\wz" /C:"\Windows\Temp\" >nul && set "ZIPSTART=1"
if "%ZIPSTART%"=="1" (
 cls
 echo ================================================================
 echo  INSTALLATION NICHT MOEGLICH: START AUS ZIP/ARCHIV ERKANNT
 echo ================================================================
 echo.
 echo  Bitte die ZIP-Datei zuerst vollstaendig entpacken.
 echo  Danach INSTALLIEREN.cmd aus einem normalen Ordner starten.
 echo.
 pause
 exit /b 2
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0tools\install-leitstand.ps1"
if errorlevel 1 (
 echo.
 echo INSTALLATION NICHT ABGESCHLOSSEN.
 pause
 exit /b 1
)
exit /b 0
