#!/bin/bash

# WISE² Sound Labs Website Deployment Script
# Deploys wise-touch website with Sound Labs to production

set -e

echo "🚀 WISE² Sound Labs Website Deployment"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_HOST="173.208.147.165"
REMOTE_USER="dwise"
PROJECT_PATH="/home/ubuntu/dev/wise2-core"
WEBSITE_PORT="3001"

# Check if we can SSH to remote
echo -e "${YELLOW}[1/6]${NC} Checking remote server connection..."
if ! ssh -o ConnectTimeout=5 ${REMOTE_USER}@${REMOTE_HOST} "echo 'Connected'" > /dev/null 2>&1; then
    echo -e "${RED}✗ Cannot connect to ${REMOTE_HOST}${NC}"
    echo "You may need to enter your SSH password or check connectivity."
    exit 1
fi
echo -e "${GREEN}✓ Remote server connected${NC}"

# Pull latest code
echo ""
echo -e "${YELLOW}[2/6]${NC} Pulling latest code from git..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${PROJECT_PATH} && git pull origin main" || {
    echo -e "${RED}✗ Git pull failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Code updated${NC}"

# Stop existing website container
echo ""
echo -e "${YELLOW}[3/6]${NC} Stopping existing website container..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "docker stop wise2-website 2>/dev/null || true" > /dev/null
echo -e "${GREEN}✓ Old container stopped${NC}"

# Build website Docker image
echo ""
echo -e "${YELLOW}[4/6]${NC} Building website Docker image..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${PROJECT_PATH} && docker build -f wise-touch/Dockerfile -t wise2-website:latest wise-touch/" || {
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Docker image built${NC}"

# Deploy website
echo ""
echo -e "${YELLOW}[5/6]${NC} Starting website container..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${PROJECT_PATH} && docker-compose -f docker-compose.prod.yml up -d website" || {
    echo -e "${RED}✗ Docker compose failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Website container started${NC}"

# Verify deployment
echo ""
echo -e "${YELLOW}[6/6]${NC} Verifying website is running..."
sleep 3
if ssh ${REMOTE_USER}@${REMOTE_HOST} "docker ps | grep wise2-website" > /dev/null; then
    echo -e "${GREEN}✓ Website container is running${NC}"
else
    echo -e "${RED}✗ Website container not running${NC}"
    exit 1
fi

# Final success message
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✨ WISE² Sound Labs Website Deployed! ✨${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📍 Access the website at:"
echo -e "${YELLOW}   http://173.208.147.165:${WEBSITE_PORT}${NC}"
echo ""
echo "📍 View Sound Labs page at:"
echo -e "${YELLOW}   http://173.208.147.165:${WEBSITE_PORT}/sound-labs${NC}"
echo ""
echo "📊 Monitor container:"
echo -e "${YELLOW}   ssh dwise@173.208.147.165 'docker logs -f wise2-website'${NC}"
echo ""
