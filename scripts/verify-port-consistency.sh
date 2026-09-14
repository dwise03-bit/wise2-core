#!/bin/bash
# WISE² Port Consistency Validator
# CRITICAL: Run before ANY deployment. Prevents 502 errors from port mismatches.
# Usage: bash scripts/verify-port-consistency.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        WISE² Port Consistency Validator (PRE-DEPLOYMENT)      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo

# ============================================================================
# LOCKED VALUES (DO NOT CHANGE)
# ============================================================================
WEBSITE_PORT="3001"
API_PORT="3010"
ADMIN_BACKEND_PORT="3014"
COMMAND_CENTER_PORT="3004"
STUDIO_PORT="3005"
PROMPT_SHOP_PORT="3002"

echo "📋 Locked Port Configuration:"
echo "  • Website:          $WEBSITE_PORT"
echo "  • API:              $API_PORT"
echo "  • Admin Backend:    $ADMIN_BACKEND_PORT"
echo "  • Command Center:   $COMMAND_CENTER_PORT"
echo "  • Studio:           $STUDIO_PORT"
echo "  • Prompt Shop:      $PROMPT_SHOP_PORT"
echo

# ============================================================================
# CHECK 1: Docker Compose Files
# ============================================================================
echo "🐳 Checking docker-compose files..."

# Check docker-compose.prod.yml
if grep -q "0.0.0.0:$WEBSITE_PORT:3000" docker-compose.prod.yml 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} docker-compose.prod.yml: website → $WEBSITE_PORT"
else
    echo -e "  ${RED}✗${NC} docker-compose.prod.yml: website port mismatch!"
    grep "website:" -A 30 docker-compose.prod.yml | grep "ports:" -A 2
    ERRORS=$((ERRORS + 1))
fi

# Check docker-compose.production.yml
if grep -q "0.0.0.0:$WEBSITE_PORT:3000" docker-compose.production.yml 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} docker-compose.production.yml: website → $WEBSITE_PORT"
else
    echo -e "  ${RED}✗${NC} docker-compose.production.yml: website port mismatch!"
    grep "website:" -A 30 docker-compose.production.yml | grep "ports:" -A 2
    ERRORS=$((ERRORS + 1))
fi

# Verify no port 3011 exists (old stale port)
if grep -r "3011" docker-compose.*.yml 2>/dev/null; then
    echo -e "  ${RED}✗${NC} ERROR: Old port 3011 found in compose files (MUST BE 3001)"
    grep -r "3011" docker-compose.*.yml
    ERRORS=$((ERRORS + 1))
else
    echo -e "  ${GREEN}✓${NC} No stale port 3011 found"
fi

echo

# ============================================================================
# CHECK 2: Nginx Configuration Files
# ============================================================================
echo "🌐 Checking nginx configs..."

# Check blakkhail.com.conf
if grep -q "server 127.0.0.1:$WEBSITE_PORT" infrastructure/nginx/blakkhail.com.conf 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} blakkhail.com.conf: upstream → $WEBSITE_PORT"
else
    echo -e "  ${RED}✗${NC} blakkhail.com.conf: upstream port mismatch!"
    grep "upstream blakkhail_website" -A 2 infrastructure/nginx/blakkhail.com.conf
    ERRORS=$((ERRORS + 1))
fi

# Check wise2.net.conf
if grep -q "server 127.0.0.1:$WEBSITE_PORT" infrastructure/nginx/wise2.net.conf 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} wise2.net.conf: upstream → $WEBSITE_PORT"
else
    echo -e "  ${RED}✗${NC} wise2.net.conf: upstream port mismatch!"
    grep "upstream website_backend" -A 2 infrastructure/nginx/wise2.net.conf
    ERRORS=$((ERRORS + 1))
fi

# Verify no port 3011 in nginx
if grep -r "3011" infrastructure/nginx/*.conf 2>/dev/null; then
    echo -e "  ${RED}✗${NC} ERROR: Old port 3011 found in nginx configs (MUST BE 3001)"
    grep -r "3011" infrastructure/nginx/*.conf
    ERRORS=$((ERRORS + 1))
else
    echo -e "  ${GREEN}✓${NC} No stale port 3011 found"
fi

echo

# ============================================================================
# CHECK 3: SSL Certificate Paths
# ============================================================================
echo "🔒 Checking SSL certificate paths..."

# Check blakkhail.com certs use correct path
if grep -q "/etc/nginx/ssl/blakkhail.com/" infrastructure/nginx/blakkhail.com.conf 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} blakkhail.com.conf: SSL path → /etc/nginx/ssl/blakkhail.com/"
else
    echo -e "  ${YELLOW}⚠${NC}  blakkhail.com.conf: SSL path may be incorrect"
    grep "ssl_certificate" infrastructure/nginx/blakkhail.com.conf | head -3
    WARNINGS=$((WARNINGS + 1))
fi

# Verify no Let's Encrypt paths (they may not exist at deploy time)
if grep -r "/etc/letsencrypt/live/" infrastructure/nginx/blakkhail.com.conf 2>/dev/null; then
    echo -e "  ${YELLOW}⚠${NC}  WARNING: Let's Encrypt template paths found (may not exist)"
    grep "/etc/letsencrypt" infrastructure/nginx/blakkhail.com.conf
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "  ${GREEN}✓${NC} No template SSL paths found"
fi

echo

# ============================================================================
# CHECK 4: Consistency Across All Files
# ============================================================================
echo "🔄 Cross-file consistency check..."

COMPOSE_PROD_PORTS=$(grep -o "0.0.0.0:[0-9]*:3000" docker-compose.prod.yml | grep -o "[0-9]*:3000" | cut -d: -f1 | sort -u)
COMPOSE_PRODUCTION_PORTS=$(grep -o "0.0.0.0:[0-9]*:3000" docker-compose.production.yml | grep -o "[0-9]*:3000" | cut -d: -f1 | sort -u)

if [ "$COMPOSE_PROD_PORTS" = "$COMPOSE_PRODUCTION_PORTS" ]; then
    echo -e "  ${GREEN}✓${NC} Both compose files use same website port: $WEBSITE_PORT"
else
    echo -e "  ${RED}✗${NC} ERROR: Compose files have DIFFERENT website ports!"
    echo "    docker-compose.prod.yml:        $COMPOSE_PROD_PORTS"
    echo "    docker-compose.production.yml:  $COMPOSE_PRODUCTION_PORTS"
    ERRORS=$((ERRORS + 1))
fi

echo

# ============================================================================
# SUMMARY
# ============================================================================
echo "╔════════════════════════════════════════════════════════════════╗"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "║  ${GREEN}✓ ALL CHECKS PASSED - SAFE TO DEPLOY${NC}                          ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "║  ${YELLOW}⚠ $WARNINGS WARNINGS - Review before deploy${NC}                   ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    exit 0
else
    echo -e "║  ${RED}✗ $ERRORS ERRORS FOUND - DO NOT DEPLOY${NC}                       ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo
    echo -e "${RED}DEPLOYMENT BLOCKED: Fix port mismatches before proceeding.${NC}"
    echo "See: docs/PORT_MAPPING_FIX.md"
    exit 1
fi
