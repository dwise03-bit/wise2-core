#!/bin/bash

# Petals & Potions Production Deployment Script
# Deploys to 173.208.147.165 on port 3003
# Usage: ./deploy.sh [branch] [environment]

set -e

# Configuration
DEPLOY_USER="dwise"
DEPLOY_HOST="173.208.147.165"
DEPLOY_PATH="/home/dwise/wise2-core"
BRANCH="${1:-claude/petals-potions-build-guu0cb}"
ENVIRONMENT="${2:-production}"
SERVICE_NAME="petals-potions-web"
SERVICE_PORT="3003"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌿 Petals & Potions Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Configuration:"
echo "  Deploy User: $DEPLOY_USER"
echo "  Deploy Host: $DEPLOY_HOST"
echo "  Deploy Path: $DEPLOY_PATH"
echo "  Branch: $BRANCH"
echo "  Environment: $ENVIRONMENT"
echo "  Service Port: $SERVICE_PORT"
echo ""

# Verify SSH access
echo -e "${YELLOW}▸ Verifying SSH access...${NC}"
if ! ssh -o ConnectTimeout=5 "$DEPLOY_USER@$DEPLOY_HOST" "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${RED}✗ SSH connection failed. Verify credentials and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection verified${NC}"

# Pull latest code
echo -e "${YELLOW}▸ Pulling latest code from $BRANCH...${NC}"
ssh "$DEPLOY_USER@$DEPLOY_HOST" "cd $DEPLOY_PATH && git fetch origin && git checkout $BRANCH && git pull origin $BRANCH"
echo -e "${GREEN}✓ Code updated${NC}"

# Build Docker image
echo -e "${YELLOW}▸ Building Docker image...${NC}"
ssh "$DEPLOY_USER@$DEPLOY_HOST" "cd $DEPLOY_PATH && docker build -f apps/petals-potions/Dockerfile.prod -t petals-potions:latest ."
echo -e "${GREEN}✓ Docker image built${NC}"

# Stop existing service (if running)
echo -e "${YELLOW}▸ Stopping existing service...${NC}"
ssh "$DEPLOY_USER@$DEPLOY_HOST" "cd $DEPLOY_PATH/apps/petals-potions && docker-compose -f docker-compose.prod.yml down" || true
echo -e "${GREEN}✓ Old service stopped${NC}"

# Start new service
echo -e "${YELLOW}▸ Starting new service on port $SERVICE_PORT...${NC}"
ssh "$DEPLOY_USER@$DEPLOY_HOST" "cd $DEPLOY_PATH/apps/petals-potions && docker-compose -f docker-compose.prod.yml up -d"
echo -e "${GREEN}✓ Service started${NC}"

# Wait for health check
echo -e "${YELLOW}▸ Waiting for service to be healthy (max 60s)...${NC}"
for i in {1..60}; do
    if ssh "$DEPLOY_USER@$DEPLOY_HOST" "curl -f http://localhost:$SERVICE_PORT/health > /dev/null 2>&1"; then
        echo -e "${GREEN}✓ Service is healthy${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}✗ Service failed health check. Check logs:${NC}"
        echo "  ssh $DEPLOY_USER@$DEPLOY_HOST 'docker logs $SERVICE_NAME'"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Reload nginx
echo -e "${YELLOW}▸ Reloading nginx...${NC}"
ssh "$DEPLOY_USER@$DEPLOY_HOST" "sudo nginx -t && sudo systemctl reload nginx"
echo -e "${GREEN}✓ Nginx reloaded${NC}"

# Verify deployment
echo -e "${YELLOW}▸ Verifying deployment...${NC}"
if ssh "$DEPLOY_USER@$DEPLOY_HOST" "curl -s -H 'Host: petals-potions.wise2.io' http://localhost/ | head -20 > /dev/null 2>&1"; then
    echo -e "${GREEN}✓ Deployment verified${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify via nginx, but service is running${NC}"
fi

# Display final status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Petals & Potions Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Service Details:"
echo "  Domain: petals-potions.wise2.io"
echo "  Port: $SERVICE_PORT (internal)"
echo "  Status: Running"
echo ""
echo "Verify deployment:"
echo "  curl http://petals-potions.wise2.io/"
echo "  docker logs $SERVICE_NAME"
echo ""
echo "SSH to server:"
echo "  ssh $DEPLOY_USER@$DEPLOY_HOST"
echo ""
