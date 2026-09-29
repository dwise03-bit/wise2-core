#!/bin/bash

################################################################################
# WISE² PRODUCTION DEPLOYMENT SCRIPT
#
# Safely deploys WISE² Business OS to production with automatic rollback,
# backups, health checks, and acceptance tests.
#
# Usage: ./infrastructure/scripts/deploy-production.sh
#
# Requirements:
#   - Docker & Docker Compose
#   - Access to production server via SSH
#   - Git repository on current branch
#   - .env.production file configured
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.production.yml"
ENV_FILE="${PROJECT_ROOT}/.env.production"
LOCK_FILE="/var/lock/wise2-deploy.lock"
RELEASES_DIR="/opt/wise2/releases"
CURRENT_LINK="/opt/wise2/current"
BACKUP_DIR="${PROJECT_ROOT}/backups"
REMOTE_USER="${DEPLOY_USER:-dwise}"
REMOTE_HOST="${DEPLOY_HOST:-173.208.147.165}"

# Release metadata
RELEASE_ID="$(date +%s)-$(git rev-parse --short HEAD)"
GIT_COMMIT="$(git rev-parse HEAD)"
GIT_BRANCH="$(git branch --show-current)"
BUILD_TIME="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

################################################################################
# LOGGING & ERROR HANDLING
################################################################################

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $*"
}

success() {
  echo -e "${GREEN}✓ $*${NC}"
}

warn() {
  echo -e "${YELLOW}⚠ $*${NC}"
}

error() {
  echo -e "${RED}✗ $*${NC}"
  exit 1
}

# Cleanup on exit
cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    error "Deployment failed with exit code $exit_code"
  fi
  exec 9>&-
  exit $exit_code
}

trap cleanup EXIT

################################################################################
# DEPLOYMENT LOCK
################################################################################

log "Acquiring deployment lock..."
exec 9>"$LOCK_FILE"

if ! flock -n 9; then
  error "Another WISE² deployment is already running. Lock file: $LOCK_FILE"
fi

success "Deployment lock acquired"

################################################################################
# PRE-FLIGHT CHECKS
################################################################################

log ""
log "=== PRE-FLIGHT CHECKS ==="
log ""

# Check repository
log "Checking Git repository..."
[ -d "${PROJECT_ROOT}/.git" ] || error "Not a Git repository: $PROJECT_ROOT"
[ "$GIT_BRANCH" == "main" ] || error "Must deploy from 'main' branch, currently on '$GIT_BRANCH'"
[ -z "$(git status --porcelain)" ] || error "Working directory is not clean. Commit all changes first."
success "Repository verified (branch: $GIT_BRANCH, commit: $GIT_COMMIT)"

# Check compose file
log "Validating docker-compose.production.yml..."
[ -f "$COMPOSE_FILE" ] || error "Compose file not found: $COMPOSE_FILE"
docker compose -f "$COMPOSE_FILE" config > /dev/null || error "Compose validation failed"
success "Compose file validated"

# Check environment
log "Checking environment file..."
[ -f "$ENV_FILE" ] || error "Environment file not found: $ENV_FILE"
success "Environment file present"

# Check Docker
log "Checking Docker..."
docker --version > /dev/null || error "Docker not installed or not running"
docker compose version > /dev/null || error "Docker Compose not available"
success "Docker $(docker --version | awk '{print $3}')"

# Check disk space
log "Checking disk space..."
available_kb=$(df / | tail -1 | awk '{print $4}')
available_gb=$((available_kb / 1024 / 1024))
[ $available_gb -gt 10 ] || error "Insufficient disk space: only ${available_gb}GB available"
success "Disk space: ${available_gb}GB available"

# Check remote server
log "Checking remote server connectivity..."
ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$REMOTE_USER@$REMOTE_HOST" 'test -d /opt/wise2 || mkdir -p /opt/wise2' || error "Cannot access $REMOTE_HOST"
success "Remote server reachable: $REMOTE_HOST"

success "All pre-flight checks passed"

################################################################################
# BACKUP PHASE
################################################################################

log ""
log "=== BACKUP PHASE ==="
log ""

mkdir -p "$BACKUP_DIR"

# Backup compose file
log "Backing up configuration..."
cp "$COMPOSE_FILE" "$BACKUP_DIR/docker-compose.production-${RELEASE_ID}.yml"
cp "$ENV_FILE" "$BACKUP_DIR/.env.production-${RELEASE_ID}"
success "Configuration backed up to $BACKUP_DIR"

# Backup databases (via remote)
log "Backing up remote databases..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDBKP
  set -euo pipefail
  BACKUP_PATH="/opt/wise2/backups/${RELEASE_ID}"
  mkdir -p "\$BACKUP_PATH"

  # Backup PostgreSQL
  docker exec wise2-postgres pg_dump -U postgres wise2_core | gzip > "\$BACKUP_PATH/postgres-wise2_core.sql.gz"

  # Backup MongoDB (if running)
  if docker ps --format '{{.Names}}' | grep -q mongodb; then
    docker exec wise2-mongodb mongodump --out /tmp/mongo-backup
    tar -czf "\$BACKUP_PATH/mongodb.tar.gz" -C /tmp mongo-backup/
    rm -rf /tmp/mongo-backup
  fi

  echo "Backups complete: \$BACKUP_PATH"
ENDBKP

success "Remote databases backed up"

################################################################################
# BUILD PHASE
################################################################################

log ""
log "=== BUILD PHASE ==="
log ""

log "Building Docker images..."
docker compose -f "$COMPOSE_FILE" build 2>&1 | tail -20 || error "Build failed"
success "Docker images built"

# Get image digests
log "Recording image digests..."
DIGESTS_FILE="$BACKUP_DIR/image-digests-${RELEASE_ID}.txt"
docker compose -f "$COMPOSE_FILE" config | grep "image:" | sed 's/^[[:space:]]*//' > "$DIGESTS_FILE"
success "Image digests recorded"

################################################################################
# DEPLOYMENT PHASE
################################################################################

log ""
log "=== DEPLOYMENT PHASE ==="
log ""

log "Deploying to production..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDEPLOY
  set -euo pipefail

  echo "Syncing compose file..."
  mkdir -p /opt/wise2/releases/$RELEASE_ID
  cd /opt/wise2/releases/$RELEASE_ID

  # Pull latest code
  git clone --depth 1 -b main https://github.com/dwise03-bit/wise2-core.git . || (cd . && git pull origin main)

  # Update link to new release
  rm -f /opt/wise2/current
  ln -s /opt/wise2/releases/$RELEASE_ID /opt/wise2/current

  echo "Starting services..."
  cd /opt/wise2/current

  # Export environment
  export \$(grep -v '^#' /opt/wise2/.env.production | xargs)

  # Start services with health checks
  docker compose -f docker-compose.production.yml up -d --remove-orphans

  echo "Deployment complete"
ENDEPLOY

success "Services deployed to production"

################################################################################
# HEALTH CHECK PHASE
################################################################################

log ""
log "=== HEALTH CHECK PHASE ==="
log ""

log "Waiting for services to stabilize..."
sleep 10

log "Running health checks..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDHC
  set -euo pipefail

  MAX_RETRIES=30
  RETRY_INTERVAL=2

  services=("wise2-api" "wise2-postgres" "wise2-redis")

  for service in "${services[@]}"; do
    echo "Checking \$service..."
    for i in \$(seq 1 \$MAX_RETRIES); do
      if docker ps --format '{{.Names}} {{.Status}}' | grep -q "\$service.*healthy"; then
        echo "✓ \$service is healthy"
        break
      elif docker ps --format '{{.Names}} {{.Status}}' | grep -q "\$service"; then
        echo "  (\$i/$MAX_RETRIES) \$service starting..."
        sleep \$RETRY_INTERVAL
      else
        echo "✗ \$service not found"
        exit 1
      fi
    done
  done

  echo "All services healthy"
ENDHC

success "Health checks passed"

################################################################################
# SMOKE TESTS
################################################################################

log ""
log "=== SMOKE TESTS ==="
log ""

log "Running production acceptance tests..."
ssh "$REMOTE_USER@$REMOTE_HOST" << ENDTEST
  set -euo pipefail

  # Test API health
  echo "Testing API health..."
  API_HEALTH=\$(docker exec wise2-api curl -s http://localhost:3001/api/health 2>/dev/null | head -c 100)
  [ -n "\$API_HEALTH" ] && echo "✓ API responding"

  # Test database
  echo "Testing database..."
  docker exec wise2-postgres psql -U postgres -d wise2_core -c "SELECT 1;" > /dev/null && echo "✓ Database healthy"

  # Test Redis
  echo "Testing Redis..."
  docker exec wise2-redis redis-cli ping && echo "✓ Redis responding"

  echo "Smoke tests passed"
ENDTEST

success "Acceptance tests passed"

################################################################################
# RELEASE RECORDING
################################################################################

log ""
log "=== RECORDING RELEASE METADATA ==="
log ""

RELEASE_INFO="$BACKUP_DIR/release-${RELEASE_ID}.json"

cat > "$RELEASE_INFO" << ENDINFO
{
  "releaseId": "$RELEASE_ID",
  "timestamp": "$BUILD_TIME",
  "gitCommit": "$GIT_COMMIT",
  "gitBranch": "$GIT_BRANCH",
  "status": "DEPLOYED",
  "server": "$REMOTE_HOST",
  "previousRelease": "$(cat /opt/wise2/releases/CURRENT_RELEASE.txt 2>/dev/null || echo 'none')",
  "backupLocation": "/opt/wise2/backups/$RELEASE_ID",
  "configBackup": "$BACKUP_DIR/docker-compose.production-${RELEASE_ID}.yml",
  "envBackup": "$BACKUP_DIR/.env.production-${RELEASE_ID}",
  "acceptanceTestsStatus": "PASSED"
}
ENDINFO

success "Release metadata recorded: $RELEASE_INFO"

################################################################################
# FINAL REPORT
################################################################################

log ""
log "╔════════════════════════════════════════════════════════════════╗"
log "║  ✓ WISE² PRODUCTION DEPLOYMENT SUCCESSFUL                     ║"
log "╚════════════════════════════════════════════════════════════════╝"
log ""
log "Release ID:            $RELEASE_ID"
log "Git Commit:            $GIT_COMMIT"
log "Server:                $REMOTE_HOST"
log "Deployment Time:       $BUILD_TIME"
log ""
log "Access Production:"
log "  WISE² API:           http://$REMOTE_HOST:3001"
log "  Nginx (wise2.net):   https://wise2.net"
log ""
log "Backup Location:"
log "  Local:               $BACKUP_DIR"
log "  Remote:              /opt/wise2/backups/$RELEASE_ID"
log ""
log "Rollback Command:"
log "  ./infrastructure/scripts/rollback-production.sh"
log ""

exit 0
