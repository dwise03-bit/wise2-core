#!/bin/bash
set -e

echo "🚀 WISE² iOS — Fieldpiece Integration Deployment"
echo "═════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

IOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$IOS_DIR"

echo -e "${BLUE}📁 Working directory: $IOS_DIR${NC}"

# Step 1: Open Xcode with the project
echo -e "\n${BLUE}1️⃣  Opening WISE² iOS project in Xcode...${NC}"
echo "   Project: WISE2.xcodeproj"
echo "   Features: Fieldpiece BLE integration, job diagnostics, measurements"

open WISE2.xcodeproj

# Wait a moment for Xcode to open
sleep 2

echo -e "\n${GREEN}✅ Xcode is opening now!${NC}"
echo ""
echo -e "${YELLOW}📱 Next steps in Xcode (these are quick):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Make sure your iPhone is connected via USB"
echo ""
echo "2. Select your iPhone from the device dropdown (top left of Xcode)"
echo "   • Shows the iPhone model + UUID"
echo ""
echo "3. Press Cmd+R to build and run"
echo "   • Build takes ~1-2 minutes first time"
echo "   • App will install and launch automatically"
echo ""
echo "4. When prompted on iPhone: TAP 'Trust'"
echo "   • This trusts the developer certificate"
echo ""
echo -e "${YELLOW}📊 Once on your iPhone:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "• Open the app → Work tab"
echo "• Select a job or create one"
echo "• Tap 'Scan for Fieldpiece Tools'"
echo "• Place your Fieldpiece devices nearby (Bluetooth range)"
echo "• Tools will appear as they're discovered"
echo "• Tap to connect and start recording measurements"
echo ""
echo -e "${GREEN}🔌 Fieldpiece Supported Tools:${NC}"
echo "  ✓ Pressure gauges (JL3PR high/low side)"
echo "  ✓ Pipe clamp thermometers (JL3PC liquid/suction)"
echo "  ✓ Psychrometers (JL3RH supply/return)"
echo "  ✓ Multimeters (SC4/SC6)"
echo "  ✓ Manometers (SM4 static pressure)"
echo ""
echo -e "${GREEN}🚀 Your technicians are ready to deploy! 🚀${NC}"
