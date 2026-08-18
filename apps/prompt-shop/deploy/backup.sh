#!/usr/bin/env sh
set -eu
umask 077
ENV_FILE="${1:-.env.production}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/wise-touch}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
set -a
. "$ENV_FILE"
set +a
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="$BACKUP_DIR/wise-touch-$STAMP.dump"
trap 'rm -f "$TARGET"' EXIT
docker compose --env-file "$ENV_FILE" exec -T db pg_dump -Fc -U "${POSTGRES_USER:-wise_touch}" "${POSTGRES_DB:-wise_touch}" > "$TARGET"
test -s "$TARGET"
docker compose --env-file "$ENV_FILE" exec -T db pg_restore -l < "$TARGET" >/dev/null
find "$BACKUP_DIR" -type f -name 'wise-touch-*.dump' -mtime "+$RETENTION_DAYS" -delete
trap - EXIT
printf 'Verified backup: %s\n' "$TARGET"
