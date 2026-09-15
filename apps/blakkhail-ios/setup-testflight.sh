#!/bin/bash
set -e

echo "🚀 BLAKKHAIL iOS - TESTFLIGHT SETUP"
echo "═════════════════════════════════════"
echo ""

# Create Archive for App Store Connect
echo "Step 1: Creating iOS app archive..."
xcodebuild archive \
  -scheme Blakkhail \
  -configuration Release \
  -sdk iphoneos \
  -archivePath ./build/Blakkhail.xcarchive \
  -derivedDataPath ./build \
  2>&1 | grep -E "Archive|error|warning" || true

if [ -d "./build/Blakkhail.xcarchive" ]; then
    echo "✅ Archive created"
else
    echo "⚠️ Archive may need manual Xcode signing"
fi

echo ""
echo "═════════════════════════════════════"
echo "📋 NEXT STEPS FOR OWNER:"
echo "═════════════════════════════════════"
echo ""
echo "1. Open Xcode:"
echo "   open -a Xcode Blakkhail.xcodeproj"
echo ""
echo "2. Sign in with blakkhail@gmail.com"
echo ""
echo "3. Go to: Product → Archive"
echo ""
echo "4. Click 'Distribute App' → 'TestFlight'"
echo ""
echo "5. Add tester emails (owner's team)"
echo ""
echo "6. Complete submission → Done"
echo ""
echo "✅ App will be downloadable from TestFlight within hours"
