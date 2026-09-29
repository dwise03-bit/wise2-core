#!/bin/bash
# WISE² AI Phone - One-Command VPS Deployment
# Usage: bash deploy-final.sh <VPS_IP> <SIP_USERNAME> <SIP_PASSWORD>

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $# -lt 3 ]; then
  echo -e "${BLUE}WISE² AI Phone - Final Deployment${NC}"
  echo ""
  echo "Usage: bash deploy-final.sh <VPS_IP> <SIP_USERNAME> <SIP_PASSWORD>"
  echo ""
  echo "Example:"
  echo "  bash deploy-final.sh 192.168.1.100 my_username my_password"
  echo ""
  echo "Your Setup:"
  echo "  • Phone: (336) 485-8421"
  echo "  • VPS: Ubuntu 22.04"
  echo "  • SIP: Telnyx or Twilio"
  exit 1
fi

VPS_IP=$1
SIP_USER=$2
SIP_PASS=$3
SIP_SERVER=${4:-sip.telnyx.com}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║  WISE² AI PHONE - FINAL DEPLOYMENT      ║"
echo "║  Your Number: (336) 485-8421            ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  VPS IP: $VPS_IP"
echo "  SIP Server: $SIP_SERVER"
echo "  SIP User: $SIP_USER"
echo ""

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ! ssh -o StrictHostKeyChecking=no ubuntu@$VPS_IP "echo 'Connected'" > /dev/null 2>&1; then
  echo -e "${RED}Cannot connect to VPS at $VPS_IP${NC}"
  echo "Check:"
  echo "  1. VPS IP is correct"
  echo "  2. SSH key is configured"
  echo "  3. VPS is running"
  exit 1
fi
echo -e "${GREEN}✓ Connected to VPS${NC}"
echo ""

# Deploy to VPS
echo -e "${YELLOW}Deploying to VPS (this takes 5-10 minutes)...${NC}"
echo ""

ssh -o StrictHostKeyChecking=no ubuntu@$VPS_IP "bash -c '
set -e

echo \"[1/7] Updating system...\"
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

echo \"[2/7] Installing Docker...\"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi

echo \"[3/7] Installing Docker Compose...\"
if ! command -v docker-compose &> /dev/null; then
  sudo curl -fsSL https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m) -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

echo \"[4/7] Cloning WISE² Core...\"
if [ ! -d /opt/wise2-core ]; then
  sudo git clone https://github.com/dwise03-bit/wise2-core.git /opt/wise2-core
fi

echo \"[5/7] Creating configuration...\"
sudo tee /opt/wise2-core/.env > /dev/null << ENV_END
GV_NUMBER=+13364858421
SIP_SERVER='$SIP_SERVER'
SIP_USERNAME='$SIP_USER'
SIP_PASSWORD='$SIP_PASS'
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions
DATABASE_URL=postgresql://wise2:wise2secure@localhost:5432/wise2_prod
REDIS_URL=redis://:wise2secure@localhost:6379/1
LOG_LEVEL=info
NODE_ENV=production
ENV_END

echo \"[6/7] Configuring firewall...\"
sudo ufw --force enable 2>/dev/null || true
sudo ufw allow 22/tcp 2>/dev/null || true
sudo ufw allow 5060/udp 2>/dev/null || true
sudo ufw allow 5060/tcp 2>/dev/null || true
sudo ufw allow 10000:20000/udp 2>/dev/null || true
sudo ufw allow 3001/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
sudo ufw allow 80/tcp 2>/dev/null || true

echo \"[7/7] Starting services...\"
cd /opt/wise2-core
sudo docker-compose -f docker-compose.phone.yml up -d

echo \"Waiting for services to be healthy...\"
for i in {1..60}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo \"✓ Services are healthy\"
    break
  fi
  if [ \$i -eq 60 ]; then
    echo \"Services taking longer to start. Check logs:\"
    echo \"  docker-compose logs phone-gateway\"
    exit 1
  fi
  echo -n \".\"
  sleep 5
done

echo \"\"
echo \"IP Address: \$(hostname -I | awk '{print \$1}')\"
'"

echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║   DEPLOYMENT COMPLETE! ✅                ║"
echo "║   Your Phone: (336) 485-8421             ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}REMAINING STEPS:${NC}"
echo ""
echo "1. Log into SIP provider (Telnyx/Twilio)"
echo "   Set Origination IP to VPS IP shown above"
echo ""
echo "2. Enable Google Voice forwarding"
echo "   google.com/voice → Settings → Forwarding phones"
echo "   Add your SIP provider's phone number"
echo ""
echo "3. Test call"
echo "   Call (336) 485-8421 from any phone"
echo "   Should hear: 'Hello! Welcome to WISE²...'"
echo ""
echo -e "${YELLOW}To verify on VPS:${NC}"
echo "  ssh ubuntu@$VPS_IP"
echo "  curl http://localhost:3001/health | jq ."
echo "  docker-compose -f /opt/wise2-core/docker-compose.phone.yml logs phone-gateway"
echo ""
echo "Timeline: 2-3 hours (including manual SIP + GV steps)"
echo "Cost: ~\$30-40/month"
echo "Savings: 95% vs Vapi/Retell 🚀"
