#!/bin/bash

# WISE² Production Verification Script
# Run after deployment to verify all services are healthy

set -e

echo "════════════════════════════════════════════════════════════════"
echo "✅ WISE² Production Verification"
echo "════════════════════════════════════════════════════════════════"
echo ""

FAILED=0
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}

    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
        echo -e "${GREEN}✓ $name${NC}"
        return 0
    else
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        echo -e "${RED}✗ $name (HTTP $STATUS)${NC}"
        return 1
    fi
}

echo "1️⃣  Checking services status..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo ""
    docker-compose -f docker-compose.production.yml ps
    echo ""
else
    echo -e "${YELLOW}⚠ Docker not available for status check${NC}"
fi
echo ""

echo "2️⃣  Checking health endpoints..."
check_endpoint "http://127.0.0.1:3010/api/health" "API Health" || FAILED=1
check_endpoint "http://127.0.0.1:3011/" "Website" || FAILED=1
check_endpoint "http://127.0.0.1:3002/" "Dashboard" || FAILED=1
check_endpoint "http://127.0.0.1:3003/" "Admin" || FAILED=1
check_endpoint "http://127.0.0.1:3004/api/health" "Command-Center" || FAILED=1
check_endpoint "http://127.0.0.1:3005/" "Studio" || FAILED=1
check_endpoint "http://127.0.0.1:3020/" "Open WebUI" || FAILED=1
echo ""

echo "3️⃣  Checking database connectivity..."
if command -v docker &> /dev/null; then
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U postgres -h localhost &>/dev/null; then
        echo -e "${GREEN}✓ PostgreSQL${NC}"
    else
        echo -e "${RED}✗ PostgreSQL not responding${NC}"
        FAILED=1
    fi

    if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping &>/dev/null; then
        echo -e "${GREEN}✓ Redis${NC}"
    else
        echo -e "${RED}✗ Redis not responding${NC}"
        FAILED=1
    fi

    if docker-compose -f docker-compose.production.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        echo -e "${GREEN}✓ MongoDB${NC}"
    else
        echo -e "${YELLOW}⚠ MongoDB not responding (may be expected)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Docker not available for database checks${NC}"
fi
echo ""

echo "4️⃣  Checking AI services..."
check_endpoint "http://127.0.0.1:11434/api/tags" "Ollama" || true
check_endpoint "http://127.0.0.1:9090/-/healthy" "Prometheus" || true
check_endpoint "http://127.0.0.1:3100/api/health" "Grafana" || true
echo ""

echo "5️⃣  Checking logs for errors..."
if command -v docker &> /dev/null; then
    echo "API logs (last 10 lines):"
    docker-compose -f docker-compose.production.yml logs --tail=10 api 2>&1 | grep -E "(error|Error|ERROR|exception)" || echo -e "${GREEN}✓ No errors in API logs${NC}"

    echo ""
    echo "Worker logs (last 10 lines):"
    docker-compose -f docker-compose.production.yml logs --tail=10 worker 2>&1 | grep -E "(error|Error|ERROR|exception)" || echo -e "${GREEN}✓ No errors in Worker logs${NC}"
else
    echo -e "${YELLOW}⚠ Docker not available for log checking${NC}"
fi
echo ""

echo "6️⃣  Checking git repository..."
if git status --porcelain | grep -q .; then
    echo -e "${YELLOW}⚠ Working tree has uncommitted changes${NC}"
else
    echo -e "${GREEN}✓ Working tree clean${NC}"
fi
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo -e "${BLUE}Current commit: $CURRENT_COMMIT${NC}"
echo ""

echo "7️⃣  Checking disk usage..."
if command -v df &> /dev/null; then
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
    DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}')
    echo "Disk usage: $DISK_USAGE, Available: $DISK_AVAILABLE"

    AVAIL_GB=$(df / | awk 'NR==2 {print int($4/1024/1024)}')
    if [ $AVAIL_GB -lt 2 ]; then
        echo -e "${RED}✗ Critical: Less than 2GB disk available${NC}"
        FAILED=1
    elif [ $AVAIL_GB -lt 5 ]; then
        echo -e "${YELLOW}⚠ Warning: Less than 5GB disk available${NC}"
    else
        echo -e "${GREEN}✓ Sufficient disk space${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Cannot check disk space${NC}"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Production verification PASSED${NC}"
    echo -e "${BLUE}All critical services are healthy${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "- Monitor logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "- Check dashboards: http://localhost:3100 (Grafana)"
    echo "- View metrics: http://localhost:9090 (Prometheus)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Production verification FAILED${NC}"
    echo -e "${YELLOW}Some services are not healthy${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Troubleshooting:"
    echo "- Check docker-compose logs: docker-compose -f docker-compose.production.yml logs"
    echo "- Verify environment variables: cat .env.production"
    echo "- Check service status: docker-compose -f docker-compose.production.yml ps"
    echo ""
    exit 1
fi
