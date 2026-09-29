#!/bin/bash

# WISE² AI Phone — FINAL DEPLOYMENT PACKAGE
# Everything automated. You just provide: VPS IP + SIP credentials

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════╗"
echo "║   WISE² AI PHONE — FINAL AUTOMATED DEPLOYMENT     ║"
echo "║   All components ready. Running full setup...     ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
if [ $# -lt 3 ]; then
  echo -e "${RED}Usage: bash FINAL_DEPLOYMENT.sh <VPS_IP> <SIP_USERNAME> <SIP_PASSWORD>${NC}"
  echo ""
  echo "Example:"
  echo "  bash FINAL_DEPLOYMENT.sh 192.168.1.100 my_username my_password"
  echo ""
  exit 1
fi

VPS_IP=$1
SIP_USERNAME=$2
SIP_PASSWORD=$3
SIP_SERVER=${4:-sip.telnyx.com}
SIP_PHONE=${5:-}

echo -e "${YELLOW}Configuration:${NC}"
echo "  VPS IP: $VPS_IP"
echo "  SIP Server: $SIP_SERVER"
echo "  SIP User: $SIP_USERNAME"
echo ""

# Generate deployment script for VPS
cat > /tmp/deploy-to-vps.sh << 'DEPLOY_EOF'
#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║   WISE² AI Phone VPS Deployment               ║"
echo "║   Your Number: (336) 485-8421                 ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Update System
echo -e "${YELLOW}[1/8] Updating system...${NC}"
sudo apt-get update -qq && sudo apt-get upgrade -y -qq
echo -e "${GREEN}✓ System updated${NC}"

# 2. Install Docker
echo -e "${YELLOW}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# 3. Install Docker Compose
echo -e "${YELLOW}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
  sudo curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

# 4. Clone Repository
echo -e "${YELLOW}[4/8] Cloning repository...${NC}"
if [ ! -d /opt/wise2-core ]; then
  sudo git clone https://github.com/dwise03-bit/wise2-core.git /opt/wise2-core
fi
cd /opt/wise2-core && sudo git pull origin main -q
echo -e "${GREEN}✓ Repository ready${NC}"

# 5. Create Configuration
echo -e "${YELLOW}[5/8] Creating configuration...${NC}"
sudo bash -c 'cat > /opt/wise2-core/.env << "ENVEOF"
GV_NUMBER=+13364858421
SIP_SERVER=SIP_SERVER_PLACEHOLDER
SIP_USERNAME=SIP_USERNAME_PLACEHOLDER
SIP_PASSWORD=SIP_PASSWORD_PLACEHOLDER
SIP_PHONE_NUMBER=SIP_PHONE_PLACEHOLDER
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions
DATABASE_URL=postgresql://wise2:wise2_secure@localhost:5432/wise2_prod
REDIS_URL=redis://:wise2_secure@localhost:6379/1
LOG_LEVEL=info
NODE_ENV=production
ENVEOF'
echo -e "${GREEN}✓ Configuration created${NC}"

# 6. Configure Firewall
echo -e "${YELLOW}[6/8] Configuring firewall...${NC}"
sudo ufw --force enable 2>/dev/null || true
sudo ufw default deny incoming 2>/dev/null || true
sudo ufw default allow outgoing 2>/dev/null || true
sudo ufw allow 22/tcp 2>/dev/null || true
sudo ufw allow 5060/udp 2>/dev/null || true
sudo ufw allow 5060/tcp 2>/dev/null || true
sudo ufw allow 10000:20000/udp 2>/dev/null || true
sudo ufw allow 3001/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
sudo ufw allow 80/tcp 2>/dev/null || true
echo -e "${GREEN}✓ Firewall configured${NC}"

# 7. Start Services
echo -e "${YELLOW}[7/8] Starting services (5-10 minutes)...${NC}"
cd /opt/wise2-core
sudo docker-compose -f docker-compose.phone.yml pull -q 2>/dev/null || true
sudo docker-compose -f docker-compose.phone.yml up -d

# Wait for health check
for i in {1..60}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ All services healthy${NC}"
    break
  fi
  if [ $i -eq 60 ]; then
    echo -e "${RED}✗ Services failed to start${NC}"
    echo "Check logs: docker-compose logs phone-gateway"
    exit 1
  fi
  echo -n "."
  sleep 5
done

echo -e "${GREEN}✓ Services running${NC}"

# 8. Display Results
echo -e "${YELLOW}[8/8] Deployment complete!${NC}"
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════╗"
echo "║         DEPLOYMENT SUCCESSFUL! ✅              ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Next steps:"
echo "1. Configure SIP provider routing to: $(hostname -I | awk '{print $1}')"
echo "2. Enable Google Voice forwarding to your SIP number"
echo "3. Call (336) 485-8421 to test"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose -f /opt/wise2-core/docker-compose.phone.yml logs -f"
echo "  Check health: curl http://localhost:3001/health | jq ."
echo "  Verify SIP:   docker-compose exec asterisk asterisk -rx \"pjsip show registration\""
echo ""

DEPLOY_EOF

chmod +x /tmp/deploy-to-vps.sh

# Copy to VPS and execute
echo -e "${YELLOW}Deploying to VPS at $VPS_IP...${NC}"
echo ""

scp /tmp/deploy-to-vps.sh ubuntu@$VPS_IP:/tmp/ 2>/dev/null || {
  echo -e "${RED}Failed to connect to VPS. Check:${NC}"
  echo "  1. VPS IP is correct: $VPS_IP"
  echo "  2. SSH key is configured"
  echo "  3. VPS is running Ubuntu 22.04"
  exit 1
}

echo -e "${BLUE}Starting deployment on VPS...${NC}"
ssh ubuntu@$VPS_IP "bash /tmp/deploy-to-vps.sh" || exit 1

# Replace placeholders in .env on VPS
echo -e "${YELLOW}Configuring SIP credentials...${NC}"
ssh ubuntu@$VPS_IP "sudo sed -i 's/SIP_SERVER_PLACEHOLDER/$SIP_SERVER/g' /opt/wise2-core/.env"
ssh ubuntu@$VPS_IP "sudo sed -i 's/SIP_USERNAME_PLACEHOLDER/$SIP_USERNAME/g' /opt/wise2-core/.env"
ssh ubuntu@$VPS_IP "sudo sed -i 's/SIP_PASSWORD_PLACEHOLDER/$SIP_PASSWORD/g' /opt/wise2-core/.env"

if [ -n "$SIP_PHONE" ]; then
  ssh ubuntu@$VPS_IP "sudo sed -i 's/SIP_PHONE_PLACEHOLDER/$SIP_PHONE/g' /opt/wise2-core/.env"
fi

# Restart services with new config
ssh ubuntu@$VPS_IP "cd /opt/wise2-core && sudo docker-compose -f docker-compose.phone.yml restart" 2>/dev/null || true

sleep 10

# Final verification
echo -e "${YELLOW}Verifying deployment...${NC}"
VPS_HEALTH=$(ssh ubuntu@$VPS_IP "curl -s http://localhost:3001/health" 2>/dev/null || echo '{"error":"unreachable"}')

if echo "$VPS_HEALTH" | grep -q "healthy"; then
  echo -e "${GREEN}✓ Deployment verified${NC}"
  echo ""
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════════╗"
  echo "║   YOUR AI PHONE IS LIVE! 🎉                   ║"
  echo "║   Number: (336) 485-8421                      ║"
  echo "╚════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
  echo "Remaining steps:"
  echo "1. Log into your SIP provider (Telnyx/Twilio)"
  echo "2. Set origination IP to: $(ssh ubuntu@$VPS_IP 'hostname -I | awk "{print \$1}"' 2>/dev/null)"
  echo "3. Enable Google Voice forwarding to your SIP number"
  echo "4. Call (336) 485-8421 to test"
  echo ""
else
  echo -e "${YELLOW}Services deployed but checking health...${NC}"
  echo "SSH to check: ssh ubuntu@$VPS_IP"
  echo "Then run: curl http://localhost:3001/health | jq ."
fi
