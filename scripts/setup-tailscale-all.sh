#!/bin/bash
# Comprehensive Tailscale Setup for WISE² Multi-Device Network
# Run this script on each device to join the Tailscale mesh network

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== WISE² Tailscale Setup ===${NC}"
echo ""

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    DISTRO=$(lsb_release -si 2>/dev/null || echo "unknown")
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

echo -e "${YELLOW}Detected OS: $OS${NC}"

# Step 1: Install Tailscale
echo ""
echo -e "${YELLOW}Step 1: Installing Tailscale...${NC}"

if command -v tailscale &> /dev/null; then
    echo -e "${GREEN}✓ Tailscale already installed${NC}"
    tailscale version
else
    case $OS in
        linux)
            echo "Installing for Linux..."
            curl -fsSL https://tailscale.com/install.sh | sh
            echo -e "${GREEN}✓ Tailscale installed${NC}"
            ;;
        macos)
            echo "Installing for macOS..."
            if command -v brew &> /dev/null; then
                brew install tailscale
            else
                echo -e "${RED}Homebrew not found. Please install from https://tailscale.com/download/mac${NC}"
                exit 1
            fi
            echo -e "${GREEN}✓ Tailscale installed${NC}"
            ;;
        windows)
            echo "Installing for Windows..."
            echo "Please download from: https://tailscale.com/download/windows"
            exit 1
            ;;
        *)
            echo -e "${RED}Unsupported OS: $OS${NC}"
            exit 1
            ;;
    esac
fi

# Step 2: Check if already authenticated
echo ""
echo -e "${YELLOW}Step 2: Checking Tailscale status...${NC}"

if tailscale status &> /dev/null; then
    echo -e "${GREEN}✓ Already authenticated to Tailscale${NC}"
    echo ""
    tailscale status
else
    echo -e "${YELLOW}Not yet authenticated. Starting authentication...${NC}"
    echo ""
    sudo tailscale up
    echo ""
    echo -e "${GREEN}✓ Authentication complete${NC}"
fi

# Step 3: Get Tailscale IP
echo ""
echo -e "${YELLOW}Step 3: Getting Tailscale IP address...${NC}"
TAILSCALE_IP=$(tailscale ip -4)
echo -e "${GREEN}✓ Your Tailscale IP: ${TAILSCALE_IP}${NC}"

# Step 4: Configure device name (optional)
echo ""
echo -e "${YELLOW}Step 4: Device Information${NC}"
DEVICE_NAME=$(hostname)
echo "Device hostname: $DEVICE_NAME"
echo "Tailscale IP: $TAILSCALE_IP"

# Step 5: Status summary
echo ""
echo -e "${BLUE}=== Setup Complete ===${NC}"
echo ""
echo -e "${GREEN}Your device is now on the WISE² Tailscale network!${NC}"
echo ""
echo "Device Details:"
echo "  Hostname: $DEVICE_NAME"
echo "  Tailscale IP: $TAILSCALE_IP"
echo "  OS: $OS"
echo ""
echo "You can now access this device from other devices on the network:"
echo "  ssh user@$TAILSCALE_IP"
echo "  curl http://$TAILSCALE_IP:3000/health"
echo ""
echo "To view all connected devices:"
echo "  tailscale status"
echo ""
echo "To share access with others:"
echo "  Visit: https://login.tailscale.com"
echo ""

# Step 6: Test connectivity to VPS
echo -e "${YELLOW}Step 5: Network Connectivity${NC}"
echo ""
echo "Run these commands to test connectivity:"
echo ""
echo "  # Check VPS connection (replace with actual VPS Tailscale IP)"
echo "  ping <vps-tailscale-ip>"
echo ""
echo "  # SSH to VPS"
echo "  ssh dwise@<vps-tailscale-ip>"
echo ""
echo "  # Access VPS API"
echo "  curl http://<vps-tailscale-ip>:3001/webhooks/google-voice/health"
echo ""
