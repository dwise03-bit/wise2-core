@echo off
setlocal EnableExtensions EnableDelayedExpansion
title WISE2 Command Center — RECAST x CLIP ENGINE
cd /d "%~dp0"

where python >nul 2>&1 || (
  echo ERROR: Python 3.11+ not found on PATH.
  pause
  exit /b 1
)
where ffmpeg >nul 2>&1 || (
  echo ERROR: ffmpeg not found on PATH. Install from https://www.gyan.dev/ffmpeg/builds/
  pause
  exit /b 1
)

set "PY="
if exist ".venv\Scripts\python.exe" set "PY=%CD%\.venv\Scripts\python.exe"
if "%PY%"=="" if exist "%USERPROFILE%\Downloads\WISE2-Clip-Engine-v1.7-Complete (1)\.venv\Scripts\python.exe" set "PY=%USERPROFILE%\Downloads\WISE2-Clip-Engine-v1.7-Complete (1)\.venv\Scripts\python.exe"
if "%PY%"=="" (
  echo Creating Python virtual environment...
  python -m venv .venv || exit /b 1
  set "PY=%CD%\.venv\Scripts\python.exe"
  "%PY%" -m pip install -q -r requirements.txt || exit /b 1
)

if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if not "%%A"=="" if not "%%A:~0,1%"=="#" set "%%A=%%B"
  )
)

set "PORT=47231"
if not "%WISE2_PORT%"=="" set "PORT=%WISE2_PORT%"
set "HOST=127.0.0.1"
if not "%WISE2_ACCESS_PASSWORD%"=="" (
  if not "%WISE2_BIND_ALL%"=="" set "HOST=0.0.0.0"
)

echo [WISE2] Starting durable worker...
start "WISE2 Recast Worker" /D "%CD%" "%PY%" -m app.worker

echo [WISE2] Starting OBSIDIAN // FORGED Command Center API on http://%HOST%:%PORT% ...
start "WISE2 Recast API" /D "%CD%" "%PY%" -m uvicorn app.main:app --host %HOST% --port %PORT%

set /a TRIES=0
:wait
set /a TRIES+=1
if !TRIES! GTR 35 (
  echo ERROR: API failed to become healthy on port %PORT%.
  exit /b 1
)
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:%PORT%/api/health -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 (
  timeout /t 1 /nobreak >nul
  goto wait
)

echo [WISE2] Command Center ONLINE at http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"
exit /b 0
