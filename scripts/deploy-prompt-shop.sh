#!/bin/bash
# Deploy WISE TOUCH Prompt Shop to VPS
# Usage: ./scripts/deploy-prompt-shop.sh [environment]

set -e

ENVIRONMENT=${1:-production}
VPS_HOST="173.208.147.165"
VPS_USER="dwise"
VPS_PORT="22"
DEPLOY_DIR="/home/dwise/wise2-core"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== WISE TOUCH Prompt Shop Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "VPS: $VPS_HOST:$VPS_PORT"
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "claude/create-34p9dm" ]; then
  echo -e "${RED}❌ Error: Must be on main or claude/create-34p9dm branch${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Branch check passed${NC}"

# Verify all changes are committed
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Error: Uncommitted changes detected${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All changes committed${NC}"

# Push to remote
echo -e "${YELLOW}→ Pushing to remote...${NC}"
git push origin $CURRENT_BRANCH

echo -e "${GREEN}✓ Push completed${NC}"

# Connect to VPS and pull changes
echo -e "${YELLOW}→ Connecting to VPS and pulling changes...${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'SSH_COMMANDS'
  set -e
  cd /home/dwise/wise2-core

  echo "Pulling latest code..."
  git fetch origin
  git checkout main
  git pull origin main

  echo "Building Docker images..."
  docker-compose -f docker-compose.prod.yml build prompt-shop

  echo "Stopping old container..."
  docker-compose -f docker-compose.prod.yml stop prompt-shop || true

  echo "Starting new container..."
  docker-compose -f docker-compose.prod.yml up -d prompt-shop

  echo "Waiting for health check..."
  sleep 5

  # Check if container is healthy
  if docker ps | grep -q wise2-prompt-shop; then
    echo "✓ Container started successfully"
  else
    echo "✗ Container failed to start"
    docker-compose -f docker-compose.prod.yml logs prompt-shop | tail -20
    exit 1
  fi

  echo "Reloading nginx..."
  docker-compose -f docker-compose.prod.yml exec -T nginx nginx -s reload || \
    docker exec wise2-nginx nginx -s reload

  echo "Deployment complete!"
  docker ps --filter "name=wise2" --format "table {{.Names}}\t{{.Status}}"

SSH_COMMANDS

echo -e "${GREEN}✓ Deployment completed successfully${NC}"
echo ""
echo -e "${YELLOW}Prompt Shop is now available at:${NC}"
echo "  https://wise2.net/prompt-shop"
echo ""
echo -e "${YELLOW}Monitor deployment:${NC}"
echo "  ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
echo "  docker-compose -f docker-compose.prod.yml logs -f prompt-shop"
