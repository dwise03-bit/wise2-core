@echo off
setlocal
cd /d "%~dp0..\.."
set "PY=python"
if exist ".venv\Scripts\python.exe" set "PY=%CD%\.venv\Scripts\python.exe"
if exist "%USERPROFILE%\Downloads\WISE2-Clip-Engine-v1.7-Complete (1)\.venv\Scripts\python.exe" set "PY=%USERPROFILE%\Downloads\WISE2-Clip-Engine-v1.7-Complete (1)\.venv\Scripts\python.exe"
"%PY%" scripts\diagnose.py
exit /b %ERRORLEVEL%
