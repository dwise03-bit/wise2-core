#!/usr/bin/env bash
set -euo pipefail

CJAYS_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_ROOT="$CJAYS_ROOT/mobile-app"
MODE="${1:-debug}"

command -v java >/dev/null || { echo "Java 17+ is required" >&2; exit 1; }
command -v gradle >/dev/null || { echo "Gradle is required" >&2; exit 1; }
if command -v brew >/dev/null && [[ -d "$(brew --prefix openjdk@17 2>/dev/null)/libexec/openjdk.jdk/Contents/Home" ]]; then
  export JAVA_HOME="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"
  export PATH="$JAVA_HOME/bin:$PATH"
fi
if [[ -z "${ANDROID_HOME:-}" && -d "$HOME/Library/Android/sdk" ]]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi
: "${ANDROID_HOME:?Set ANDROID_HOME to the Android SDK directory}"
mkdir -p "$CJAYS_ROOT/release"

cd "$APP_ROOT"
if [[ ! -x ./gradlew ]]; then
  gradle wrapper --gradle-version 8.11.1
fi

if [[ "$MODE" == "debug" ]]; then
  ./gradlew assembleDebug
  cp app/build/outputs/apk/debug/app-debug.apk "$CJAYS_ROOT/release/cjays-debug.apk"
  echo "Built $CJAYS_ROOT/release/cjays-debug.apk"
elif [[ "$MODE" == "release" ]]; then
  : "${CJAYS_RELEASE_KEYSTORE:?Set CJAYS_RELEASE_KEYSTORE}"
  : "${CJAYS_RELEASE_STORE_PASSWORD:?Set CJAYS_RELEASE_STORE_PASSWORD}"
  : "${CJAYS_RELEASE_KEY_ALIAS:?Set CJAYS_RELEASE_KEY_ALIAS}"
  : "${CJAYS_RELEASE_KEY_PASSWORD:?Set CJAYS_RELEASE_KEY_PASSWORD}"
  : "${CJAYS_API_BASE_URL:?Set CJAYS_API_BASE_URL to an HTTPS production endpoint}"
  [[ "$CJAYS_API_BASE_URL" == https://* ]] || { echo "Release API URL must use HTTPS" >&2; exit 1; }
  ./gradlew assembleRelease bundleRelease
  cp app/build/outputs/apk/release/app-release.apk "$CJAYS_ROOT/release/cjays-release.apk"
  cp app/build/outputs/bundle/release/app-release.aab "$CJAYS_ROOT/release/cjays-release.aab"
  echo "Built signed release APK and AAB in $CJAYS_ROOT/release"
else
  echo "Usage: $0 [debug|release]" >&2; exit 2
fi
