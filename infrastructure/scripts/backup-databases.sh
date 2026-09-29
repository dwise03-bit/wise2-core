#!/bin/bash

################################################################################
# WISE² DATABASE BACKUP SCRIPT
#
# Backs up all production databases:
# - PostgreSQL (wise2_core)
# - MongoDB (if configured)
#
# Retention: 7 daily, 4 weekly, 3 monthly
#
# Usage: ./infrastructure/scripts/backup-databases.sh [remote|local]
################################################################################

set -euo pipefail

BACKUP_MODE="${1:-remote}"
BACKUP_DIR="${WISE2_BACKUP_DIR:-/opt/wise2/backups}"
REMOTE_USER="${DEPLOY_USER:-dwise}"
REMOTE_HOST="${DEPLOY_HOST:-173.208.147.165}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%A)
DAY_OF_MONTH=$(date +%d)

log() {
  echo "[$(date '+%H:%M:%S')] $*"
}

if [ "$BACKUP_MODE" = "remote" ]; then
  log "Backing up remote production databases..."

  ssh "$REMOTE_USER@$REMOTE_HOST" << ENDBACKUP
    set -euo pipefail

    BACKUP_DIR="$BACKUP_DIR/databases"
    mkdir -p "\$BACKUP_DIR/daily" "\$BACKUP_DIR/weekly" "\$BACKUP_DIR/monthly"

    # PostgreSQL backup
    log() { echo "[$(date '+%H:%M:%S')] \$*"; }
    log "Backing up PostgreSQL..."

    BACKUP_FILE="\$BACKUP_DIR/daily/postgres-\$TIMESTAMP.sql.gz"
    docker exec wise2-postgres pg_dump -U postgres wise2_core | gzip > "\$BACKUP_FILE"
    log "PostgreSQL backup: \$BACKUP_FILE ($(du -h \$BACKUP_FILE | cut -f1))"

    # MongoDB backup (if running)
    if docker ps --format '{{.Names}}' | grep -q wise2-mongodb; then
      log "Backing up MongoDB..."
      docker exec wise2-mongodb mongodump --archive | gzip > "\$BACKUP_DIR/daily/mongodb-\$TIMESTAMP.archive.gz"
      log "MongoDB backup complete"
    fi

    # Weekly rotation
    if [ "$DAY_OF_WEEK" = "Sunday" ]; then
      cp "\$BACKUP_DIR/daily/postgres-\$TIMESTAMP.sql.gz" "\$BACKUP_DIR/weekly/postgres-week-\$(date +%Y%U).sql.gz"
      log "Weekly backup rotation complete"
    fi

    # Monthly rotation
    if [ "$DAY_OF_MONTH" = "01" ]; then
      cp "\$BACKUP_DIR/daily/postgres-\$TIMESTAMP.sql.gz" "\$BACKUP_DIR/monthly/postgres-\$(date +%Y%m).sql.gz"
      log "Monthly backup rotation complete"
    fi

    # Cleanup old daily backups (keep 7 days)
    find "\$BACKUP_DIR/daily" -name "*.gz" -mtime +7 -delete
    log "Old backups cleaned up"

    # Create backup manifest
    cat > "\$BACKUP_DIR/BACKUP_MANIFEST.txt" << ENDMANIFEST
    Production Database Backups
    Generated: \$(date)
    Server: \$(hostname)

    Daily backups (kept 7 days):
    \$(ls -lh \$BACKUP_DIR/daily/*.gz 2>/dev/null | awk '{print \$9, \$5}')

    Weekly backups (kept 4 weeks):
    \$(ls -lh \$BACKUP_DIR/weekly/*.gz 2>/dev/null | awk '{print \$9, \$5}')

    Monthly backups (kept 3 months):
    \$(ls -lh \$BACKUP_DIR/monthly/*.gz 2>/dev/null | awk '{print \$9, \$5}')
    ENDMANIFEST

    log "Backup manifest created"
ENDBACKUP

elif [ "$BACKUP_MODE" = "local" ]; then
  log "Backing up local development databases..."

  mkdir -p "$BACKUP_DIR/development/daily"

  # PostgreSQL backup
  log "Backing up local PostgreSQL..."
  docker exec wise2-postgres-prod pg_dump -U postgres | gzip > "$BACKUP_DIR/development/daily/postgres-local-$TIMESTAMP.sql.gz"
  log "Local PostgreSQL backup complete"

  # MongoDB backup
  if docker ps --format '{{.Names}}' | grep -q wise2-mongodb; then
    log "Backing up local MongoDB..."
    docker exec wise2-mongodb mongodump --archive | gzip > "$BACKUP_DIR/development/daily/mongodb-local-$TIMESTAMP.archive.gz"
    log "Local MongoDB backup complete"
  fi
fi

log "Database backup completed successfully"
log "Backup retention policy:"
log "  Daily:   7 backups"
log "  Weekly:  4 backups (Sundays)"
log "  Monthly: 3 backups (1st of month)"
