#!/bin/bash
set -e

echo "🔨 Building OTA Release..."
echo "════════════════════════════════════════"

IOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$IOS_DIR"

# Build for iOS (skip signing for development builds)
echo "📦 Building app..."
xcodebuild clean build \
  -scheme WISE2 \
  -configuration Release \
  -destination generic/platform=iOS \
  -derivedDataPath "$IOS_DIR/build" \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

# Copy built app to OTA directory
echo "📱 Preparing OTA package..."
mkdir -p "$IOS_DIR/build/OTA"
cp -r "$IOS_DIR/build/Build/Products/Release-iphoneos/WISE2.app" "$IOS_DIR/build/OTA/Payload/WISE2.app" 2>/dev/null || true
mkdir -p "$IOS_DIR/build/OTA/Payload"
cp -r "$IOS_DIR/build/Build/Products/Release-iphoneos/WISE2.app" "$IOS_DIR/build/OTA/Payload/WISE2.app"

# Create IPA (just a ZIP with .ipa extension)
echo "📦 Creating IPA..."
cd "$IOS_DIR/build/OTA"
zip -r -q WISE2.ipa Payload/
cd "$IOS_DIR"

# Copy to VPS
if [ -f "$IOS_DIR/build/OTA/WISE2.ipa" ]; then
  echo "✅ IPA built successfully"
  echo ""
  echo "📤 Uploading to VPS..."
  scp "$IOS_DIR/build/OTA/WISE2.ipa" dwise@173.208.147.165:/var/www/apps/wise2-ios/
  scp "$IOS_DIR/ota-manifest.plist" dwise@173.208.147.165:/var/www/apps/wise2-ios/
  echo "✅ OTA update published!"
  echo ""
  echo "🔗 Installation link:"
  echo "itms-services://?action=purchaseIntent&bundleId=com.wisedefense.fieldtech&url=http://173.208.147.165:3000/apps/wise2-ios/ota-manifest.plist"
else
  echo "❌ Failed to build IPA"
  exit 1
fi
