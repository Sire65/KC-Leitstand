@echo off
setlocal
cd /d "%~dp0"
python tools\framework-tuev.py release --level STABLE
set RC=%ERRORLEVEL%
echo.
if not "%RC%"=="0" echo STABLE-FREIGABE GESPERRT: Ziel-PC-/Live-Nachweise fehlen oder Fehler vorhanden.
pause
exit /b %RC%
