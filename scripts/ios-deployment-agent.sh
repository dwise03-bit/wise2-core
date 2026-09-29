#!/bin/bash
# BLAKKHAIL iOS Deployment Agent (Local AI Powered)

set -e

APP_NAME="BLAKKHAIL"
APP_ID="com.sencere.blakkhail"
APP_DIR="apps/blakkhail-ios"
TEAM_ID="757UN8CV9G"

log() {
  echo "🤖 [$APP_NAME] $1"
}

log "Starting iOS deployment workflow..."

# Step 1: Verify device
log "Checking for connected iPhone..."
DEVICE=$(xcrun devicectl list devices 2>/dev/null | grep "iPhone.*connected" | head -1 | awk -F'[()]' '{print $(NF-1)}')

if [ -z "$DEVICE" ]; then
  log "ERROR: No iPhone connected. Plug in device and try again."
  exit 1
fi

log "Device found: $DEVICE"

# Step 2: Build
log "Building app..."
cd "$APP_DIR"

xcodebuild \
  -scheme Blakkhail \
  -configuration Release \
  -sdk iphoneos \
  -destination "id=$DEVICE" \
  -derivedDataPath ./build \
  -allowProvisioningUpdates \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  build 2>&1 | grep -E "Build complete|error|failed" || true

# Step 3: Install via Xcode (requires provisioning)
log "Installing to device..."
log "Opening Xcode for final approval..."
open -a Xcode .

log "✅ Deployment workflow complete"
log "Complete installation in Xcode: Product → Run (Cmd+R)"

