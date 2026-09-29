#!/bin/bash
set -e

echo "🚀 WISE² HVAC iOS Deployment"
echo "════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

HVAC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HVAC_DIR"

echo -e "${BLUE}📁 Working directory: $HVAC_DIR${NC}"

# Step 1: Install dependencies
echo -e "\n${BLUE}1️⃣  Installing npm dependencies...${NC}"
npm install

# Step 2: Build Next.js app
echo -e "\n${BLUE}2️⃣  Building Next.js application...${NC}"
npm run build

# Step 3: Check if iOS project exists
if [ ! -d "ios" ]; then
    echo -e "\n${BLUE}3️⃣  Generating iOS project with Capacitor...${NC}"
    npx cap add ios
else
    echo -e "\n${BLUE}3️⃣  iOS project already exists. Syncing...${NC}"
fi

# Step 4: Sync Capacitor
echo -e "\n${BLUE}4️⃣  Syncing Capacitor...${NC}"
npx cap sync ios

# Step 5: Open in Xcode
echo -e "\n${BLUE}5️⃣  Opening in Xcode...${NC}"
npx cap open ios

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps in Xcode:${NC}"
echo "1. Make sure your iPhone is connected via USB"
echo "2. Select your iPhone from the device dropdown (top left)"
echo "3. Press Cmd+R to build and run"
echo "4. Tap 'Trust' on your iPhone to trust the developer certificate"
echo "5. The app will launch automatically"
echo ""
echo -e "${YELLOW}After the app launches:${NC}"
echo "1. Go to Settings → API Configuration"
echo "2. Set the API Base URL to your backend IP (e.g., http://192.168.1.x:3000)"
echo "3. Restart the app"
echo ""
echo -e "${GREEN}Your technicians are ready to deploy! 🚀${NC}"
