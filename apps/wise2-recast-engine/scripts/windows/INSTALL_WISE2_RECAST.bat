@echo off
setlocal EnableExtensions
title WISE2 RECAST ENGINE — Hardware-Safe Windows Installer
cd /d "%~dp0..\.."

echo ============================================================
echo   WISE2 CLIP ENGINE x OPENJUTSU — HARDWARE-SAFE INSTALLER
echo ============================================================

where python >nul 2>&1 || (echo ERROR: Python 3.11+ required. & exit /b 1)
where node >nul 2>&1 || (echo ERROR: Node.js 22.6+ required. & exit /b 1)
where ffmpeg >nul 2>&1 || (echo ERROR: FFmpeg required. & exit /b 1)

echo [1/4] Checking Python environment...
if not exist ".venv\Scripts\python.exe" (
  if exist "%USERPROFILE%\Downloads\WISE2-Clip-Engine-v1.7-Complete (1)\.venv\Scripts\python.exe" (
    echo Reusing existing WISE2 Clip Engine .venv to conserve disk space.
  ) else (
    python -m venv .venv || exit /b 1
    ".venv\Scripts\python.exe" -m pip install -r requirements.txt || exit /b 1
  )
)

echo [2/4] Detecting GPU and CUDA compatibility...
where nvidia-smi >nul 2>&1
if errorlevel 1 (
  echo [GUARD] No NVIDIA GPU detected. Skipping heavy CUDA PyTorch / multi-GB local model downloads.
  echo [GUARD] Remote ComfyUI, Free Google Colab, and Free Kaggle GPU backends are configured instead.
) else (
  nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
  echo [INFO] NVIDIA GPU detected. You may install ComfyUI CUDA dependencies on this machine if >=16 GB VRAM and >=45 GB free disk.
)

echo [3/4] Creating .env from .env.example if absent...
if not exist ".env" copy ".env.example" ".env" >nul

echo [4/4] Running full WISE2 diagnostic audit...
call scripts\windows\DIAGNOSE_WISE2_RECAST.bat
exit /b %ERRORLEVEL%
