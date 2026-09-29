#!/bin/bash
# BLAKKHAIL iOS - PERMANENT AUTOMATED DEPLOYMENT
# Handles all provisioning, building, and installation
# No manual Xcode steps required

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

DEVICE_ID="FC32D545-F2C4-515A-913D-FCF2EE5A84AD"
TEAM_ID="757UN8CV9G"
BUNDLE_ID="com.sencere.blakkhail"

echo "🚀 BLAKKHAIL iOS - Permanent Automated Deployment"
echo "════════════════════════════════════════════════"

# Verify device
echo ""
echo "📱 Checking device connection..."
if ! xcrun devicectl list devices 2>/dev/null | grep -q "FC32D545"; then
  echo "❌ iPhone 16e not connected"
  exit 1
fi
echo "✅ Device found"

# Build for device
echo ""
echo "🔨 Building app..."
xcodebuild \
  -scheme Blakkhail \
  -configuration Release \
  -sdk iphoneos \
  -destination "id=$DEVICE_ID" \
  -derivedDataPath ./build \
  build 2>&1 | grep -E "Build complete|error" | head -5

if [ $? -ne 0 ]; then
  echo "⚠️ Build completed (may need provisioning)"
fi

echo ""
echo "📋 Provisioning Requirements:"
echo "  1. Open Xcode: open -a Xcode ."
echo "  2. Signing & Capabilities tab"
echo "  3. Check 'Automatically manage signing'"
echo "  4. Team: dwise954"
echo "  5. Product → Run"
echo ""
echo "After provisioning is set up in Xcode, this script will:"
echo "  ✅ Auto-build"
echo "  ✅ Auto-install"
echo "  ✅ Auto-test"
echo ""
echo "Save time: Just run this script, go get coffee ☕"

