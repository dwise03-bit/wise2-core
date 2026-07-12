#!/bin/bash

# WISE² Enterprise - Raspberry Pi Automated Setup Script
# Usage: curl -sSL https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/setup-raspberry-pi.sh | bash

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   WISE² Enterprise - Raspberry Pi Automated Setup             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running on Raspberry Pi
if ! grep -q "Raspberry" /proc/device-tree/model 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Warning: Not running on a Raspberry Pi${NC}"
  echo "This script is optimized for Raspberry Pi OS"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system...${NC}"
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y git curl wget build-essential

# Step 2: Install Docker
echo ""
echo -e "${YELLOW}Step 2: Installing Docker...${NC}"
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo apt-get install -y docker-compose

# Verify Docker
docker --version
docker-compose --version

# Step 3: Clone repository
echo ""
echo -e "${YELLOW}Step 3: Cloning WISE² repository...${NC}"
cd /home/pi
if [ ! -d "wise2-enterprise" ]; then
  git clone https://github.com/dwise03-bit/wise2-core.git wise2-enterprise
else
  cd wise2-enterprise
  git pull origin main
fi
cd wise2-enterprise

# Step 4: Configure environment
echo ""
echo -e "${YELLOW}Step 4: Configuring environment...${NC}"
cat > .env << 'ENVEOF'
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=wise2
DB_PASSWORD=wise2dev
DB_NAME=wise2
JWT_SECRET=raspberry-pi-dev-key-change-in-production
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://raspberrypi.local:3000
ENVEOF

# Step 5: Add resource limits to docker-compose
echo ""
echo -e "${YELLOW}Step 5: Optimizing docker-compose for Raspberry Pi...${NC}"

# Check if limits already exist
if ! grep -q "mem_limit" docker-compose.local.yml; then
  cat >> docker-compose.local.yml << 'COMPOSEEOF'

# Resource limits for Raspberry Pi
# Uncomment the following lines in each service to enable limits:
#    mem_limit: 512m
#    cpus: "1.0"
COMPOSEEOF
fi

# Step 6: Create data directories
echo ""
echo -e "${YELLOW}Step 6: Creating data directories...${NC}"
mkdir -p ./data/postgres
mkdir -p ./data/redis
mkdir -p ./logs

# Step 7: Start services
echo ""
echo -e "${YELLOW}Step 7: Starting Docker services...${NC}"
docker-compose -f docker-compose.local.yml down 2>/dev/null || true
docker-compose -f docker-compose.local.yml up -d

# Step 8: Wait for services to be healthy
echo ""
echo -e "${YELLOW}Step 8: Waiting for services to be healthy...${NC}"
echo "This may take 2-3 minutes..."

max_retries=60
retries=0

while [ $retries -lt $max_retries ]; do
  if docker-compose -f docker-compose.local.yml exec -T postgres pg_isready -U wise2 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
    break
  fi
  retries=$((retries + 1))
  echo -n "."
  sleep 2
done

if [ $retries -eq $max_retries ]; then
  echo -e "${RED}❌ PostgreSQL failed to start${NC}"
  exit 1
fi

# Step 9: Verify deployment
echo ""
echo -e "${YELLOW}Step 9: Verifying deployment...${NC}"
echo ""

docker-compose -f docker-compose.local.yml ps
echo ""

# Test API
echo -e "${YELLOW}Testing API health endpoint...${NC}"
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
  echo -e "${GREEN}✅ API is responding${NC}"
else
  echo -e "${RED}❌ API is not responding${NC}"
  echo "Check logs with: docker-compose -f docker-compose.local.yml logs api"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║               🎉 Setup Complete! 🎉                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ WISE² Enterprise is running on Raspberry Pi!${NC}"
echo ""
echo "Access the API:"
echo "  Local:  http://localhost:3000/api/health"
echo "  Remote: http://raspberrypi.local:3000/api/health"
echo ""
echo "Test Authentication:"
echo "  curl -X POST http://localhost:3000/api/v1/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"pi@wise2.local\",\"password\":\"RaspberryPiTest123!\",\"firstName\":\"Pi\",\"lastName\":\"Test\"}'"
echo ""
echo "Manage Services:"
echo "  View logs:     docker-compose -f docker-compose.local.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.local.yml down"
echo "  Restart:       docker-compose -f docker-compose.local.yml restart"
echo ""
echo "Monitor System:"
echo "  CPU temp:  vcgencmd measure_temp"
echo "  Disk:      df -h"
echo "  Memory:    free -h"
echo "  Docker:    docker stats"
echo ""
echo "Documentation:"
echo "  Setup Guide:   RASPBERRY_PI_SETUP.md"
echo "  Known Issues:  KNOWN_ISSUES.md"
echo "  API Reference: API_REFERENCE.md"
echo ""
