#!/bin/bash

#
# WISE² - Phase 3: Network Setup (Tailscale + SSH)
#
# Configures secure private networking between Mac and VPS
# using Tailscale, avoiding public internet exposure.
#
# Run on both MacBook and VPS
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Phase 3: Network Setup (Tailscale)                  ║"
echo "║                                                              ║"
echo "║  Sets up secure private networking                          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS="mac"
  echo "✅ Detected macOS"
elif [[ "$OSTYPE" =~ ^linux ]]; then
  OS="linux"
  echo "✅ Detected Linux"
else
  echo "❌ Unsupported OS: $OSTYPE"
  exit 1
fi

# Install Tailscale
echo ""
echo "Installing Tailscale..."

if ! command -v tailscale &> /dev/null; then
  if [ "$OS" == "mac" ]; then
    brew install tailscale
  elif [ "$OS" == "linux" ]; then
    curl -fsSL https://tailscale.com/install.sh | sh
  fi
  echo "✅ Tailscale installed"
else
  echo "✅ Tailscale already installed"
fi

# Start Tailscale
echo ""
echo "Starting Tailscale..."

if [ "$OS" == "mac" ]; then
  # macOS
  open -a Tailscale
  echo "⚠️  Tailscale opened - authenticate in the system menu"
  echo "You will need an auth key from https://login.tailscale.com"
  read -p "Press Enter after authenticating... "
elif [ "$OS" == "linux" ]; then
  # Linux
  sudo systemctl enable tailscaled
  sudo systemctl start tailscaled
  echo "⚠️  Tailscale started as daemon"
  echo "Authenticate with: sudo tailscale up"
  sudo tailscale up
fi

# Show status
echo ""
echo "Tailscale Status:"
tailscale status

# Get Tailscale IP
echo ""
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "N/A")
echo "Your Tailscale IP: $TAILSCALE_IP"

# Configure SSH config
if [ "$OS" == "mac" ]; then
  echo ""
  echo "Configuring SSH..."

  mkdir -p ~/.ssh

  cat >> ~/.ssh/config << 'EOF'

# WISE² SSH Configuration
Host wise-vps
    HostName vps.internal
    User dwise
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking accept-new

Host wise-gpu
    HostName gpu.internal
    User dwise
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking accept-new

Host wise-pi-*
    HostName *.internal
    User pi
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking accept-new
EOF

  chmod 600 ~/.ssh/config
  echo "✅ SSH config updated"

  echo ""
  echo "Testing SSH to VPS..."
  if ssh -o ConnectTimeout=3 wise-vps 'echo SSH OK' 2>/dev/null; then
    echo "✅ SSH connection to VPS works"
  else
    echo "⚠️  SSH to VPS not yet working"
    echo "VPS might not be in Tailscale yet"
  fi
fi

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  ✅ Network Setup Complete!                                 ║"
echo "║                                                              ║"
echo "║  Tailscale is configured for secure networking              ║"
echo "║                                                              ║"
echo "║  Next Steps:                                                 ║"
if [ "$OS" == "mac" ]; then
  echo "║  1. Verify Tailscale: tailscale status                     ║"
  echo "║  2. Test SSH: ssh wise-vps 'hostname'                      ║"
  echo "║  3. Run Mac setup: bash deploy/01-mac-setup.sh             ║"
else
  echo "║  1. Verify Tailscale: sudo tailscale status                ║"
  echo "║  2. Wait for MacBook to connect                            ║"
  echo "║  3. Run VPS setup: bash deploy/02-vps-setup.sh             ║"
fi
echo "║                                                              ║"
echo "║  For complete deployment: bash deploy/04-full-deploy.sh     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
