#!/bin/bash

################################################################################
# WISE² DATABASE RESTORE SCRIPT
#
# Restores PostgreSQL or MongoDB from backup
#
# Usage: ./infrastructure/scripts/restore-database.sh --postgres BACKUP_FILE
#        ./infrastructure/scripts/restore-database.sh --mongodb BACKUP_FILE
################################################################################

set -euo pipefail

DB_TYPE=""
BACKUP_FILE=""
CONFIRM=""

usage() {
  cat << ENDUSAGE
Usage: $0 [options]

Options:
  --postgres FILE   Restore PostgreSQL from .sql.gz backup
  --mongodb FILE    Restore MongoDB from .archive.gz backup
  --confirm         Skip confirmation prompt

Examples:
  $0 --postgres /opt/wise2/backups/databases/daily/postgres-20260728_120000.sql.gz
  $0 --mongodb /opt/wise2/backups/databases/daily/mongodb-20260728_120000.archive.gz
ENDUSAGE
  exit 1
}

log() {
  echo "[$(date '+%H:%M:%S')] $*"
}

error() {
  echo "ERROR: $*"
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --postgres)
      DB_TYPE="postgres"
      BACKUP_FILE="$2"
      shift 2
      ;;
    --mongodb)
      DB_TYPE="mongodb"
      BACKUP_FILE="$2"
      shift 2
      ;;
    --confirm)
      CONFIRM="yes"
      shift
      ;;
    *)
      usage
      ;;
  esac
done

[ -n "$DB_TYPE" ] || usage
[ -f "$BACKUP_FILE" ] || error "Backup file not found: $BACKUP_FILE"

log "╔════════════════════════════════════════════════════════════════╗"
log "║  DATABASE RESTORE                                              ║"
log "╚════════════════════════════════════════════════════════════════╝"
log ""
log "Database Type: $DB_TYPE"
log "Backup File:   $BACKUP_FILE"
log "Backup Size:   $(du -h "$BACKUP_FILE" | cut -f1)"
log ""

if [ "$CONFIRM" != "yes" ]; then
  read -p "⚠️  This will restore production data. Continue? (type 'yes' to proceed): " REPLY
  [ "$REPLY" = "yes" ] || error "Restore cancelled"
fi

if [ "$DB_TYPE" = "postgres" ]; then
  log "Restoring PostgreSQL database..."
  log "Drop existing database..."
  docker exec wise2-postgres psql -U postgres -c "DROP DATABASE IF EXISTS wise2_core;" || true
  docker exec wise2-postgres psql -U postgres -c "CREATE DATABASE wise2_core OWNER wise2_prod_user;" || true

  log "Restoring from backup..."
  gunzip -c "$BACKUP_FILE" | docker exec -i wise2-postgres psql -U postgres -d wise2_core

  log "Verifying restore..."
  docker exec wise2-postgres psql -U postgres -d wise2_core -c "SELECT COUNT(*) FROM information_schema.tables;" || error "Database verification failed"

  log "✓ PostgreSQL restore complete"

elif [ "$DB_TYPE" = "mongodb" ]; then
  log "Restoring MongoDB database..."
  log "Dropping existing database..."
  docker exec wise2-mongodb mongosh --eval "use admin; db.dropDatabase();" || true

  log "Restoring from backup..."
  gunzip -c "$BACKUP_FILE" | docker exec -i wise2-mongodb mongorestore --archive

  log "Verifying restore..."
  docker exec wise2-mongodb mongosh --eval "db.adminCommand('ping');" || error "Database verification failed"

  log "✓ MongoDB restore complete"
fi

log ""
log "╔════════════════════════════════════════════════════════════════╗"
log "║  ✓ DATABASE RESTORE COMPLETE                                  ║"
log "╚════════════════════════════════════════════════════════════════╝"
log ""
log "Please restart affected services:"
log "  docker compose -f docker-compose.production.yml restart api"
