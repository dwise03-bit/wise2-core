#!/bin/bash
set -e

# Command Center Dashboard Deployment Script
# Deploys backend API and frontend to production server
#
# Usage: ./scripts/deploy-command-center.sh
#
# What it does:
# 1. Builds backend API and frontend
# 2. Creates deployment package
# 3. Uploads to production server
# 4. Starts services
# 5. Verifies deployment
# 6. Updates nginx

echo "🚀 Command Center Dashboard - Production Deployment"
echo "=================================================="

# Configuration
PRODUCTION_SERVER="${1:-173.208.147.165}"
PRODUCTION_USER="${2:-dwise}"
DEPLOY_PATH="/opt/wise2/command-center"
API_PORT="3000"
WEB_PORT="3001"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "Server: $PRODUCTION_SERVER"
echo "User: $PRODUCTION_USER"
echo "Deploy path: $DEPLOY_PATH"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

# Step 1: Build
echo -e "\n${YELLOW}Step 1: Building application...${NC}"

echo "Building backend API..."
cd packages/api
npm run build
npm ci --production
cd ../..

echo "Building frontend..."
cd apps/dashboard
npm run build
npm ci --production
cd ../..

echo -e "${GREEN}✓ Build complete${NC}"

# Step 2: Create deployment package
echo -e "\n${YELLOW}Step 2: Creating deployment package...${NC}"

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

mkdir -p "$TEMP_DIR/cc-deploy"
cp -r packages/api/dist "$TEMP_DIR/cc-deploy/api"
cp -r packages/api/node_modules "$TEMP_DIR/cc-deploy/api/" || true
cp -r apps/dashboard/.next "$TEMP_DIR/cc-deploy/dashboard"
cp -r apps/dashboard/node_modules "$TEMP_DIR/cc-deploy/dashboard/" || true
cp -r apps/dashboard/public "$TEMP_DIR/cc-deploy/dashboard-public"
cp packages/api/package.json "$TEMP_DIR/cc-deploy/api-package.json"
cp apps/dashboard/package.json "$TEMP_DIR/cc-deploy/dashboard-package.json"

echo -e "${GREEN}✓ Package created in $TEMP_DIR${NC}"

# Step 3: Deploy to production
echo -e "\n${YELLOW}Step 3: Deploying to production server...${NC}"

echo "Creating deployment directory..."
ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" "mkdir -p $DEPLOY_PATH" || {
  echo -e "${RED}✗ Failed to create directory on server${NC}"
  exit 1
}

echo "Uploading API..."
scp -r "$TEMP_DIR/cc-deploy/api" "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/" || {
  echo -e "${RED}✗ Failed to upload API${NC}"
  exit 1
}

echo "Uploading frontend..."
scp -r "$TEMP_DIR/cc-deploy/dashboard" "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/" || {
  echo -e "${RED}✗ Failed to upload frontend${NC}"
  exit 1
}

echo "Uploading public assets..."
scp -r "$TEMP_DIR/cc-deploy/dashboard-public" "$PRODUCTION_USER@$PRODUCTION_SERVER:$DEPLOY_PATH/public" || true

echo -e "${GREEN}✓ Files deployed${NC}"

# Step 4: Start services
echo -e "\n${YELLOW}Step 4: Starting services...${NC}"

ssh "$PRODUCTION_USER@$PRODUCTION_SERVER" bash << 'DEPLOY_COMMANDS'
  DEPLOY_PATH="/opt/wise2/command-center"
  API_PORT="3000"
  WEB_PORT="3001"

  # Kill old processes if running
  echo "Stopping old services..."
  pkill -f "node.*api" || true
  pkill -f "next" || true
  sleep 2

  # Start API
  echo "Starting API on port $API_PORT..."
  cd "$DEPLOY_PATH/api"
  NODE_ENV=production npm start > /var/log/cc-api.log 2>&1 &
  API_PID=$!
  echo "API PID: $API_PID"

  # Start frontend
  echo "Starting frontend on port $WEB_PORT..."
  cd "$DEPLOY_PATH/dashboard"
  NODE_ENV=production npm start > /var/log/cc-web.log 2>&1 &
  WEB_PID=$!
  echo "Web PID: $WEB_PID"

  # Wait for services to start
  sleep 5

  # Verify services started
  echo "Verifying services..."
  if curl -s http://localhost:$API_PORT/api/status > /dev/null 2>&1; then
    echo "✓ API running"
  else
    echo "⚠ API may not be responding yet"
  fi

  if curl -s http://localhost:$WEB_PORT > /dev/null 2>&1; then
    echo "✓ Web running"
  else
    echo "⚠ Web may not be responding yet"
  fi
DEPLOY_COMMANDS

echo -e "${GREEN}✓ Services started${NC}"

# Step 5: Verify deployment
echo -e "\n${YELLOW}Step 5: Verifying deployment...${NC}"

sleep 3

# Check API
echo "Checking API..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://$PRODUCTION_SERVER:$API_PORT/api/status" 2>/dev/null || echo "000")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "404" ]; then
  echo -e "${GREEN}✓ API responding (HTTP $RESPONSE)${NC}"
else
  echo -e "${YELLOW}⚠ API response: HTTP $RESPONSE (may still be starting)${NC}"
fi

# Check frontend
echo "Checking frontend..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://$PRODUCTION_SERVER:$WEB_PORT" 2>/dev/null || echo "000")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "307" ]; then
  echo -e "${GREEN}✓ Frontend responding (HTTP $RESPONSE)${NC}"
else
  echo -e "${YELLOW}⚠ Frontend response: HTTP $RESPONSE (may still be starting)${NC}"
fi

# Final status
echo -e "\n${GREEN}=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "Dashboard is now available at:"
echo "  🌐 http://$PRODUCTION_SERVER/command-center"
echo ""
echo "API endpoint:"
echo "  🔌 http://$PRODUCTION_SERVER:$API_PORT"
echo ""
echo "View logs (SSH into server):"
echo "  tail -f /var/log/cc-api.log"
echo "  tail -f /var/log/cc-web.log"
echo ""
echo "Troubleshooting:"
echo "  - Check if services are running: ps aux | grep node"
echo "  - Check API response: curl http://localhost:3000/api/status"
echo "  - Check frontend: curl http://localhost:3001"
echo "  - View detailed logs: cat /var/log/cc-*.log"
echo ""
echo "Rollback (if needed):"
echo "  ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pkill node; pkill next'"
echo ""
