#!/usr/bin/env bash
# Builds a signed WISE² Field Tech release APK.
#
# Signing secrets are NEVER read from files in this repo — only from environment variables,
# consumed directly by apps/fieldtech-android/app/build.gradle.kts's release signingConfig:
#   WISE2_RELEASE_KEYSTORE          absolute path to the .jks/.keystore file (not committed)
#   WISE2_RELEASE_STORE_PASSWORD
#   WISE2_RELEASE_KEY_ALIAS
#   WISE2_RELEASE_KEY_PASSWORD
#
# If those aren't set, build.gradle.kts skips configuring a signingConfig and this script
# fails fast rather than silently producing an unsigned/debug-signed "release" APK.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$ROOT_DIR/apps/fieldtech-android"

if [[ -z "${WISE2_RELEASE_KEYSTORE:-}" || -z "${WISE2_RELEASE_STORE_PASSWORD:-}" || -z "${WISE2_RELEASE_KEY_ALIAS:-}" || -z "${WISE2_RELEASE_KEY_PASSWORD:-}" ]]; then
  echo "Missing one or more WISE2_RELEASE_* signing environment variables. Refusing to build an unsigned release APK." >&2
  echo "Required: WISE2_RELEASE_KEYSTORE, WISE2_RELEASE_STORE_PASSWORD, WISE2_RELEASE_KEY_ALIAS, WISE2_RELEASE_KEY_PASSWORD" >&2
  exit 1
fi

if [[ ! -f "$WISE2_RELEASE_KEYSTORE" ]]; then
  echo "WISE2_RELEASE_KEYSTORE does not point to a file: $WISE2_RELEASE_KEYSTORE" >&2
  exit 1
fi

cd "$PROJECT_DIR"
echo "Building signed release APK..."
./gradlew --no-daemon clean assembleRelease

APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" | head -1)
if [[ -z "$APK_PATH" ]]; then
  echo "Build finished but no APK was produced." >&2
  exit 1
fi

VERSION_NAME=$(grep -m1 'versionName = ' app/build.gradle.kts | sed -E 's/.*versionName = "(.*)"/\1/')
RELEASES_DIR="$ROOT_DIR/releases"
mkdir -p "$RELEASES_DIR"
DEST="$RELEASES_DIR/WISE2-FieldTech-v${VERSION_NAME}.apk"
cp "$APK_PATH" "$DEST"

SHA256=$(shasum -a 256 "$DEST" | awk '{print $1}')

echo ""
echo "Release built: $DEST"
echo "SHA-256: $SHA256"
echo ""
echo "Next: publish $DEST to WISE² release infrastructure, then update the"
echo "FieldTechRelease record (versionCode, versionName, apkUrl, sha256) so"
echo "GET /api/v1/fieldtech/releases/latest reflects it. See scripts/check-android-release.sh."
