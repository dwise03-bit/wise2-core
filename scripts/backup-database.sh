#!/bin/bash

# WISE² Database Backup Script
# Daily PostgreSQL backups with 7-day retention

set -e

BACKUP_DIR="${BACKUP_DIR:-/backups/wise2}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-wise2_prod}"
DB_USER="${DB_USER:-wise2_prod}"
DB_PASSWORD="${DB_PASSWORD}"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wise2_backup_$TIMESTAMP.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $@" >> "$BACKUP_DIR/backup.log"
}

log "Starting database backup..."

# Perform backup
if PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --verbose \
  2>> "$BACKUP_DIR/backup.log" | gzip > "$BACKUP_FILE"; then

  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  log "✅ Backup completed successfully: $BACKUP_FILE ($BACKUP_SIZE)"

  # Verify backup integrity
  if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "✅ Backup integrity verified"
  else
    log "❌ Backup integrity check failed!"
    exit 1
  fi

else
  log "❌ Backup failed!"
  exit 1
fi

# Clean old backups (keep last 7 days)
log "Cleaning old backups (retention: $RETENTION_DAYS days)..."
REMOVED=0
while IFS= read -r old_file; do
  rm -f "$old_file"
  log "  Removed: $old_file"
  ((REMOVED++))
done < <(find "$BACKUP_DIR" -name "wise2_backup_*.sql.gz" -mtime +$RETENTION_DAYS)

log "Cleaned up $REMOVED old backup(s)"

# Send to S3 (optional)
if command -v aws &> /dev/null; then
  S3_BUCKET="${S3_BUCKET_BACKUP:-}"
  if [ -n "$S3_BUCKET" ]; then
    log "Uploading backup to S3: $S3_BUCKET"
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/" \
      && log "✅ S3 upload completed" \
      || log "⚠️  S3 upload failed"
  fi
fi

log "Backup process completed"
