#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$ROOT_DIR/apps/wise2-ios"
PROJECT="$IOS_DIR/WISE2.xcodeproj"
SCHEME="${SCHEME:-WISE2}"
CONFIGURATION="${CONFIGURATION:-Release}"
DERIVED_DATA="$IOS_DIR/build/DerivedData"
PRODUCTS_DIR="$DERIVED_DATA/Build/Products/${CONFIGURATION}-iphoneos"
APP_PATH="$PRODUCTS_DIR/${SCHEME}.app"
DIST_DIR="$IOS_DIR/build/distribution"
PAYLOAD_DIR="$DIST_DIR/Payload"
STAMP="$(date +%Y%m%d-%H%M%S)"
IPA_PATH="$DIST_DIR/${SCHEME}-${STAMP}.ipa"

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "error: xcodebuild is not available. Install Xcode and select it with xcode-select." >&2
  exit 1
fi

if ! xcrun -f codesign >/dev/null 2>&1; then
  echo "error: Xcode command line tools are incomplete; codesign is unavailable through xcrun." >&2
  exit 1
fi

if [[ ! -d "$PROJECT" ]]; then
  echo "error: Xcode project not found at $PROJECT" >&2
  exit 1
fi

echo "==> Building $SCHEME $CONFIGURATION for generic iOS device"
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DERIVED_DATA" \
  clean build

if [[ ! -d "$APP_PATH" ]]; then
  echo "error: built app not found at $APP_PATH" >&2
  exit 1
fi

if [[ ! -f "$APP_PATH/embedded.mobileprovision" ]]; then
  echo "error: built app has no embedded provisioning profile. Open Xcode, sign in, select a personal team, and build once." >&2
  exit 1
fi

codesign --verify --deep --strict "$APP_PATH"

rm -rf "$PAYLOAD_DIR"
mkdir -p "$PAYLOAD_DIR"
cp -R "$APP_PATH" "$PAYLOAD_DIR/"

rm -f "$IPA_PATH"
(
  cd "$DIST_DIR"
  /usr/bin/zip -qry "$IPA_PATH" Payload
)

if [[ ! -f "$IPA_PATH" ]]; then
  echo "error: ipa was not created at $IPA_PATH" >&2
  exit 1
fi

echo "==> Created IPA: $IPA_PATH"
echo "$IPA_PATH"
