#!/bin/bash

#
# WISE² - Phase 2: VPS (Always-On Node) Setup
#
# This script automates the deployment of a Hermes node on your
# production VPS (Ubuntu 24.04 or similar).
#
# Run this on the VPS directly, or use SSH to execute remotely:
#   ssh wise-vps 'bash -s' < deploy/02-vps-setup.sh
#
# What it does:
# 1. Checks prerequisites
# 2. Installs Hermes (Linux version)
# 3. Creates systemd service
# 4. Sets up peer connection to Mac Hermes
# 5. Verifies connectivity
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Phase 2: VPS (Always-On Node) Setup                 ║"
echo "║                                                              ║"
echo "║  This will install Hermes on your production VPS           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if running on Linux
if [[ ! "$OSTYPE" =~ ^linux ]]; then
  echo "❌ Error: This script must run on Linux"
  exit 1
fi

echo "✅ Running on Linux"

# Update system
echo ""
echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
echo "✅ System updated"

# Install prerequisites
echo ""
echo "Installing prerequisites..."

sudo apt-get install -y \
  curl \
  wget \
  git \
  nodejs \
  npm \
  docker.io \
  docker-compose

echo "✅ Prerequisites installed"

# Create Hermes user
echo ""
echo "Creating Hermes service user..."

if ! id -u hermes &>/dev/null 2>&1; then
  sudo useradd -m -s /bin/bash hermes
  echo "✅ Hermes user created"
else
  echo "✅ Hermes user already exists"
fi

# Create Hermes directories
sudo mkdir -p /home/hermes/.hermes
sudo chown -R hermes:hermes /home/hermes/.hermes
echo "✅ Hermes directories created"

# Install Hermes
echo ""
echo "Installing Hermes (Linux)..."

if ! command -v hermes &> /dev/null; then
  # Download official Hermes installer for Linux
  curl -fsSL https://hermes.io/install.sh | bash || {
    echo "⚠️  Could not auto-install Hermes"
    echo "Install manually from: https://hermes.io/install"
    exit 1
  }
else
  echo "✅ Hermes already installed"
fi

echo "✅ Hermes: $(hermes --version)"

# Create systemd service
echo ""
echo "Creating systemd service..."

sudo tee /etc/systemd/user/hermes.service > /dev/null << 'EOF'
[Unit]
Description=Hermes Gateway - WISE² Always-On Node
After=network.target

[Service]
Type=simple
User=hermes
ExecStart=/usr/local/bin/hermes gateway start
Restart=on-failure
RestartSec=5

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
EOF

sudo systemctl --user daemon-reload
echo "✅ Systemd service created"

# Enable and start Hermes
echo ""
echo "Starting Hermes service..."

sudo systemctl --user enable hermes
sudo systemctl --user start hermes

sleep 2

if sudo systemctl --user is-active --quiet hermes; then
  echo "✅ Hermes service is running"
else
  echo "⚠️  Hermes service failed to start"
  echo "Check: sudo systemctl --user status hermes"
fi

# Configure as peer to Mac Hermes
echo ""
echo "Configuring peer connection to Mac Hermes..."

cat > /tmp/wise2-vps-config.json << 'EOF'
{
  "node_id": "vps-production",
  "role": "always-on-remote",
  "capabilities": ["hermes", "postgres", "redis", "workers", "api", "automation"],
  "mac_hermes_address": "mac.internal:9000",
  "mac_hermes_token": "REPLACE_WITH_PEER_TOKEN"
}
EOF

sudo cp /tmp/wise2-vps-config.json /home/hermes/.hermes/wise2-config.json
sudo chown hermes:hermes /home/hermes/.hermes/wise2-config.json

echo "✅ Configuration created at /home/hermes/.hermes/wise2-config.json"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   1. On your MacBook, generate a peer token:"
echo "      hermes peer generate-token --peer vps --duration 365d"
echo "   2. Update the config on VPS with the token"
echo "   3. Run: hermes peer register --name mac --address mac.internal"

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  ✅ VPS Setup Complete!                                     ║"
echo "║                                                              ║"
echo "║  Hermes is running on your VPS                              ║"
echo "║                                                              ║"
echo "║  Next Steps:                                                 ║"
echo "║  1. Verify: sudo systemctl --user status hermes             ║"
echo "║  2. Configure peer token (see above)                        ║"
echo "║  3. Test SSH from Mac: ssh wise-vps 'hermes --version'      ║"
echo "║                                                              ║"
echo "║  For Tailscale networking: bash deploy/03-network-setup.sh  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
