#!/bin/bash
################################################################################
# WISE² Phone System Complete Deployment Script
# Deploys Asterisk 22 LTS + Phone Gateway + All Dependencies
# Run with: sudo bash deploy-phone-system.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ASTERISK_VERSION="22"
PHONE_GATEWAY_PORT="3001"
WHISPER_PORT="8000"
OLLAMA_PORT="11435"
PIPER_PORT="8080"
DOMAIN="${1:-localhost}"
PUBLIC_IP="${2:-$(curl -s ifconfig.me)}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WISE² Phone System - Complete Deployment                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}ERROR: This script must be run as root (sudo)${NC}"
   exit 1
fi

################################################################################
# STEP 1: System Preparation
################################################################################
echo -e "${YELLOW}[1/8] System Preparation...${NC}"

apt-get update
apt-get upgrade -y

# Install basic dependencies
apt-get install -y \
  build-essential \
  curl \
  wget \
  git \
  vim \
  htop \
  net-tools \
  ufw \
  fail2ban \
  openssh-server \
  openssl \
  ca-certificates

# Create asterisk user
if ! id -u asterisk > /dev/null 2>&1; then
  useradd -m -d /var/lib/asterisk -s /bin/bash asterisk
  usermod -a -G audio asterisk
  echo -e "${GREEN}✓ Asterisk user created${NC}"
else
  echo -e "${GREEN}✓ Asterisk user already exists${NC}"
fi

# Create directories
mkdir -p /opt/wise2-phone
mkdir -p /var/spool/asterisk/voicemail
mkdir -p /var/spool/asterisk/recordings
mkdir -p /tmp/wise2-phone-audio

chown -R asterisk:asterisk /var/spool/asterisk
chown -R asterisk:asterisk /tmp/wise2-phone-audio

echo -e "${GREEN}✓ System prepared${NC}"
echo ""

################################################################################
# STEP 2: Install Docker & Docker Compose
################################################################################
echo -e "${YELLOW}[2/8] Installing Docker & Docker Compose...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh

  # Add current user to docker group
  usermod -aG docker asterisk
  echo -e "${GREEN}✓ Docker installed${NC}"
else
  echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
  echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

systemctl enable docker
systemctl start docker
echo ""

################################################################################
# STEP 3: Install Asterisk 22 LTS
################################################################################
echo -e "${YELLOW}[3/8] Installing Asterisk 22 LTS...${NC}"

if ! command -v asterisk &> /dev/null; then
  # Add Asterisk PPA
  add-apt-repository -y ppa:asterisk/lts
  apt-get update

  # Install Asterisk
  DEBIAN_FRONTEND=noninteractive apt-get install -y asterisk asterisk-dev

  echo -e "${GREEN}✓ Asterisk 22 LTS installed${NC}"
else
  echo -e "${GREEN}✓ Asterisk already installed$(asterisk -V)${NC}"
fi

# Fix permissions
chown -R asterisk:asterisk /etc/asterisk
chown -R asterisk:asterisk /var/lib/asterisk
chown -R asterisk:asterisk /var/log/asterisk

echo ""

################################################################################
# STEP 4: Configure Asterisk PJSIP
################################################################################
echo -e "${YELLOW}[4/8] Configuring Asterisk PJSIP...${NC}"

# Backup original config
cp /etc/asterisk/pjsip.conf /etc/asterisk/pjsip.conf.bak

# Create PJSIP configuration
cat > /etc/asterisk/pjsip.conf << 'EOF'
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060
external_media_address=PUBLIC_IP_HERE
external_signaling_address=PUBLIC_IP_HERE

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089

; Internal extension for Phone Gateway
[wise2-gateway]
type=endpoint
transport=transport-udp
context=wise2-phone
auth=gateway-auth
aors=gateway-aor
disallow=all
allow=ulaw
allow=alaw
allow=opus
direct_media=no

[gateway-auth]
type=auth
auth_type=userpass
username=wise2_gateway
password=GATEWAY_PASSWORD_HERE

[gateway-aor]
type=aor
max_contacts=1
contact=sip:phone-gateway:5061

; Twilio BYOC Trunk (outbound)
[twilio-outbound]
type=registration
transport=transport-udp
outbound_auth=twilio-auth
server_uri=sip:sip.twilio.com
client_uri=sip:+PHONE_NUMBER_HERE@sip.twilio.com

[twilio-auth]
type=auth
auth_type=userpass
username=ACCOUNT_SID_HERE
password=AUTH_TOKEN_HERE

[twilio-endpoint]
type=endpoint
transport=transport-udp
outbound_auth=twilio-auth
aors=twilio-aor
context=outbound-to-twilio
disallow=all
allow=ulaw
allow=alaw

[twilio-aor]
type=aor
max_contacts=1
contact=sip:sip.twilio.com
EOF

# Replace placeholders
sed -i "s/PUBLIC_IP_HERE/${PUBLIC_IP}/g" /etc/asterisk/pjsip.conf
sed -i "s/GATEWAY_PASSWORD_HERE/$(openssl rand -base64 32)/g" /etc/asterisk/pjsip.conf
sed -i "s/+PHONE_NUMBER_HERE/+18668543330/g" /etc/asterisk/pjsip.conf
sed -i "s/ACCOUNT_SID_HERE/AC9e082045SC2344d68baa54203dbd7/g" /etc/asterisk/pjsip.conf

# Note: User must fill in AUTH_TOKEN_HERE
echo -e "${YELLOW}⚠️  IMPORTANT: Edit /etc/asterisk/pjsip.conf and replace:${NC}"
echo -e "${YELLOW}   AUTH_TOKEN_HERE with your Twilio Auth Token${NC}"

chown asterisk:asterisk /etc/asterisk/pjsip.conf
chmod 640 /etc/asterisk/pjsip.conf

echo -e "${GREEN}✓ Asterisk PJSIP configured${NC}"
echo ""

################################################################################
# STEP 5: Configure Asterisk Dialplan
################################################################################
echo -e "${YELLOW}[5/8] Configuring Asterisk Dialplan...${NC}"

cp /etc/asterisk/extensions.conf /etc/asterisk/extensions.conf.bak

cat > /etc/asterisk/extensions.conf << 'EOF'
[general]
static=yes
writeprotect=no
autofallthrough=yes

[inbound-calls]
; Inbound calls from Twilio BYOC trunk
exten => YOUR_DID,1,Answer()
 same => n,Set(CHANNEL(language)=en)
 same => n,Stasis(wise2-phone-app)
 same => n,Hangup()

; Default context for unknown numbers
exten => _.,1,Playback(silence/1)
 same => n,Hangup()

[wise2-phone]
; Test extension for Phone Gateway
exten => 1000,1,NoOp(Test extension)
 same => n,Playback(silence/1)
 same => n,Hangup()

[outbound-to-twilio]
; Route outbound calls through Twilio BYOC trunk
exten => _.,1,Dial(PJSIP/${EXTEN}@twilio-endpoint)
 same => n,Hangup()
EOF

chown asterisk:asterisk /etc/asterisk/extensions.conf
chmod 640 /etc/asterisk/extensions.conf

echo -e "${GREEN}✓ Asterisk dialplan configured${NC}"
echo ""

################################################################################
# STEP 6: Enable and Start Asterisk
################################################################################
echo -e "${YELLOW}[6/8] Starting Asterisk...${NC}"

systemctl enable asterisk
systemctl restart asterisk

# Wait for Asterisk to start
sleep 3

# Check if running
if systemctl is-active --quiet asterisk; then
  echo -e "${GREEN}✓ Asterisk started successfully${NC}"

  # Test PJSIP registration
  asterisk -rx "pjsip show endpoints" | head -5
else
  echo -e "${RED}✗ Asterisk failed to start${NC}"
  systemctl status asterisk
  exit 1
fi
echo ""

################################################################################
# STEP 7: Configure Firewall
################################################################################
echo -e "${YELLOW}[7/8] Configuring Firewall...${NC}"

# Enable UFW
ufw --force enable

# SSH
ufw allow 22/tcp

# SIP
ufw allow 5060/udp
ufw allow 5061/tcp
ufw allow 5061/udp

# RTP
ufw allow 10000:20000/udp

# Phone Gateway
ufw allow 3001/tcp

# Whisper STT
ufw allow 8000/tcp

# Piper TTS
ufw allow 8080/tcp

# Ollama
ufw allow 11435/tcp

# Reload firewall
ufw reload

echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

################################################################################
# STEP 8: Deploy Docker Services
################################################################################
echo -e "${YELLOW}[8/8] Deploying Docker Services...${NC}"

# Create .env file for services
cat > /opt/wise2-phone/.env << EOF
# Phone Gateway
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Asterisk ARI
ASTERISK_ARI_ENDPOINT=http://localhost:8088/ari
ASTERISK_USERNAME=wise2_gateway
ASTERISK_PASSWORD=$(openssl rand -base64 32)

# STT (Whisper)
WHISPER_URL=http://whisper:8000/v1/audio/transcriptions
STT_PROVIDER=whisper

# TTS (Piper)
PIPER_URL=http://piper:8080/api/tts
TTS_PROVIDER=piper

# LLM (Hermes)
HERMES_ENDPOINT=http://ollama:11435/v1/chat/completions
HERMES_CHAT_MODEL=hermes2-pro
HERMES_TIMEOUT_MS=90000

# Database
DATABASE_URL=postgresql://wise2:wise2_password@postgres:5432/wise2_prod

# Redis
REDIS_URL=redis://:redis_password@redis:6379/1

# Twilio
TWILIO_ACCOUNT_SID=AC9e082045SC2344d68baa54203dbd7
TWILIO_AUTH_TOKEN=YOUR_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=+18668543330
EOF

# Copy docker-compose file
if [ -f "/root/wise2-core/docker-compose.phone.yml" ]; then
  cp /root/wise2-core/docker-compose.phone.yml /opt/wise2-phone/docker-compose.yml
  echo -e "${GREEN}✓ Docker Compose file copied${NC}"
else
  echo -e "${YELLOW}⚠️  Docker Compose file not found, manual setup needed${NC}"
fi

# Start Docker services
cd /opt/wise2-phone
docker-compose up -d

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Check service status
echo -e "${BLUE}Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✓ Docker services started${NC}"
echo ""

################################################################################
# Final Summary
################################################################################
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WISE² Phone System Deployment Complete!                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}Deployment Summary:${NC}"
echo "  ✓ System updated and configured"
echo "  ✓ Docker installed and running"
echo "  ✓ Asterisk 22 LTS installed and started"
echo "  ✓ PJSIP configured"
echo "  ✓ Firewall configured"
echo "  ✓ Docker services deployed"
echo ""

echo -e "${YELLOW}IMPORTANT - Manual Configuration Required:${NC}"
echo "1. Edit /etc/asterisk/pjsip.conf"
echo "   - Replace AUTH_TOKEN_HERE with your Twilio Auth Token"
echo "   - Replace YOUR_DID with your Twilio phone number"
echo ""
echo "2. Edit /opt/wise2-phone/.env"
echo "   - Replace YOUR_AUTH_TOKEN_HERE with Twilio Auth Token"
echo ""
echo "3. Verify Asterisk:"
echo "   asterisk -rx 'pjsip show registrations'"
echo "   (Should show 'Registered' for twilio-outbound)"
echo ""

echo -e "${YELLOW}Service Ports:${NC}"
echo "  • Phone Gateway API: http://$PUBLIC_IP:3001"
echo "  • Asterisk ARI: http://$PUBLIC_IP:8088/ari"
echo "  • Whisper STT: http://$PUBLIC_IP:8000"
echo "  • Ollama LLM: http://$PUBLIC_IP:11435"
echo "  • Piper TTS: http://$PUBLIC_IP:8080"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure Twilio SIP routing (see TWILIO_CONFIGURATION.md)"
echo "2. Test inbound call: curl http://$PUBLIC_IP:3001/health"
echo "3. Monitor logs: docker-compose logs -f phone-api"
echo ""

echo -e "${GREEN}Deployment complete!${NC}"
