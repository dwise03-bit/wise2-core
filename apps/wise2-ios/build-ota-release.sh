#!/bin/bash
set -e

echo "🔨 Building OTA Release..."
echo "════════════════════════════════════════"

IOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$IOS_DIR"

# Build for iOS with the configured Apple Development signing identity.
echo "📦 Building app..."
xcodebuild clean build \
  -scheme SenCere \
  -configuration Release \
  -destination generic/platform=iOS \
  -derivedDataPath "$IOS_DIR/build" \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=9N5L62DHKJ \
  CODE_SIGNING_REQUIRED=YES \
  CODE_SIGNING_ALLOWED=YES \
  -allowProvisioningUpdates

# Copy built app to OTA directory
echo "📱 Preparing OTA package..."
rm -rf "$IOS_DIR/build/OTA"
mkdir -p "$IOS_DIR/build/OTA/Payload"
cp -r "$IOS_DIR/build/Build/Products/Release-iphoneos/SenCere.app" "$IOS_DIR/build/OTA/Payload/SenCere.app"

# Create IPA (just a ZIP with .ipa extension)
echo "📦 Creating IPA..."
cd "$IOS_DIR/build/OTA"
zip -r -q WISE2.ipa Payload
cd "$IOS_DIR"

# Copy to VPS
if [ -f "$IOS_DIR/build/OTA/WISE2.ipa" ]; then
  echo "✅ IPA built successfully"
  echo ""
  echo "📤 Uploading to VPS..."
  scp "$IOS_DIR/build/OTA/WISE2.ipa" "$IOS_DIR/ota-manifest.plist" dwise@173.208.147.165:/tmp/
  ssh dwise@173.208.147.165 'sudo -n install -d -m 755 /var/www/html/downloads/apps/wise2-ios && sudo -n install -m 644 /tmp/WISE2.ipa /var/www/html/downloads/apps/wise2-ios/WISE2.ipa && sudo -n install -m 644 /tmp/ota-manifest.plist /var/www/html/downloads/apps/wise2-ios/ota-manifest.plist'
  echo "✅ OTA update published!"
  echo ""
  echo "🔗 Installation link:"
echo "itms-services://?action=download-manifest&url=https://wisedefensellc.com/downloads/apps/wise2-ios/ota-manifest.plist"
else
  echo "❌ Failed to build IPA"
  exit 1
fi
