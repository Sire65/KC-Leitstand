@echo off
setlocal
cd /d "%~dp0"
call :CHECK_EXTRACTED
if errorlevel 1 exit /b %ERRORLEVEL%

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\verify-certificate.ps1"
set RC=%ERRORLEVEL%
pause
exit /b %RC%

:CHECK_EXTRACTED
set "STARTPFAD=%~dp0"
set "ZIPSTART=0"
if not exist "%~dp0tools\verify-certificate.ps1" set "ZIPSTART=1"
if not exist "%~dp0tuev\certificate.json" set "ZIPSTART=1"
if not exist "%~dp0app\index.html" set "ZIPSTART=1"
echo(%STARTPFAD%| findstr /I /C:"\AppData\Local\Temp\Rar$" /C:"\AppData\Local\Temp\7z" /C:"\AppData\Local\Temp\wz" /C:"\Windows\Temp\" >nul && set "ZIPSTART=1"
if "%ZIPSTART%"=="1" (
 cls
 echo ================================================================
 echo  TUEV-PRUEFUNG NICHT MOEGLICH: START AUS ZIP/ARCHIV ERKANNT
 echo ================================================================
 echo.
 echo  Bitte die ZIP-Datei zuerst vollstaendig entpacken.
 echo  Danach aus einem normalen Ordner starten,
 echo  nicht direkt aus ZIP, WinRAR oder 7-Zip.
 echo.
 pause
 exit /b 2
)
exit /b 0
