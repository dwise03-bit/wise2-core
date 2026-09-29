#!/bin/bash

# WiseOS Deployment Script

PI_USER="${1:-dwise}"
PI_HOST="${2:-192.168.8.136}"
PI_PASS="${3:-Glock19!}"

PI_REMOTE="$PI_USER@$PI_HOST"
WISEOS_LOCAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deploying WiseOS to Raspberry Pi"
echo "📱 Target: $PI_REMOTE"
echo "📂 Source: $WISEOS_LOCAL"
echo ""

# Use SSH with key if available, otherwise prompt for password
if [[ -z "$PI_PASS" ]]; then
    echo "Connecting via SSH key..."
    SSH_CMD="ssh $PI_REMOTE"
    SCP_CMD="scp -r"
else
    echo "Connecting with password..."
    which sshpass &> /dev/null || {
        echo "❌ sshpass not found. Install with: brew install sshpass"
        exit 1
    }
    SSH_CMD="sshpass -p '$PI_PASS' ssh $PI_REMOTE"
    SCP_CMD="sshpass -p '$PI_PASS' scp -r"
fi

# Copy WiseOS to Pi
echo "📤 Copying WiseOS files..."
$SCP_CMD "$WISEOS_LOCAL" "$PI_REMOTE:/home/$PI_USER/" 2>/dev/null || {
    echo "❌ Failed to copy files. Check connectivity and credentials."
    exit 1
}

# Run installation script
echo "⚙️  Running installation..."
$SSH_CMD "cd /home/$PI_USER/wise-os && chmod +x install/install.sh && bash install/install.sh"

echo ""
echo "✅ WiseOS Deployed!"
echo "🌐 Access at: http://$PI_HOST:3000"
