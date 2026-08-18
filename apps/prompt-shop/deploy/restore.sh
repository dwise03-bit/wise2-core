#!/usr/bin/env sh
set -eu
ENV_FILE="${1:-.env.production}"
ARCHIVE="${2:-}"
if [ -z "$ARCHIVE" ] || [ ! -s "$ARCHIVE" ]; then echo "Usage: deploy/restore.sh ENV_FILE BACKUP.dump" >&2; exit 1; fi
set -a
. "$ENV_FILE"
set +a
printf 'This replaces the WISE TOUCH database contents. Type RESTORE to continue: '
read -r CONFIRM
if [ "$CONFIRM" != "RESTORE" ]; then echo "Restore cancelled."; exit 1; fi
docker compose --env-file "$ENV_FILE" stop app
docker compose --env-file "$ENV_FILE" exec -T db pg_restore --clean --if-exists --no-owner --exit-on-error -U "${POSTGRES_USER:-wise_touch}" -d "${POSTGRES_DB:-wise_touch}" < "$ARCHIVE"
docker compose --env-file "$ENV_FILE" start app
echo "Restore complete. Verify /api/ready and account data immediately."
