# WISE² Stable Docker Setup

## Overview

The production WISE² deployment uses `docker-compose.stable.yml` with only core services:

- **wise2-db** (PostgreSQL 15) on port 5432
- **wise2-redis** (Redis 7) on port 6379
- **wise2-api** (NestJS API) on port 3010
- **wise2-website** (Next.js frontend) on port 3000

All services have `restart: unless-stopped` policy for automatic recovery.

## Automatic Startup

A systemd service (`wise2-core.service`) ensures services start automatically on server reboot:

```bash
sudo systemctl status wise2-core.service
sudo systemctl start wise2-core.service
sudo systemctl stop wise2-core.service
sudo systemctl restart wise2-core.service
```

## Manual Operations

Start all services:
```bash
cd /home/dwise/wise2-core
docker-compose -f docker-compose.stable.yml up -d
```

Stop all services:
```bash
docker-compose -f docker-compose.stable.yml down
```

View logs:
```bash
docker-compose -f docker-compose.stable.yml logs -f
```

Check service status:
```bash
docker ps
```

## Troubleshooting

### Website not responding through nginx

Check if `wise2-website` container is running:
```bash
docker ps | grep wise2-website
```

If not running, start it:
```bash
docker-compose -f docker-compose.stable.yml up -d wise2-website
```

### API connection errors

Ensure database is healthy:
```bash
docker logs wise2-db
```

Check API logs:
```bash
docker logs wise2-api
```

### Redis connection issues

Verify Redis is running:
```bash
docker exec wise2-redis redis-cli ping
```

### Port conflicts

If port 3000 or 3010 is already in use, check what's using it:
```bash
lsof -i :3000
lsof -i :3010
```

## Why docker-compose.prod.yml isn't used

The original `docker-compose.prod.yml` includes dashboard and command-center services that have pnpm build issues (`ERR_PNPM_PNPM_ENGINE_IDENTITY_UNVERIFIABLE`). These are not essential for core functionality.

For MVP, `docker-compose.stable.yml` provides a reliable, minimal configuration.

## Reverting to docker-compose.prod.yml

To use the full feature set in the future:

1. Fix the pnpm-lock.yaml to resolve build issues
2. Update Dockerfiles to use compatible Node/pnpm versions
3. Test dashboard and command-center builds locally before deploying

## Monitoring

All containers have health checks configured:

- Database: checks pg_isready every 10s
- Redis: checks PING command every 10s
- API: checks /api/health endpoint every 30s
- Website: checks HTTP 200 on / every 30s

View health status:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Expected healthy state:
```
wise2-db        Up ... (healthy)
wise2-redis     Up ... (healthy)
wise2-api       Up ... (health: starting)
wise2-website   Up ... (health: starting)
```

## Environment Variables

All environment variables from `.env` are passed to containers. Ensure these are set before starting services:

```bash
cat /home/dwise/wise2-core/.env | grep -E "^[A-Z]"
```

Critical variables:
- `DATABASE_PASSWORD` — PostgreSQL password (default: wise2)
- `REDIS_PASSWORD` — Redis password (default: redis123)
- `JWT_SECRET` — API authentication secret
- `STRIPE_*` — Payment processing keys (optional for MVP)

## Deployment Flow

1. **First deployment:** `docker-compose -f docker-compose.stable.yml up -d`
2. **Service restart:** `systemctl restart wise2-core` (if using systemd)
3. **Update containers:** Rebuild images and restart
4. **Monitor:** Check `docker ps` and service logs regularly
