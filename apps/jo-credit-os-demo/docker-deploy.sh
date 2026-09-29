#!/bin/bash

# WISE² Website - Docker Compose Deployment Script

set -e

echo "🐳 WISE² Website - Docker Deployment"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Verify Docker
echo -e "\n${BLUE}Step 1: Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not installed${NC}"
    exit 1
fi
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"
echo -e "${GREEN}✓ Docker Compose $(docker-compose --version | cut -d' ' -f3 | tr -d ',')${NC}"

# Step 2: Stop existing container
echo -e "\n${BLUE}Step 2: Checking for existing containers...${NC}"
if docker-compose ps | grep -q "wise2-website"; then
    echo -e "${YELLOW}⚠ Existing container found, stopping...${NC}"
    docker-compose down
    sleep 2
fi
echo -e "${GREEN}✓ Ready for deployment${NC}"

# Step 3: Build image
echo -e "\n${BLUE}Step 3: Building Docker image...${NC}"
echo "This may take 2-3 minutes on first build..."
docker-compose build
echo -e "${GREEN}✓ Image built successfully${NC}"

# Step 4: Start container
echo -e "\n${BLUE}Step 4: Starting container...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Container started${NC}"

# Step 5: Wait for health check
echo -e "\n${BLUE}Step 5: Waiting for service to be healthy...${NC}"
echo "Checking health (timeout: 60s)..."
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Service is healthy${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${YELLOW}⚠ Health check timeout, service may still be starting${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Step 6: Display status
echo -e "\n${BLUE}Step 6: Container status${NC}"
docker-compose ps

# Step 7: Show access information
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

echo -e "\n${BLUE}🌐 Access Information:${NC}"
echo "  Website: http://localhost:3000"
echo "  Health Check: curl http://localhost:3000"

echo -e "\n${BLUE}📋 Useful Commands:${NC}"
echo "  View logs:      docker-compose logs -f website"
echo "  Stop container: docker-compose down"
echo "  Restart:        docker-compose restart website"
echo "  Remove all:     docker-compose down -v"

echo -e "\n${BLUE}🔍 Verification:${NC}"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Check animations are smooth"
echo "  3. Test mobile responsiveness"
echo "  4. Verify no console errors"

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo "  See DOCKER.md for detailed guide"
echo "  See DEPLOYMENT_CHECKLIST.md for next steps"

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}Next: Open http://localhost:3000${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"
