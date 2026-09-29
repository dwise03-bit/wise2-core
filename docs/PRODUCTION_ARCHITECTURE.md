# WISE² Production Architecture
**Definitive Source of Truth for Production Configuration**  
**Last Updated:** 2026-07-23  
**Status:** Revenue Ready v1.0

---

## System Overview

WISE² Production is a multi-service SaaS platform serving paying customers. This document defines the authoritative configuration, dependencies, and deployment architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                         WISE² Production                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PUBLIC INTERNET (HTTPS/TLS)                                │
│           ↓                                                   │
│  ┌──────────────────────────────────────────┐               │
│  │  Nginx Reverse Proxy (Port 80/443)       │               │
│  │  - SSL/TLS Termination                   │               │
│  │  - Route traffic to services             │               │
│  │  - Health checks every 30s               │               │
│  └──────────────────────────────────────────┘               │
│     ↙              ↙              ↙                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ API      │  │ Website  │  │ Studio   │                  │
│  │ Port 3000│  │ Port 3001│  │ Port 3005│                  │
│  │ NestJS   │  │ Next.js  │  │ Next.js  │                  │
│  │ (Docker) │  │ (Docker) │  │ (Docker) │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│     ↓                               ↓                        │
│  ┌─────────────────────────┐  ┌──────────┐                 │
│  │  PostgreSQL Database    │  │ Redis    │                 │
│  │  Port 5432 (Docker)     │  │ Port 6379│                 │
│  │  Persistent Volume      │  │ Cache    │                 │
│  │  Health: pg_isready     │  │ Queues   │                 │
│  └─────────────────────────┘  └──────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Services Configuration

### 1. **Nginx Reverse Proxy**
- **Role:** Public entry point, SSL/TLS termination, traffic routing
- **Image:** `nginx:alpine`
- **Public Ports:** 80 (HTTP), 443 (HTTPS)
- **Configuration:** `/nginx.conf`
- **Upstream Routing:**
  ```
  wise2.net           → website:3001
  api.wise2.net       → api:3000
  studio.wise2.net    → studio:3005
  ```
- **SSL Certificates:** `/etc/nginx/certs/wise2.net.crt` + `.key`
- **Security Headers:** HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Health Check:** `curl http://localhost` every 30s

### 2. **NestJS API** (Backend)
- **Image:** `wise2-api:latest` (built from `Dockerfile.api`)
- **Container Port:** 3000
- **Docker Port Mapping:** 3000:3000
- **Environment Variables:**
  - `PORT=3000`
  - `DATABASE_URL` (PostgreSQL connection string)
  - `REDIS_URL` (Redis connection string)
  - `STRIPE_SECRET_KEY` (production Stripe key)
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`
  - `SENDGRID_API_KEY` (email service)
  - `SENDGRID_FROM_EMAIL`
  - `APP_URL=https://wise2.net`
  - `API_BASE_URL=https://api.wise2.net`
  - `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET` (consulting)
- **Dependencies:**
  - PostgreSQL (required: healthy before start)
  - Redis (required: healthy before start)
- **Health Check:**
  - `/health` (always 200 if running)
  - `/ready` (checks database connectivity)
- **Startup:** `npm run start:prod`

### 3. **Next.js Website**
- **Image:** `wise2-website:latest` (built from `Dockerfile.website`)
- **Container Port:** 3001
- **Docker Port Mapping:** 3001:3001
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL=https://api.wise2.net`
- **Dependencies:**
  - API service (required before routing)
- **Health Check:**
  - `curl http://localhost:3001` every 30s
- **Startup:** `npm start` (production Next.js server)

### 4. **Studio App**
- **Image:** `wise2-studio:latest` (built from `Dockerfile.studio`)
- **Container Port:** 3005
- **Docker Port Mapping:** 3005:3005
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL=https://api.wise2.net`
- **Dependencies:**
  - API service (required before routing)
- **Health Check:**
  - `curl http://localhost:3005` every 30s
- **Startup:** `npm start` (production Next.js server)

### 5. **PostgreSQL Database**
- **Image:** `postgres:15-alpine`
- **Container Name:** `wise2-db`
- **Port:** 5432 (internal only, not exposed to public)
- **Database:** `wise2_prod`
- **User:** `wise2`
- **Password:** From `DATABASE_PASSWORD` env var
- **Initialization:** `./packages/db/schema.sql` auto-runs on first startup
- **Persistent Volume:** `postgres_data:/var/lib/postgresql/data`
- **Health Check:** `pg_isready -U wise2 -d wise2_prod` every 10s

### 6. **Redis Cache & Queue**
- **Image:** `redis:7-alpine`
- **Container Name:** `wise2-redis`
- **Port:** 6379 (internal only)
- **Authentication:** Password from `REDIS_PASSWORD` env var
- **Persistent Volume:** `redis_data:/data`
- **Command:** `redis-server --requirepass [PASSWORD]`
- **Health Check:** `redis-cli --raw incr ping` every 10s
- **Used By:**
  - API service (queues, caching, session storage)
  - Background job processing

---

## Network Configuration

**Internal Docker Network:** `wise2` (bridge mode)
- All services communicate via service names (DNS resolution within network)
- External traffic routes through Nginx only
- No public exposure of database or Redis

**External Ports (Public):**
- 80 (HTTP → 443 HTTPS redirect)
- 443 (HTTPS)

**Internal Ports (Docker):**
- API: 3000
- Website: 3001
- Studio: 3005
- PostgreSQL: 5432
- Redis: 6379

---

## Volumes & Data Persistence

```yaml
volumes:
  postgres_data:
    - Database files
    - Survives container restarts
    - Backed up daily
  redis_data:
    - Redis persistence (AOF)
    - Survives container restarts
    - Not critical (ephemeral cache)
```

---

## Environment Configuration

**Source of Truth:** `.env.production` (not in git)  
**Template:** `.env.production.example` (in git)  
**Structure:** One file per deployment environment

**Required Variables (No Defaults):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `APP_URL`
- `API_BASE_URL`
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`

**Env Vars with Defaults:**
- `DATABASE_PASSWORD=wise2` (should be overridden)
- `REDIS_PASSWORD=redis123` (should be overridden)
- `LOG_LEVEL=info`
- `NODE_ENV=production`

---

## Build & Deployment

### Docker Images
Built on each push to main/production:

```
docker build -t wise2-api:latest -f Dockerfile.api .
docker build -t wise2-website:latest -f Dockerfile.website .
docker build -t wise2-studio:latest -f Dockerfile.studio .
```

### Deployment Script
**File:** `docker-compose.prod.yml`  
**Deployment:** `./deploy.sh production`  
**Automated By:** GitHub Actions (`.github/workflows/deploy.yml`)  
**Trigger:** Push to `main` or `production` branch

### Zero-Downtime Deployment
1. Build new images
2. Pull new images on deployment server
3. `docker compose up -d` (replaces old containers)
4. Nginx routes to healthy containers only
5. Old containers stop after health check timeout

---

## SSL/TLS Configuration

**Certificates Required:**
- `/etc/nginx/certs/wise2.net.crt` (certificate)
- `/etc/nginx/certs/wise2.net.key` (private key)

**Protocols:** TLSv1.2, TLSv1.3  
**Ciphers:** HIGH:!aNULL:!MD5  
**HSTS:** `max-age=31536000; includeSubDomains`

**Renewal:** Manual (or via Let's Encrypt automation)

---

## Monitoring & Observability

### Health Checks
Every service has health checks with 30-second intervals:

```yaml
Database: pg_isready
API: /health + /ready
Website: curl http://localhost:3001
Studio: curl http://localhost:3005
Redis: redis-cli incr ping
```

### Logging
- All services log to stdout (Docker captures to logs)
- Centralized log aggregation optional (ELK, Datadog, etc.)
- Log level: `info` in production

### Metrics
- Prometheus endpoint: (configured but not exposed)
- Grafana dashboard: (optional)

---

## Backup & Disaster Recovery

### Database Backups
- **Frequency:** Daily (2 AM UTC)
- **Retention:** 30 days
- **Storage:** S3 (encrypted)
- **Restore:** `pg_restore` from backup

### Configuration Backups
- `.env.production` backed up (stored securely)
- Docker Compose config versioned in git

### Disaster Recovery
1. Restore PostgreSQL from backup
2. Restart Redis (ephemeral, will rebuild)
3. Deploy latest images
4. Run migrations if needed

---

## Security Checklist

- ✅ No secrets in docker-compose.yml (all env vars)
- ✅ SSL/TLS on all public traffic
- ✅ PostgreSQL not exposed to public
- ✅ Redis not exposed to public
- ✅ Security headers set by Nginx
- ✅ Health check endpoints don't expose sensitive data
- ✅ Database password from env var (not hardcoded)
- ✅ Redis password from env var (not hardcoded)

---

## Scaling & Performance

### Current Configuration
- Designed for: 10-50 concurrent users (MVP)
- Database: Single PostgreSQL instance
- Cache: Single Redis instance
- Reverse proxy: Single Nginx instance

### Future Scaling
1. **Horizontal:** Load balancer + multiple API instances
2. **Vertical:** Larger database instances
3. **Cache:** Redis cluster for high-availability
4. **CDN:** CloudFront for static assets
5. **Read replicas:** PostgreSQL read replicas for reporting

---

## Runbook: Common Operations

### Deploy Latest Code
```bash
ssh user@production-host
cd wise2-core
git pull origin main
docker compose -f docker-compose.prod.yml up -d
docker logs wise2-api -f
```

### Check Service Status
```bash
docker compose -f docker-compose.prod.yml ps
curl https://api.wise2.net/health
curl https://wise2.net/health
```

### View Logs
```bash
docker logs wise2-api
docker logs wise2-website
docker logs wise2-postgres
docker logs wise2-redis
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart website
docker compose -f docker-compose.prod.yml restart studio
```

### Database Access
```bash
docker exec -it wise2-db psql -U wise2 -d wise2_prod
# Or from outside Docker:
psql postgresql://wise2:PASSWORD@localhost:5432/wise2_prod
```

### Database Backup
```bash
docker exec wise2-db pg_dump -U wise2 wise2_prod > backup.sql
```

### Database Restore
```bash
docker exec -i wise2-db psql -U wise2 wise2_prod < backup.sql
```

---

## Troubleshooting

| Issue | Symptoms | Fix |
|-------|----------|-----|
| API won't start | Port 3000 already in use | `docker ps`, find container, `docker kill <id>` |
| Website shows "API Error" | `/ready` returns unhealthy | Check database: `docker logs wise2-postgres` |
| Requests timeout | Nginx 504 Gateway Timeout | Check health: `docker compose ps` |
| Database slow | High CPU usage | Check indexes: `SELECT * FROM pg_stat_user_indexes` |
| Redis memory full | Redis eviction happening | Reduce TTLs or increase memory limit |

---

## Important Notes

1. **Never commit `.env.production`** - Contains real secrets
2. **Always use `docker compose up -d`** - Preserves volumes between restarts
3. **SSL certificates are required** - HTTP redirects to HTTPS via Nginx
4. **Backups are essential** - Test restore procedures monthly
5. **Monitoring is optional but recommended** - At minimum, log aggregation

---

*This document is the single source of truth for WISE² production configuration. Changes require a git commit to this file.*
