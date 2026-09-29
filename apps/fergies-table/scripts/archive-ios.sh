#!/usr/bin/env bash
# Archive Fergie's Table for App Store Connect.
# Requires a paid Apple Developer Program team on 9N5L62DHKJ.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS_APP="${ROOT}/ios/App"
ARCHIVE_PATH="${ROOT}/ios/dist/FergiesTable.xcarchive"
EXPORT_PATH="${ROOT}/ios/dist/export"

mkdir -p "${ROOT}/ios/dist"

echo "==> Sync Capacitor"
cd "$ROOT"
pnpm ios:sync

echo "==> Archive Release"
xcodebuild \
  -project "${IOS_APP}/App.xcodeproj" \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=9N5L62DHKJ \
  archive

echo "==> Export IPA"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "${ROOT}/ios/exportOptions.plist" \
  -allowProvisioningUpdates

echo ""
echo "Archive: ${ARCHIVE_PATH}"
echo "Export:  ${EXPORT_PATH}"
echo "Upload from Xcode Organizer or: xcrun altool --upload-app (after paid membership)"
