#!/bin/bash
# Deploy WISE² K10 + CYD Gateway Service to skorpius
#
# This script:
# 1. Installs Node.js dependencies
# 2. Copies gateway files to skorpius
# 3. Creates systemd service
# 4. Starts the gateway service
# 5. Verifies connectivity
#
# Run on: skorpius (Raspberry Pi 5)
# Usage: bash deploy-k10-cyd-gateway.sh

set -e

echo "════════════════════════════════════════════════════════"
echo "WISE² K10 + CYD Gateway Deployment"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
GATEWAY_DIR="/opt/wise2/gateway"
GATEWAY_USER="wise2"
NODE_PORT=8888

echo -e "${BLUE}Step 1: Checking prerequisites${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✗ This script requires sudo${NC}"
  echo "Run: sudo bash deploy-k10-cyd-gateway.sh"
  exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}⚠ Node.js not found, installing...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check npm
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

# Check MQTT broker
if ! command -v mosquitto &> /dev/null; then
  echo -e "${YELLOW}⚠ Mosquitto not found, installing...${NC}"
  sudo apt-get install -y mosquitto mosquitto-clients
fi

echo -e "${GREEN}✓ Mosquitto installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Setting up gateway directory${NC}"
echo ""

# Create gateway directory
if [ ! -d "$GATEWAY_DIR" ]; then
  mkdir -p "$GATEWAY_DIR"
  echo -e "${GREEN}✓ Created $GATEWAY_DIR${NC}"
else
  echo -e "${GREEN}✓ Gateway directory exists${NC}"
fi

# Create wise2 user if needed
if ! id "$GATEWAY_USER" &>/dev/null; then
  useradd -r -s /bin/bash -d "$GATEWAY_DIR" "$GATEWAY_USER"
  echo -e "${GREEN}✓ Created $GATEWAY_USER user${NC}"
else
  echo -e "${GREEN}✓ $GATEWAY_USER user exists${NC}"
fi

# Set permissions
chown -R "$GATEWAY_USER:$GATEWAY_USER" "$GATEWAY_DIR"
chmod 755 "$GATEWAY_DIR"
echo -e "${GREEN}✓ Set permissions${NC}"
echo ""

echo -e "${BLUE}Step 3: Installing gateway service${NC}"
echo ""

# Copy gateway files
echo "Copying files..."
cp k10-cyd-gateway-service.js "$GATEWAY_DIR/"
cp K10_CYD_WISEPI_INTEGRATION.md "$GATEWAY_DIR/"
chmod +x "$GATEWAY_DIR/k10-cyd-gateway-service.js"
echo -e "${GREEN}✓ Files copied${NC}"

# Create package.json
cat > "$GATEWAY_DIR/package.json" << 'EOF'
{
  "name": "wise2-k10-cyd-gateway",
  "version": "1.0.0",
  "description": "WISE² K10 + CYD Gateway Service",
  "main": "k10-cyd-gateway-service.js",
  "scripts": {
    "start": "node k10-cyd-gateway-service.js",
    "dev": "nodemon k10-cyd-gateway-service.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mqtt": "^5.0.0",
    "axios": "^1.5.0"
  },
  "author": "dwise",
  "license": "MIT"
}
EOF

echo -e "${GREEN}✓ Created package.json${NC}"

# Install npm dependencies
echo "Installing npm dependencies..."
cd "$GATEWAY_DIR"
npm install --production

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 4: Creating systemd service${NC}"
echo ""

# Copy systemd service file
cp k10-cyd-gateway.service /etc/systemd/system/
chmod 644 /etc/systemd/system/k10-cyd-gateway.service

# Reload systemd
systemctl daemon-reload
echo -e "${GREEN}✓ Systemd service installed${NC}"

# Enable service
systemctl enable k10-cyd-gateway.service
echo -e "${GREEN}✓ Service enabled (auto-start on reboot)${NC}"
echo ""

echo -e "${BLUE}Step 5: Starting gateway service${NC}"
echo ""

# Start service
systemctl start k10-cyd-gateway.service
sleep 2

# Check status
if systemctl is-active --quiet k10-cyd-gateway.service; then
  echo -e "${GREEN}✓ Gateway service started${NC}"
else
  echo -e "${RED}✗ Gateway service failed to start${NC}"
  echo "Check logs with: sudo journalctl -u k10-cyd-gateway -n 20"
  exit 1
fi
echo ""

echo -e "${BLUE}Step 6: Verifying connectivity${NC}"
echo ""

# Test gateway health
echo "Testing gateway health endpoint..."
if curl -s http://localhost:$NODE_PORT/health | grep -q "online"; then
  echo -e "${GREEN}✓ Gateway responding at port $NODE_PORT${NC}"
else
  echo -e "${YELLOW}⚠ Gateway may not be responding yet, starting up...${NC}"
  sleep 3
fi

# Test MQTT
echo "Testing MQTT connectivity..."
if mosquitto_pub -h localhost -t "test/wise2" -m "test" 2>/dev/null; then
  echo -e "${GREEN}✓ MQTT broker accessible${NC}"
else
  echo -e "${RED}✗ MQTT broker not responding${NC}"
  echo "Start MQTT with: sudo systemctl start mosquitto"
  exit 1
fi

# Test Pocket Node discovery
echo "Testing Pocket Node discovery..."
POCKET_IP="100.85.242.34"
if ping -c 1 -W 2 $POCKET_IP &>/dev/null; then
  echo -e "${GREEN}✓ Pocket Node reachable (Tailscale)${NC}"
else
  echo -e "${YELLOW}⚠ Pocket Node unreachable - check Tailscale connection${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Gateway deployment complete!${NC}"
echo "════════════════════════════════════════════════════════"
echo ""

echo "Gateway Information:"
echo "  Service: k10-cyd-gateway"
echo "  Location: $GATEWAY_DIR"
echo "  Port: $NODE_PORT"
echo "  MQTT: localhost:1883"
echo "  User: $GATEWAY_USER"
echo ""

echo "Useful commands:"
echo "  Status:   sudo systemctl status k10-cyd-gateway"
echo "  Logs:     sudo journalctl -u k10-cyd-gateway -f"
echo "  Restart:  sudo systemctl restart k10-cyd-gateway"
echo "  Stop:     sudo systemctl stop k10-cyd-gateway"
echo ""

echo "Test the gateway:"
echo "  curl http://localhost:$NODE_PORT/health"
echo "  curl http://localhost:$NODE_PORT/k10/health"
echo "  curl http://localhost:$NODE_PORT/cyd/health"
echo ""

echo "Documentation:"
echo "  View setup guide: less $GATEWAY_DIR/K10_CYD_WISEPI_INTEGRATION.md"
echo ""

echo -e "${GREEN}Next steps:${NC}"
echo "1. Connect K10 device to same WiFi as wisepi"
echo "2. K10 should auto-discover gateway (mDNS)"
echo "3. Connect CYD display to same WiFi"
echo "4. CYD will display HVAC data from Pocket Node"
echo "5. Voice commands on K10 sync to Pocket Node diagnostics"
echo ""
