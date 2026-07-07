#!/bin/bash
# Wise² Database Backup Script
# Creates compressed PostgreSQL backups with retention policy

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/wise2_core_${TIMESTAMP}.sql.gz"

# Database configuration
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-wise2_core}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Export password for pg_dump (if needed)
if [ -n "$POSTGRES_PASSWORD" ]; then
  export PGPASSWORD="$POSTGRES_PASSWORD"
fi

# Create backup
echo "Backing up $DB_NAME from $DB_HOST:$DB_PORT..."

if pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --verbose \
  --no-password \
  --compress=9 \
  > "$BACKUP_FILE"; then

  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✓ Backup created successfully: $BACKUP_FILE (${BACKUP_SIZE})${NC}"

  # List backup file
  ls -lh "$BACKUP_FILE"
else
  echo -e "${RED}✗ Backup failed!${NC}"
  exit 1
fi

# Cleanup old backups
echo ""
echo "Cleaning up backups older than $RETENTION_DAYS days..."

DELETED_COUNT=0
while IFS= read -r file; do
  rm -f "$file"
  echo "  Deleted: $(basename $file)"
  ((DELETED_COUNT++))
done < <(find "$BACKUP_DIR" -name "wise2_core_*.sql.gz" -mtime "+$RETENTION_DAYS" -type f)

if [ $DELETED_COUNT -eq 0 ]; then
  echo "  No old backups to delete"
else
  echo -e "${GREEN}✓ Deleted $DELETED_COUNT old backup(s)${NC}"
fi

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/wise2_core_*.sql.gz | tail -5

# Summary
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo -e "${GREEN}Backup complete!${NC}"
echo "Total backup size: $TOTAL_SIZE"
echo "Retention policy: $RETENTION_DAYS days"

exit 0
