@echo off
setlocal
title Stopping WISE2 RECAST ENGINE
echo Stopping WISE2 Recast API, Worker, and OpenJutsu Proxy processes...
taskkill /FI "WINDOWTITLE eq WISE2 Recast API*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WISE2 Recast Worker*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Openjutsu proxy*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Openjutsu app*" /F >nul 2>&1
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'app\.main:app|app\.worker|comfy-api-proxy' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
echo Done.
exit /b 0
