#!/usr/bin/env bash
# Verifies a built WISE² Field Tech APK matches what /api/v1/fieldtech/releases/latest
# publishes, before technicians are told to update (spec §22 — reject hash mismatches).
set -euo pipefail

API_BASE="${WISE2_API_BASE:-https://wise2.net/api}"
APK_PATH="${1:-}"

if [[ -z "$APK_PATH" ]]; then
  echo "Usage: $0 <path-to-apk>" >&2
  exit 1
fi
if [[ ! -f "$APK_PATH" ]]; then
  echo "File not found: $APK_PATH" >&2
  exit 1
fi

LOCAL_SHA256=$(shasum -a 256 "$APK_PATH" | awk '{print $1}')
echo "Local APK SHA-256: $LOCAL_SHA256"

RESPONSE=$(curl -fsSL "$API_BASE/v1/fieldtech/releases/latest")
REMOTE_SHA256=$(echo "$RESPONSE" | grep -o '"sha256"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/.*"([a-f0-9]{64})"/\1/')
REMOTE_VERSION=$(echo "$RESPONSE" | grep -o '"versionName"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/.*"([^"]*)"$/\1/')

echo "Published release: v$REMOTE_VERSION, SHA-256: $REMOTE_SHA256"

if [[ "$LOCAL_SHA256" != "$REMOTE_SHA256" ]]; then
  echo "MISMATCH: local APK does not match the published release metadata." >&2
  exit 1
fi

echo "OK: local APK matches the published release."
