#!/bin/bash
set -e

echo "🔍 Checking for connected iOS devices..."
xcrun xctrace list devices 2>/dev/null | grep -i "iphone" || echo "⚠️  No device found in xctrace"

echo ""
echo "📱 Available devices:"
instruments -s devices | grep -i "iphone" || echo "⚠️  No iPhone devices found"

echo ""
echo "🔧 Building for connected device..."
echo "This may take 1-2 minutes on first build"
echo ""

# Build for generic iOS device
xcodebuild \
  -scheme WISE2RP \
  -configuration Debug \
  -sdk iphoneos \
  -derivedDataPath ./build \
  -verbose 2>&1 | tail -50

echo ""
echo "✅ Build complete!"
echo "📱 To deploy, connect your iPhone and run:"
echo "   xcodebuild -scheme WISE2RP -configuration Debug -sdk iphoneos -derivedDataPath ./build install"
