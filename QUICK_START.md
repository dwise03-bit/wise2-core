# WISE² Production Deployment - Quick Start

## TL;DR - Get It Running in 5 Minutes

### 1. Setup Environment
```bash
cp .env.prod.local .env.production
# Edit .env.production with your production values (CRITICAL!)
nano .env.production
```

**Must Change**:
- `POSTGRES_ADMIN_PASSWORD` - PostgreSQL admin
- `POSTGRES_APP_PASSWORD` - App user password
- `JWT_SECRET` - Application secret key
- `REDIS_PASSWORD` - Redis password
- `GRAFANA_PASSWORD` - Monitoring dashboard

### 2. Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verify Everything Works
```bash
# Check services health (wait 30 seconds)
docker-compose -f docker-compose.prod.yml ps

# Expected: All show "healthy" or "running"

# Test API
curl http://localhost:3010/api/health

# Test website
curl http://localhost:3000/
```

That's it! Database initializes automatically.

## Common Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Check database
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c "SELECT COUNT(*) FROM users;"

# Backup database
./infrastructure/docker/db-scripts.sh backup

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Start everything
docker-compose -f docker-compose.prod.yml up -d
```

## What Gets Created Automatically

- PostgreSQL database: `wise2_core_prod`
- Database user: `wise2_prod_user`
- 8 tables with indexes and triggers
- Redis cache
- API server (NestJS)
- Website (Next.js)
- Dashboard (Next.js)
- Admin panel (Next.js)
- Prometheus metrics
- Grafana dashboards

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3010 | None |
| Website | http://localhost:3000 | None |
| Dashboard | http://localhost:3002 | None |
| Admin | http://localhost:3003 | None |
| Prometheus | http://localhost:9090 | None |
| Grafana | http://localhost:3100 | admin / GRAFANA_PASSWORD |

## Database Health Check

```bash
# Quick health check
docker exec wise2-postgres-prod pg_isready -U wise2_prod_user -d wise2_core_prod

# Detailed check
./infrastructure/docker/db-scripts.sh health
```

## Troubleshooting

**Containers not starting?**
```bash
docker-compose -f docker-compose.prod.yml logs postgres
```

**Can't connect to database?**
```bash
# Verify credentials
echo $POSTGRES_APP_PASSWORD

# Test connection
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c "\dt"
```

**High resource usage?**
```bash
docker stats wise2-postgres-prod wise2-api-prod
./infrastructure/docker/db-scripts.sh slow-queries
```

## Backup & Restore

```bash
# Backup
./infrastructure/docker/db-scripts.sh backup

# Restore
./infrastructure/docker/db-scripts.sh restore ./backups/wise2_db_TIMESTAMP.sql.gz
```

## Next Steps

1. **Set up SSL/TLS** - Follow DEPLOYMENT_GUIDE.md section "Step 5"
2. **Configure Nginx** - For reverse proxy and HTTPS
3. **Set up automated backups** - Daily at 2 AM via cron
4. **Configure monitoring alerts** - In Grafana
5. **Test disaster recovery** - Restore a backup to staging

## Documentation

- **Full deployment guide**: `DEPLOYMENT_GUIDE.md`
- **Database details**: `infrastructure/docker/README.md`
- **Database schema**: `infrastructure/database/SCHEMA_DESIGN.md`
- **Setup summary**: `DATABASE_INITIALIZATION_SUMMARY.md`

## Environment Variables - Key Ones

| Variable | Purpose | Example |
|----------|---------|---------|
| `POSTGRES_ADMIN_PASSWORD` | PostgreSQL admin | `RandomString32Chars!` |
| `POSTGRES_APP_PASSWORD` | App database user | `AnotherRandom32Chars!` |
| `JWT_SECRET` | API authentication | `VeryLongRandomSecret32+Chars` |
| `REDIS_PASSWORD` | Cache layer | `RedisSecret32Chars!` |
| `GRAFANA_PASSWORD` | Monitoring dashboard | `GrafanaPass123!` |
| `CORS_ORIGIN` | Allowed domains | `https://wise2.net` |
| `NODE_ENV` | Environment | `production` |

## Database Schema at a Glance

**8 Tables**:
- users (accounts)
- sessions (active sessions)
- deployments (app deployments)
- deployment_services (services per deployment)
- services (real-time status)
- audit_logs (change tracking)
- automation_jobs (scheduled tasks)
- automation_tasks (job execution history)

**3 Views**:
- active_deployments
- deployment_status_summary
- user_activity

## Security Checklist

- [ ] Generate strong random passwords
- [ ] Set all environment variables
- [ ] Don't commit `.env.production`
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall (only 80, 443 public)
- [ ] Enable automated backups
- [ ] Review audit logs weekly
- [ ] Rotate passwords quarterly

## Performance Metrics

After startup, check:

```bash
# Top slow queries
./infrastructure/docker/db-scripts.sh slow-queries

# Table sizes
./infrastructure/docker/db-scripts.sh table-sizes

# Active connections
./infrastructure/docker/db-scripts.sh connection-count
```

## Getting Help

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Run health check: `./infrastructure/docker/db-scripts.sh health`
3. Test database: `docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c "SELECT version();"`
4. Read full guides in documentation folder
5. Contact DevOps team with logs and `.env` (without passwords)

---

**Ready to deploy?** Follow the full guide in `DEPLOYMENT_GUIDE.md` for production checklist and advanced configuration.
