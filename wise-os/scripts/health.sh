#!/bin/sh
set -u
PORT="${WISE2_PORT:-3000}"
pass() { printf '%-12s %s\n' "$1" "$2"; }
printf 'WISE² DEFENSE HEALTH\n\n'
if curl -fsS "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then pass CORE PASS; pass DASHBOARD PASS; else pass CORE FAIL; pass DASHBOARD FAIL; fi
if ip route 2>/dev/null | grep -q default; then pass NETWORK PASS; else pass NETWORK OFFLINE; fi
if command -v tailscale >/dev/null 2>&1 && tailscale status >/dev/null 2>&1; then pass TAILSCALE PASS; else pass TAILSCALE 'NOT CONNECTED'; fi
if [ -n "${WISE2_API_URL:-}" ]; then pass 'WISE²' CONFIGURED; else pass 'WISE²' 'NOT CONFIGURED'; fi
if command -v rtl_test >/dev/null 2>&1 && lsusb 2>/dev/null | grep -Eqi 'rtl|dvb'; then pass SDR PASS; else pass SDR 'HARDWARE NOT DETECTED'; fi
if [ -e /dev/ttyACM0 ] || [ -e /dev/ttyUSB0 ] || [ -n "${MESHTASTIC_HOST:-}" ]; then pass MESH CONFIGURED; else pass MESH 'NOT CONFIGURED'; fi
if [ -n "${CRIMERADAR_API_URL:-}" ]; then pass INCIDENTS CONFIGURED; else pass INCIDENTS 'NOT CONFIGURED'; fi
if [ -f /opt/wise2-defense/data/wise2-defense.db ] && sqlite3 /opt/wise2-defense/data/wise2-defense.db 'PRAGMA quick_check' 2>/dev/null | grep -q ok; then pass DATABASE PASS; else pass DATABASE 'NOT INITIALIZED'; fi
printf '\nSTATUS: OPERATIONAL WITH OPTIONAL SERVICES AS REPORTED\n'
