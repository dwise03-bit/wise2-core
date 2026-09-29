#!/bin/bash

# ============================================================================
# WISE² Twilio BYOC Verification Script
# Diagnoses common Asterisk/PJSIP/Twilio registration issues
# ============================================================================

set -e

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

PASS="${GREEN}✅ PASS${RESET}"
FAIL="${RED}❌ FAIL${RESET}"
WARN="${YELLOW}⚠️  WARN${RESET}"
INFO="${BLUE}ℹ️  INFO${RESET}"

# Track overall status
OVERALL_STATUS=0

echo ""
echo "============================================================================"
echo "WISE² Twilio BYOC Verification"
echo "============================================================================"
echo ""

# ============================================================================
# PART 1: System Requirements
# ============================================================================

echo -e "${BLUE}PART 1: System Requirements${RESET}"
echo "--------"

# Check if Asterisk is running
if pgrep -x "asterisk" > /dev/null; then
    echo -e "$PASS Asterisk is running"
else
    echo -e "$FAIL Asterisk is not running"
    OVERALL_STATUS=1
    echo "  → Start Asterisk: sudo systemctl start asterisk"
fi

# Check if Asterisk CLI is accessible
if asterisk -rx "core show version" &>/dev/null; then
    echo -e "$PASS Asterisk CLI is accessible"
    ASTERISK_VERSION=$(asterisk -rx "core show version" | head -1)
    echo "  → Version: $ASTERISK_VERSION"
else
    echo -e "$FAIL Asterisk CLI not accessible"
    OVERALL_STATUS=1
    echo "  → Check: sudo systemctl status asterisk"
fi

# Check required config files
if [ -f "/etc/asterisk/pjsip.conf" ]; then
    echo -e "$PASS /etc/asterisk/pjsip.conf exists"
else
    echo -e "$FAIL /etc/asterisk/pjsip.conf missing"
    OVERALL_STATUS=1
    echo "  → Deploy from: packages/ai-phone/config/pjsip.conf"
fi

if [ -f "/etc/asterisk/sorcery.conf" ]; then
    echo -e "$PASS /etc/asterisk/sorcery.conf exists"
else
    echo -e "$FAIL /etc/asterisk/sorcery.conf missing"
    OVERALL_STATUS=1
    echo "  → Deploy from: packages/ai-phone/config/sorcery.conf"
fi

echo ""

# ============================================================================
# PART 2: Configuration Syntax
# ============================================================================

echo -e "${BLUE}PART 2: Configuration Syntax${RESET}"
echo "--------"

# Validate PJSIP config
if asterisk -rx "config validate pjsip.conf" 2>&1 | grep -q "is valid"; then
    echo -e "$PASS pjsip.conf syntax valid"
else
    echo -e "$FAIL pjsip.conf syntax errors"
    OVERALL_STATUS=1
    echo "  → Errors:"
    asterisk -rx "config validate pjsip.conf" 2>&1 | sed 's/^/     /'
fi

# Check sorcery registration mapping
if grep -q "registration=config,pjsip.conf" /etc/asterisk/sorcery.conf; then
    echo -e "$PASS Sorcery registration mapping configured"
else
    echo -e "$FAIL Sorcery registration mapping missing"
    OVERALL_STATUS=1
    echo "  → Add to /etc/asterisk/sorcery.conf:"
    echo "     registration=config,pjsip.conf,criteria=type=registration"
fi

# Check for [twilio-registration] section
if grep -q "\[twilio-registration\]" /etc/asterisk/pjsip.conf; then
    echo -e "$PASS [twilio-registration] section exists"
else
    echo -e "$FAIL [twilio-registration] section missing"
    OVERALL_STATUS=1
fi

# Check for type=registration
if grep -A 10 "\[twilio-registration\]" /etc/asterisk/pjsip.conf 2>/dev/null | grep -q "type=registration"; then
    echo -e "$PASS type=registration configured"
else
    echo -e "$FAIL type=registration not found"
    OVERALL_STATUS=1
fi

echo ""

# ============================================================================
# PART 3: PJSIP Registration Status
# ============================================================================

echo -e "${BLUE}PART 3: PJSIP Registration Status${RESET}"
echo "--------"

# Get registration status
REGISTRATIONS=$(asterisk -rx "pjsip show registrations" 2>/dev/null | tail -n +4)

if [ -z "$REGISTRATIONS" ]; then
    echo -e "$FAIL No PJSIP registrations found"
    OVERALL_STATUS=1
    echo "  → Troubleshoot:"
    echo "     1. Check sorcery.conf has: registration=config,pjsip.conf,criteria=type=registration"
    echo "     2. Reload: asterisk -rx 'core reload'"
    echo "     3. Check logs: tail -50 /var/log/asterisk/messages.log | grep registration"
else
    echo -e "$PASS PJSIP registrations found:"
    echo "$REGISTRATIONS" | sed 's/^/  /'

    # Check Twilio registration specifically
    if echo "$REGISTRATIONS" | grep -q "twilio"; then
        if echo "$REGISTRATIONS" | grep "twilio" | grep -q "Registered"; then
            echo -e "$PASS Twilio registration: REGISTERED"
        else
            STATUS=$(echo "$REGISTRATIONS" | grep "twilio" | awk '{print $NF}')
            echo -e "$WARN Twilio registration status: $STATUS"
            echo "  → This may be normal if just started or if connection issues exist"
        fi
    else
        echo -e "$FAIL Twilio registration not found"
        OVERALL_STATUS=1
    fi
fi

echo ""

# ============================================================================
# PART 4: Twilio Credentials
# ============================================================================

echo -e "${BLUE}PART 4: Twilio Credentials${RESET}"
echo "--------"

# Check for placeholder values
if grep -q "TWILIO_ACCOUNT_SID\|TWILIO_AUTH_TOKEN" /etc/asterisk/pjsip.conf; then
    echo -e "$FAIL Twilio credentials still have placeholder values"
    OVERALL_STATUS=1
    echo "  → Replace in /etc/asterisk/pjsip.conf:"
    echo "     TWILIO_ACCOUNT_SID → Your Account SID"
    echo "     TWILIO_AUTH_TOKEN → Your Auth Token"
else
    echo -e "$PASS Twilio credentials appear configured"
fi

# Check auth configuration
if asterisk -rx "pjsip show auth twilio-auth" 2>/dev/null | grep -q "Type:"; then
    echo -e "$PASS twilio-auth configuration found"
    echo "  → Details:"
    asterisk -rx "pjsip show auth twilio-auth" 2>/dev/null | sed 's/^/     /'
else
    echo -e "$WARN twilio-auth not fully configured"
fi

echo ""

# ============================================================================
# PART 5: Network Connectivity
# ============================================================================

echo -e "${BLUE}PART 5: Network Connectivity${RESET}"
echo "--------"

# Check DNS resolution
if host sip-us1.twilio.com &>/dev/null; then
    IP=$(host sip-us1.twilio.com | head -1 | awk '{print $NF}')
    echo -e "$PASS DNS resolution works: sip-us1.twilio.com → $IP"
else
    echo -e "$WARN Cannot resolve sip-us1.twilio.com"
    echo "  → This may prevent registration from completing"
fi

# Check if port 5060 is listening
if netstat -tuln 2>/dev/null | grep -q ":5060"; then
    echo -e "$PASS Port 5060 (SIP) is listening"
else
    echo -e "$FAIL Port 5060 (SIP) not listening"
    OVERALL_STATUS=1
    echo "  → Check: sudo netstat -tuln | grep 5060"
fi

# Check firewall
if command -v ufw &>/dev/null; then
    if sudo ufw status | grep -q "5060.*ALLOW"; then
        echo -e "$PASS Firewall allows port 5060"
    else
        echo -e "$WARN Firewall may block port 5060"
        echo "  → Allow with: sudo ufw allow 5060/udp"
    fi
else
    echo -e "$INFO Firewall check skipped (ufw not installed)"
fi

echo ""

# ============================================================================
# PART 6: Dialplan Configuration
# ============================================================================

echo -e "${BLUE}PART 6: Dialplan Configuration${RESET}"
echo "--------"

# Check if from-twilio context exists
if asterisk -rx "dialplan show from-twilio" 2>/dev/null | grep -q "\[from-twilio\]"; then
    echo -e "$PASS [from-twilio] context configured"
else
    echo -e "$WARN [from-twilio] context not found"
    echo "  → Inbound calls from Twilio may not route correctly"
fi

# Check for AGI script
if [ -x "/var/lib/asterisk/agi-bin/ai-receptionist" ]; then
    echo -e "$PASS AGI script exists: /var/lib/asterisk/agi-bin/ai-receptionist"
else
    echo -e "$INFO AGI script not deployed (optional)"
    echo "  → Deploy from: packages/ai-phone/agi/ai-receptionist.sh"
fi

echo ""

# ============================================================================
# PART 7: Recent Logs
# ============================================================================

echo -e "${BLUE}PART 7: Recent Registration Logs${RESET}"
echo "--------"

if [ -f "/var/log/asterisk/messages.log" ]; then
    echo "Last 10 registration-related log entries:"
    grep -i "registration\|twilio" /var/log/asterisk/messages.log | tail -10 | sed 's/^/  /'
else
    echo -e "$INFO Asterisk log file not found at default location"
fi

echo ""

# ============================================================================
# PART 8: Recommended Actions
# ============================================================================

echo -e "${BLUE}PART 8: Recommended Actions${RESET}"
echo "--------"

if [ $OVERALL_STATUS -ne 0 ]; then
    echo "Issues detected. Recommended fixes:"
    echo ""
    echo "1. If registration not appearing:"
    echo "   → Verify sorcery.conf has: registration=config,pjsip.conf,criteria=type=registration"
    echo "   → Run: asterisk -rx 'core reload'"
    echo "   → Wait 30 seconds and check: asterisk -rx 'pjsip show registrations'"
    echo ""
    echo "2. If credentials error:"
    echo "   → Get credentials from: https://console.twilio.com/account"
    echo "   → Update /etc/asterisk/pjsip.conf with exact Account SID and Auth Token"
    echo "   → Restart: sudo systemctl restart asterisk"
    echo ""
    echo "3. If network error:"
    echo "   → Test: ping sip-us1.twilio.com"
    echo "   → Allow firewall: sudo ufw allow 5060/udp"
    echo "   → Check NAT/IP: asterisk -rx 'pjsip show endpoints'"
    echo ""
    echo "4. Enable debug logging:"
    echo "   → asterisk -rvvv"
    echo "   → core set verbose 5"
    echo "   → core set debug 5"
    echo "   → pjsip reload"
    echo "   → # Wait 30 seconds and watch output"
    echo ""
else
    echo "✅ All checks passed! Twilio BYOC appears to be working correctly."
    echo ""
    echo "Next steps:"
    echo "1. Place a test call to your Twilio BYOC number"
    echo "2. Verify Asterisk answers and routes to dialplan"
    echo "3. Monitor logs: tail -f /var/log/asterisk/messages.log"
fi

echo ""
echo "============================================================================"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}Status: ALL CHECKS PASSED${RESET}"
else
    echo -e "${RED}Status: ISSUES DETECTED${RESET}"
fi

echo "============================================================================"
echo ""

exit $OVERALL_STATUS
