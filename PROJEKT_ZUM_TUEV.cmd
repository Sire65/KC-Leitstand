@echo off
setlocal
cd /d "%~dp0"
if "%~1"=="" (
  echo Ziehen Sie eine Projekt-ZIP oder einen Projektordner auf diese Datei.
  echo Alternativ: PROJEKT_ZUM_TUEV.cmd "C:\Pfad\Projekt.zip"
  pause
  exit /b 2
)
python tools\framework-tuev-universal.py "%~1" --level CANDIDATE
set RC=%ERRORLEVEL%
echo.
if "%RC%"=="0" (
 echo FRAMEWORK-TUEV BESTANDEN.
) else (
 echo FRAMEWORK-TUEV NICHT BESTANDEN. VERWENDUNG GESPERRT.
)
pause
exit /b %RC%
