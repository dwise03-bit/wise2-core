#!/bin/bash

# REAPER V1 Deployment Script
# Deploys M0 foundation + M1 audit orchestration to wise2.net

set -e

echo "🚀 REAPER V1 Deployment to wise2.net"
echo "===================================="

# Configuration
SERVER="173.208.147.165"
USER="dwise"
APP_DIR="/home/dwise/wise2-core"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK_URL:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Connect to server
echo -e "${YELLOW}[1/7]${NC} Connecting to server..."
ssh -i ~/.ssh/id_rsa $USER@$SERVER "cd $APP_DIR && pwd" > /dev/null
echo -e "${GREEN}✓${NC} Connected to $SERVER"

# Step 2: Pull latest code
echo -e "${YELLOW}[2/7]${NC} Pulling latest code..."
ssh -i ~/.ssh/id_rsa $USER@$SERVER "cd $APP_DIR && git pull origin main"
echo -e "${GREEN}✓${NC} Code updated"

# Step 3: Build packages
echo -e "${YELLOW}[3/7]${NC} Building REAPER packages..."
ssh -i ~/.ssh/id_rsa $USER@$SERVER "cd $APP_DIR && npm run build --workspaces"
echo -e "${GREEN}✓${NC} Packages built"

# Step 4: Run migrations
echo -e "${YELLOW}[4/7]${NC} Running database migrations..."
ssh -i ~/.ssh/id_rsa $USER@$SERVER "cd $APP_DIR/packages/db && npx prisma migrate deploy"
echo -e "${GREEN}✓${NC} Database ready"

# Step 5: Stop existing containers
echo -e "${YELLOW}[5/7]${NC} Stopping existing containers..."
ssh -i ~/.ssh/id_rsa $USER@$SERVER "cd $APP_DIR && docker-compose -f docker-compose.reaper.yml down || true"
echo -e "${GREEN}✓${NC} Containers stopped"

# Step 6: Start new containers
echo -e "${YELLOW}[6/7]${NC} Starting REAPER services..."
ssh -i ~/.ssh/id_rsa $USER@$SERVER \
  "cd $APP_DIR && DISCORD_WEBHOOK_URL='$DISCORD_WEBHOOK' docker-compose -f docker-compose.reaper.yml up -d"
echo -e "${GREEN}✓${NC} Services started"

# Step 7: Verify health
echo -e "${YELLOW}[7/7]${NC} Verifying deployment..."
sleep 5

# Check API
API_HEALTH=$(curl -s http://$SERVER:3001/api/reaper/health | grep -o "OPERATIONAL" || echo "FAILED")
if [ "$API_HEALTH" = "OPERATIONAL" ]; then
  echo -e "${GREEN}✓${NC} API healthy"
else
  echo -e "${RED}✗${NC} API health check failed"
  exit 1
fi

echo ""
echo -e "${GREEN}===================================="
echo "✅ REAPER V1 Deployment Complete!"
echo "===================================${NC}"
echo ""
echo "Services running on wise2.net:"
echo "  • API: http://173.208.147.165:3001/api/reaper"
echo "  • Health: curl http://173.208.147.165:3001/api/reaper/health"
echo ""
echo "Test audit:"
echo "  curl -X POST http://173.208.147.165:3001/api/reaper/prospects/prospect-1/audit \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"auditType\": \"WEBSITE\", \"sourceUrl\": \"https://example.com\"}'"
echo ""
