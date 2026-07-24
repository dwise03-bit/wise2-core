#!/bin/bash

# Comprehensive Server Audit Script
# Checks for conflicts before Wise² Core deployment to 173.208.147.165

set -e

echo "🔍 WISE² CORE SERVER AUDIT"
echo "============================"
echo "Server: 173.208.147.165"
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check and report findings
check_port() {
    local port=$1
    local service=$2
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${RED}⚠️  PORT $port IN USE${NC} - $service"
        netstat -tuln 2>/dev/null | grep ":$port " | awk '{print "   " $0}'
        return 1
    else
        echo -e "${GREEN}✓ PORT $port FREE${NC} - $service"
        return 0
    fi
}

check_process() {
    local process=$1
    if pgrep -f "$process" > /dev/null; then
        echo -e "${RED}⚠️  PROCESS RUNNING${NC} - $process"
        pgrep -f "$process" | while read pid; do
            echo "   PID: $pid - $(ps -p $pid -o comm=)"
        done
        return 1
    else
        echo -e "${GREEN}✓ PROCESS NOT RUNNING${NC} - $process"
        return 0
    fi
}

# ============================================================================
# SECTION 1: SYSTEM INFO
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "01 — SYSTEM INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OS: $(lsb_release -ds 2>/dev/null || echo 'Unknown')"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime -p)"
echo "CPU Cores: $(nproc)"
echo "RAM: $(free -h | awk 'NR==2 {print $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $2 " total, " $4 " available"}')"
echo ""

# ============================================================================
# SECTION 2: PORT CONFLICTS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "02 — PORT AVAILABILITY (Required for Wise² Core)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PORT_CONFLICTS=0

check_port 80 "HTTP (Nginx)" || ((PORT_CONFLICTS++))
check_port 443 "HTTPS (Nginx)" || ((PORT_CONFLICTS++))
check_port 3000 "Dashboard (Frontend)" || ((PORT_CONFLICTS++))
check_port 3001 "API Service" || ((PORT_CONFLICTS++))
check_port 3002 "Admin Dashboard" || ((PORT_CONFLICTS++))
check_port 5432 "PostgreSQL" || ((PORT_CONFLICTS++))
check_port 6379 "Redis" || ((PORT_CONFLICTS++))
check_port 9090 "Prometheus" || ((PORT_CONFLICTS++))
check_port 3001 "Grafana" || ((PORT_CONFLICTS++))

echo ""
if [ $PORT_CONFLICTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL REQUIRED PORTS ARE FREE${NC}"
else
    echo -e "${RED}⚠️  $PORT_CONFLICTS PORT(S) IN USE - CONFLICTS DETECTED${NC}"
fi
echo ""

# ============================================================================
# SECTION 3: RUNNING SERVICES
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "03 — RUNNING SERVICES & PROCESSES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SERVICE_CONFLICTS=0

check_process "nginx" || ((SERVICE_CONFLICTS++))
check_process "docker" || echo -e "${YELLOW}✓ Docker installed/available${NC}"
check_process "postgres" || echo -e "${GREEN}✓ PostgreSQL not running${NC}"
check_process "redis" || echo -e "${GREEN}✓ Redis not running${NC}"
check_process "node" || echo -e "${GREEN}✓ Node processes not running${NC}"

echo ""
echo "Active listening services:"
netstat -tuln 2>/dev/null | grep LISTEN | awk '{print "  " $4 " — " $1}' || echo "  (none)"
echo ""

# ============================================================================
# SECTION 4: DOCKER STATUS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "04 — DOCKER STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker installed${NC}"
    echo "  Version: $(docker --version)"

    RUNNING_CONTAINERS=$(docker ps --quiet 2>/dev/null | wc -l)
    ALL_CONTAINERS=$(docker ps -a --quiet 2>/dev/null | wc -l)

    echo "  Running containers: $RUNNING_CONTAINERS"
    echo "  Total containers: $ALL_CONTAINERS"

    if [ "$RUNNING_CONTAINERS" -gt 0 ]; then
        echo -e "  ${YELLOW}⚠️  Containers currently running:${NC}"
        docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | tail -n +2 | awk '{print "     " $0}'
    else
        echo -e "  ${GREEN}✓ No containers running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not installed${NC}"
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
    echo "  Version: $(docker-compose --version 2>/dev/null | cut -d' ' -f3)"
else
    echo -e "${YELLOW}⚠️  Docker Compose not installed${NC}"
fi
echo ""

# ============================================================================
# SECTION 5: DISK & STORAGE
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "05 — DISK & STORAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
df -h | awk 'NR==1 {print "  " $0} NR>1 {printf "  %-20s %8s %8s %8s %5s %s\n", $1, $2, $3, $4, $5, $6}'
echo ""

# ============================================================================
# SECTION 6: FIREWALL STATUS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "06 — FIREWALL & SECURITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null | head -1)
    echo "UFW: $UFW_STATUS"
    if [ "$UFW_STATUS" = "Status: active" ]; then
        echo "  Rules:"
        ufw status | grep -E "^[0-9]|^To" | awk '{print "    " $0}'
    fi
else
    echo "UFW not installed"
fi

if command -v iptables &> /dev/null; then
    echo ""
    echo "iptables (INPUT chain):"
    iptables -L INPUT -n 2>/dev/null | head -5 | tail -3 | awk '{print "  " $0}' || echo "  (unable to read)"
fi
echo ""

# ============================================================================
# SECTION 7: SSL CERTIFICATES
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "07 — SSL CERTIFICATES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "/etc/letsencrypt/live" ]; then
    CERT_COUNT=$(find /etc/letsencrypt/live -type d -mindepth 1 -maxdepth 1 | wc -l)
    echo "Let's Encrypt certificates: $CERT_COUNT found"
    find /etc/letsencrypt/live -type d -mindepth 1 -maxdepth 1 -exec basename {} \; | while read domain; do
        if [ -f "/etc/letsencrypt/live/$domain/cert.pem" ]; then
            expiry=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" 2>/dev/null | cut -d= -f2)
            echo "  - $domain (expires: $expiry)"
        fi
    done
else
    echo -e "${YELLOW}⚠️  No SSL certificates found${NC}"
fi
echo ""

# ============================================================================
# SECTION 8: EXISTING DIRECTORIES & CONFLICTS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "08 — EXISTING DIRECTORIES (Wise² Core will use /opt)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "/opt/wise2-core" ]; then
    echo -e "${YELLOW}⚠️  /opt/wise2-core ALREADY EXISTS${NC}"
    du -sh /opt/wise2-core
    echo "  Contents:"
    ls -la /opt/wise2-core | head -10 | tail -9 | awk '{print "    " $0}'
else
    echo -e "${GREEN}✓ /opt/wise2-core does not exist (safe to create)${NC}"
fi

if [ -d "/opt" ]; then
    TOTAL_SIZE=$(du -sh /opt 2>/dev/null | cut -f1)
    echo "  Total /opt size: $TOTAL_SIZE"
else
    echo -e "${GREEN}✓ /opt directory ready to be created${NC}"
fi
echo ""

# ============================================================================
# SECTION 9: NETWORK CONFIGURATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "09 — NETWORK CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "IP Address:"
hostname -I | awk '{for(i=1;i<=NF;i++) print "  " $i}'

echo ""
echo "DNS Configuration:"
cat /etc/resolv.conf 2>/dev/null | grep -E "^nameserver" | awk '{print "  " $0}' || echo "  (unable to read)"

echo ""
echo "Hostname:"
echo "  $(hostname)"
echo ""

# ============================================================================
# SECTION 10: SUMMARY & RECOMMENDATIONS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10 — AUDIT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_ISSUES=$((PORT_CONFLICTS + SERVICE_CONFLICTS))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ SERVER READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Update DNS: Point wise2.net A record to 173.208.147.165"
    echo "  2. SSH to server: ssh root@173.208.147.165"
    echo "  3. Clone repo: cd /opt && git clone <repo>"
    echo "  4. Run deployment: ./deploy.sh"
    echo ""
else
    echo -e "${RED}❌ CONFLICTS DETECTED - CANNOT DEPLOY${NC}"
    echo ""
    echo "Issues found: $TOTAL_ISSUES"
    echo "  - Port conflicts: $PORT_CONFLICTS"
    echo "  - Service conflicts: $SERVICE_CONFLICTS"
    echo ""
    echo "Resolution:"
    echo "  1. Stop conflicting services"
    echo "  2. Free up required ports (80, 443, 3000, 3001, 3002, 5432, 6379, 9090)"
    echo "  3. Re-run audit to verify"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Audit completed: $(date)"
echo ""
