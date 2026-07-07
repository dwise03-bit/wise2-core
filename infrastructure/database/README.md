# Wise² Database

PostgreSQL database schema, migrations, and backup utilities for Wise² Core.

## Quick Start

### 1. Start Database Container

```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### 2. Initialize Database

```bash
# Run schema initialization
psql postgresql://postgres:postgres@localhost:5432/wise2_core < schema.sql

# Or use seed data script (includes schema)
bash scripts/seed-data.sh
```

### 3. Verify Database

```bash
psql postgresql://postgres:postgres@localhost:5432/wise2_core

# Inside psql:
\dt  # List tables
\d users  # Describe table
SELECT COUNT(*) FROM users;  # Count rows
\q  # Exit
```

## Database Structure

### Tables

| Table | Purpose | Records |
|-------|---------|---------|
| **users** | System users & accounts | ~1-1000 |
| **sessions** | Active user sessions | ~100-10000 |
| **deployments** | Application deployments | ~10-100 |
| **deployment_services** | Services in deployments | ~50-500 |
| **services** | Real-time service status | ~50-500 |
| **audit_logs** | Change audit trail | ~1000+ |
| **automation_jobs** | Scheduled automation | ~10-100 |
| **automation_tasks** | Job execution history | ~1000+ |

### Views

- `active_deployments` - Currently active deployments
- `deployment_status_summary` - Health summary by deployment
- `user_activity` - User activity metrics

## Backup & Recovery

### Create Backup

```bash
# Manual backup
bash infrastructure/database/backup.sh

# Backup with custom retention
BACKUP_RETENTION_DAYS=60 bash infrastructure/database/backup.sh

# List backups
ls -lh backups/
```

### Restore Backup

```bash
# Restore with confirmation
bash infrastructure/database/restore.sh backups/wise2_core_20260707_120000.sql.gz

# Restore without confirmation (force)
bash infrastructure/database/restore.sh backups/wise2_core_20260707_120000.sql.gz --force
```

### Backup Retention Policy

- **Daily backups**: One backup per day
- **Retention**: 30 days (configurable)
- **Compression**: gzip (9) for ~90% size reduction
- **Storage**: `backups/` directory

## Migrations

### Run Migrations

```bash
# Run all pending migrations
npx ts-node infrastructure/database/migrations-runner.ts run

# Check migration status
npx ts-node infrastructure/database/migrations-runner.ts status

# Rollback last migration
npx ts-node infrastructure/database/migrations-runner.ts rollback
```

### Create Migration

1. Create new SQL file in `migrations/` directory:
   ```bash
   touch infrastructure/database/migrations/003_add_new_column.sql
   ```

2. Write migration SQL:
   ```sql
   -- Add new column to users table
   ALTER TABLE users ADD COLUMN new_column VARCHAR(255);
   ```

3. Run migrations:
   ```bash
   npx ts-node infrastructure/database/migrations-runner.ts run
   ```

### Migration Naming Convention

- Format: `NNN_description.sql`
- Example: `001_initial_schema.sql`, `002_add_indexes.sql`
- Migrations run in alphabetical order
- Schema tracked in `schema_migrations` table

## Maintenance

### Regular Tasks

#### Daily
```bash
# Backup database
bash infrastructure/database/backup.sh
```

#### Weekly
```bash
# Analyze query performance
psql -h localhost -U postgres -d wise2_core -c "ANALYZE;"

# Check table sizes
psql -h localhost -U postgres -d wise2_core -c "
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables WHERE schemaname != 'pg_catalog'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

#### Monthly
```bash
# Reindex tables
psql -h localhost -U postgres -d wise2_core -c "REINDEX DATABASE wise2_core;"

# Vacuum full
psql -h localhost -U postgres -d wise2_core -c "VACUUM FULL ANALYZE;"
```

### Monitor Slow Queries

```bash
# Enable query logging
psql -h localhost -U postgres -d wise2_core -c "
  ALTER DATABASE wise2_core SET log_min_duration_statement = 1000;  -- Log queries > 1s
"

# View slow queries
psql -h localhost -U postgres -d wise2_core -c "
  SELECT query, calls, mean_time FROM pg_stat_statements 
  ORDER BY mean_time DESC LIMIT 10;"
```

### Check Database Health

```bash
# Connection status
psql -h localhost -U postgres -d wise2_core -c "
  SELECT datname, usename, count(*) 
  FROM pg_stat_activity 
  GROUP BY datname, usename;"

# Table bloat
psql -h localhost -U postgres -d wise2_core -c "
  SELECT schemaname, tablename, 
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables 
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_relation_size(schemaname||'.'||tablename) DESC;"

# Index usage
psql -h localhost -U postgres -d wise2_core -c "
  SELECT schemaname, tablename, indexname, idx_scan 
  FROM pg_stat_user_indexes 
  ORDER BY idx_scan DESC;"
```

## Connection Management

### Connection Pool Settings

- **Min connections**: 2
- **Max connections**: 10
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

Adjust in `services/api/src/database.ts` if needed.

### Active Connections

```bash
# List all connections
psql -h localhost -U postgres -d wise2_core -c "
  SELECT pid, usename, client_addr, query 
  FROM pg_stat_activity 
  WHERE datname = 'wise2_core';"

# Kill connection (if needed)
psql -h localhost -U postgres -d wise2_core -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE usename = 'wise2_app';"
```

## User Management

### Create Database User

```bash
# Create application user
psql -h localhost -U postgres -c "
  CREATE USER wise2_app WITH PASSWORD 'secure_password';
  GRANT ALL PRIVILEGES ON DATABASE wise2_core TO wise2_app;
  GRANT ALL PRIVILEGES ON SCHEMA public TO wise2_app;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wise2_app;
"
```

### Change User Password

```bash
psql -h localhost -U postgres -c "
  ALTER USER wise2_app WITH PASSWORD 'new_secure_password';
"
```

### Drop User

```bash
psql -h localhost -U postgres -c "
  DROP USER IF EXISTS wise2_app;
"
```

## Disaster Recovery

### Full Recovery Procedure

1. **Stop application**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

2. **Restore database**
   ```bash
   bash infrastructure/database/restore.sh backups/wise2_core_TIMESTAMP.sql.gz --force
   ```

3. **Verify database**
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/wise2_core -c "SELECT COUNT(*) FROM users;"
   ```

4. **Restart application**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Run health check**
   ```bash
   curl http://localhost:3000/health
   ```

### Point-in-Time Recovery

PostgreSQL WAL (Write-Ahead Logging) enables recovery to any point in time. Configure:

```bash
# Enable WAL archiving (requires separate setup)
# See PostgreSQL documentation for details
```

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### Authentication Failed

```bash
# Verify credentials in .env
cat .env | grep POSTGRES

# Test connection
psql postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB
```

### Database Locked

```bash
# List active transactions
psql -h localhost -U postgres -d wise2_core -c "
  SELECT * FROM pg_locks 
  WHERE NOT granted;"

# Kill blocking process (if necessary)
psql -h localhost -U postgres -d wise2_core -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE state = 'idle in transaction';"
```

### Out of Disk Space

```bash
# Check database size
du -sh /var/lib/postgresql/data/

# Clean old backups
find backups/ -name "*.sql.gz" -mtime +30 -delete

# Vacuum to reclaim space
psql -h localhost -U postgres -d wise2_core -c "VACUUM FULL;"
```

## Security

### Best Practices

1. **Use strong passwords** for all database users
2. **Restrict network access** to database
3. **Enable SSL/TLS** for remote connections
4. **Rotate passwords** regularly
5. **Audit access** via audit logs
6. **Backup regularly** and test restores
7. **Monitor connections** for unusual activity

### Audit Trail

All changes are tracked in `audit_logs` table. Query:

```bash
psql -h localhost -U postgres -d wise2_core -c "
  SELECT user_id, action, resource_type, created_at 
  FROM audit_logs 
  ORDER BY created_at DESC 
  LIMIT 20;"
```

## Performance

### Query Optimization

```bash
# Explain query plan
EXPLAIN ANALYZE SELECT * FROM users WHERE id = '...';

# Index missing?
EXPLAIN SELECT * FROM deployments WHERE status = 'deployed';

# Create index if needed
CREATE INDEX idx_deployments_status ON deployments(status);
```

### Monitoring Tools

- **pgAdmin**: Web UI for PostgreSQL management
- **pgBadger**: PostgreSQL log analyzer
- **pg_stat_statements**: Query performance insights

## Backups

See [Backup & Recovery](#backup--recovery) section above.

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin](https://www.pgadmin.org/)
- [Database Architecture](./SCHEMA_DESIGN.md)
- [Wise² Documentation](../../docs/)
