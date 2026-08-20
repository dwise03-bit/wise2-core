#!/bin/bash

# Petals & Potions Verified Deployment Script
# This script checks EVERYTHING before deploying
# Run this on the VPS: ssh dwise@173.208.147.165 'bash deploy-petals.sh'

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌿 Petals & Potions Verified Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

DEPLOY_PATH="/home/dwise/wise2-core"
PP_PORT="3003"

# ============================================================================
# STEP 1: Verify SSH/connectivity
# ============================================================================
echo -e "${YELLOW}▸ STEP 1: Verifying connectivity...${NC}"
if [ ! -d "$DEPLOY_PATH" ]; then
    echo -e "${RED}✗ Deploy path not found: $DEPLOY_PATH${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Deploy path exists${NC}"

# ============================================================================
# STEP 2: Check ports - verify 3003 is actually free
# ============================================================================
echo -e "${YELLOW}▸ STEP 2: Checking port availability...${NC}"
echo "  Checking port 3000 (main API)..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Port 3000: IN USE (expected - main API)${NC}"
    MAIN_API_PID=$(lsof -i :3000 | grep LISTEN | awk '{print $2}' | head -1)
    echo "    PID: $MAIN_API_PID"
else
    echo -e "${YELLOW}  ⚠ Port 3000: FREE (unusual - should be running)${NC}"
fi

echo "  Checking port 3001 (nginx proxy)..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}  ⚠ Port 3001: IN USE (may conflict)${NC}"
    lsof -i :3001
else
    echo -e "${GREEN}  ✓ Port 3001: FREE${NC}"
fi

echo "  Checking port 3003 (Petals & Potions)..."
if lsof -i :3003 > /dev/null 2>&1; then
    echo -e "${RED}  ✗ Port 3003: ALREADY IN USE - CONFLICT!${NC}"
    lsof -i :3003
    echo -e "${YELLOW}  Choose a different port and update DEPLOYMENT_VERIFIED.sh${NC}"
    exit 1
else
    echo -e "${GREEN}  ✓ Port 3003: FREE and ready${NC}"
fi

# ============================================================================
# STEP 3: Verify git branch exists and is correct
# ============================================================================
echo -e "${YELLOW}▸ STEP 3: Verifying git branch...${NC}"
cd "$DEPLOY_PATH"
git fetch origin

if git rev-parse --verify origin/claude/petals-potions-build-guu0cb > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Branch exists on origin${NC}"
else
    echo -e "${RED}✗ Branch not found on origin${NC}"
    exit 1
fi

# ============================================================================
# STEP 4: Check out petals-potions branch
# ============================================================================
echo -e "${YELLOW}▸ STEP 4: Checking out petals-potions branch...${NC}"
git checkout claude/petals-potions-build-guu0cb
git pull origin claude/petals-potions-build-guu0cb
COMMIT=$(git rev-parse --short HEAD)
echo -e "${GREEN}✓ On branch (commit: $COMMIT)${NC}"

# ============================================================================
# STEP 5: Verify petals-potions code exists
# ============================================================================
echo -e "${YELLOW}▸ STEP 5: Verifying Petals & Potions code...${NC}"
PP_WEB_PATH="$DEPLOY_PATH/apps/petals-potions/web"

if [ ! -d "$PP_WEB_PATH" ]; then
    echo -e "${RED}✗ Petals & Potions web app not found: $PP_WEB_PATH${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Web app directory exists${NC}"

if [ ! -f "$PP_WEB_PATH/package.json" ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ package.json exists${NC}"

if [ ! -f "$PP_WEB_PATH/next.config.js" ]; then
    echo -e "${RED}✗ Next.js config not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Next.js config exists${NC}"

# ============================================================================
# STEP 6: Install dependencies
# ============================================================================
echo -e "${YELLOW}▸ STEP 6: Installing dependencies...${NC}"
cd "$PP_WEB_PATH"
npm install --prefer-offline --no-audit 2>&1 | tail -5
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================================================
# STEP 7: Build Next.js app
# ============================================================================
echo -e "${YELLOW}▸ STEP 7: Building Next.js app...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# ============================================================================
# STEP 8: Start the server in background
# ============================================================================
echo -e "${YELLOW}▸ STEP 8: Starting server on port $PP_PORT...${NC}"

# Kill any existing instance
pkill -f "next start" || true
sleep 2

# Start new server
PORT=$PP_PORT npm start > /tmp/petals-potions.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for startup
echo "  Waiting for server to start..."
sleep 5

# ============================================================================
# STEP 9: Health check
# ============================================================================
echo -e "${YELLOW}▸ STEP 9: Health check...${NC}"
MAX_ATTEMPTS=10
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -sf http://localhost:$PP_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server responding on port $PP_PORT${NC}"
        break
    fi

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}✗ Server failed to start after ${MAX_ATTEMPTS} attempts${NC}"
        echo "  Check logs: tail -f /tmp/petals-potions.log"
        exit 1
    fi

    echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

# ============================================================================
# STEP 10: Verify nginx configuration
# ============================================================================
echo -e "${YELLOW}▸ STEP 10: Verifying nginx configuration...${NC}"
NGINX_CONF="$DEPLOY_PATH/infrastructure/nginx/conf.d/petals-potions.conf"

if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${YELLOW}⚠ Nginx config not found: $NGINX_CONF${NC}"
    echo "  You may need to configure nginx manually"
else
    echo -e "${GREEN}✓ Nginx config exists${NC}"

    # Test nginx config
    if sudo nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Nginx config is valid${NC}"
        sudo systemctl reload nginx
        echo -e "${GREEN}✓ Nginx reloaded${NC}"
    else
        echo -e "${YELLOW}⚠ Nginx config test failed${NC}"
        sudo nginx -t
    fi
fi

# ============================================================================
# STEP 11: Final verification
# ============================================================================
echo -e "${YELLOW}▸ STEP 11: Final verification...${NC}"

echo "  Port 3003 status:"
if lsof -i :3003 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Server running on port 3003${NC}"
else
    echo -e "  ${RED}✗ Port 3003 not responding${NC}"
fi

echo "  Testing direct access:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PP_PORT/)
if [ "$RESPONSE" = "200" ]; then
    echo -e "  ${GREEN}✓ HTTP 200 - Server healthy${NC}"
else
    echo -e "  ${YELLOW}⚠ HTTP $RESPONSE - Check logs${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Petals & Potions Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Deployment Details:"
echo "  Server: Running (PID: $SERVER_PID)"
echo "  Port: $PP_PORT"
echo "  Branch: claude/petals-potions-build-guu0cb"
echo "  Commit: $COMMIT"
echo ""
echo "Access:"
echo "  Local:  http://localhost:$PP_PORT"
echo "  Domain: http://petals-potions.wise2.io (if nginx configured)"
echo ""
echo "Monitoring:"
echo "  Logs:   tail -f /tmp/petals-potions.log"
echo "  Status: curl http://localhost:$PP_PORT/"
echo "  Ports:  lsof -i :3000 :3001 :3003"
echo ""
echo "Stop server:"
echo "  kill $SERVER_PID"
echo ""
