# WISE² Docker Infrastructure

Docker configuration and initialization scripts for WISE² production deployment.

## Quick Start

### 1. Prepare Environment Configuration

```bash
# Copy the production environment template
cp .env.prod.local .env.production

# Edit with your actual production values
nano .env.production
```

### 2. Start the Production Stack

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verify Initialization

```bash
# Check PostgreSQL initialization
docker-compose -f docker-compose.prod.yml logs postgres | tail -20

# Check API connection to database
docker-compose -f docker-compose.prod.yml logs api | tail -20

# Verify all services are healthy
docker-compose -f docker-compose.prod.yml ps
```

## PostgreSQL Database Initialization

### Automated Initialization Process

The PostgreSQL container automatically runs `infrastructure/docker/init-db.sql` when starting for the first time. This script:

1. **Creates the production database** `wise2_core_prod`
2. **Creates the application user** `wise2_prod_user` with secure password
3. **Initializes the complete schema** with all required tables
4. **Sets up indexes** for performance optimization
5. **Configures triggers** for automatic timestamp updates and audit logging
6. **Creates views** for common queries
7. **Grants permissions** to the application user
8. **Configures logging** for monitoring and debugging

### Environment Variables

The initialization process uses the following environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_ADMIN_USER` | `postgres` | PostgreSQL root user |
| `POSTGRES_ADMIN_PASSWORD` | `secure_postgres_admin_2026` | Root user password |
| `POSTGRES_APP_PASSWORD` | `wise2_prod_secure_2026` | Application user password |

**IMPORTANT**: Change all default passwords in production!

### Database Schema

The initialization creates:

#### Tables (8)
- `users` - System users and accounts
- `sessions` - Active user sessions with JWT tokens
- `deployments` - Application deployment configurations
- `deployment_services` - Services within each deployment
- `services` - Real-time service status and metrics
- `audit_logs` - Immutable audit trail of all changes
- `automation_jobs` - Scheduled and event-triggered jobs
- `automation_tasks` - Execution history of automation jobs

#### Views (3)
- `active_deployments` - Currently active deployments
- `deployment_status_summary` - Health summary by deployment
- `user_activity` - User activity metrics

#### Extensions
- `uuid-ossp` - UUID generation
- `pg_trgm` - Text search and similarity
- `pg_stat_statements` - Query performance tracking

### Volume Configuration

```yaml
volumes:
  postgres_data:        # Database files (persistent)
  postgres_wal:         # Write-Ahead Logs (for recovery)
  redis_data:           # Redis cache (persistent)
  prometheus_data:      # Prometheus metrics (persistent)
  grafana_data:         # Grafana dashboards (persistent)
```

### Health Checks

The PostgreSQL container includes a comprehensive health check that verifies:

1. Admin user can connect
2. Application user can connect
3. Application database exists and is accessible

```bash
# Check health status
docker exec wise2-postgres-prod pg_isready -U postgres -h localhost
docker exec wise2-postgres-prod pg_isready -U wise2_prod_user -h localhost -d wise2_core_prod
```

## API Configuration

The API service is configured to:

1. Wait for PostgreSQL to be healthy before starting (`depends_on: service_healthy`)
2. Connect using application user credentials
3. Automatically apply TypeORM synchronization in development
4. Use database connection pooling

### Database Connection Details

- **Host**: `postgres` (Docker DNS name)
- **Port**: `5432`
- **Database**: `wise2_core_prod`
- **User**: `wise2_prod_user`
- **Password**: From `POSTGRES_APP_PASSWORD` environment variable

## Troubleshooting

### PostgreSQL Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs postgres

# Check if port 5432 is already in use
lsof -i :5432

# Check volume permissions
docker volume ls | grep postgres
docker volume inspect wise2-core_postgres_data
```

### Can't Connect to Database

```bash
# Verify container is running
docker-compose -f docker-compose.prod.yml ps postgres

# Test connection from host
PGPASSWORD=wise2_prod_secure_2026 psql -h localhost -U wise2_prod_user -d wise2_core_prod -c "SELECT version();"

# Test connection from API container
docker exec wise2-api-prod psql -h postgres -U wise2_prod_user -d wise2_core_prod -c "SELECT COUNT(*) FROM users;"
```

### Health Check Failing

The health check verifies:

```bash
# Admin user connectivity
docker exec wise2-postgres-prod pg_isready -U postgres -h localhost -p 5432

# App user connectivity
docker exec wise2-postgres-prod pg_isready -U wise2_prod_user -h localhost -p 5432 -d wise2_core_prod
```

If health check fails:
1. Verify both users exist
2. Verify passwords match environment variables
3. Check PostgreSQL initialization logs
4. Ensure database `wise2_core_prod` exists

### Reset Database (Development Only)

```bash
# WARNING: This removes all data!

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Remove volumes
docker volume rm wise2-core_postgres_data wise2-core_postgres_wal

# Start fresh
docker-compose -f docker-compose.prod.yml up -d postgres

# Watch initialization
docker-compose -f docker-compose.prod.yml logs -f postgres
```

## Backup & Recovery

### Automated Backups

PostgreSQL Write-Ahead Logs (WAL) are persisted in the `postgres_wal` volume for automatic recovery capability.

### Manual Backup

```bash
# From host machine
docker exec wise2-postgres-prod pg_dump -U wise2_prod_user -d wise2_core_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Or from container
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U wise2_prod_user -d wise2_core_prod | gzip > backup.sql.gz
```

### Restore from Backup

```bash
# Decompress and restore
gunzip < backup_20260716_120000.sql.gz | docker exec -i wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod
```

## Performance Tuning

### PostgreSQL Configuration

The PostgreSQL container includes performance optimizations:

```yaml
POSTGRES_INITDB_ARGS: >-
  -c log_connections=on
  -c log_disconnections=on
  -c log_min_duration_statement=1000
  -c shared_preload_libraries=pg_stat_statements
```

This enables:
- Connection logging for security auditing
- Slow query logging (queries > 1 second)
- Query performance statistics via `pg_stat_statements`

### Query Performance Analysis

```bash
# View slow queries
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c \
  "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Analyze table
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c \
  "ANALYZE users;"

# View table size
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c \
  "SELECT pg_size_pretty(pg_total_relation_size('users')) AS size;"
```

## Resource Limits

The docker-compose file includes resource limits to prevent runaway container resource usage:

### PostgreSQL
- **CPU limit**: 2 cores
- **CPU reserved**: 1 core
- **Memory limit**: 2GB
- **Memory reserved**: 1GB

### API
- **CPU limit**: 1 core
- **CPU reserved**: 0.5 core
- **Memory limit**: 1GB
- **Memory reserved**: 512MB

Adjust these values in `docker-compose.prod.yml` based on your server specifications.

## Monitoring

### Prometheus Metrics

PostgreSQL metrics are collected via:

```sql
shared_preload_libraries=pg_stat_statements
```

Metrics available at: `http://localhost:9090`

### Grafana Dashboards

Access at: `http://localhost:3100`

Default credentials:
- Username: `admin`
- Password: From `GRAFANA_PASSWORD` environment variable

### Check Connection Count

```bash
docker exec wise2-postgres-prod psql -U wise2_prod_user -d wise2_core_prod -c \
  "SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY datname, usename;"
```

## Security Best Practices

1. **Change all default passwords** in production
2. **Use strong passwords** (at least 32 characters, random)
3. **Restrict network access** to PostgreSQL port
4. **Enable SSL/TLS** for remote database connections
5. **Rotate credentials regularly** (quarterly minimum)
6. **Monitor audit logs** for suspicious activity
7. **Maintain backups** with test restores
8. **Keep PostgreSQL updated** to latest patch version

## Production Checklist

- [ ] Set unique, strong password for `POSTGRES_ADMIN_PASSWORD`
- [ ] Set unique, strong password for `POSTGRES_APP_PASSWORD`
- [ ] Set unique JWT secret in `JWT_SECRET`
- [ ] Configure CORS origins in `CORS_ORIGIN`
- [ ] Set up SSL/TLS certificates for HTTPS
- [ ] Configure backup retention policy
- [ ] Set up monitoring and alerting
- [ ] Create backup retention schedule
- [ ] Test disaster recovery procedures
- [ ] Document any custom configuration
- [ ] Set up database connection pooling
- [ ] Configure log retention policies

## References

- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [WISE² Database Schema](../database/SCHEMA_DESIGN.md)
