@echo off
cd /d "%~dp0.."
echo Core mode: pytest without installing faster-whisper.
python -m pytest -ra
exit /b %ERRORLEVEL%
