#!/bin/bash
################################################################################
# Post-Deployment Configuration Script
# Runs after deploy-phone-system.sh to complete setup
# Run with: bash post-deploy-setup.sh
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WISE² Phone System - Post-Deployment Setup                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running with correct privileges for some operations
if [[ $EUID -eq 0 ]]; then
  echo -e "${YELLOW}Running with sudo privileges${NC}"
fi

################################################################################
# 1. Verify Asterisk
################################################################################
echo -e "${YELLOW}[1] Verifying Asterisk...${NC}"

if ! systemctl is-active --quiet asterisk; then
  echo -e "${RED}✗ Asterisk is not running${NC}"
  systemctl status asterisk
  exit 1
fi

echo -e "${GREEN}✓ Asterisk is running${NC}"

# Show PJSIP status
echo -e "${BLUE}PJSIP Endpoints:${NC}"
asterisk -rx "pjsip show endpoints" 2>/dev/null | head -10 || echo "  (Run manually: asterisk -rx 'pjsip show endpoints')"

echo ""

################################################################################
# 2. Verify Docker Services
################################################################################
echo -e "${YELLOW}[2] Verifying Docker Services...${NC}"

cd /opt/wise2-phone

echo -e "${BLUE}Running Containers:${NC}"
docker-compose ps

echo ""

################################################################################
# 3. Health Checks
################################################################################
echo -e "${YELLOW}[3] Running Health Checks...${NC}"

# Phone Gateway
echo -n "  Phone Gateway (3001): "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${RED}✗ NOT RESPONDING (may still be starting)${NC}"
fi

# Whisper STT
echo -n "  Whisper STT (8000): "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${RED}✗ NOT RESPONDING${NC}"
fi

# Piper TTS
echo -n "  Piper TTS (8080): "
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${RED}✗ NOT RESPONDING (may still be starting)${NC}"
fi

# Ollama
echo -n "  Ollama LLM (11435): "
if curl -s http://localhost:11435/api/tags > /dev/null 2>&1; then
  echo -e "${GREEN}✓ OK${NC}"
else
  echo -e "${RED}✗ NOT RESPONDING (not started)${NC}"
fi

echo ""

################################################################################
# 4. Verify Configuration Files
################################################################################
echo -e "${YELLOW}[4] Checking Configuration Files...${NC}"

FILES_TO_CHECK=(
  "/etc/asterisk/pjsip.conf"
  "/etc/asterisk/extensions.conf"
  "/etc/asterisk/ari.conf"
  "/opt/wise2-phone/.env"
  "/opt/wise2-phone/docker-compose.yml"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${YELLOW}⚠${NC} $file (not found)"
  fi
done

echo ""

################################################################################
# 5. Test Connectivity
################################################################################
echo -e "${YELLOW}[5] Testing SIP Connectivity...${NC}"

echo -n "  Asterisk SIP (5060): "
if netstat -ulnp 2>/dev/null | grep -q :5060; then
  echo -e "${GREEN}✓ Listening${NC}"
else
  echo -e "${RED}✗ Not listening${NC}"
fi

echo -n "  RTP Range (10000-20000): "
if netstat -ulnp 2>/dev/null | grep -E ":1000[0-9]" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Configured${NC}"
else
  echo -e "${YELLOW}ℹ Not yet in use${NC}"
fi

echo ""

################################################################################
# 6. Display Test Commands
################################################################################
echo -e "${YELLOW}[6] Test Commands${NC}"
echo ""
echo -e "${BLUE}Test API Connectivity:${NC}"
echo "  curl -s http://localhost:3001/health | jq ."
echo ""

echo -e "${BLUE}Monitor Asterisk:${NC}"
echo "  asterisk -rv"
echo "  CLI> pjsip show registrations"
echo "  CLI> pjsip show endpoints"
echo ""

echo -e "${BLUE}View Logs:${NC}"
echo "  sudo tail -f /var/log/asterisk/full"
echo "  docker-compose logs -f phone-api"
echo "  docker-compose logs -f whisper"
echo ""

echo -e "${BLUE}Test STT (Whisper):${NC}"
echo "  curl -X POST http://localhost:8000/v1/audio/transcriptions \\"
echo "    -F 'file=@/path/to/audio.wav' \\"
echo "    -F 'language=en'"
echo ""

################################################################################
# 7. Troubleshooting Guide
################################################################################
echo -e "${YELLOW}[7] Troubleshooting${NC}"
echo ""

echo -e "${BLUE}If Phone Gateway won't start:${NC}"
echo "  docker-compose logs phone-api"
echo "  Check: .env file has correct DATABASE_URL and REDIS_URL"
echo ""

echo -e "${BLUE}If Asterisk won't register with Twilio:${NC}"
echo "  1. Verify Auth Token in /etc/asterisk/pjsip.conf"
echo "  2. Check: asterisk -rx 'pjsip show registrations'"
echo "  3. Monitor: sudo tail -f /var/log/asterisk/full | grep twilio"
echo ""

echo -e "${BLUE}If no audio on calls:${NC}"
echo "  1. Verify codecs match: asterisk -rx 'pjsip show endpoint wise2-gateway'"
echo "  2. Check firewall RTP range: sudo ufw status"
echo "  3. Check NAT: might need STUN server configuration"
echo ""

################################################################################
# 8. Final Status
################################################################################
echo ""
echo -e "${GREEN}✓ Post-deployment setup complete!${NC}"
echo ""

echo -e "${YELLOW}REMAINING CONFIGURATION:${NC}"
echo "1. Twilio BYOC Trunk SIP Routing (see TWILIO_CONFIGURATION.md)"
echo "2. Test inbound call to +18668543330"
echo "3. Monitor logs for any errors"
echo ""

echo -e "${YELLOW}Key Credentials to Secure:${NC}"
echo "  • /etc/asterisk/pjsip.conf (contains Auth Token)"
echo "  • /opt/wise2-phone/.env (contains credentials)"
echo "  • Keep backups: /etc/asterisk/*.bak"
echo ""

echo -e "${GREEN}System ready for testing!${NC}"
