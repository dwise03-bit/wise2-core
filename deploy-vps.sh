#!/bin/bash

# WISE² AI Phone VPS Deployment Automation
# Fully automates deployment to Ubuntu 22.04 VPS
# Usage: bash deploy-vps.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║   WISE² AI PHONE - VPS AUTOMATED DEPLOYMENT   ║"
echo "║   Your Number: (336) 485-8421                 ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Detect OS
if [ ! -f /etc/os-release ]; then
  echo -e "${RED}This script requires Ubuntu 22.04${NC}"
  exit 1
fi

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}This script must be run with sudo${NC}"
  exit 1
fi

# Step 1: Update System
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Docker
echo -e "${YELLOW}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# Step 2.5: Install Git
echo -e "${YELLOW}[2.5/8] Installing Git...${NC}"
if ! command -v git &> /dev/null; then
  apt-get install -y -qq git
fi
echo -e "${GREEN}✓ Git installed${NC}"
echo ""

# Step 3: Install Docker Compose
echo -e "${YELLOW}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
  curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"
echo ""

# Step 4: Add user to docker group
echo -e "${YELLOW}[4/8] Configuring permissions...${NC}"
usermod -aG docker ubuntu 2>/dev/null || true
echo -e "${GREEN}✓ Docker permissions configured${NC}"
echo ""

# Step 5: Clone repository
echo -e "${YELLOW}[5/8] Cloning WISE² Core repository...${NC}"
rm -rf /opt/wise2-core
sudo -u root bash -c 'git clone https://github.com/dwise03-bit/wise2-core.git /opt/wise2-core'
cd /opt/wise2-core
git checkout main
echo -e "${GREEN}✓ Repository ready${NC}"
echo ""

# Step 6: Create environment file
echo -e "${YELLOW}[6/8] Creating configuration...${NC}"
if [ ! -f /opt/wise2-core/.env ]; then
  cat > /opt/wise2-core/.env << 'ENVEOF'
# Your Google Voice Number
GV_NUMBER=+13364858421

# SIP Provider (edit with your credentials)
SIP_PROVIDER=telnyx
SIP_SERVER=sip.telnyx.com
SIP_USERNAME=YOUR_USERNAME
SIP_PASSWORD=YOUR_PASSWORD
SIP_PHONE_NUMBER=+1XXXXXXXXXX

# API Configuration
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace

# AI Services (local)
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions

# Database
DATABASE_URL=postgresql://wise2:wise2_secure_password@localhost:5432/wise2_prod
REDIS_URL=redis://:wise2_secure_password@localhost:6379/1

# Logging
LOG_LEVEL=info
NODE_ENV=production
ENVEOF

  echo -e "${YELLOW}⚠ Configuration created at /opt/wise2-core/.env${NC}"
  echo -e "${YELLOW}  Edit it with your SIP provider credentials:${NC}"
  echo -e "${YELLOW}  nano /opt/wise2-core/.env${NC}"
fi
echo -e "${GREEN}✓ Configuration ready${NC}"
echo ""

# Step 7: Configure Firewall
echo -e "${YELLOW}[7/8] Configuring firewall...${NC}"
ufw --force enable 2>/dev/null || true
ufw default deny incoming 2>/dev/null || true
ufw default allow outgoing 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true    # SSH
ufw allow 5060/udp 2>/dev/null || true  # SIP
ufw allow 5060/tcp 2>/dev/null || true
ufw allow 10000:20000/udp 2>/dev/null || true  # RTP
ufw allow 3001/tcp 2>/dev/null || true  # Phone Gateway API
ufw allow 443/tcp 2>/dev/null || true   # HTTPS
ufw allow 80/tcp 2>/dev/null || true    # HTTP
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Step 8: Start Services
echo -e "${YELLOW}[8/8] Starting services (this takes 5-10 minutes)...${NC}"
cd /opt/wise2-core
docker-compose -f docker-compose.phone.yml pull -q
docker-compose -f docker-compose.phone.yml up -d

# Wait for services
echo -e "${YELLOW}      Waiting for services to be healthy...${NC}"
for i in {1..60}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ All services healthy${NC}"
    break
  fi
  if [ $i -eq 60 ]; then
    echo -e "${RED}✗ Services failed to start${NC}"
    echo "Check logs: docker-compose logs"
    exit 1
  fi
  echo -n "."
  sleep 5
done
echo ""

# Completion summary
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════╗"
echo "║         DEPLOYMENT COMPLETE! ✅                ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Edit configuration with SIP provider credentials:${NC}"
echo "   nano /opt/wise2-core/.env"
echo ""
echo "2. ${YELLOW}Update SIP settings:${NC}"
echo "   SIP_SERVER=sip.telnyx.com (or your provider)"
echo "   SIP_USERNAME=your_username"
echo "   SIP_PASSWORD=your_password"
echo "   SIP_PHONE_NUMBER=+1XXXXXXXXXX"
echo ""
echo "3. ${YELLOW}Restart services:${NC}"
echo "   cd /opt/wise2-core"
echo "   docker-compose -f docker-compose.phone.yml restart"
echo ""
echo "4. ${YELLOW}Configure SIP provider (Telnyx/Twilio):${NC}"
echo "   Set origination IP: $(hostname -I | awk '{print $1}')"
echo "   Set inbound routing to SIP user"
echo ""
echo "5. ${YELLOW}Enable Google Voice forwarding:${NC}"
echo "   google.com/voice → Settings → Forwarding phones"
echo "   Add your SIP provider's phone number"
echo ""
echo "6. ${YELLOW}Test call:${NC}"
echo "   Call: (336) 485-8421"
echo "   Should hear: 'Hello! Welcome to WISE²...'"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo ""
echo "  View logs:        docker-compose -f /opt/wise2-core/docker-compose.phone.yml logs -f"
echo "  Check health:     curl http://localhost:3001/health | jq ."
echo "  Run tests:        bash /opt/wise2-core/scripts/test-phone-e2e.sh"
echo "  Stop services:    docker-compose -f /opt/wise2-core/docker-compose.phone.yml down"
echo "  Check firewall:   sudo ufw status"
echo ""
echo -e "${GREEN}Server IP: $(hostname -I | awk '{print $1}')${NC}"
echo -e "${GREEN}Your Phone: (336) 485-8421${NC}"
echo ""
echo "Status: 🟡 Awaiting SIP configuration | 🟢 Ready for calls in ~30 min"
echo ""
