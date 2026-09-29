#!/bin/bash
set -e

# WISE² HVAC - Automated iPhone Deployment
# Prerequisites: Xcode installed + Apple ID code signing setup

HVAC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_PROJECT="$HVAC_DIR/ios/App"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 WISE² HVAC - iPhone Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Check Xcode
echo -e "\n${BLUE}1️⃣  Checking Xcode installation...${NC}"
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode not found. Install from App Store:${NC}"
    echo "   https://apps.apple.com/us/app/xcode/id497799835"
    exit 1
fi
echo -e "${GREEN}✅ Xcode found${NC}"

# Check code signing
echo -e "\n${BLUE}2️⃣  Checking code signing identities...${NC}"
IDENTITIES=$(security find-identity -p codesigning | grep -c "iOS Development" || true)
if [ "$IDENTITIES" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No code signing identity found.${NC}"
    echo "   Open Xcode → Settings → Accounts"
    echo "   Click Manage Certificates → Create iOS Development Certificate"
    exit 1
fi
echo -e "${GREEN}✅ Code signing ready${NC}"

# Check connected device
echo -e "\n${BLUE}3️⃣  Checking for connected iPhone...${NC}"
if ! command -v instruments &> /dev/null; then
    echo -e "${YELLOW}⚠️  Could not verify connected device${NC}"
    echo "   Make sure iPhone is connected via USB and unlocked"
else
    DEVICE_COUNT=$(instruments -s devices 2>/dev/null | grep -c "iPhone" || true)
    if [ "$DEVICE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Connected iPhone found${NC}"
        instruments -s devices | grep "iPhone"
    fi
fi

# Build
echo -e "\n${BLUE}4️⃣  Building for iOS...${NC}"
cd "$IOS_PROJECT"

xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  build-for-testing

echo -e "${GREEN}✅ Build successful${NC}"

# Install
echo -e "\n${BLUE}5️⃣  Installing on physical iPhone...${NC}"
echo -e "${YELLOW}Make sure your iPhone is:${NC}"
echo "  • Connected via USB"
echo "  • Unlocked"
echo "  • Ready to receive the app"
echo ""
read -p "Press Enter to continue..."

# Get device UDID
DEVICE_UDID=$(instruments -s devices 2>/dev/null | grep "iPhone" | head -1 | awk -F'[()]' '{print $(NF-1)}' || true)

if [ -z "$DEVICE_UDID" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect device UDID${NC}"
    echo "   Run manually:"
    echo "   xcodebuild -project $IOS_PROJECT/App.xcodeproj -scheme App -configuration Release -destination 'id=YOUR_DEVICE_ID' install"
    exit 1
fi

echo -e "${BLUE}Using device: $DEVICE_UDID${NC}"

xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -destination "id=$DEVICE_UDID" \
  -allowProvisioningUpdates \
  install

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps on your iPhone:${NC}"
echo "1. Tap the HVAC app to open it"
echo "2. Go to Settings → API Configuration"
echo "3. Set API Base URL (e.g., http://192.168.1.100:3000)"
echo "4. Restart the app"
echo ""
echo -e "${GREEN}Your technicians are ready to deploy! 🚀${NC}"
