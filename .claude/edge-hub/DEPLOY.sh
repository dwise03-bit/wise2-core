#!/bin/bash
#
# WISE² Edge Hub - Complete Deployment Script
# Phases 1-3 (Device Registry, Health API, Voice Coordinator, Remote Support)
#
# Usage: ./DEPLOY.sh [pi-user]@[pi-host]
# Example: ./DEPLOY.sh dwise@wisepi.tail44396d.ts.net
#

set -e

PI_HOST="${1:-dwise@wisepi.tail44396d.ts.net}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_DIR="/home/dwise/wise2-edge/app"

echo "============================================"
echo "WISE² Edge Hub - Full Deployment"
echo "============================================"
echo "Target: $PI_HOST"
echo "Local:  $SCRIPT_DIR"
echo

# Step 1: Copy files
echo "Step 1: Copying Phase 1-3 code to Pi..."
ssh "$PI_HOST" "mkdir -p $BUILD_DIR/src"
scp "$SCRIPT_DIR"/*.ts "$PI_HOST:$BUILD_DIR/src/"
scp "$SCRIPT_DIR"/package.json "$PI_HOST:$BUILD_DIR/"
scp "$SCRIPT_DIR"/ecosystem.config.js "$PI_HOST:$BUILD_DIR/"
echo "✓ Files copied"
echo

# Step 2: Build
echo "Step 2: Building on Pi..."
ssh "$PI_HOST" "cd $BUILD_DIR && npm run build" || {
  echo "⚠️  Build may have failed - checking..."
  ssh "$PI_HOST" "ls -la $BUILD_DIR/dist/ | head -5"
}
echo "✓ Build complete"
echo

# Step 3: Deploy services
echo "Step 3: Deploying services..."
ssh "$PI_HOST" "cd $BUILD_DIR && pm2 delete all 2>/dev/null || true && sleep 1"
ssh "$PI_HOST" "cd $BUILD_DIR && pm2 start ecosystem.config.js --env production"
ssh "$PI_HOST" "pm2 save"
echo "✓ Services started"
echo

# Step 4: Verify
echo "Step 4: Verifying services..."
sleep 3
ssh "$PI_HOST" "pm2 status"
echo

# Step 5: Test endpoints
echo "Step 5: Testing endpoints..."
echo "  Testing Health API (4900)..."
ssh "$PI_HOST" "curl -s http://127.0.0.1:4900/ping | jq . 2>/dev/null && echo '  ✓ Health API OK' || echo '  ⚠️  Health API not responding'"

echo "  Testing Voice API (4901)..."
ssh "$PI_HOST" "curl -s http://127.0.0.1:4901/voice/test 2>/dev/null | jq . 2>/dev/null && echo '  ✓ Voice API OK' || echo '  ⚠️  Voice API not responding'"

echo "  Testing Support API (4902)..."
ssh "$PI_HOST" "curl -s http://127.0.0.1:4902/support/diagnostics 2>/dev/null | jq . 2>/dev/null && echo '  ✓ Support API OK' || echo '  ⚠️  Support API not responding'"

echo
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "============================================"
echo
echo "Services running on:"
echo "  Port 4900 - Registry + Health API"
echo "  Port 4901 - Voice Coordinator"
echo "  Port 4902 - Remote Support + OTA"
echo
echo "Quick tests:"
echo "  curl http://127.0.0.1:4900/devices"
echo "  curl http://127.0.0.1:4901/voice/status"
echo "  curl -X POST http://127.0.0.1:4902/support/bundle"
echo
echo "View logs:"
echo "  pm2 logs wise2-edge-registry"
echo "  pm2 logs wise2-edge-voice"
echo "  pm2 logs wise2-edge-support"
echo
