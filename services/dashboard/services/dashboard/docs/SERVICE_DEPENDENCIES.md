# Service Dependencies — Wise² Core

Complete service relationship and dependency map.

---

## Dependency Overview

```
                    External Services
                    (GitHub, Claude API, etc.)
                           │
                    ┌──────┴──────┐
                    │             │
              Infrastructure    Monitoring
              (Database, Redis, (Prometheus,
               Message Queue)   Grafana)
                    │
        ┌───────────┼───────────┬─────────────┐
        │           │           │             │
      API       Dashboard    Admin-       Discord
    (Port:    (Port:3001)   Dashboard    Bot
     3000)    (Port:3002)   
        │           │           │             │
        └───────────┴───────────┴─────────────┘
                    │
            ┌───────┴───────┐
            │               │
          Worker        Wise OS
      (Background)   (Desktop/Pi)
```

---

## Service Startup Order

**Mandatory Order** (respect dependencies):

### Level 1 — Infrastructure (Required First)
1. **PostgreSQL** — Database
2. **Redis** — Cache and message queue

### Level 2 — Core Services (Once infrastructure ready)
3. **API** — REST backend (depends on DB + Redis)
4. **Worker** — Background jobs (depends on DB + Redis)

### Level 3 — User-Facing Services (Once API ready)
5. **Dashboard** — Web UI (connects to API)
6. **Admin-Dashboard** — Admin UI (connects to API)
7. **Discord Bot** — Discord integration (connects to API)

### Level 4 — Monitoring & Observability
8. **Prometheus** — Metrics (scrapes all services)
9. **Grafana** — Dashboards (reads Prometheus)

### Level 5 — Optional Services
10. **Wise OS** — Desktop/Pi platform (independent or connects to API)

**Startup Script**:
```bash
# Start infrastructure
docker-compose up -d postgres redis

# Wait for health
sleep 10

# Start core services
docker-compose up -d api worker

# Wait for API ready
sleep 10

# Start user-facing services
docker-compose up -d dashboard admin-dashboard bot

# Start monitoring
docker-compose up -d prometheus grafana

# Verify
docker-compose ps
docker-compose logs -f
```

---

## API Service

**Role**: Core backend, provides REST endpoints for all clients

**Depends On**:
- PostgreSQL (database)
- Redis (caching, sessions)
- External APIs (Claude, GitHub, Stripe)

**Provides**:
- REST API on port 3000
- Health endpoint: `/health`
- All business logic

**Environment Variables**:
```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/wise2_core
REDIS_URL=redis://:password@redis:6379
CLAUDE_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
JWT_SECRET=your-secret
```

**Health Check**:
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","service":"api","uptime":...}
```

**Startup Time**: ~5 seconds
**Critical**: Yes

---

## Dashboard Service

**Role**: Web UI for users

**Depends On**:
- API (for data and authentication)

**Provides**:
- Web interface on port 3001
- Static assets
- Real-time updates via WebSocket

**Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

**Health Check**:
```bash
curl http://localhost:3001/
# Response: HTML page
```

**Startup Time**: ~10-20 seconds (Next.js build)
**Critical**: Yes (user-facing)

---

## Admin Dashboard Service

**Role**: Admin interface for system management

**Depends On**:
- API (for admin endpoints)

**Provides**:
- Admin UI on port 3002
- Admin-only features

**Environment Variables**:
```bash
API_URL=http://api:3000
ADMIN_TOKEN=your-admin-token
```

**Health Check**:
```bash
curl http://localhost:3002/
# Response: HTML page
```

**Startup Time**: ~5 seconds
**Critical**: No (operations only)

---

## Discord Bot Service

**Role**: Discord integration for notifications and commands

**Depends On**:
- API (to execute commands)
- Discord API (external)

**Provides**:
- Discord bot functionality
- Notifications to Discord
- Commands for users

**Environment Variables**:
```bash
DISCORD_BOT_TOKEN=your-token
DISCORD_GUILD_ID=your-guild-id
API_URL=http://api:3000
ADMIN_ID=your-admin-id
```

**Health Check**:
```bash
# Check if bot is connected to Discord
# View logs: docker-compose logs bot
```

**Startup Time**: ~3 seconds
**Critical**: No (optional integration)

---

## Worker Service

**Role**: Background job processing

**Depends On**:
- PostgreSQL (for job storage)
- Redis (for message queue)
- API (for job execution context)

**Provides**:
- Async job processing
- Scheduled tasks
- Long-running operations

**Environment Variables**:
```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/wise2_core
REDIS_URL=redis://:password@redis:6379
API_URL=http://api:3000
```

**Health Check**:
```bash
# Check if worker is listening on Redis
docker-compose exec worker redis-cli -h redis PING
# Response: PONG
```

**Startup Time**: ~3 seconds
**Critical**: Yes (job processing)

---

## PostgreSQL Database

**Role**: Primary data store

**Depends On**:
- Disk storage

**Provides**:
- Data persistence
- Query execution
- Transactions

**Configuration**:
```yaml
Image: postgres:15-alpine
Port: 5432
Volume: postgres_data
Env:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: (from .env)
  POSTGRES_DB: wise2_core
```

**Health Check**:
```bash
docker-compose exec postgres pg_isready -U postgres
# Response: accepting connections
```

**Startup Time**: ~2-3 seconds
**Critical**: Yes (data required by all services)

**Connection Limits**:
- Max connections: 100
- Pool size per service: 10
- Total available: 60

---

## Redis Cache

**Role**: Caching, sessions, message queue

**Depends On**:
- Disk storage

**Provides**:
- Fast data caching
- Session storage
- Message queue
- Rate limiting

**Configuration**:
```yaml
Image: redis:7-alpine
Port: 6379
Volume: redis_data
Env:
  REDIS_PASSWORD: (from .env)
  Max Memory: 256MB
```

**Health Check**:
```bash
docker-compose exec redis redis-cli -a PASSWORD ping
# Response: PONG
```

**Startup Time**: ~1 second
**Critical**: Yes (caching and sessions required)

**Memory Limits**:
- Max: 256MB
- Eviction: Least Recently Used (LRU)

---

## Communication Patterns

### API ↔ Dashboard
```
User Browser
    │
    └──→ HTTP Request
         API (port 3000)
           │
           └──→ Query Database
           └──→ Cache in Redis
         Response JSON
    ←──── Display in UI
```

### API ↔ Worker
```
API creates job
    │
    └──→ Enqueue to Redis
         │
         └──→ Worker polls Redis
             Worker processes job
             Stores result in Database
             Updates API
```

### API ↔ Database
```
API Request
    │
    └──→ Connection Pool (max 10)
         │
         └──→ PostgreSQL
             Execute Query
             Return Results
    ←──── API Response
```

### API ↔ Redis
```
API needs data
    │
    ├──→ Check Redis Cache (first)
    │   Hit: Return cached data
    │   Miss:
    │     └──→ Query Database
    │         Cache result in Redis
    │         Return data
    └──→ Service Response
```

---

## Dependency Matrix

| Service | DB | Redis | API | Network | Critical |
|---------|----|----|-----|---------|----------|
| API | ✓ | ✓ | — | — | Yes |
| Dashboard | — | — | ✓ | ✓ | Yes |
| Admin | — | — | ✓ | ✓ | No |
| Bot | — | — | ✓ | ✓ | No |
| Worker | ✓ | ✓ | ✓ | — | Yes |
| Postgres | — | — | — | — | Yes |
| Redis | — | — | — | — | Yes |

---

## Failure Scenarios

### If PostgreSQL Down
- **Impact**: API cannot query data, cannot authenticate
- **Symptoms**: Connection refused errors in API logs
- **Mitigation**: Restart PostgreSQL, restore from backup if corrupted
- **Affected Services**: API, Worker, Dashboard (no new data)

### If Redis Down
- **Impact**: Cache lost, sessions lost, message queue stopped
- **Symptoms**: Worker cannot process jobs, API cannot cache
- **Mitigation**: Restart Redis (data will be lost, will rebuild)
- **Affected Services**: API (slower), Worker (stops), Dashboard (may timeout)

### If API Down
- **Impact**: All clients lose backend access
- **Symptoms**: 502 Bad Gateway from Dashboard, Worker cannot execute jobs
- **Mitigation**: Restart API, check logs for errors
- **Affected Services**: Dashboard, Admin, Bot, Worker

### If Dashboard Down
- **Impact**: Users cannot access web UI
- **Symptoms**: Cannot connect to dashboard.wise2.net
- **Mitigation**: Restart Dashboard
- **Affected Services**: Users (API still works)

### If Worker Down
- **Impact**: Scheduled jobs don't run, long operations fail
- **Symptoms**: Tasks queued but not processed
- **Mitigation**: Restart Worker, check for job backlog
- **Affected Services**: Background job system

---

## Port Map

| Service | Port | Type | Access |
|---------|------|------|--------|
| API | 3000 | HTTP | Internal/External |
| Dashboard | 3001 | HTTP | External |
| Admin | 3002 | HTTP | Internal |
| PostgreSQL | 5432 | TCP | Internal only |
| Redis | 6379 | TCP | Internal only |
| Prometheus | 9090 | HTTP | Internal |
| Grafana | 3001 | HTTP | Internal |
| AlertManager | 9093 | HTTP | Internal |

---

## Environment Variable Dependencies

### Required for All Services
```bash
ENVIRONMENT=production      # development, staging, production
NODE_ENV=production
TZ=America/New_York
```

### API Requires
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CLAUDE_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
JWT_SECRET=your-secret
```

### Dashboard Requires
```bash
NEXT_PUBLIC_API_URL=http://api:3000
NEXT_PUBLIC_WS_URL=ws://api:3000
```

### Worker Requires
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
API_URL=http://api:3000
```

### Bot Requires
```bash
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
API_URL=http://api:3000
```

---

## Deployment Dependencies

### Before Deploying API
- [ ] PostgreSQL running and healthy
- [ ] Redis running and healthy
- [ ] Database migrations completed
- [ ] Environment variables configured

### Before Deploying Dashboard
- [ ] API running and responding
- [ ] API health checks passing
- [ ] Network connectivity verified

### Before Deploying Worker
- [ ] PostgreSQL running and healthy
- [ ] Redis running and healthy
- [ ] API running (for job context)
- [ ] Message queue accessible

### Before Full Deployment
- [ ] All infrastructure healthy
- [ ] All services healthy
- [ ] Health checks passing
- [ ] Integration tests passing
- [ ] Monitoring configured

---

## Dependency Testing

**Test Database Connection**:
```bash
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT 1;"
```

**Test Redis Connection**:
```bash
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

**Test API**:
```bash
curl http://localhost:3000/health
```

**Test Dashboard**:
```bash
curl http://localhost:3001/
```

**Test Worker**:
```bash
docker-compose logs worker | grep "ready\|listening"
```

**Test All Together**:
```bash
# Run integration test
docker-compose exec api npm run test:integration

# Check logs
docker-compose logs | grep -i error
```

---

**Service Dependencies Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Architecture / DevOps Team
