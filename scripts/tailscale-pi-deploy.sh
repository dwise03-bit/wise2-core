#!/bin/bash
# Raspberry Pi Tailscale + Google Voice Deployment
# Run on Raspberry Pi: ssh pi@192.168.1.XXX

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Raspberry Pi: Tailscale + Google Voice Deployment ===${NC}"
echo ""

# Step 1: Install Tailscale
echo -e "${YELLOW}Step 1: Installing Tailscale...${NC}"
if command -v tailscale &> /dev/null; then
    echo -e "${GREEN}✓ Tailscale already installed${NC}"
else
    curl -fsSL https://tailscale.com/install.sh | sh
    echo -e "${GREEN}✓ Tailscale installed${NC}"
fi

# Step 2: Authenticate with Tailscale
echo ""
echo -e "${YELLOW}Step 2: Authenticating with Tailscale...${NC}"
if tailscale status &> /dev/null; then
    echo -e "${GREEN}✓ Already authenticated${NC}"
else
    echo -e "${YELLOW}Please authenticate by visiting the URL below:${NC}"
    sudo tailscale up
fi

# Get Tailscale IP
PI_TAILSCALE_IP=$(tailscale ip -4)
echo -e "${GREEN}✓ Pi Tailscale IP: $PI_TAILSCALE_IP${NC}"

# Step 3: Pull latest code
echo ""
echo -e "${YELLOW}Step 3: Pulling latest WISE² code...${NC}"
if [ ! -d ~/wise2-core ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    cd ~
    git clone https://github.com/dwise03-bit/wise2-core.git
else
    cd ~/wise2-core
    git fetch origin main
    git checkout main
    git pull
fi
echo -e "${GREEN}✓ Code ready${NC}"

# Step 4: Copy credentials from VPS
echo ""
echo -e "${YELLOW}Step 4: Getting Google Voice credentials...${NC}"
echo ""
echo "Option 1: Copy from your local machine"
echo "  scp ~/.wise2-google-voice-creds.env pi@$PI_TAILSCALE_IP:~/"
echo ""
echo "Option 2: Copy from VPS (after VPS is deployed)"
echo "  scp dwise@<vps-tailscale-ip>:~/.wise2-google-voice-creds.env ~/"
echo ""
read -p "Have you copied the credentials file? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please copy credentials first, then run this script again${NC}"
    exit 1
fi

if [ -f ~/.wise2-google-voice-creds.env ]; then
    echo -e "${GREEN}✓ Credentials file found${NC}"
else
    echo -e "${RED}✗ Credentials file not found${NC}"
    exit 1
fi

# Step 5: Set up environment
echo ""
echo -e "${YELLOW}Step 5: Setting up environment...${NC}"
if [ ! -f .env.pi ]; then
    cp .env.pi.example .env.pi
fi

if grep -q "GOOGLE_PROJECT_ID" .env.pi; then
    echo -e "${GREEN}✓ Already configured${NC}"
else
    cat ~/.wise2-google-voice-creds.env >> .env.pi
    chmod 600 .env.pi
    echo -e "${GREEN}✓ Credentials added to .env.pi${NC}"
fi

# Step 6: Check resource constraints
echo ""
echo -e "${YELLOW}Step 6: Checking Raspberry Pi resources...${NC}"
echo "Available memory:"
free -h | grep Mem

echo ""
echo "Disk space:"
df -h /

# Step 7: Build Docker image (or pull if available)
echo ""
echo -e "${YELLOW}Step 7: Preparing Docker image...${NC}"
# For RPi, we might want to pull pre-built image instead of building
echo "Options:"
echo "  1) Pull pre-built image from registry (faster)"
echo "  2) Build locally (slower, ~10-15 minutes)"
echo ""
read -p "Choose option (1 or 2): " -n 1 -r
echo

if [[ $REPLY == "1" ]]; then
    echo -e "${YELLOW}Pulling Docker image...${NC}"
    docker pull wise2/ai-phone:latest
    echo -e "${GREEN}✓ Image pulled${NC}"
else
    echo -e "${YELLOW}Building Docker image (this may take 10-15 minutes on Pi)...${NC}"
    docker build -f packages/ai-phone/Dockerfile -t wise2/ai-phone:latest .
    echo -e "${GREEN}✓ Docker image built${NC}"
fi

# Step 8: Deploy services
echo ""
echo -e "${YELLOW}Step 8: Deploying services...${NC}"
source ~/.wise2-core/.env.pi
docker-compose -f docker-compose.pi.yml up -d ai-phone api
echo -e "${GREEN}✓ Services deployed${NC}"

# Step 9: Wait for services
echo ""
echo -e "${YELLOW}Waiting for services to start (20 seconds)...${NC}"
sleep 20

# Step 10: Verify deployment
echo ""
echo -e "${YELLOW}Step 9: Verifying deployment...${NC}"
echo ""

# Check running containers
echo "Docker containers:"
docker-compose -f docker-compose.pi.yml ps

echo ""
echo "Health check:"
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}✓ API service is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Health check pending, checking logs...${NC}"
    docker-compose -f docker-compose.pi.yml logs --tail=20 api
fi

# Step 11: Summary
echo ""
echo -e "${BLUE}=== Deployment Complete ===${NC}"
echo ""
echo -e "${GREEN}Raspberry Pi is now deployed with:${NC}"
echo "  • Tailscale IP: $PI_TAILSCALE_IP"
echo "  • Google Voice service"
echo "  • API on port 3000"
echo "  • Database (replica from VPS)"
echo ""
echo "Access from other devices:"
echo "  curl http://$PI_TAILSCALE_IP:3000/health"
echo "  ssh pi@$PI_TAILSCALE_IP"
echo ""
echo "Monitor logs:"
echo "  docker-compose -f docker-compose.pi.yml logs -f api"
echo ""
echo "Resource monitoring:"
echo "  watch -n 2 'docker stats --no-stream && vcgencmd measure_temp && free -h'"
echo ""
echo "Next step: Deploy to Android device or test webhook delivery"
echo ""
