#!/bin/bash
set -e

echo "🔐 Blakkhail Admin Deployment Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="dwise"
REMOTE_HOST="173.208.147.165"
REMOTE_PATH="/opt/wise2-core/apps/website"
ADMIN_SERVICE_PORT="3011"

# Deploy to remote server
deploy() {
    echo -e "${YELLOW}[1/4] Building Next.js app...${NC}"
    ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm run build" > /dev/null 2>&1

    echo -e "${YELLOW}[2/4] Restarting website service...${NC}"
    ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "pm2 restart website" > /dev/null 2>&1

    echo -e "${YELLOW}[3/4] Verifying services...${NC}"
    sleep 3

    # Check website service
    STATUS=$(ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "pm2 list | grep website | grep online | wc -l")
    if [ "$STATUS" -eq 1 ]; then
        echo -e "${GREEN}✓ Website service online${NC}"
    else
        echo -e "${RED}✗ Website service failed${NC}"
        exit 1
    fi

    echo -e "${YELLOW}[4/4] Testing deployment...${NC}"

    # Test admin login endpoint
    RESPONSE=$(curl -s -X POST https://blakkhail.com/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test"}' | grep -o 'error\|success' || echo "error")

    if [ "$RESPONSE" != "error" ]; then
        echo -e "${GREEN}✓ API endpoint responding${NC}"
    else
        echo -e "${YELLOW}⚠ API endpoint needs verification${NC}"
    fi

    echo -e "${GREEN}======================================"
    echo "✓ Deployment complete!${NC}"
    echo ""
    echo "Access points:"
    echo "  - Login page: https://blakkhail.com/blakkhail-admin-tv-login.html"
    echo "  - Dashboard: https://blakkhail.com/blakkhail-admin-dashboard.html"
    echo "  - Store: https://blakkhail.com/sencere/blakkhail"
    echo ""
    echo "Credentials:"
    echo "  - Email: blakkhail@gmail.com"
    echo "  - Password: Piffcity"
}

# Show status
status() {
    echo "Checking Blakkhail services..."
    ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "pm2 list | grep -E 'website|admin'"
}

# Show logs
logs() {
    echo "Website service logs:"
    ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "pm2 logs website --lines 50" 2>/dev/null | tail -50 || echo "Logs unavailable"
}

# Main
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "Usage: $0 {deploy|status|logs}"
        exit 1
        ;;
esac
