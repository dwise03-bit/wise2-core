#!/bin/bash
# Wise² Database Restore Script
# Restores PostgreSQL backup created by backup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-wise2_core}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Validate arguments
if [ $# -lt 1 ]; then
  echo -e "${YELLOW}Usage: $0 <backup_file> [--force]${NC}"
  echo ""
  echo "Available backups:"
  ls -lh "$BACKUP_DIR"/wise2_core_*.sql.gz | tail -5
  exit 1
fi

BACKUP_FILE="$1"
FORCE_RESTORE="${2:-}"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${BLUE}Restore Information:${NC}"
echo "  Backup file: $BACKUP_FILE"
echo "  Backup size: $BACKUP_SIZE"
echo "  Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "  User: $DB_USER"
echo ""

# Confirm restore (unless --force is used)
if [ "$FORCE_RESTORE" != "--force" ]; then
  read -p "Are you sure you want to restore? This will REPLACE all data! (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
  fi
fi

# Export password (if needed)
if [ -n "$POSTGRES_PASSWORD" ]; then
  export PGPASSWORD="$POSTGRES_PASSWORD"
fi

# Drop existing database
echo -e "${YELLOW}Dropping existing database...${NC}"
dropdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  --if-exists \
  "$DB_NAME" || true

# Create new database
echo -e "${YELLOW}Creating new database...${NC}"
createdb \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME"

# Restore from backup
echo -e "${YELLOW}Restoring backup...${NC}"

if gunzip -c "$BACKUP_FILE" | psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password \
  --quiet; then

  echo -e "${GREEN}✓ Database restored successfully!${NC}"

  # Verify restore
  echo ""
  echo -e "${BLUE}Verification:${NC}"

  # Count tables
  TABLE_COUNT=$(psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

  echo "  Tables created: $TABLE_COUNT"

  # Timestamp of backup
  BACKUP_DATE=$(stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$BACKUP_FILE" 2>/dev/null || stat -c %y "$BACKUP_FILE" | cut -d' ' -f1-2)
  echo "  Backup created: $BACKUP_DATE"

  echo ""
  echo -e "${GREEN}Restore complete!${NC}"

else
  echo -e "${RED}✗ Restore failed!${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check database connectivity"
  echo "  2. Verify PostgreSQL is running"
  echo "  3. Check POSTGRES_PASSWORD if set"
  exit 1
fi

exit 0
