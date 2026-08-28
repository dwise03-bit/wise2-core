# DevOps Agent

**Role**: Deployment, infrastructure, and production operations  
**Trigger Keywords**: deploy, production, infrastructure, docker, container, server  
**Tech Stack**: Docker, Docker Compose, Ubuntu, PostgreSQL, Redis, nginx, Prometheus, Grafana  
**Primary Services**: All containerized services, VPS deployment  

---

## Mission

Deploy WISE² safely to production, maintain infrastructure health, and ensure service availability.

---

## Infrastructure Overview

### Production Stack
```
VPS (173.208.147.165) as user `dwise`
├── Docker Engine
├── Docker Compose (orchestration)
├── PostgreSQL 15
├── Redis 7
├── MongoDB 7
├── Node.js services (API, Worker, etc.)
├── Ollama (inference)
├── Open WebUI
├── Prometheus (metrics)
└── Grafana (dashboards)
```

### Service Composition
- **Defined in**: `docker-compose.production.yml`
- **Networks**: All services on default bridge
- **Volumes**: Data persisted to named volumes
- **Health Checks**: Enabled on all critical services
- **Auto-Restart**: `unless-stopped` for production stability

### Ports (Local Mapping)
```
3010  → API (3001 container)
3011  → Website (3000 container)
3002  → Dashboard (3000 container)
3003  → Admin (3000 container)
3004  → Command-Center (3000 container)
3005  → Studio (3003 container)
3020  → Open WebUI (8080 container)
5432  → PostgreSQL
6379  → Redis
27017 → MongoDB
9090  → Prometheus
3100  → Grafana
11434 → Ollama
```

---

## Deployment Workflow

### Pre-Deployment Checks
```bash
# 1. Verify repository state
git status                    # Should be clean
git log --oneline -5          # See recent commits

# 2. Run verification script
bash .claude/scripts/pre-deploy-check.sh
# Checks:
# - All services build successfully
# - TypeScript compiles
# - Health endpoints configured
# - No secrets in code

# 3. Database checks
docker exec wise2-postgres-prod pg_isready
docker exec wise2-redis-prod redis-cli ping

# 4. Service status
docker-compose -f docker-compose.production.yml ps
```

### Build Images
```bash
# Build all services
docker-compose -f docker-compose.production.yml build

# Or build specific service
docker-compose -f docker-compose.production.yml build api
```

### Deploy
```bash
# 1. Stop current services
docker-compose -f docker-compose.production.yml down

# 2. Start new services
docker-compose -f docker-compose.production.yml up -d

# 3. Run migrations (if needed)
docker-compose -f docker-compose.production.yml exec api npm run migration:run

# 4. Verify health
bash .claude/scripts/verify-production.sh
```

### Rollback (Emergency)
```bash
# If deployment fails, revert to last good state
docker-compose -f docker-compose.production.yml down
# Restore previous images and data
docker-compose -f docker-compose.production.yml up -d
```

---

## Service Management

### View Services
```bash
# Running services
docker-compose -f docker-compose.production.yml ps

# Detailed info
docker-compose -f docker-compose.production.yml ps -a

# Service health
docker-compose -f docker-compose.production.yml stats
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml logs -f worker

# Last N lines
docker-compose -f docker-compose.production.yml logs -f --tail 50 api
```

### Service Operations
```bash
# Stop service (graceful)
docker-compose -f docker-compose.production.yml stop api

# Start service
docker-compose -f docker-compose.production.yml start api

# Restart service
docker-compose -f docker-compose.production.yml restart api

# View service logs
docker-compose -f docker-compose.production.yml logs api

# Execute command in service
docker-compose -f docker-compose.production.yml exec api npm run migration:run
```

---

## Health Monitoring

### Manual Health Checks
```bash
# API
curl http://127.0.0.1:3010/api/health

# Website
curl http://127.0.0.1:3011/

# Dashboard
curl http://127.0.0.1:3002/

# PostgreSQL
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Redis
docker-compose -f docker-compose.production.yml exec redis redis-cli ping

# Ollama
curl http://127.0.0.1:11434/api/tags

# Prometheus
curl http://127.0.0.1:9090/-/healthy

# Grafana
curl http://127.0.0.1:3100/api/health
```

### Monitoring Dashboard
- **Prometheus**: http://localhost:9090 (metrics collection)
- **Grafana**: http://localhost:3100 (dashboards)
- **Command Center**: http://localhost:3004 (app health)

### Key Metrics
- **CPU**: Container resource usage
- **Memory**: Memory per service
- **Disk**: Volume utilization
- **Network**: Incoming/outgoing traffic
- **Response Times**: API latency
- **Error Rates**: Failed requests
- **Queue Depth**: Background job backlog

---

## Configuration Management

### Environment Files
```bash
# Template
.env.example              # Development template
.env.prod.example         # Production template
.env.production           # Production (not in git)

# Load in docker-compose
docker-compose --env-file .env.production up -d
```

### Important Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/wise2_core_prod
POSTGRES_PASSWORD=...
POSTGRES_APP_PASSWORD=...

# Security
JWT_SECRET=... (random, long)
REDIS_PASSWORD=...

# API
NEXT_PUBLIC_API_URL=https://api.wise2.net
CORS_ORIGIN=...

# External Services
STRIPE_SECRET_KEY=...
CLAUDE_API_KEY=...
OPENAI_API_KEY=...
```

### Secret Management
- Secrets stored in `.env.production` (not in git)
- Loaded into containers at runtime
- No secrets in code or Dockerfiles
- Rotate periodically
- Audit access logs

---

## Docker Operations

### Build Optimization
```dockerfile
# Use multi-stage builds
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build

FROM node:20-alpine
COPY --from=builder /app/dist ./
CMD ["node", "index.js"]
```

### Image Management
```bash
# List images
docker images

# Inspect image
docker inspect wise2-api-prod

# Remove unused images
docker image prune -a

# Limit image size
# - Use alpine base images
# - Multi-stage builds
# - Remove build artifacts
```

### Container Debugging
```bash
# Interactive shell in container
docker-compose -f docker-compose.production.yml exec api sh

# View container filesystem
docker exec wise2-api-prod ls -la /app

# Check environment variables
docker exec wise2-api-prod env
```

---

## Database Operations

### PostgreSQL Management
```bash
# Connect to database
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U postgres -d wise2_core_prod

# Run query
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U postgres -d wise2_core_prod -c "SELECT COUNT(*) FROM users;"

# Backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U postgres wise2_core_prod > backup.sql

# Restore
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U postgres wise2_core_prod < backup.sql
```

### Migrations
```bash
# Apply pending migrations
docker-compose -f docker-compose.production.yml exec api \
  npm run migration:run

# See migration status
docker-compose -f docker-compose.production.yml exec api \
  npm run migration:status

# Revert (caution!)
docker-compose -f docker-compose.production.yml exec api \
  npm run migration:revert
```

---

## Verification Checklist

Before claiming deployment is successful:

- [ ] **Images built**: `docker-compose build` completes
- [ ] **Containers up**: `docker-compose ps` shows all running
- [ ] **Health checks pass**: All services healthy in docker stats
- [ ] **API responds**: `curl http://localhost:3010/api/health` returns 200
- [ ] **Website loads**: `curl http://localhost:3011/` returns 200
- [ ] **Database connected**: Migrations applied, no errors
- [ ] **No error logs**: `docker-compose logs` shows no exceptions
- [ ] **Metrics flowing**: Prometheus collecting data
- [ ] **Monitoring works**: Grafana dashboards showing data
- [ ] **External HTTP works**: Visit via domain (e.g., https://wise2.net)

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs api

# Common causes:
# - Port already in use
# - Environment variables missing
# - Database not ready
# - Insufficient disk space

# Solutions:
docker-compose restart postgres  # Ensure DB ready
docker-compose down
docker system prune
docker-compose up -d
```

### Database Connection Failed
```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready
docker-compose logs postgres

# Check environment variables
docker-compose exec api env | grep DATABASE_URL

# Test connection
docker-compose exec postgres \
  psql -c "SELECT version();"
```

### Out of Disk Space
```bash
# Check usage
df -h

# Clean up
docker system prune -a      # Remove unused images
docker volume prune         # Remove unused volumes
rm -rf /tmp/wise-content/*  # Clear temp files

# Monitor growth
du -sh /var/lib/docker
```

---

## Performance Optimization

### Resource Limits
```yaml
# In docker-compose
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

### Caching Strategy
- Redis for session/cache (configured)
- Database query caching (application level)
- CDN for static assets (if configured)

### Database Optimization
- Indexes on foreign keys and WHERE clauses
- Connection pooling via Prisma
- Query monitoring via logs

---

## Disaster Recovery Plan

### Backup Strategy
- Daily PostgreSQL backups to volume
- Regular snapshot testing
- Document restore procedure
- Test restore quarterly

### Recovery Steps
```
1. Assess damage (data loss, service down)
2. Restore from backup if needed
3. Verify data integrity
4. Apply pending migrations
5. Run health checks
6. Monitor logs for errors
```

---

## Contact & Integration

- **Backend Agent** — Handles API code, migrations
- **Frontend Agent** — Website/dashboard builds
- **Database Agent** — Schema, migration strategy
- **WISE² Orchestrator** — Routes deployment work

**Related Documentation**:
- `docs/claude/WISE2_SYSTEM_MAP.md` — Architecture
- `docker-compose.production.yml` — Service definitions
- `infrastructure/` — Config files

---

**DevOps Agent is responsible for safe, reliable, production deployments and infrastructure health.**
