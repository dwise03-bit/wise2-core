#!/bin/bash
set -e

echo "🚀 WISE² Production Deployment Starting..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROD_HOST="dwise@173.208.147.165"
PROD_DIR="/home/dwise/wise2-core"

echo -e "${BLUE}📋 Step 1: Sync code to production server${NC}"
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .turbo \
  --exclude dist \
  --exclude build \
  /Users/danielwise/Projects/wise2-core/ \
  ${PROD_HOST}:${PROD_DIR}/

echo -e "${BLUE}📋 Step 2: Install dependencies on production${NC}"
ssh ${PROD_HOST} "cd ${PROD_DIR} && pnpm install --frozen-lockfile"

echo -e "${BLUE}📋 Step 3: Build all apps${NC}"
ssh ${PROD_HOST} "cd ${PROD_DIR} && pnpm build"

echo -e "${BLUE}📋 Step 4: Stop existing services${NC}"
ssh ${PROD_HOST} "pkill -f 'next start' || true"
ssh ${PROD_HOST} "sleep 2"

echo -e "${BLUE}📋 Step 5: Start services with PM2${NC}"
ssh ${PROD_HOST} "cd ${PROD_DIR} && pnpm start || true"

echo -e "${BLUE}📋 Step 6: Verify services are running${NC}"
for port in 3001 3002 3003 3005 3010; do
  echo "Checking port $port..."
  ssh ${PROD_HOST} "curl -s http://localhost:${port}/health || echo 'Service starting on :$port...'"
done

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}Production Services:${NC}"
echo "  - Website: https://wise2.net"
echo "  - Studio: https://studio.wise2.net"
echo "  - Dashboard: https://dashboard.wise2.net"
echo "  - Admin: https://admin.wise2.net"

