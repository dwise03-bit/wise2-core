#!/bin/bash
#
# WISE² Website Deployment Script
# Deploys latest website code to production server
# Usage: ./deploy-website.sh
#

set -e

# Configuration
REMOTE_SERVER="173.208.147.165"
REMOTE_USER="dwise"
REMOTE_APP_DIR="/home/dwise/wise2-core/apps/website"
REMOTE_PORT="3000"
LOCAL_BUILD_DIR="apps/website/.next"

echo "=== WISE² Website Deployment ==="
echo "Remote: $REMOTE_SERVER"
echo "Port: $REMOTE_PORT"
echo ""

# Step 1: Kill old process on remote
echo "Step 1: Stopping old process on remote server..."
ssh -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_SERVER" "
  if lsof -i :$REMOTE_PORT >/dev/null 2>&1; then
    PID=\$(lsof -t -i :$REMOTE_PORT 2>/dev/null | head -1)
    if [ -n \"\$PID\" ]; then
      echo \"  Found process on port $REMOTE_PORT (PID: \$PID)\"
      kill -9 \$PID 2>/dev/null || true
      sleep 1
      echo \"  Process stopped\"
    fi
  else
    echo \"  No process running on port $REMOTE_PORT\"
  fi
" || echo "  Warning: Could not verify port status on remote"

# Step 2: Deploy .next build directory (fastest, pre-compiled)
echo ""
echo "Step 2: Deploying pre-built .next directory..."
rsync -avz --delete "$LOCAL_BUILD_DIR/" \
  "$REMOTE_USER@$REMOTE_SERVER:$REMOTE_APP_DIR/.next/" \
  --exclude '.DS_Store' \
  --exclude 'node_modules'

if [ $? -eq 0 ]; then
  echo "  .next directory deployed successfully"
else
  echo "  ERROR: Failed to deploy .next directory"
  exit 1
fi

# Step 3: Copy minimal source files (app/* and package.json for reference)
echo ""
echo "Step 3: Deploying source files..."
rsync -avz \
  --include="package.json" \
  --include="package-lock.json" \
  --include="next.config.js" \
  --include="tsconfig.json" \
  --include="app/***" \
  --exclude="*" \
  "$LOCAL_BUILD_DIR/../" \
  "$REMOTE_USER@$REMOTE_SERVER:$REMOTE_APP_DIR/" \
  2>/dev/null || true

echo "  Source files deployed"

# Step 4: Start new process on remote
echo ""
echo "Step 4: Starting website on remote server (port $REMOTE_PORT)..."
ssh "$REMOTE_USER@$REMOTE_SERVER" "
  cd $REMOTE_APP_DIR && \
  PORT=$REMOTE_PORT npx next start > /tmp/website.log 2>&1 &
  sleep 2

  # Verify it started
  if lsof -i :$REMOTE_PORT >/dev/null 2>&1; then
    echo '  Website started successfully on port $REMOTE_PORT'
    echo '  PID: '
    lsof -t -i :$REMOTE_PORT | head -1
  else
    echo '  ERROR: Website failed to start'
    echo '  Last 10 lines of log:'
    tail -10 /tmp/website.log
    exit 1
  fi
"

if [ $? -eq 0 ]; then
  echo ""
  echo "Step 5: Verifying deployment..."
  sleep 2

  # Test the endpoint via localhost tunnel
  RESPONSE=$(ssh -L 3000:127.0.0.1:3000 "$REMOTE_USER@$REMOTE_SERVER" "
    timeout 5 curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo '000'
  " 2>/dev/null || echo "000")

  if [ "$RESPONSE" = "200" ]; then
    echo "  Website responding with HTTP 200 - Deployment SUCCESSFUL"
    echo ""
    echo "=== Deployment Complete ==="
    echo "Website live at: http://173.208.147.165:$REMOTE_PORT"
    echo ""
    echo "View logs on server with:"
    echo "  ssh $REMOTE_USER@$REMOTE_SERVER tail -f /tmp/website.log"
    exit 0
  else
    echo "  WARNING: Server responded with HTTP $RESPONSE"
    echo "  Check logs: ssh $REMOTE_USER@$REMOTE_SERVER tail -50 /tmp/website.log"
    exit 1
  fi
else
  echo ""
  echo "ERROR: Failed to start website on remote server"
  echo "Check logs: ssh $REMOTE_USER@$REMOTE_SERVER tail -50 /tmp/website.log"
  exit 1
fi
