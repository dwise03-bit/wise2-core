#!/usr/bin/env bash
# WISE2 Galaxy View read-only ADB inventory; never flashes, roots, or installs.
set -euo pipefail
command -v adb >/dev/null || { echo "adb missing"; exit 1; }
adb devices -l
SERIAL="${1:-}"
if [[ -z "$SERIAL" ]]; then
  echo "Pass the authorized device serial as argument after checking adb devices -l"
  exit 2
fi
adb -s "$SERIAL" get-state
echo "=== Hardware ==="
for p in ro.product.model ro.product.device ro.product.name ro.build.fingerprint ro.build.version.release ro.build.version.sdk ro.bootloader ro.product.cpu.abi ro.build.version.security_patch; do
  printf '%s: ' "$p"
  adb -s "$SERIAL" shell getprop "$p" | tr -d '\r'
done
echo "=== Partitions (read-only) ==="
adb -s "$SERIAL" shell 'cat /proc/partitions'
echo "=== Storage ==="
adb -s "$SERIAL" shell 'df -h /data /system 2>/dev/null || true'
echo "=== App packages ==="
adb -s "$SERIAL" shell 'pm list packages' | grep -E 'google|samsung|android.webview|chrome' || true
echo "=== USB debug authorization and audit finished; no changes made ==="
