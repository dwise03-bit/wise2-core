#!/usr/bin/env bash
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
case "${1:-status}" in
  status)
    echo "iOS project: $root/apps/wise2-ios/WISE2.xcodeproj"
    [[ -d "$root/apps/wise2-ios/WISE2.xcodeproj" ]] && echo "iOS: present" || echo "iOS: missing"
    [[ -d "$root/apps/wise2-android" ]] && echo "Android: present" || echo "Android: not initialized in this repository"
    command -v xcrun >/dev/null 2>&1 && xcrun simctl list devices available | head -12 || true
    command -v adb >/dev/null 2>&1 && adb devices || true
    ;;
  ios)
    cd "$root/apps/wise2-ios"
    command -v xcodebuild >/dev/null 2>&1 || { echo "xcodebuild is required on the Mac" >&2; exit 1; }
    xcodebuild -list -project WISE2.xcodeproj
    ;;
  android)
    if [[ ! -x "$root/apps/wise2-android/gradlew" ]]; then echo "Android project not initialized: apps/wise2-android/gradlew not found" >&2; exit 2; fi
    (cd "$root/apps/wise2-android" && ./gradlew test lint)
    ;;
  *) echo "Usage: $0 [status|ios|android]" >&2; exit 2;;
esac
