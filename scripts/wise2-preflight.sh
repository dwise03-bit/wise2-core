#!/usr/bin/env bash
set -u
profile="${1:-mac}"
fail=0
need() { if command -v "$1" >/dev/null 2>&1; then echo "PASS $1: $(command -v "$1")"; else echo "MISS $1"; fail=1; fi; }
echo "WISE² preflight: $profile"
need git
case "$profile" in
  mac|mobile)
    need ssh; need tailscale; need ollama
    if command -v xcodebuild >/dev/null 2>&1; then echo "PASS xcodebuild: $(xcodebuild -version | head -1)"; else echo "MISS xcodebuild"; fi
    if command -v adb >/dev/null 2>&1; then echo "PASS adb: $(adb version | head -1)"; else echo "INFO adb not installed"; fi
    ;;
  vps) need ssh; need docker; need curl ;;
  *) echo "Usage: $0 [mac|mobile|vps]" >&2; exit 2;;
esac
exit "$fail"
