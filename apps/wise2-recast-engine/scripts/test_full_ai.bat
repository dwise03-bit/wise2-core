@echo off
cd /d "%~dp0.."
echo Installing optional ASR dependencies.
python -m pip install -r requirements.txt -r requirements-asr.txt -r requirements-dev.txt
if errorlevel 1 exit /b 1
echo Full-AI mode: pytest including real transcription.
python -m pytest -ra
exit /b %ERRORLEVEL%
