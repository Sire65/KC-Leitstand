@echo off
setlocal
cd /d "%~dp0"
python tools\framework-tuev.py release --level CANDIDATE
set RC=%ERRORLEVEL%
echo.
if "%RC%"=="0" (
 echo TUEV-ZERTIFIKAT ERZEUGT: tuev\certificate.txt
) else (
 echo RELEASE, MIGRATION UND GITHUB SIND GESPERRT.
)
pause
exit /b %RC%
