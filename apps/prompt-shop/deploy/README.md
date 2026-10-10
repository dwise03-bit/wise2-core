# WISE TOUCH VPS Deployment

## Server prerequisites

- A current Ubuntu LTS VPS with at least 2 CPU cores, 4 GB RAM, and adequate asset bandwidth.
- Docker Engine with the Compose plugin; rootless Docker is preferred where practical.
- DNS `A`/`AAAA` records for the production domain pointing to the VPS.
- Inbound TCP 22, 80, and 443 plus UDP 443. Restrict SSH by source IP when possible.

## First deployment

1. Copy the repository to `/opt/wise-touch` and enter that directory.
2. Copy `deploy/env.production.example` to `.env.production`.
3. Generate independent database and auth secrets; enter the domain and provider keys.
4. Run `node deploy/validate-env.mjs .env.production`.
5. Run `docker compose --env-file .env.production config` and inspect the resolved configuration without sharing its secret-bearing output.
6. Run `docker compose --env-file .env.production up -d --build`.
7. Check `docker compose ps`, then `curl -fsS https://YOUR_DOMAIN/api/health`.

Caddy obtains and renews TLS automatically when DNS is correct and ports 80/443 are reachable. PostgreSQL is private to the internal Docker network. The app waits for the database health check before starting and initializes its schema idempotently.

## Releases and rollback

Before an update, record the current source revision and take a database backup. Build with `docker compose build app`, then start with `docker compose up -d`. To roll back, restore the previous revision/image and run the same start command. Do not delete named volumes during routine releases.

## Operations

- Status: `docker compose ps`
- Application logs: `docker compose logs --tail=200 app`
- Proxy logs: `docker compose logs --tail=200 caddy`
- Database logs: `docker compose logs --tail=200 db`
- Restart app: `docker compose restart app`
- Stop without deleting data: `docker compose down`

Never run `docker compose down -v` in production unless permanent database and certificate deletion is explicitly intended and independently backed up.

## Backups

Run `BACKUP_DIR=/secure/offsite-mounted-path sh deploy/backup.sh .env.production` nightly from cron. The script creates a compressed PostgreSQL custom-format archive, verifies its table of contents, deletes partial failures, and retains 14 days by default. Copy backups off the VPS and periodically test restoration on a separate host.

Restore only during a declared maintenance window: `sh deploy/restore.sh .env.production /path/to/backup.dump`. The restore command stops the application, requires an explicit `RESTORE` confirmation, uses `--exit-on-error`, and restarts the app afterward.
