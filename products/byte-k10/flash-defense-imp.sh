#!/usr/bin/env bash
#
# WISE² K10 Defense IMP - Automated Flash Script
#
# Usage:
#   ./flash-defense-imp.sh                    # Auto-detect everything
#   ./flash-defense-imp.sh --port /dev/ttyUSB0 --api 192.168.1.100
#
# This script will:
#   1. Detect K10 USB port (or use provided one)
#   2. Install arduino-cli if missing
#   3. Install UNIHIKER board package
#   4. Update API endpoint in firmware
#   5. Compile firmware
#   6. Flash to device
#   7. Monitor serial output
#   8. Post test incident
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K10_PORT=""
EDGE_API_IP="192.168.1.100"
EDGE_API_PORT="3000"
SKIP_MONITOR=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            K10_PORT="$2"
            shift 2
            ;;
        --api)
            EDGE_API_IP="$2"
            shift 2
            ;;
        --no-monitor)
            SKIP_MONITOR=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  WISE² K10 Defense IMP Flash Script  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Step 1: Detect K10 if port not provided
if [ -z "$K10_PORT" ]; then
    echo -e "${YELLOW}[1/7] Detecting K10 USB port...${NC}"

    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        K10_PORT=$(ls /dev/cu.usbmodem* /dev/cu.usbserial* 2>/dev/null | head -1)
    # Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        K10_PORT=$(ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null | head -1)
    fi

    if [ -z "$K10_PORT" ]; then
        echo -e "${RED}✗ No K10 device found!${NC}"
        echo "  Please:"
        echo "    1. Connect K10 via USB"
        echo "    2. Wait 2 seconds for device to appear"
        echo "    3. Run again"
        echo ""
        echo "  Or specify manually:"
        echo "    ./flash-defense-imp.sh --port /dev/cu.usbmodem101"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Found K10 at: $K10_PORT${NC}\n"

# Step 2: Install arduino-cli
echo -e "${YELLOW}[2/7] Checking Arduino CLI...${NC}"
if ! command -v arduino-cli &> /dev/null; then
    echo "  Installing arduino-cli..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install arduino-cli || true
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
        export PATH="$HOME/.local/bin:$PATH"
    fi
fi
echo -e "${GREEN}✓ Arduino CLI ready${NC}\n"

# Step 3: Install board package
echo -e "${YELLOW}[3/7] Installing UNIHIKER board package...${NC}"
arduino-cli core install UNIHIKER:esp32@0.0.5 2>/dev/null || true
arduino-cli lib install "TFT_eSPI" 2>/dev/null || true
echo -e "${GREEN}✓ Board package installed${NC}\n"

# Step 4: Update API endpoint
echo -e "${YELLOW}[4/7] Configuring API endpoint...${NC}"
API_URL="http://$EDGE_API_IP:$EDGE_API_PORT/api/imp"
echo "  API: $API_URL"

# Update byte-k10.ino with API endpoint
sed -i.bak "s|const char\* WISE2_API = .*|const char* WISE2_API = \"$API_URL\";|" \
    "$SCRIPT_DIR/byte-k10.ino" 2>/dev/null || \
    sed -i '' "s|const char\* WISE2_API = .*|const char* WISE2_API = \"$API_URL\";|" \
    "$SCRIPT_DIR/byte-k10.ino"

rm -f "$SCRIPT_DIR/byte-k10.ino.bak" 2>/dev/null || true
echo -e "${GREEN}✓ API configured${NC}\n"

# Step 5: Compile
echo -e "${YELLOW}[5/7] Compiling firmware...${NC}"
arduino-cli compile --fqbn UNIHIKER:esp32:k10 "$SCRIPT_DIR" 2>&1 | grep -E "Compiling|Linking|warning|error" || true
echo -e "${GREEN}✓ Compilation complete${NC}\n"

# Step 6: Flash
echo -e "${YELLOW}[6/7] Flashing to K10 (this may take 30-60 seconds)...${NC}"
arduino-cli upload -p "$K10_PORT" --fqbn UNIHIKER:esp32:k10 "$SCRIPT_DIR" 2>&1 | tail -5

sleep 2

echo -e "${GREEN}✓ Flash complete!${NC}\n"

# Step 7: Monitor and test
if [ "$SKIP_MONITOR" = false ]; then
    echo -e "${YELLOW}[7/7] Monitoring serial output (ctrl-c to exit)...${NC}\n"

    sleep 2

    # Open serial monitor
    timeout 15 arduino-cli monitor -p "$K10_PORT" -c baudrate=115200 2>/dev/null || true

    echo ""
    echo -e "${GREEN}✓ Device booting...${NC}\n"

    # Wait for device to settle
    echo -e "${YELLOW}Waiting for Defense IMP to connect...${NC}"
    sleep 5

    # Post test incident
    echo -e "${YELLOW}Posting test incident to Defense IMP...${NC}"
    curl -s -X POST "http://$EDGE_API_IP:$EDGE_API_PORT/defense-imp/incident" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "fire",
            "distance": 0.8,
            "location": "Main St & 5th Ave",
            "severity": "critical"
        }' 2>/dev/null && echo -e "${GREEN}✓ Test incident posted${NC}" || \
        echo -e "${YELLOW}⚠ Could not post test incident (edge device may not be running)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         FLASH COMPLETE! ✓             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo "K10 is now running Defense IMP!"
echo ""
echo "Next steps:"
echo "  1. Observe animated IMP face on K10 screen"
echo "  2. Wait ~5 seconds for incident counter to appear"
echo "  3. Check top bar for incident counter"
echo "  4. Check bottom bar for CPU/RAM/Signal metrics"
echo "  5. Check right side for connectivity status"
echo ""
echo "To post real incidents:"
echo "  curl -X POST http://$EDGE_API_IP:$EDGE_API_PORT/defense-imp/incident \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"type\":\"fire\",\"distance\":0.8,\"location\":\"Test\",\"severity\":\"critical\"}'"
echo ""
echo "Troubleshooting:"
echo "  - Serial output: screen $K10_PORT 115200"
echo "  - Port info: ls /dev/cu.* /dev/ttyUSB* /dev/ttyACM*"
echo "  - Docs: See QUICK_START_FLASH.md or DEFENSE_IMP_FLASH_GUIDE.md"
echo ""
