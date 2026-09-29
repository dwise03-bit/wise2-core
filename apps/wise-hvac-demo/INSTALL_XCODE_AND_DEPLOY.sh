#!/bin/bash
set -e

# WISE² HVAC — Xcode Installation + Native Deployment
# Run this when Xcode installation completes

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🍎 Checking Xcode Installation...${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Wait for Xcode to be installed
while [ ! -d "/Applications/Xcode.app" ]; do
    echo -e "${YELLOW}⏳ Xcode not found. Waiting...${NC}"
    sleep 10
done

echo -e "${GREEN}✅ Xcode detected!${NC}"

# Accept Xcode license
echo -e "\n${BLUE}Accepting Xcode license...${NC}"
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

echo -e "${GREEN}✅ License accepted${NC}"

# Verify xcodebuild works
echo -e "\n${BLUE}Verifying xcodebuild...${NC}"
xcodebuild -version

echo -e "${GREEN}✅ xcodebuild is ready${NC}"

# Auto-create code signing identity
echo -e "\n${BLUE}Setting up code signing...${NC}"
echo -e "${YELLOW}Opening Xcode to create iOS Development certificate...${NC}"
open /Applications/Xcode.app

echo -e ""
echo -e "${YELLOW}In Xcode:${NC}"
echo -e "  1. Go to Xcode → Settings → Accounts"
echo -e "  2. Click + to add your Apple ID"
echo -e "  3. Click Manage Certificates → + Create iOS Development"
echo -e "  4. Close Xcode"
echo -e ""
read -p "Press Enter once code signing is set up in Xcode..."

# Build and deploy
HVAC_DIR="/Users/danielwise/Projects/wise2-core/apps/wise-hvac-demo"
IOS_PROJECT="$HVAC_DIR/ios/App"

echo -e "\n${BLUE}Building native iOS app...${NC}"
cd "$IOS_PROJECT"

xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  build

echo -e "${GREEN}✅ Build complete${NC}"

# Get connected device
echo -e "\n${BLUE}Finding connected iPhone...${NC}"
DEVICE_UDID=$(instruments -s devices 2>/dev/null | grep -i "iPhone" | grep -v simulator | head -1 | awk -F'[()]' '{print $(NF-1)}' || true)

if [ -z "$DEVICE_UDID" ]; then
    echo -e "${RED}❌ No iPhone found${NC}"
    echo ""
    echo -e "${YELLOW}Make sure:${NC}"
    echo "  1. iPhone is connected via USB"
    echo "  2. iPhone is unlocked"
    echo "  3. You tapped 'Trust' on the iPhone"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Found device: $DEVICE_UDID${NC}"

echo -e "\n${BLUE}Installing app on physical iPhone...${NC}"
xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -destination "id=$DEVICE_UDID" \
  -allowProvisioningUpdates \
  install

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Native iOS App Installed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next:${NC}"
echo "1. The HVAC app icon should appear on your iPhone"
echo "2. Tap to open"
echo "3. Settings → API Configuration"
echo "4. Set API URL (e.g., http://192.168.1.100:3000)"
echo ""
echo -e "${GREEN}Your technicians are ready to deploy! 🚀${NC}"
