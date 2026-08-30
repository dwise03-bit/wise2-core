#!/bin/bash
# Android Termux: Tailscale Setup + Access to WISE² Services
# Run in Termux on Android phone

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Android Termux: Tailscale Setup ===${NC}"
echo ""

# Step 1: Check if running in Termux
if [ -z "$TERMUX_VERSION" ]; then
    echo -e "${RED}This script must be run in Termux!${NC}"
    echo "Please install Termux from Google Play Store first"
    exit 1
fi

echo -e "${GREEN}✓ Running in Termux${NC}"
echo ""

# Step 2: Update package manager
echo -e "${YELLOW}Step 1: Updating package manager...${NC}"
apt update
apt upgrade -y
echo -e "${GREEN}✓ Packages updated${NC}"

# Step 3: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
apt install -y curl wget openssh git
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Install Tailscale
echo -e "${YELLOW}Step 3: Installing Tailscale...${NC}"
if command -v tailscale &> /dev/null; then
    echo -e "${GREEN}✓ Tailscale already installed${NC}"
else
    curl -fsSL https://tailscale.com/install.sh | sh
    echo -e "${GREEN}✓ Tailscale installed${NC}"
fi

# Step 5: Authenticate with Tailscale
echo ""
echo -e "${YELLOW}Step 4: Authenticating with Tailscale...${NC}"
echo ""
echo "Opening Tailscale authentication..."
echo "If browser doesn't open automatically, visit:"
echo "  https://login.tailscale.com"
echo ""

if tailscale status &> /dev/null; then
    echo -e "${GREEN}✓ Already authenticated${NC}"
else
    tailscale up
fi

# Get Tailscale IP
ANDROID_IP=$(tailscale ip -4)
echo ""
echo -e "${GREEN}✓ Android Tailscale IP: $ANDROID_IP${NC}"

# Step 6: Set up SSH
echo ""
echo -e "${YELLOW}Step 5: Setting up SSH access...${NC}"
pkg install -y openssh
echo -e "${GREEN}✓ OpenSSH installed${NC}"

# Generate SSH key if doesn't exist
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Generating SSH key..."
    ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa
    echo -e "${GREEN}✓ SSH key generated${NC}"
fi

echo "Your public SSH key:"
echo ""
cat ~/.ssh/id_rsa.pub
echo ""
echo -e "${YELLOW}Add this to VPS/Pi ~/.ssh/authorized_keys to enable SSH${NC}"

# Step 7: Create quick access scripts
echo ""
echo -e "${YELLOW}Step 6: Creating access scripts...${NC}"

mkdir -p ~/wise2-scripts

# VPS access script
cat > ~/wise2-scripts/connect-vps.sh << 'EOF'
#!/bin/bash
ssh dwise@gpu-nmls-1.tail44396d.ts.net
EOF
chmod +x ~/wise2-scripts/connect-vps.sh

# Pi access script
cat > ~/wise2-scripts/connect-pi.sh << 'EOF'
#!/bin/bash
echo "What is the Pi Tailscale IP? (format: 100.64.x.x)"
read PI_IP
echo "Connecting to Pi at $PI_IP..."
ssh pi@$PI_IP
EOF
chmod +x ~/wise2-scripts/connect-pi.sh

# Health check script
cat > ~/wise2-scripts/health-check.sh << 'EOF'
#!/bin/bash
echo "=== WISE² Health Check via Tailscale ==="
echo ""

echo "VPS Status:"
curl -s --connect-timeout 5 http://gpu-nmls-1.tail44396d.ts.net:3010/api/health 2>/dev/null && echo "" && echo "✓ VPS API OK" || echo "✗ VPS API unreachable (try: ssh dwise@gpu-nmls-1.tail44396d.ts.net)"

echo ""
echo "Raspberry Pi Status:"
read -p "Enter Pi Tailscale IP: " PI_IP
curl -s http://$PI_IP:3000/health 2>/dev/null && echo "" && echo "✓ Pi OK" || echo "✗ Pi Unreachable"

echo ""
echo "Tailscale Network Status:"
tailscale status
EOF
chmod +x ~/wise2-scripts/health-check.sh

echo -e "${GREEN}✓ Scripts created in ~/wise2-scripts/${NC}"
echo ""
echo "Available scripts:"
echo "  • ~/wise2-scripts/connect-vps.sh      # SSH to VPS"
echo "  • ~/wise2-scripts/connect-pi.sh       # SSH to Raspberry Pi"
echo "  • ~/wise2-scripts/health-check.sh     # Check system health"

# Step 8: Install optional tools
echo ""
echo -e "${YELLOW}Step 7: Installing optional tools...${NC}"
apt install -y jq curl ncdu htop
echo -e "${GREEN}✓ Optional tools installed${NC}"

# Step 9: Summary
echo ""
echo -e "${BLUE}=== Setup Complete ===${NC}"
echo ""
echo -e "${GREEN}Android is now connected to WISE² Tailscale network!${NC}"
echo ""
echo "Your Device:"
echo "  • Termux installed: ✓"
echo "  • Tailscale IP: $ANDROID_IP"
echo "  • SSH enabled: ✓"
echo ""
echo "Next steps:"
echo ""
echo "1. Deploy VPS and Raspberry Pi"
echo ""
echo "2. Note their Tailscale IPs:"
echo "   - VPS Tailscale IP: 100.64.x.x"
echo "   - Pi Tailscale IP: 100.64.x.x"
echo ""
echo "3. Connect via SSH:"
echo "   ssh dwise@<vps-tailscale-ip>"
echo "   ssh pi@<pi-tailscale-ip>"
echo ""
echo "4. Check system health:"
echo "   ~/wise2-scripts/health-check.sh"
echo ""
echo "5. Copy files between devices:"
echo "   scp file.txt dwise@<vps-ip>:~/"
echo "   scp pi@<pi-ip>:~/file.txt ./"
echo ""
echo "6. View all connected devices:"
echo "   tailscale status"
echo ""
echo "Quick commands:"
echo "  tailscale ip -4              # Your IP"
echo "  tailscale status             # All devices"
echo "  curl http://<ip>:3000/health # Check service"
echo ""
