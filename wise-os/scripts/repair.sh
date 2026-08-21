#!/bin/sh
set -eu
install -d -o wise2 -g wise2 -m 0750 /opt/wise2-defense/data /opt/wise2-defense/logs
chown -R wise2:wise2 /opt/wise2-defense/data /opt/wise2-defense/logs
if command -v sqlite3 >/dev/null 2>&1; then sqlite3 /opt/wise2-defense/data/wise2-defense.db 'PRAGMA quick_check;' >/dev/null; fi
systemctl restart wise2-defense.service
systemctl reset-failed wise2-sdr.service wise2-mesh.service 2>/dev/null || true
/opt/wise2-defense/scripts/health.sh
