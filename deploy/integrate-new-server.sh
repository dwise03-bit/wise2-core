#!/bin/bash

#
# WISE² New Server Integration Script
#
# This script integrates a new server into the WISE² Hermes network
# on Tailscale
#
# Prerequisites:
# - Server is on Tailscale network (can ping vps.internal and mac.internal)
# - wise2-core repository cloned to ~/wise2-core
# - Basic tools installed (docker, node, git)
#
# Usage:
#   bash deploy/integrate-new-server.sh [server-name]
#
# Example:
#   bash deploy/integrate-new-server.sh gpu-node-1
#

set -e

# Configuration
SERVER_NAME="${1:-new-server}"
WISE2_REPO="${HOME}/wise2-core"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Server Integration                                  ║"
echo "║                                                              ║"
echo "║  Integrating: $SERVER_NAME"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Install with: sudo apt-get install docker.io"
  exit 1
fi
echo "✅ Docker: $(docker --version)"

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install with: sudo apt-get install nodejs npm"
  exit 1
fi
echo "✅ Node.js: $(node --version)"

if ! command -v git &> /dev/null; then
  echo "❌ Git not found. Install with: sudo apt-get install git"
  exit 1
fi
echo "✅ Git: $(git --version)"

if [ ! -d "$WISE2_REPO" ]; then
  echo "❌ wise2-core not found at $WISE2_REPO"
  echo "Clone it first: git clone https://github.com/dwise03-bit/wise2-core.git ~/wise2-core"
  exit 1
fi
echo "✅ wise2-core found at $WISE2_REPO"
echo ""

# Network connectivity check
echo "Checking Tailscale connectivity..."
echo ""

if ! command -v tailscale &> /dev/null; then
  echo "⚠️  Tailscale not installed"
  echo "Installing Tailscale..."
  curl -fsSL https://tailscale.com/install.sh | sh
fi

if ! tailscale status &>/dev/null; then
  echo "⚠️  Tailscale not running"
  echo "Start with: sudo tailscale up"
  read -p "Press Enter after Tailscale is running... "
fi

TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "unknown")
echo "Tailscale IP: $TAILSCALE_IP"
echo ""

# Check connectivity to main nodes
echo "Testing connectivity..."

if ping -c 1 -W 2 vps.internal &>/dev/null; then
  echo "✅ Can reach vps.internal"
else
  echo "⚠️  Cannot reach vps.internal"
fi

if ping -c 1 -W 2 mac.internal &>/dev/null; then
  echo "✅ Can reach mac.internal"
else
  echo "⚠️  Cannot reach mac.internal (this is OK if Mac is offline)"
fi
echo ""

# Hermes installation
echo "════════════════════════════════════════════════════════════════"
echo "Installing/Verifying Hermes"
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v hermes &> /dev/null; then
  echo "Installing Hermes..."
  curl -fsSL https://hermes.io/install.sh | bash
  echo "✅ Hermes installed: $(hermes --version)"
else
  echo "✅ Hermes already installed: $(hermes --version)"
fi
echo ""

# Docker configuration
echo "════════════════════════════════════════════════════════════════"
echo "Docker Configuration"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Ensuring user is in docker group..."
if ! groups | grep -q docker; then
  sudo usermod -aG docker $USER
  echo "⚠️  Added user to docker group. You may need to log out and back in."
fi
echo "✅ Docker configured"
echo ""

# Service user
echo "════════════════════════════════════════════════════════════════"
echo "Service User Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

SERVICE_USER="wise2-service"

if ! id -u "$SERVICE_USER" &>/dev/null 2>&1; then
  echo "Creating service user: $SERVICE_USER"
  sudo useradd -m -s /bin/bash "$SERVICE_USER"
  sudo usermod -aG docker "$SERVICE_USER"
  echo "✅ Service user created"
else
  echo "✅ Service user already exists"
fi
echo ""

# Configuration directory
echo "════════════════════════════════════════════════════════════════"
echo "Configuration"
echo "════════════════════════════════════════════════════════════════"
echo ""

CONFIG_DIR="/etc/wise2"
sudo mkdir -p "$CONFIG_DIR"
sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$CONFIG_DIR"

echo "Creating server configuration..."

sudo tee "$CONFIG_DIR/server.env" > /dev/null << EOF
# WISE² Server Configuration
SERVER_NAME=$SERVER_NAME
WISE2_REPO=$WISE2_REPO
NODE_ENV=production
LOG_LEVEL=info
TAILSCALE_IP=$TAILSCALE_IP

# Network
API_HOST=0.0.0.0
API_PORT=3000
HERMES_PORT=9000

# Database (configure per server)
DATABASE_URL=postgresql://wise2:password@postgres.internal:5432/wise2
REDIS_URL=redis://redis.internal:6379

# Services
ENABLE_HERMES=true
ENABLE_API=true
ENABLE_DOCKER=true

# Logging
LOG_DIR=/var/log/wise2
DATA_DIR=/var/lib/wise2
EOF

echo "✅ Configuration created at $CONFIG_DIR/server.env"
echo ""

# Systemd service
echo "════════════════════════════════════════════════════════════════"
echo "Systemd Service Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Creating systemd service..."

sudo tee /etc/systemd/system/wise2-server.service > /dev/null << EOF
[Unit]
Description=WISE² Server ($SERVER_NAME)
After=network.target docker.service
Wants=docker.service
StartLimitIntervalSec=0
StartLimitBurst=0

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$WISE2_REPO
EnvironmentFile=$CONFIG_DIR/server.env

ExecStart=/usr/bin/bash -c 'cd $WISE2_REPO && docker-compose -f docker-compose.prod.yml up -d'
ExecStop=/usr/bin/bash -c 'cd $WISE2_REPO && docker-compose -f docker-compose.prod.yml down'

Restart=on-failure
RestartSec=10
TimeoutStartSec=120
TimeoutStopSec=60

StandardOutput=journal
StandardError=journal
SyslogIdentifier=wise2-server

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
echo "✅ Systemd service created"
echo ""

# Networking
echo "════════════════════════════════════════════════════════════════"
echo "Network Configuration"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Current Tailscale network:"
tailscale status --json 2>/dev/null | grep -o '"HostName":"[^"]*"' | head -5 || echo "Could not query network"
echo ""

echo "⚠️  Manual step required:"
echo "1. Go to https://login.tailscale.com/admin/machines"
echo "2. Find this server: $SERVER_NAME"
echo "3. Tag it appropriately (e.g., tag:ops-host, tag:gpu-node)"
echo ""

# Docker registry
echo "════════════════════════════════════════════════════════════════"
echo "Docker Configuration"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ -f "$HOME/.docker/config.json" ]; then
  echo "✅ Docker config exists"
else
  echo "⚠️  Creating Docker config"
  mkdir -p "$HOME/.docker"
  echo '{}' > "$HOME/.docker/config.json"
fi
echo ""

# Service startup
echo "════════════════════════════════════════════════════════════════"
echo "Starting Services"
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "Start WISE² server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  sudo systemctl enable wise2-server
  sudo systemctl start wise2-server
  sleep 3

  if sudo systemctl is-active --quiet wise2-server; then
    echo "✅ WISE² server started"
  else
    echo "⚠️  Failed to start WISE² server"
    echo "Check logs: sudo journalctl -u wise2-server -f"
  fi
else
  echo "⏭️  Skipped starting service"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "INTEGRATION COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Server: $SERVER_NAME"
echo "Tailscale IP: $TAILSCALE_IP"
echo "Config: $CONFIG_DIR/server.env"
echo "Service: wise2-server"
echo "Status: $(sudo systemctl is-active wise2-server 2>/dev/null || echo 'not running')"
echo ""

echo "Next Steps:"
echo "1. Configure database connections in $CONFIG_DIR/server.env"
echo "2. Tag this server in Tailscale admin console"
echo "3. Monitor logs: sudo journalctl -u wise2-server -f"
echo "4. Verify: curl http://localhost:3000/health"
echo ""

echo "✅ Server integration complete!"
echo ""
