#!/bin/bash
# VPS Tailscale + Google Voice Deployment
# Run on VPS via Tailscale: ssh dwise@gpu-nmls-1.tail44396d.ts.net

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== VPS: Tailscale + Google Voice Deployment ===${NC}"
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
VPS_TAILSCALE_IP=$(tailscale ip -4)
echo -e "${GREEN}✓ VPS Tailscale IP: $VPS_TAILSCALE_IP${NC}"

# Step 3: Pull latest code
echo ""
echo -e "${YELLOW}Step 3: Pulling latest WISE² code...${NC}"
cd ~/wise2-core
git fetch origin main
git checkout main
git pull
echo -e "${GREEN}✓ Code updated${NC}"

# Step 4: Check for Google Voice credentials
echo ""
echo -e "${YELLOW}Step 4: Checking Google Voice credentials...${NC}"
if [ -f ~/.wise2-google-voice-creds.env ]; then
    echo -e "${GREEN}✓ Credentials file found${NC}"
    if grep -q "GOOGLE_PROJECT_ID" .env.production; then
        echo -e "${GREEN}✓ Already added to .env.production${NC}"
    else
        echo -e "${YELLOW}Adding credentials to .env.production...${NC}"
        cat ~/.wise2-google-voice-creds.env >> .env.production
        chmod 600 .env.production
        echo -e "${GREEN}✓ Credentials added${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Credentials file not found at ~/.wise2-google-voice-creds.env${NC}"
    echo "Please run the Google Cloud setup first and copy credentials."
    echo ""
    echo "To transfer credentials from local machine:"
    echo "  scp ~/.wise2-google-voice-creds.env dwise@173.208.147.165:~/"
    echo ""
    exit 1
fi

# Step 5: Build Docker image
echo ""
echo -e "${YELLOW}Step 5: Building Docker image (this may take 3-5 minutes)...${NC}"
docker build -f packages/ai-phone/Dockerfile -t wise2/ai-phone:latest .
echo -e "${GREEN}✓ Docker image built${NC}"

# Step 6: Deploy services
echo ""
echo -e "${YELLOW}Step 6: Deploying services...${NC}"
source ~/.wise2-core/.env.production
docker-compose -f docker-compose.prod.yml up -d ai-phone api
echo -e "${GREEN}✓ Services deployed${NC}"

# Step 7: Wait for services
echo ""
echo -e "${YELLOW}Waiting for services to start (30 seconds)...${NC}"
sleep 30

# Step 8: Verify deployment
echo ""
echo -e "${YELLOW}Step 8: Verifying deployment...${NC}"
echo ""

# Check running containers
echo "Docker containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Health check:"
if curl -s http://localhost:3001/webhooks/google-voice/health | grep -q "ok"; then
    echo -e "${GREEN}✓ AI Phone service is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Health check pending, checking logs...${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=20 ai-phone
fi

# Step 9: Summary
echo ""
echo -e "${BLUE}=== Deployment Complete ===${NC}"
echo ""
echo -e "${GREEN}VPS is now deployed with:${NC}"
echo "  • Tailscale IP: $VPS_TAILSCALE_IP"
echo "  • Google Voice service on port 3001"
echo "  • API on port 3000"
echo ""
echo "Access from other devices:"
echo "  curl http://$VPS_TAILSCALE_IP:3001/webhooks/google-voice/health"
echo "  ssh dwise@$VPS_TAILSCALE_IP"
echo ""
echo "Monitor logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f ai-phone"
echo ""
echo "Next step: Deploy to Raspberry Pi and Android devices"
echo ""
