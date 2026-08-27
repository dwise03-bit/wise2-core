#!/bin/bash
################################################################################
# WISE² Phone System - FULLY AUTOMATED DEPLOYMENT
# With Twilio credentials pre-configured
# Run once: sudo bash deploy-phone-system-automated.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# PRE-CONFIGURED CREDENTIALS (Set via environment variables)
TWILIO_ACCOUNT_SID="${TWILIO_ACCOUNT_SID:-}"
TWILIO_AUTH_TOKEN="${TWILIO_AUTH_TOKEN:-}"
TWILIO_PHONE_NUMBER="${TWILIO_PHONE_NUMBER:-}"

# Validate credentials are set
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_PHONE_NUMBER" ]; then
    echo "ERROR: Twilio credentials not set. Please export:"
    echo "  export TWILIO_ACCOUNT_SID='your-account-sid'"
    echo "  export TWILIO_AUTH_TOKEN='your-auth-token'"
    echo "  export TWILIO_PHONE_NUMBER='your-phone-number'"
    exit 1
fi
ASTERISK_PASSWORD=$(openssl rand -base64 32)
PUBLIC_IP=$(curl -s ifconfig.me)

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WISE² Phone System - FULLY AUTOMATED DEPLOYMENT         ║${NC}"
echo -e "${BLUE}║   Twilio Account: $TWILIO_ACCOUNT_SID              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}ERROR: This script must be run as root (sudo)${NC}"
   exit 1
fi

echo -e "${YELLOW}[1/9] System Update...${NC}"
apt-get update && apt-get upgrade -y > /dev/null 2>&1

echo -e "${YELLOW}[2/9] Installing Dependencies...${NC}"
apt-get install -y curl wget git vim htop net-tools ufw fail2ban openssl ca-certificates > /dev/null 2>&1

echo -e "${YELLOW}[3/9] Creating Asterisk User...${NC}"
if ! id -u asterisk > /dev/null 2>&1; then
  useradd -m -d /var/lib/asterisk -s /bin/bash asterisk
  usermod -a -G audio asterisk
fi

mkdir -p /var/spool/asterisk/voicemail /var/spool/asterisk/recordings /tmp/wise2-phone-audio
chown -R asterisk:asterisk /var/spool/asterisk /tmp/wise2-phone-audio

echo -e "${YELLOW}[4/9] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh > /dev/null 2>&1
  rm get-docker.sh
  usermod -aG docker asterisk
fi
systemctl enable docker > /dev/null 2>&1
systemctl start docker > /dev/null 2>&1

echo -e "${YELLOW}[5/9] Installing Asterisk 22 LTS...${NC}"
if ! command -v asterisk &> /dev/null; then
  add-apt-repository -y ppa:asterisk/lts > /dev/null 2>&1
  apt-get update > /dev/null 2>&1
  DEBIAN_FRONTEND=noninteractive apt-get install -y asterisk asterisk-dev > /dev/null 2>&1
fi

chown -R asterisk:asterisk /etc/asterisk /var/lib/asterisk /var/log/asterisk

echo -e "${YELLOW}[6/9] Configuring Asterisk PJSIP (Auto-configured!)...${NC}"

cat > /etc/asterisk/pjsip.conf << EOF
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060
external_media_address=$PUBLIC_IP
external_signaling_address=$PUBLIC_IP

[twilio-outbound]
type=registration
transport=transport-udp
outbound_auth=twilio-auth
server_uri=sip:sip.twilio.com
client_uri=sip:$TWILIO_PHONE_NUMBER@sip.twilio.com

[twilio-auth]
type=auth
auth_type=userpass
username=$TWILIO_ACCOUNT_SID
password=$TWILIO_AUTH_TOKEN

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

[gateway-auth]
type=auth
auth_type=userpass
username=wise2_gateway
password=$ASTERISK_PASSWORD

[gateway-aor]
type=aor
max_contacts=1
contact=sip:phone-gateway:5061
EOF

cat > /etc/asterisk/extensions.conf << 'EOF'
[general]
static=yes
writeprotect=no
autofallthrough=yes

[inbound-calls]
exten => +18668543330,1,Answer()
 same => n,Set(CHANNEL(language)=en)
 same => n,Stasis(wise2-phone-app)
 same => n,Hangup()

exten => _.,1,Playback(silence/1)
 same => n,Hangup()

[wise2-phone]
exten => 1000,1,NoOp(Test extension)
 same => n,Playback(silence/1)
 same => n,Hangup()

[outbound-to-twilio]
exten => _.,1,Dial(PJSIP/${EXTEN}@twilio-endpoint)
 same => n,Hangup()
EOF

chown asterisk:asterisk /etc/asterisk/{pjsip,extensions}.conf
chmod 640 /etc/asterisk/{pjsip,extensions}.conf

echo -e "${YELLOW}[7/9] Starting Asterisk...${NC}"
systemctl enable asterisk > /dev/null 2>&1
systemctl restart asterisk > /dev/null 2>&1
sleep 3

if systemctl is-active --quiet asterisk; then
  echo -e "${GREEN}✓ Asterisk started${NC}"
else
  echo -e "${RED}✗ Asterisk failed to start${NC}"
  systemctl status asterisk
  exit 1
fi

echo -e "${YELLOW}[8/9] Configuring Firewall...${NC}"
ufw --force enable > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 5060/udp > /dev/null 2>&1
ufw allow 5061/tcp > /dev/null 2>&1
ufw allow 5061/udp > /dev/null 2>&1
ufw allow 10000:20000/udp > /dev/null 2>&1
ufw allow 3001/tcp > /dev/null 2>&1
ufw allow 8000/tcp > /dev/null 2>&1
ufw allow 8080/tcp > /dev/null 2>&1
ufw allow 11435/tcp > /dev/null 2>&1
ufw reload > /dev/null 2>&1

echo -e "${YELLOW}[9/9] Starting Docker Services...${NC}"
cd /root/wise2-core 2>/dev/null || cd /home/dwise/wise2-core 2>/dev/null || true

if [ -f "docker-compose.phone.yml" ]; then
  docker-compose -f docker-compose.phone.yml up -d > /dev/null 2>&1
  sleep 5
  echo -e "${BLUE}Docker Services:${NC}"
  docker-compose -f docker-compose.phone.yml ps 2>/dev/null || echo "Services starting..."
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   DEPLOYMENT COMPLETE!                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Twilio Credentials (AUTO-CONFIGURED):${NC}"
echo "  Account SID:      $TWILIO_ACCOUNT_SID"
echo "  Phone Number:     $TWILIO_PHONE_NUMBER"
echo "  Auth Token:       ✓ Configured"
echo ""

echo -e "${BLUE}Asterisk Status:${NC}"
asterisk -rx "pjsip show registrations" 2>/dev/null | head -3 || echo "  (Run: asterisk -rx 'pjsip show registrations')"
echo ""

echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Verify Twilio registration:"
echo "   asterisk -rx 'pjsip show registrations'"
echo ""
echo "2. Test inbound call:"
echo "   Go to Twilio Console → +18668543330 → Make Test Call"
echo ""
echo "3. Monitor logs:"
echo "   sudo tail -f /var/log/asterisk/full"
echo ""

echo -e "${GREEN}✓ WISE² Phone System Ready!${NC}"
