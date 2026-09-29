#!/bin/bash
# Deploy WISE² iOS app to connected iPhone
# Usage: ./DEPLOY_TO_DEVICE.sh

set -e

DEVICE_ID="00008130-001455242861401C"
TEAM_ID="757UN8CV9G"
BUNDLE_ID="com.wise2.app"

echo "🚀 WISE² iOS Deployment to Device"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if device is connected
echo "📱 Checking for connected device..."
DEVICES=$(xcodebuild -showsdks -verbose 2>&1 | grep "iPhone" || true)

if [ -z "$DEVICES" ]; then
    echo "❌ No iPhone detected. Ensure iPhone is:"
    echo "   1. Connected via USB cable"
    echo "   2. Unlocked"
    echo "   3. Trust dialog accepted on device"
    exit 1
fi

echo "✓ Device found"

# Step 1: Add Apple Account (if needed)
echo ""
echo "📋 Step 1: Add Apple Account to Xcode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Open Xcode:"
echo "  1. Xcode > Preferences > Accounts"
echo "  2. Click '+' button"
echo "  3. Select 'Apple ID'"
echo "  4. Sign in with: dwise954@icloud.com"
echo ""
read -p "✓ Account added? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Step 2: Configure signing in Xcode
echo ""
echo "📋 Step 2: Configure Code Signing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "In Xcode:"
echo "  1. Select WISE2 project (left sidebar)"
echo "  2. Select WISE2 target"
echo "  3. Go to 'Signing & Capabilities' tab"
echo "  4. Check 'Automatically manage signing'"
echo "  5. Team dropdown > Select 'Daniel Wise (757UN8CV9G)'"
echo ""
read -p "✓ Signing configured? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Step 3: Verify iPhone trust
echo ""
echo "📱 Step 3: Trust Device"
echo "━━━━━━━━━━━━━━━━━━━"
echo "On your iPhone:"
echo "  1. Settings > General > VPN & Device Management"
echo "  2. Find 'Daniel Wise' certificate"
echo "  3. Tap > Trust"
echo ""
read -p "✓ Device trusted? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Step 4: Build & Deploy
echo ""
echo "🔨 Building & Deploying..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

# Use Xcode GUI instead of command line (more reliable)
echo ""
echo "Using Xcode GUI for deployment:"
echo "  1. In Xcode, select your iPhone in device menu (top-left)"
echo "  2. Product > Run (or press ⌘R)"
echo ""
echo "If prompted for password:"
echo "  - Enter your Mac password (for keychain access)"
echo "  - Deployment will proceed automatically"
echo ""
echo "✓ Launch Xcode: open WISE2.xcodeproj"
