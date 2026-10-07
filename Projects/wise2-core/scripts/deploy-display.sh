#!/bin/bash
# Deploy WISE² display to TV Hub (wise2-surface)

set -e

DISPLAY_HOST="100.97.230.73"
DISPLAY_USER="dwise"
DISPLAY_DIR="/home/wise2/wise2-core"

echo "🎬 Deploying WISE² Display to TV Hub..."

# Get latest from GitHub
echo "Pulling latest from GitHub..."
git pull origin main

# Build display assets
echo "Building display assets..."
if [ -f "apps/dashboard/package.json" ]; then
    cd apps/dashboard
    npm ci
    npm run build:display
    cd - > /dev/null
fi

# Deploy to TV Hub
echo "Deploying to wise2-surface (TV Hub)..."
ssh -i ~/.ssh/id_rsa "${DISPLAY_USER}@${DISPLAY_HOST}" << 'DEPLOY_EOF'
cd /home/wise2/wise2-core
git pull origin main
npm ci
npm run build
systemctl restart wise2-display || sudo systemctl restart wise2-display
echo "✓ Display service restarted"

# Verify deployment
echo "Verifying display is running..."
systemctl status wise2-display --no-pager | head -5
DEPLOY_EOF

# Test display accessibility
echo "Testing display accessibility..."
DISPLAY_IP="100.97.230.73"
DISPLAY_PORT="3000"

if timeout 5 bash -c "echo >/dev/tcp/${DISPLAY_IP}/${DISPLAY_PORT}" 2>/dev/null; then
    echo "✅ Display is accessible at http://${DISPLAY_IP}:${DISPLAY_PORT}"
else
    echo "⚠️ Display may not be responding. Check status on the TV Hub."
fi

echo ""
echo "✅ Display deployment complete!"
echo "TV Hub IP: ${DISPLAY_IP}"
echo "Check the Surface TV for the display"
