#!/bin/bash
#
# WISE² Edge Hub - Local Deployment Script
# Run this DIRECTLY on the Pi (via monitor/keyboard or physical SSH)
# Usage: bash DEPLOY_LOCAL.sh
#

set -e

BUILD_DIR="/home/dwise/wise2-edge/app"

echo "============================================"
echo "WISE² Edge Hub - Local Deployment"
echo "============================================"
echo "Build Dir: $BUILD_DIR"
echo

# Ensure we're in the right place
if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: $BUILD_DIR does not exist"
  echo "Run: mkdir -p $BUILD_DIR"
  exit 1
fi

# Step 1: Check code is copied
echo "Step 1: Checking if code is present..."
if [ ! -f "$BUILD_DIR/src/device-registry.ts" ]; then
  echo "⚠️  Code files not found in $BUILD_DIR/src/"
  echo "Copy code first: scp .claude/edge-hub/*.ts $BUILD_DIR/src/"
  exit 1
fi
echo "✓ Code files present"
echo

# Step 2: Build
echo "Step 2: Building..."
cd "$BUILD_DIR"
npm run build || {
  echo "⚠️  Build failed"
  npm install
  npm run build
}
echo "✓ Build complete"
echo

# Step 3: Deploy services
echo "Step 3: Stopping old services..."
pm2 delete all 2>/dev/null || true
sleep 1
echo "✓ Services stopped"
echo

echo "Step 4: Starting new services..."
pm2 start ecosystem.config.js --env production
pm2 save
echo "✓ Services started"
echo

# Step 5: Verify
echo "Step 5: Verifying services..."
sleep 2
pm2 status
echo

# Step 6: Test endpoints (localhost only)
echo "Step 6: Testing endpoints..."
sleep 2

echo "  Testing Health API (4900)..."
curl -s http://127.0.0.1:4900/ping | jq . 2>/dev/null && echo "  ✓ Health API OK" || echo "  ⚠️  Health API not responding (yet)"

echo "  Testing Voice API (4901)..."
curl -s http://127.0.0.1:4901/voice/test 2>/dev/null | jq . 2>/dev/null && echo "  ✓ Voice API OK" || echo "  ⚠️  Voice API not responding (yet)"

echo "  Testing Support API (4902)..."
curl -s http://127.0.0.1:4902/support/diagnostics 2>/dev/null | jq . 2>/dev/null && echo "  ✓ Support API OK" || echo "  ⚠️  Support API not responding (yet)"

echo
echo "============================================"
echo "✅ LOCAL DEPLOYMENT COMPLETE"
echo "============================================"
echo
echo "Services running on:"
echo "  Port 4900 - Registry + Health API"
echo "  Port 4901 - Voice Coordinator"
echo "  Port 4902 - Remote Support + OTA"
echo
echo "Next steps:"
echo "  pm2 logs          # View logs"
echo "  pm2 status        # Check services"
echo "  curl http://127.0.0.1:4900/health | jq ."
echo
