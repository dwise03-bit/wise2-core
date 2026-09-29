#!/bin/bash

# WISE² Comprehensive Health Check
# Monitors all production services and reports status
# Usage: ./scripts/health-check-comprehensive.sh [server] [user]

SERVER=${1:-173.208.147.165}
USER=${2:-dwise}
SSH_KEY="${HOME}/.ssh/wise2-deploy"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

log "WISE² Comprehensive Health Check"
log "Server: $SERVER | User: $USER"
log "=========================================="
log ""

# Remote health check
ssh -i "$SSH_KEY" "$USER@$SERVER" bash << 'REMOTE_SCRIPT'
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

REPO_DIR="/home/dwise/wise2-core"
FAILED=0
WARNING=0

# ============================================================================
# SYSTEM HEALTH
# ============================================================================
log ""
log "SYSTEM HEALTH"
log "=========================================="

# Disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
  pass "Disk usage: ${DISK_USAGE}%"
else
  if [ "$DISK_USAGE" -lt 90 ]; then
    warn "Disk usage high: ${DISK_USAGE}%"
    WARNING=$((WARNING + 1))
  else
    fail "Disk usage critical: ${DISK_USAGE}%"
    FAILED=$((FAILED + 1))
  fi
fi

# Memory
MEM_AVAILABLE=$(free -m | awk 'NR==2 {print $7}')
if [ "$MEM_AVAILABLE" -gt 1024 ]; then
  pass "Memory available: ${MEM_AVAILABLE}MB"
else
  warn "Memory low: ${MEM_AVAILABLE}MB"
  WARNING=$((WARNING + 1))
fi

# Docker
if command -v docker &> /dev/null; then
  RUNNING_CONTAINERS=$(docker ps -q | wc -l)
  pass "Docker running: $RUNNING_CONTAINERS containers"
else
  fail "Docker not installed"
  FAILED=$((FAILED + 1))
fi

# ============================================================================
# SERVICES
# ============================================================================
log ""
log "SERVICES"
log "=========================================="

cd "$REPO_DIR"

# Services to check
SERVICES=(
  "postgres:Database"
  "redis:Cache"
  "api:API Server"
  "website:Landing Page"
  "dashboard:Dashboard"
  "command-center:Command Center"
  "worker:Background Worker"
  "ollama:Ollama AI"
  "open-webui:Open WebUI"
)

for service_info in "${SERVICES[@]}"; do
  SERVICE=$(echo "$service_info" | cut -d: -f1)
  NAME=$(echo "$service_info" | cut -d: -f2)

  if docker-compose -f docker-compose.production.yml ps "$SERVICE" 2>/dev/null | grep -q "Up"; then
    pass "$NAME ($SERVICE) is running"
  else
    fail "$NAME ($SERVICE) is not running"
    FAILED=$((FAILED + 1))
  fi
done

# ============================================================================
# ENDPOINT HEALTH
# ============================================================================
log ""
log "ENDPOINT HEALTH"
log "=========================================="

check_endpoint() {
  local url=$1
  local name=$2
  local timeout=${3:-5}

  if curl -sf --max-time "$timeout" "$url" > /dev/null 2>&1; then
    pass "$name"
    return 0
  else
    fail "$name"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

check_endpoint "http://localhost:3011/" "Website (port 3011)"
check_endpoint "http://localhost:3002/" "Dashboard (port 3002)"
check_endpoint "http://localhost:3010/api/health" "API Health (port 3010)"
check_endpoint "http://localhost:3004/api/health" "Command Center (port 3004)"
check_endpoint "http://localhost:3020/health" "Open WebUI (port 3020)"

# ============================================================================
# DATABASE HEALTH
# ============================================================================
log ""
log "DATABASE HEALTH"
log "=========================================="

# PostgreSQL
if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
  CONN_COUNT=$(docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | grep -oE '[0-9]+' | tail -1)
  pass "PostgreSQL is healthy ($CONN_COUNT connections)"
else
  fail "PostgreSQL is not responding"
  FAILED=$((FAILED + 1))
fi

# Redis
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
  pass "Redis is healthy"
else
  fail "Redis is not responding"
  FAILED=$((FAILED + 1))
fi

# MongoDB
if docker-compose -f docker-compose.production.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  pass "MongoDB is healthy"
else
  fail "MongoDB is not responding"
  FAILED=$((FAILED + 1))
fi

# ============================================================================
# STORAGE & BACKUPS
# ============================================================================
log ""
log "STORAGE & BACKUPS"
log "=========================================="

# Check backup directory
BACKUP_COUNT=$(ls -1 /home/dwise/backups/*.sql 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 0 ]; then
  LATEST_BACKUP=$(ls -t /home/dwise/backups/*.sql 2>/dev/null | head -1)
  BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")))
  BACKUP_HOURS=$((BACKUP_AGE / 3600))

  if [ "$BACKUP_HOURS" -lt 48 ]; then
    pass "Latest backup: $BACKUP_HOURS hours ago"
  else
    warn "Latest backup is old: $BACKUP_HOURS hours ago"
    WARNING=$((WARNING + 1))
  fi
else
  warn "No backups found"
  WARNING=$((WARNING + 1))
fi

# Docker volume usage
VOLUME_USAGE=$(docker system df -v | grep -E "postgres_data|redis_data" | awk '{sum += $3} END {print sum / 1024 / 1024}')
if [ ! -z "$VOLUME_USAGE" ]; then
  pass "Docker volumes using ~${VOLUME_USAGE%.*}MB"
fi

# ============================================================================
# LOGS & ERRORS
# ============================================================================
log ""
log "RECENT LOGS"
log "=========================================="

# Check for errors in API logs
ERROR_COUNT=$(docker-compose -f docker-compose.production.yml logs api --tail=100 2>/dev/null | grep -i "error\|exception" | wc -l)
if [ "$ERROR_COUNT" -gt 0 ]; then
  warn "Found $ERROR_COUNT error messages in API logs"
  WARNING=$((WARNING + 1))
  echo "Sample errors:"
  docker-compose -f docker-compose.production.yml logs api --tail=10 2>/dev/null | grep -i "error\|exception" | head -3 | sed 's/^/  /'
else
  pass "No recent errors in API logs"
fi

# ============================================================================
# PERFORMANCE
# ============================================================================
log ""
log "PERFORMANCE"
log "=========================================="

# Check container resource usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -10

# ============================================================================
# SUMMARY
# ============================================================================
log ""
log "=========================================="
log "SUMMARY"
log "=========================================="

if [ "$FAILED" -eq 0 ] && [ "$WARNING" -eq 0 ]; then
  pass "All systems operational! ✅"
  exit 0
elif [ "$FAILED" -eq 0 ]; then
  warn "All critical systems running, but $WARNING warning(s) detected"
  exit 0
else
  fail "$FAILED critical issue(s) detected, $WARNING warning(s)"
  exit 1
fi
REMOTE_SCRIPT

echo ""
log "Health check complete!"
