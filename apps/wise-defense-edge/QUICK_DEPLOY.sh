#!/bin/bash
################################################################################
# WISE DEFENSE — QUICK DEPLOYMENT HELPER
#
# Usage (on your Mac):
#   bash QUICK_DEPLOY.sh <pi-ip> <pi-username>
#
# Example:
#   bash QUICK_DEPLOY.sh 192.168.1.100 pi
#
# This script:
#   1. Transfers all files to Pi
#   2. Runs installer automatically
#   3. Verifies installation
################################################################################

PI_IP="${1:-192.168.1.100}"
PI_USER="${2:-pi}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  WISE DEFENSE QUICK DEPLOYMENT                         ║"
echo "║  Target: pi@$PI_IP                                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify connectivity
echo "[1/4] Testing SSH connectivity..."
if ! ssh -o ConnectTimeout=5 "${PI_USER}@${PI_IP}" "echo OK" &>/dev/null; then
    echo "❌ Cannot connect to pi@$PI_IP"
    echo "   Check IP address and ensure SSH is enabled on Pi"
    exit 1
fi
echo "✅ SSH connection OK"

# Step 2: Transfer files
echo ""
echo "[2/4] Transferring files to Pi..."
ssh "${PI_USER}@${PI_IP}" "mkdir -p ~/wise-defense" || exit 1

# Copy app directory
scp -r "$SCRIPT_DIR/app" "${PI_USER}@${PI_IP}:~/wise-defense/" || exit 1
scp -r "$SCRIPT_DIR/config" "${PI_USER}@${PI_IP}:~/wise-defense/" || exit 1
scp -r "$SCRIPT_DIR/systemd" "${PI_USER}@${PI_IP}:~/wise-defense/" || exit 1

# Copy installer and docs
scp "$SCRIPT_DIR/scripts/install-wise2-defense.sh" "${PI_USER}@${PI_IP}:~/wise-defense/" || exit 1
scp "$SCRIPT_DIR/README.md" "${PI_USER}@${PI_IP}:~/wise-defense/" || exit 1

echo "✅ Files transferred"

# Step 3: Run installer
echo ""
echo "[3/4] Running installer on Pi (this may take 3-5 minutes)..."
ssh "${PI_USER}@${PI_IP}" << 'INSTALL_SCRIPT'
cd ~/wise-defense
chmod +x install-wise2-defense.sh
sudo bash install-wise2-defense.sh
INSTALL_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Installer failed"
    exit 1
fi

# Step 4: Verify
echo ""
echo "[4/4] Verifying installation..."
sleep 2

API_RESPONSE=$(ssh "${PI_USER}@${PI_IP}" "curl -s http://localhost:3014/health" 2>/dev/null)

if echo "$API_RESPONSE" | grep -q "OPERATIONAL"; then
    echo "✅ API is responding"
    echo "✅ Installation successful!"
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  DEPLOYMENT COMPLETE                                   ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "  1. SSH into Pi:"
    echo "     ssh ${PI_USER}@${PI_IP}"
    echo ""
    echo "  2. View logs:"
    echo "     journalctl -u wise2-defense -n 20"
    echo ""
    echo "  3. Test API:"
    echo "     curl http://localhost:3014/health"
    echo ""
    echo "  4. Access dashboard:"
    echo "     http://${PI_IP}:3014/api/dashboard"
    echo ""
else
    echo "⚠️  API not responding yet. Check logs on Pi:"
    echo "    ssh ${PI_USER}@${PI_IP}"
    echo "    journalctl -u wise2-defense -f"
    exit 1
fi
