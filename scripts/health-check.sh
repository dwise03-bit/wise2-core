#!/bin/bash

# WISE² Health Check Script
# Monitors all production services and alerts on failures

set -e

API_URL="${API_URL:-https://api.wise2.net}"
DASHBOARD_URL="${DASHBOARD_URL:-https://wise2.net}"
HEALTH_LOG="/var/log/wise2-health.log"
ALERT_EMAIL="${ALERT_EMAIL}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $@" >> "$HEALTH_LOG"
  echo -e "$@"
}

alert() {
  if [ -n "$ALERT_EMAIL" ]; then
    echo "$1" | mail -s "WISE² Alert: $(date +'%Y-%m-%d %H:%M:%S')" "$ALERT_EMAIL"
  fi
  log "${RED}ALERT: $1${NC}"
}

# Check API Health
check_api() {
  if curl -sf "$API_URL/health" > /dev/null 2>&1; then
    log "${GREEN}✅ API Health: OK${NC}"
    return 0
  else
    alert "API Health Check Failed"
    return 1
  fi
}

# Check Dashboard Health
check_dashboard() {
  if curl -sf "$DASHBOARD_URL" > /dev/null 2>&1; then
    log "${GREEN}✅ Dashboard: OK${NC}"
    return 0
  else
    alert "Dashboard Health Check Failed"
    return 1
  fi
}

# Check Database
check_database() {
  if sudo -u postgres psql -h localhost -U wise2_prod -d wise2_prod -c "SELECT 1" > /dev/null 2>&1; then
    log "${GREEN}✅ Database: OK${NC}"
    return 0
  else
    alert "Database Connection Failed"
    return 1
  fi
}

# Check Redis
check_redis() {
  if redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    log "${GREEN}✅ Redis: OK${NC}"
    return 0
  else
    alert "Redis Connection Failed"
    return 1
  fi
}

# Check Disk Space
check_disk() {
  DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ "$DISK_USAGE" -gt 80 ]; then
    alert "Disk Usage Critical: ${DISK_USAGE}%"
    return 1
  else
    log "${GREEN}✅ Disk Space: ${DISK_USAGE}%${NC}"
    return 0
  fi
}

# Check Memory
check_memory() {
  MEM_USAGE=$(free | awk 'NR==2{printf("%.0f", $3/$2 * 100)}')
  if [ "$MEM_USAGE" -gt 90 ]; then
    alert "Memory Usage Critical: ${MEM_USAGE}%"
    return 1
  else
    log "${GREEN}✅ Memory: ${MEM_USAGE}%${NC}"
    return 0
  fi
}

# Check Docker Services
check_docker() {
  CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps -q 2>/dev/null | wc -l)
  RUNNING=$(docker-compose -f docker-compose.prod.yml ps --filter "status=running" -q 2>/dev/null | wc -l)

  if [ "$CONTAINERS" -eq "$RUNNING" ]; then
    log "${GREEN}✅ Docker Services: $RUNNING/$CONTAINERS Running${NC}"
    return 0
  else
    alert "Docker Service Failure: Only $RUNNING/$CONTAINERS running"
    return 1
  fi
}

# Run all checks
log "========== WISE² Health Check $(date +'%Y-%m-%d %H:%M:%S') =========="

FAILED=0
check_api || ((FAILED++))
check_dashboard || ((FAILED++))
check_database || ((FAILED++))
check_redis || ((FAILED++))
check_disk || ((FAILED++))
check_memory || ((FAILED++))
check_docker || ((FAILED++))

log "========== Summary: $FAILED Check(s) Failed =========="

exit $FAILED
