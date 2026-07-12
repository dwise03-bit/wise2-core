# Database Documentation — Wise² Core

PostgreSQL database schema and reference for Wise² Core.

---

## Overview

**Database Type**: PostgreSQL 16
**Host**: postgres (docker-compose) / Configured via DATABASE_URL
**Port**: 5432
**Database Name**: wise2_core
**Current Version**: 1.0

---

## Database Connection

### Connection String Format

```
postgresql://username:password@host:port/database_name
```

### Local Development

```bash
# Connect using docker-compose
docker-compose exec postgres psql -U postgres -d wise2_core

# Or using direct connection
psql -h localhost -U postgres -d wise2_core -W
```

### Environment Variable

```bash
DATABASE_URL=postgresql://postgres:password@postgres:5432/wise2_core
```

---

## Schema Overview

The database is organized into several main domains:

1. **Authentication & Users** - User accounts and authentication
2. **Deployment** - Deployment tracking and versioning
3. **Services** - Service status and monitoring
4. **Configuration** - Application configuration
5. **Audit** - Change tracking and audit logs

---

## Tables

### Users Table

**Purpose**: Store user account information

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `email`: User email address (unique, indexed)
- `password_hash`: Hashed password (bcryptjs)
- `name`: User full name
- `role`: User role (admin, user, viewer)
- `status`: Account status (active, inactive, suspended)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `last_login`: Last login timestamp
- `deleted_at`: Soft delete timestamp

**Relationships**:
- Has many sessions
- Has many deployments

---

### Sessions Table

**Purpose**: Track user sessions and authentication tokens

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  invalidated_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Fields**:
- `id`: Session identifier
- `user_id`: Reference to users table
- `token`: JWT token (unique)
- `expires_at`: Token expiration time
- `created_at`: Session creation time
- `invalidated_at`: When session was invalidated

**Relationships**:
- Belongs to user

---

### Deployments Table

**Purpose**: Track all deployments and versions

```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  environment VARCHAR(50) NOT NULL,
  deployed_by UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT,
  deployment_log TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deployments_version ON deployments(version);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_environment ON deployments(environment);
CREATE INDEX idx_deployments_deployed_by ON deployments(deployed_by);
```

**Fields**:
- `id`: Deployment identifier
- `version`: Version string (e.g., "1.0.0")
- `status`: Deployment status (queued, in_progress, success, failed)
- `environment`: Target environment (development, staging, production)
- `deployed_by`: User who triggered deployment
- `started_at`: Deployment start time
- `completed_at`: Deployment completion time
- `error_message`: Error message if failed
- `deployment_log`: Full deployment log
- `created_at`: Record creation time

**Relationships**:
- Belongs to user
- Has many service_deployments

---

### Deployment Services Table

**Purpose**: Track individual service deployment status

```sql
CREATE TABLE deployment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  version VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_deployment_services_deployment_id ON deployment_services(deployment_id);
CREATE INDEX idx_deployment_services_service_name ON deployment_services(service_name);
```

**Fields**:
- `id`: Record identifier
- `deployment_id`: Reference to deployments
- `service_name`: Service name (api, dashboard, bot, worker)
- `status`: Service deployment status
- `version`: Service version deployed
- `started_at`: Service deployment start
- `completed_at`: Service deployment completion
- `error_message`: Error if failed

---

### Services Table

**Purpose**: Track service status and health

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'unknown',
  version VARCHAR(50),
  uptime_seconds BIGINT DEFAULT 0,
  last_health_check TIMESTAMP,
  last_restart TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_status ON services(status);
```

**Fields**:
- `id`: Service identifier
- `name`: Service name (api, dashboard, bot, worker, etc.)
- `status`: Current status (running, stopped, error)
- `version`: Current deployed version
- `uptime_seconds`: Total uptime in seconds
- `last_health_check`: Last health check timestamp
- `last_restart`: Last service restart
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

---

### Audit Log Table

**Purpose**: Track all significant operations for compliance

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  changes JSONB,
  status VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Fields**:
- `id`: Log entry identifier
- `user_id`: User who performed action
- `action`: Action type (login, deploy, update, delete)
- `resource_type`: What was acted upon
- `resource_id`: ID of resource
- `changes`: JSONB of what changed
- `status`: Success/failure status
- `ip_address`: Source IP address
- `user_agent`: Browser/client info
- `created_at`: When action occurred

---

### Configuration Table

**Purpose**: Store application configuration

```sql
CREATE TABLE configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_configuration_key ON configuration(key);
```

**Fields**:
- `id`: Config entry identifier
- `key`: Configuration key
- `value`: Configuration value (JSONB for flexibility)
- `description`: What this config does
- `updated_by`: Who last updated it
- `updated_at`: Last update time
- `created_at`: Creation time

---

## Relationships Diagram

```
users (1) ---- (Many) sessions
users (1) ---- (Many) deployments
users (1) ---- (Many) audit_logs

deployments (1) ---- (Many) deployment_services

services (Independent)

configuration (Independent)

audit_logs (Foreign Key to users)
```

---

## Constraints

### Primary Keys
- All tables use UUID primary keys for security and distribution

### Foreign Keys
- `sessions.user_id` → `users.id` (CASCADE DELETE)
- `deployments.deployed_by` → `users.id` (RESTRICT)
- `deployment_services.deployment_id` → `deployments.id` (CASCADE DELETE)
- `audit_logs.user_id` → `users.id` (SET NULL)

### Unique Constraints
- `users.email` - One email per user
- `sessions.token` - Tokens are unique
- `configuration.key` - One value per config key
- `services.name` - One record per service

### Indexes

**Performance Indexes**:
- User lookups: email, role, status
- Session management: user_id, token, expires_at
- Deployment tracking: version, status, environment
- Audit trail: user_id, created_at, resource_type

---

## Data Types

### Standard Types
- `UUID`: Unique identifiers
- `VARCHAR(n)`: Text fields with limits
- `TEXT`: Long text fields
- `TIMESTAMP`: Date/time with timezone
- `BIGINT`: Large integers (uptime seconds)
- `INET`: IP addresses
- `JSONB`: JSON binary format (for flexibility)

---

## Queries

### Common Queries

#### Get user with sessions
```sql
SELECT u.*, s.token, s.expires_at
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
WHERE u.email = 'user@example.com'
  AND s.invalidated_at IS NULL
  AND s.expires_at > NOW();
```

#### Get deployment history
```sql
SELECT d.*, u.email as deployed_by_email
FROM deployments d
JOIN users u ON d.deployed_by = u.id
WHERE d.environment = 'production'
ORDER BY d.started_at DESC
LIMIT 20;
```

#### Get service health
```sql
SELECT name, status, version, last_health_check
FROM services
ORDER BY status DESC, name;
```

#### Audit log for user
```sql
SELECT * FROM audit_logs
WHERE user_id = 'uuid-here'
ORDER BY created_at DESC
LIMIT 100;
```

---

## Maintenance

### Backups

**Automated Backup**:
```bash
docker-compose exec postgres pg_dump -U postgres wise2_core | gzip > backup.sql.gz
```

**Restore from Backup**:
```bash
gunzip < backup.sql.gz | docker-compose exec -T postgres psql -U postgres wise2_core
```

**Backup Script**:
See `infrastructure/scripts/backup.sh`

### Migrations

All schema changes go through migrations:

```bash
migrations/
├── 001_initial_schema.sql
├── 002_add_audit_logs.sql
└── 003_add_configuration_table.sql
```

### Indexes

**Rebuild Indexes** (if corrupted):
```sql
REINDEX DATABASE wise2_core;
```

**Check Index Usage**:
```sql
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Vacuuming

Automatic vacuum is enabled. Manual vacuum:

```sql
VACUUM ANALYZE;
```

---

## Monitoring

### Connection Monitoring

```sql
SELECT count(*) as connection_count FROM pg_stat_activity;
SELECT * FROM pg_stat_activity WHERE state != 'idle';
```

### Query Performance

```sql
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Table Sizes

```sql
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## Performance

### Query Optimization Tips

1. Always use indexed columns in WHERE clauses
2. Use EXPLAIN ANALYZE to plan queries
3. Limit result sets with LIMIT
4. Use pagination for large result sets
5. Index foreign keys used in joins

### Slow Query Log

Queries taking > 1 second are logged:

```sql
ALTER DATABASE wise2_core SET log_min_duration_statement = 1000;
```

---

## Security

### User Access

- All queries use prepared statements (SQL injection prevention)
- Row-level security (RLS) for sensitive data (to be implemented)
- Connections use SSL/TLS
- Database user has minimal permissions

### Data Protection

- Passwords hashed with bcryptjs
- PII encrypted at rest (to be implemented)
- Audit logs immutable
- Backups encrypted

---

## Support

For database issues:
1. Check PostgreSQL logs: `docker-compose logs postgres`
2. Verify connectivity: `docker-compose exec postgres pg_isready`
3. Run health check: `docker-compose exec postgres pg_stat_activity`
4. Contact database team

---

**Database Documentation Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: Database/DevOps Team

*Note: This schema represents the current design. Actual tables may differ based on implementation.*
