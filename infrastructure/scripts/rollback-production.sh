#!/bin/bash

################################################################################
# WISE² PRODUCTION ROLLBACK SCRIPT
#
# Safely rolls back to the previous production release
#
# Usage: ./infrastructure/scripts/rollback-production.sh [RELEASE_ID]
################################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
RELEASES_DIR="/opt/wise2/releases"
REMOTE_USER="${DEPLOY_USER:-dwise}"
REMOTE_HOST="${DEPLOY_HOST:-173.208.147.165}"

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $*"
}

success() {
  echo -e "${GREEN}✓ $*${NC}"
}

error() {
  echo -e "${RED}✗ $*${NC}"
  exit 1
}

################################################################################
# FIND PREVIOUS RELEASE
################################################################################

log "Discovering available releases..."

if [ -z "${1:-}" ]; then
  # Find most recent previous release
  RELEASES=$(ssh "$REMOTE_USER@$REMOTE_HOST" "ls -1d $RELEASES_DIR/*/ 2>/dev/null | tail -2")
  PREV_RELEASE=$(echo "$RELEASES" | head -1 | xargs basename)
else
  PREV_RELEASE="$1"
fi

[ -n "$PREV_RELEASE" ] || error "No previous release found. Cannot rollback."

log "Previous release: $PREV_RELEASE"

################################################################################
# BACKUP CURRENT RELEASE
################################################################################

log "Backing up current state..."
ROLLBACK_BACKUP="/opt/wise2/backups/pre-rollback-$(date +%s).tar.gz"

ssh "$REMOTE_USER@$REMOTE_HOST" "tar -czf $ROLLBACK_BACKUP /opt/wise2/current 2>/dev/null || true"

success "Backup created: $ROLLBACK_BACKUP"

################################################################################
# ROLLBACK SERVICES
################################################################################

log "Rolling back to release: $PREV_RELEASE"

ssh "$REMOTE_USER@$REMOTE_HOST" << ENDROLLBACK
  set -euo pipefail

  # Remove current link
  rm -f /opt/wise2/current

  # Create new link to previous release
  ln -s $RELEASES_DIR/$PREV_RELEASE /opt/wise2/current

  cd /opt/wise2/current

  # Restart services
  docker compose -f docker-compose.production.yml down
  sleep 5
  docker compose -f docker-compose.production.yml up -d

  echo "Rollback complete"
ENDROLLBACK

success "Services rolled back"

################################################################################
# VERIFY ROLLBACK
################################################################################

log "Verifying rollback..."
sleep 10

ssh "$REMOTE_USER@$REMOTE_HOST" << ENDVERIFY
  set -euo pipefail

  # Check service health
  HEALTHY=0
  for i in {1..30}; do
    if docker ps --format '{{.Names}} {{.Status}}' | grep -q "wise2-api.*healthy"; then
      HEALTHY=1
      break
    fi
    sleep 1
  done

  if [ $HEALTHY -eq 1 ]; then
    echo "Rollback verified - services healthy"
  else
    echo "WARNING: Services may not be healthy yet. Check manually."
  fi
ENDVERIFY

log ""
log "╔════════════════════════════════════════════════════════════════╗"
log "║  ✓ ROLLBACK COMPLETE                                          ║"
log "╚════════════════════════════════════════════════════════════════╝"
log ""
log "Released rolled back to: $PREV_RELEASE"
log "Backup of previous release: $ROLLBACK_BACKUP"
log ""
log "Server Status:"
ssh "$REMOTE_USER@$REMOTE_HOST" "docker ps --format 'table {{.Names}}\t{{.Status}}'"
log ""

exit 0
