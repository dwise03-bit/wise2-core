#!/bin/bash

# Wise² Core Backup Script
# Backs up PostgreSQL database and Redis cache
# Usage: ./backup.sh [backup-dir]

set -e

# Configuration
BACKUP_DIR="${1:-.}"
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="wise2_backup_${BACKUP_TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
LOG_FILE="${BACKUP_PATH}.log"

# Environment variables (from docker-compose)
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-wise2_core}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

error() {
  log "❌ ERROR: $1"
  exit 1
}

success() {
  log "✅ $1"
}

# Create backup directory
mkdir -p "${BACKUP_DIR}" || error "Failed to create backup directory: ${BACKUP_DIR}"
mkdir -p "${BACKUP_PATH}" || error "Failed to create backup path: ${BACKUP_PATH}"

log "Starting backup..."
log "Backup directory: ${BACKUP_PATH}"

# ============================================================================
# PostgreSQL Backup
# ============================================================================

log "Backing up PostgreSQL database..."

POSTGRES_BACKUP="${BACKUP_PATH}/postgres.sql.gz"

docker exec wise2-postgres pg_dump \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --verbose \
  2>>"${LOG_FILE}" | gzip > "${POSTGRES_BACKUP}" || error "PostgreSQL backup failed"

POSTGRES_SIZE=$(du -sh "${POSTGRES_BACKUP}" | cut -f1)
success "PostgreSQL backup completed (${POSTGRES_SIZE})"

# ============================================================================
# Redis Backup
# ============================================================================

log "Backing up Redis cache..."

REDIS_BACKUP="${BACKUP_PATH}/redis.rdb"

docker exec wise2-redis redis-cli \
  -a "${REDIS_PASSWORD}" \
  BGSAVE 2>>"${LOG_FILE}" || error "Redis BGSAVE failed"

# Wait for Redis to finish saving
sleep 5

docker cp wise2-redis:/data/dump.rdb "${REDIS_BACKUP}" || error "Failed to copy Redis backup"

REDIS_SIZE=$(du -sh "${REDIS_BACKUP}" | cut -f1)
success "Redis backup completed (${REDIS_SIZE})"

# ============================================================================
# Backup Metadata
# ============================================================================

log "Creating backup metadata..."

cat > "${BACKUP_PATH}/backup-info.txt" << EOF
Backup Information
==================
Created: $(date)
Hostname: $(hostname)
Backup Name: ${BACKUP_NAME}

Database Configuration:
  Host: ${DB_HOST}
  Port: ${DB_PORT}
  Database: ${DB_NAME}
  User: ${DB_USER}

Redis Configuration:
  Host: ${REDIS_HOST}
  Port: ${REDIS_PORT}

Backup Contents:
  - postgres.sql.gz (${POSTGRES_SIZE}) - PostgreSQL dump
  - redis.rdb (${REDIS_SIZE}) - Redis snapshot
  - backup-info.txt (this file)

To restore this backup:
  1. Extract the backup archive
  2. Run: docker-compose exec postgres psql -U ${DB_USER} -d ${DB_NAME} < postgres.sql
  3. Run: docker-compose exec redis redis-cli -a ${REDIS_PASSWORD} < redis-restore.sh

Backup Retention: ${RETENTION_DAYS} days
EOF

success "Backup metadata created"

# ============================================================================
# Cleanup Old Backups
# ============================================================================

log "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."

find "${BACKUP_DIR}" -maxdepth 1 -type d -name "wise2_backup_*" -mtime +${RETENTION_DAYS} | while read old_backup; do
  log "Removing old backup: $(basename ${old_backup})"
  rm -rf "${old_backup}"
done

success "Cleanup completed"

# ============================================================================
# Backup Verification
# ============================================================================

log "Verifying backup integrity..."

if [ -f "${POSTGRES_BACKUP}" ] && [ -s "${POSTGRES_BACKUP}" ]; then
  success "PostgreSQL backup verified"
else
  error "PostgreSQL backup verification failed"
fi

if [ -f "${REDIS_BACKUP}" ] && [ -s "${REDIS_BACKUP}" ]; then
  success "Redis backup verified"
else
  error "Redis backup verification failed"
fi

# ============================================================================
# Completion
# ============================================================================

TOTAL_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
log ""
success "Backup completed successfully!"
log "Total backup size: ${TOTAL_SIZE}"
log "Backup location: ${BACKUP_PATH}"
log "Log file: ${LOG_FILE}"

# Archive the backup if it's large
if [ -f "$(command -v tar)" ]; then
  log "Creating compressed backup archive..."
  tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}" 2>>"${LOG_FILE}" && \
    success "Backup archive created: ${BACKUP_PATH}.tar.gz" && \
    rm -rf "${BACKUP_PATH}" && \
    log "Original backup directory removed"
fi

exit 0
