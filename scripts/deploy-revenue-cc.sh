#!/bin/bash
# WISE² Revenue Command Center Deployment Script
# Run this on production after pulling the latest commit

set -e

echo "🚀 WISE² Revenue Command Center Deployment"
echo "=========================================="

# Configuration
API_PORT=${API_PORT:-3000}
BOT_PM2_NAME=${BOT_PM2_NAME:-wise2-bot}
API_PM2_NAME=${API_PM2_NAME:-wise2-api}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify environment
echo -e "\n${YELLOW}[1/7]${NC} Verifying environment..."
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}✗ DATABASE_URL not set${NC}"
  exit 1
fi
if [ -z "$DISCORD_BOT_TOKEN" ]; then
  echo -e "${RED}✗ DISCORD_BOT_TOKEN not set${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Environment variables set${NC}"

# Step 2: Database migration
echo -e "\n${YELLOW}[2/7]${NC} Running database migration..."
cd packages/db
npx prisma migrate deploy
cd ../../
echo -e "${GREEN}✓ Database migration complete${NC}"

# Step 3: Verify tables
echo -e "\n${YELLOW}[3/7]${NC} Verifying database tables..."
psql "$DATABASE_URL" -c "\dt public.offers public.deals public.lead_scores public.quotes" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ All revenue tables created${NC}"
else
  echo -e "${RED}✗ Database verification failed${NC}"
  exit 1
fi

# Step 4: Build API
echo -e "\n${YELLOW}[4/7]${NC} Building API..."
cd packages/api
npm run build 2>&1 | tail -5
cd ../../
echo -e "${GREEN}✓ API build complete${NC}"

# Step 5: Restart API service
echo -e "\n${YELLOW}[5/7]${NC} Restarting API service..."
if command -v pm2 &> /dev/null; then
  pm2 restart "$API_PM2_NAME" 2>/dev/null || pm2 start ecosystem.config.js --name "$API_PM2_NAME"
  echo -e "${GREEN}✓ API service restarted${NC}"
else
  echo -e "${YELLOW}⚠ PM2 not found, skipping restart${NC}"
fi

# Step 6: Restart Discord bot
echo -e "\n${YELLOW}[6/7]${NC} Restarting Discord bot..."
if command -v pm2 &> /dev/null; then
  pm2 restart "$BOT_PM2_NAME" 2>/dev/null || echo "Bot not running via PM2"
  echo -e "${GREEN}✓ Bot restart triggered${NC}"
else
  echo -e "${YELLOW}⚠ PM2 not found, skipping bot restart${NC}"
fi

# Step 7: Verify deployment
echo -e "\n${YELLOW}[7/7]${NC} Verifying deployment..."
sleep 2

# Check API
echo -n "  Checking API health... "
if curl -s "http://localhost:$API_PORT/revenue/dashboard?period=today" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠${NC} (API not responding yet, may be starting up)"
fi

echo -e "\n${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo -e "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify Discord commands: /revenue today"
echo "2. Monitor logs: pm2 logs"
echo "3. Check dashboard: curl http://localhost:$API_PORT/revenue/dashboard"
echo ""
echo "Documentation: See WISE2_REVENUE_CC_COMPLETE.md"
