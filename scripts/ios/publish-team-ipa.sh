#!/usr/bin/env bash
# Archive a WISE² iOS app and publish a SideStore-ready .ipa for wise2.net/support.
# Usage: ./scripts/ios/publish-team-ipa.sh <wise2|cherry-count|fergies-table|fieldtech>
set -euo pipefail

APP="${1:-}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST_DIR="${TEAM_APPS_DIR:-${ROOT}/apps/website/public/downloads/apps}"
EXPORT_OPTIONS="${ROOT}/scripts/ios/exportOptions.sidestore.plist"
TEAM_ID="${DEVELOPMENT_TEAM:-9N5L62DHKJ}"

case "$APP" in
  wise2)
    PROJECT="${ROOT}/apps/wise2-ios/WISE2.xcodeproj"
    SCHEME="WISE2"
    WORKDIR="${ROOT}/apps/wise2-ios/dist"
    IPA_NAME="wise2.ipa"
    ;;
  cherry-count)
    PROJECT="${ROOT}/apps/cherry-count/ios/App/App.xcodeproj"
    SCHEME="App"
    WORKDIR="${ROOT}/apps/cherry-count/ios/dist"
    IPA_NAME="cherry-count.ipa"
    if [[ -f "${ROOT}/apps/cherry-count/package.json" ]]; then
      (cd "${ROOT}/apps/cherry-count" && pnpm ios:sync)
    fi
    ;;
  fergies-table)
    PROJECT="${ROOT}/apps/fergies-table/ios/App/App.xcodeproj"
    SCHEME="App"
    WORKDIR="${ROOT}/apps/fergies-table/ios/dist"
    IPA_NAME="fergies-table.ipa"
    if [[ -f "${ROOT}/apps/fergies-table/package.json" ]]; then
      (cd "${ROOT}/apps/fergies-table" && pnpm ios:sync)
    fi
    ;;
  fieldtech)
    PROJECT="${ROOT}/apps/wise-hvac-demo/ios/App/App.xcodeproj"
    SCHEME="App"
    WORKDIR="${ROOT}/apps/wise-hvac-demo/ios/dist"
    IPA_NAME="fieldtech.ipa"
    ;;
  fieldtech-apk)
    SRC="${ROOT}/apps/wise-hvac-demo/public/downloads/WISE-FieldTech-latest.apk"
    mkdir -p "$DEST_DIR"
    cp "$SRC" "${DEST_DIR}/fieldtech.apk"
    echo "Published ${DEST_DIR}/fieldtech.apk"
    echo "Team download page: https://wise2.net/support"
    exit 0
    ;;
  *)
    echo "Usage: $0 <wise2|cherry-count|fergies-table|fieldtech|fieldtech-apk>" >&2
    exit 1
    ;;
esac

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script archives iOS apps and must run on a Mac with Xcode." >&2
  exit 1
fi

mkdir -p "$WORKDIR" "$DEST_DIR"
ARCHIVE_PATH="${WORKDIR}/${APP}.xcarchive"
EXPORT_PATH="${WORKDIR}/export"

echo "==> Archive ${APP} (${SCHEME})"
xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  archive

echo "==> Export SideStore IPA"
rm -rf "$EXPORT_PATH"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates

EXPORTED_IPA="$(find "$EXPORT_PATH" -maxdepth 1 -name '*.ipa' | head -n 1)"
if [[ -z "$EXPORTED_IPA" ]]; then
  echo "Export finished but no .ipa was produced in ${EXPORT_PATH}" >&2
  exit 1
fi

cp "$EXPORTED_IPA" "${DEST_DIR}/${IPA_NAME}"
echo ""
echo "Published ${DEST_DIR}/${IPA_NAME}"
echo "Local download: /downloads/apps/${IPA_NAME}"
echo "Team page: https://wise2.net/support"
echo "Production copy (after this file exists):"
echo "  rsync -avz ${DEST_DIR}/${IPA_NAME} dwise@173.208.147.165:/var/www/html/downloads/apps/"
