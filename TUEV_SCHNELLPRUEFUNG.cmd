@echo off
setlocal
cd /d "%~dp0"
python tools\framework-tuev.py quick --level CANDIDATE
set RC=%ERRORLEVEL%
echo.
if not "%RC%"=="0" echo FRAMEWORK TUEV NICHT BESTANDEN - ENTWICKLUNG GESPERRT
pause
exit /b %RC%
