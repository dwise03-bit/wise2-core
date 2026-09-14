#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
mode="${1:-all}"
pass=0; warn=0
check() { if command -v "$1" >/dev/null 2>&1; then echo "PASS tool: $1"; pass=$((pass+1)); else echo "WARN missing tool: $1"; warn=$((warn+1)); fi; }
echo "WISE2 Mobile Verify | mode=$mode"
check git
check node
case "$mode" in
  ios|all) check xcodebuild; check xcrun ;;
esac
case "$mode" in
  android|all) check adb; command -v java >/dev/null 2>&1 && echo 'PASS tool: java' || { echo 'WARN missing tool: java'; warn=$((warn+1)); } ;;
esac
case "$mode" in
  expo|all) check npx ;;
esac
for d in apps/mobile-ios apps/wise2-ios apps/fieldtech-android apps/wise2-me-capture-android; do
  test -d "$d" && echo "PASS app: $d" && pass=$((pass+1))
done
echo "SUMMARY pass=$pass warn=$warn"
echo 'Use platform build/test commands from .claude/skills/wise2-mobile-development before release.'
