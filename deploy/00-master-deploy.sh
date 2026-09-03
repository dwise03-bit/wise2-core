#!/bin/bash

#
# WISE² Hermes + iMessage - Master Deployment Script
#
# This orchestrates the complete deployment across Mac and VPS
# Run on your MacBook Pro M4 after cloning wise2-core
#
# Usage: bash deploy/00-master-deploy.sh
#

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  WISE² Hermes + iMessage - Master Deployment                ║"
echo "║                                                              ║"
echo "║  This will deploy the entire system:                        ║"
echo "║  1. Mac setup (Hermes + Photon + LaunchAgent)               ║"
echo "║  2. VPS setup (Hermes + systemd service)                    ║"
echo "║  3. Network setup (Tailscale + SSH)                         ║"
echo "║  4. End-to-end testing                                      ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verify we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ Error: This script must run on macOS"
  exit 1
fi

echo "✅ Running on macOS"
echo ""

# Step 1: Mac Setup
echo "════════════════════════════════════════════════════════════════"
echo "STEP 1: MacBook Pro Setup"
echo "════════════════════════════════════════════════════════════════"
read -p "Ready to set up MacBook Pro? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash deploy/01-mac-setup.sh
  MAC_STATUS="✅ Complete"
else
  MAC_STATUS="⏭️  Skipped"
fi
echo ""

# Step 2: VPS Setup (Remote)
echo "════════════════════════════════════════════════════════════════"
echo "STEP 2: VPS Setup (Remote via SSH)"
echo "════════════════════════════════════════════════════════════════"
read -p "Ready to set up VPS (173.208.147.165)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Connecting to VPS as dwise@173.208.147.165..."
  if ssh dwise@173.208.147.165 'test -d wise2-core' 2>/dev/null; then
    echo "✅ wise2-core found on VPS"
    ssh dwise@173.208.147.165 'cd wise2-core && bash deploy/02-vps-setup.sh'
    VPS_STATUS="✅ Complete"
  else
    echo "⚠️  wise2-core not found on VPS"
    echo "First, copy the repo to VPS:"
    echo "  scp -r . dwise@173.208.147.165:~/wise2-core"
    echo "Then run: ssh dwise@173.208.147.165 'cd wise2-core && bash deploy/02-vps-setup.sh'"
    VPS_STATUS="⏳ Manual"
  fi
else
  VPS_STATUS="⏭️  Skipped"
fi
echo ""

# Step 3: Network Setup
echo "════════════════════════════════════════════════════════════════"
echo "STEP 3: Network Setup (Tailscale + SSH)"
echo "════════════════════════════════════════════════════════════════"
read -p "Ready to configure networking? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash deploy/03-network-setup.sh
  NETWORK_STATUS="✅ Complete"
else
  NETWORK_STATUS="⏭️  Skipped"
fi
echo ""

# Step 4: Test
echo "════════════════════════════════════════════════════════════════"
echo "STEP 4: End-to-End Testing"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Testing local services..."
if curl -s http://localhost:9002/health > /dev/null 2>&1; then
  echo "✅ WISE² IMP service responding"
else
  echo "⚠️  WISE² IMP not responding on localhost:9002"
fi

echo ""
echo "Testing CLI..."
if command -v wise2 &> /dev/null; then
  echo "✅ WISE² CLI installed"
  wise2 status 2>/dev/null || echo "   (Status check may require services to be running)"
else
  echo "⚠️  WISE² CLI not in PATH"
fi

echo ""

# Step 5: Summary
echo "════════════════════════════════════════════════════════════════"
echo "DEPLOYMENT SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  Mac Setup:       $MAC_STATUS"
echo "  VPS Setup:       $VPS_STATUS"
echo "  Network Setup:   $NETWORK_STATUS"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║  Next Steps                                                  ║"
echo "║                                                              ║"
if [[ "$MAC_STATUS" == "✅ Complete" ]] && [[ "$VPS_STATUS" == "✅ Complete" ]]; then
  echo "║  1. Exchange peer tokens (see below)                        ║"
  echo "║  2. Test from Mac: wise2 status                             ║"
  echo "║  3. Test from iPhone: Send 'Wise, status'                   ║"
else
  echo "║  1. Complete any skipped steps                              ║"
  echo "║  2. Exchange peer tokens                                    ║"
  echo "║  3. Test iMessage integration                               ║"
fi
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Peer Token Exchange Instructions
if [[ "$MAC_STATUS" == "✅ Complete" ]] && [[ "$VPS_STATUS" == "✅ Complete" ]]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "PEER TOKEN EXCHANGE"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "On this Mac, generate token for VPS peer:"
  echo "  hermes peer generate-token --peer vps --duration 365d"
  echo ""
  echo "Copy the token, then on VPS:"
  echo "  ssh dwise@173.208.147.165"
  echo "  sudo nano /home/hermes/.hermes/wise2-config.json"
  echo "  # Update 'mac_hermes_token' with the token"
  echo ""
  echo "Then restart Hermes on VPS:"
  echo "  ssh dwise@173.208.147.165 'sudo systemctl --user restart hermes'"
  echo ""
fi

echo "✅ Deployment complete!"
