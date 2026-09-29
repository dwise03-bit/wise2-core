# Wise² Database Schema Design

**Version**: 1.0  
**Status**: ACTIVE  
**Owner**: CTO  
**Database**: PostgreSQL 15+  
**Last Updated**: 2026-07-07

---

## Overview

Complete database schema for Wise² Core platform. All services read/write to this single PostgreSQL instance.

**Design Principles**:
- Normalization to 3NF
- Efficient indexing for common queries
- Audit trail on critical tables
- Soft deletes where appropriate
- Temporal tracking (created_at, updated_at)
- Data integrity constraints

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │◄──────┐
│ name            │       │
│ role            │       │
│ is_active       │       │
│ created_at      │       │
│ updated_at      │       │
│ deleted_at      │       │
└─────────────────┘       │
         ▲                │
         │                │
    ┌────┴────────┐  ┌────┴──────────┐
    │             │  │               │
┌───┴──────┐  ┌──┴──────┐  ┌────────┴───┐
│ sessions │  │audit_log│  │deployments │
└──────────┘  └─────────┘  └────────┬───┘
                                   │
                            ┌──────┴─────────┐
                            │                │
                    ┌───────┴────┐  ┌────────┴──────┐
                    │   services │  │deployment_svcs│
                    └────────────┘  └─────────────────┘

┌──────────────────┐  ┌────────────────────┐
│automation_jobs   │  │automation_tasks    │
├──────────────────┤  ├────────────────────┤
│ id (PK)          │  │ id (PK)            │
│ name             │  │ job_id (FK)        │
│ trigger          │  │ status             │
│ actions (JSONB)  │  │ result (JSONB)     │
│ schedule (JSONB) │  │ started_at         │
│ is_enabled       │  │ completed_at       │
└──────────────────┘  └────────────────────┘
```

---

## Core Tables

### 1. users

Stores all system users.

```sql
CREATE TABLE users (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- Authentication
  password_hash VARCHAR(255) NOT NULL,
  
  -- Profile
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  
  -- Authorization
  role VARCHAR(50) NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'operator', 'developer', 'viewer')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_created_at (created_at),
  INDEX idx_users_deleted_at (deleted_at)
);
```

**Constraints**:
- Email is globally unique
- Role must be one of defined values
- Password must be hashed on application side (never stored plaintext)

**Soft Delete**: Uses deleted_at column for soft deletes

---

### 2. sessions

Stores active user sessions.

```sql
CREATE TABLE sessions (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Authentication
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  
  -- Lifecycle
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_expires_at (expires_at),
  INDEX idx_sessions_token_hash (token_hash)
);
```

**Constraints**:
- Token hash is unique (no duplicate sessions)
- User must exist
- Expires_at cannot be in past

**Notes**:
- No soft delete (sessions are ephemeral)
- Cleanup: Delete expired sessions daily

---

### 3. deployments

Stores deployment configurations.

```sql
CREATE TABLE deployments (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Naming & Description
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuration
  configuration JSONB NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'preparing', 'ready', 'deployed', 'failed', 'archived')),
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deployed_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_deployments_user_id (user_id),
  INDEX idx_deployments_status (status),
  INDEX idx_deployments_created_at (created_at),
  INDEX idx_deployments_name (name)
);
```

**Constraints**:
- User must exist
- Status must be valid state
- Name should be unique per user (recommend application-level check)

---

### 4. deployment_services

Maps services to deployments.

```sql
CREATE TABLE deployment_services (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  
  -- Service Configuration
  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL
    CHECK (service_type IN ('api', 'dashboard', 'admin', 'bot', 'worker')),
  
  -- Docker Configuration
  docker_image VARCHAR(255) NOT NULL,
  docker_tag VARCHAR(255) DEFAULT 'latest',
  container_port INTEGER NOT NULL,
  container_memory VARCHAR(50) DEFAULT '512m',
  container_cpu VARCHAR(50) DEFAULT '0.5',
  
  -- Environment
  environment JSONB DEFAULT '{}',
  secrets JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'configured'
    CHECK (status IN ('configured', 'starting', 'running', 'restarting', 'stopping', 'stopped', 'failed')),
  
  -- Health
  health_check_url TEXT,
  health_check_interval INTEGER DEFAULT 30,
  last_health_check_at TIMESTAMP,
  last_health_status VARCHAR(50),
  
  -- Metrics
  metrics JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_deployment_services_deployment_id (deployment_id),
  INDEX idx_deployment_services_status (status),
  INDEX idx_deployment_services_service_name (service_name)
);
```

**Constraints**:
- Deployment must exist
- Service type must be recognized
- Port must be valid (1-65535)
- Memory/CPU must be valid

---

### 5. services

Tracks all deployed services and their health.

```sql
CREATE TABLE services (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployments(id),
  deployment_service_id UUID REFERENCES deployment_services(id),
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  version VARCHAR(50),
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'unknown'
    CHECK (status IN ('running', 'stopped', 'restarting', 'failed', 'unknown')),
  
  -- Health
  is_healthy BOOLEAN DEFAULT false,
  last_health_check_at TIMESTAMP,
  health_check_failures INTEGER DEFAULT 0,
  
  -- Access
  http_url TEXT,
  port INTEGER,
  
  -- Metrics (recent)
  cpu_percent FLOAT,
  memory_bytes BIGINT,
  memory_percent FLOAT,
  uptime_seconds BIGINT,
  
  -- Timestamps
  started_at TIMESTAMP,
  last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_services_deployment_id (deployment_id),
  INDEX idx_services_status (status),
  INDEX idx_services_name (name)
);
```

**Notes**:
- Real-time status table, refreshed by monitoring system
- Metrics are recent values (not historical)

---

### 6. audit_logs

Tracks all user actions for compliance.

```sql
CREATE TABLE audit_logs (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- Action
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_resource (resource_type, resource_id),
  INDEX idx_audit_logs_created_at (created_at),
  INDEX idx_audit_logs_action (action)
);
```

**Notes**:
- Immutable (no updates or deletes)
- User can be null for system actions
- Use for compliance and investigation

---

### 7. automation_jobs

Stores automation job definitions.

```sql
CREATE TABLE automation_jobs (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Configuration
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Trigger
  trigger JSONB NOT NULL,
  -- Example: {"type": "schedule", "cron": "0 0 * * *"}
  -- Example: {"type": "event", "event_type": "deployment:completed"}
  
  -- Actions
  actions JSONB NOT NULL,
  -- Example: [{"type": "notify", "channels": ["email", "slack"]}]
  
  -- Schedule (if scheduled)
  schedule JSONB,
  -- Example: {"type": "cron", "expression": "0 0 * * *"}
  
  -- Status
  is_enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_automation_jobs_user_id (user_id),
  INDEX idx_automation_jobs_enabled (is_enabled),
  INDEX idx_automation_jobs_next_run (next_run_at)
);
```

---

### 8. automation_tasks

Tracks automation task executions.

```sql
CREATE TABLE automation_tasks (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES automation_jobs(id),
  
  -- Execution
  status VARCHAR(50) NOT NULL
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  
  -- Result
  result JSONB,
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  
  -- Metadata
  input_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_automation_tasks_job_id (job_id),
  INDEX idx_automation_tasks_status (status),
  INDEX idx_automation_tasks_created_at (created_at)
);
```

---

## Indexes

### Critical Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Session lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Deployment queries
CREATE INDEX idx_deployments_user_id ON deployments(user_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_created_at ON deployments(created_at);

-- Service queries
CREATE INDEX idx_services_deployment_id ON services(deployment_id);
CREATE INDEX idx_services_status ON services(status);

-- Audit logging
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Automation
CREATE INDEX idx_automation_jobs_next_run ON automation_jobs(next_run_at);
CREATE INDEX idx_automation_tasks_job_id ON automation_tasks(job_id);
```

---

## Constraints & Relationships

### Foreign Key Constraints
```
sessions → users (ON DELETE CASCADE)
deployments → users (ON DELETE CASCADE)
deployment_services → deployments (ON DELETE CASCADE)
services → deployments (ON DELETE CASCADE)
services → deployment_services (ON DELETE SET NULL)
automation_jobs → users (ON DELETE CASCADE)
automation_tasks → automation_jobs (ON DELETE CASCADE)
audit_logs → users (ON DELETE SET NULL)
```

### Check Constraints
```
users.role IN ('admin', 'operator', 'developer', 'viewer')
deployments.status IN ('draft', 'preparing', 'ready', 'deployed', 'failed', 'archived')
deployment_services.status IN ('configured', 'starting', 'running', 'restarting', 'stopping', 'stopped', 'failed')
deployment_services.service_type IN ('api', 'dashboard', 'admin', 'bot', 'worker')
services.status IN ('running', 'stopped', 'restarting', 'failed', 'unknown')
automation_tasks.status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
```

---

## Migrations

### Migration 001: Initial Schema
- Create all core tables
- Add primary keys and indexes
- Add constraints

### Migration 002: Add Audit Triggers
- Create triggers for audit logging on key tables
- Track changes to users, deployments, services

### Migration 003: Add Views
- Create views for common queries

---

## Backup & Recovery

### Backup Strategy
```
Daily full backups at 02:00 UTC
Incremental backups every 6 hours
30-day retention policy
Offsite backup to S3
```

### Recovery Time Objectives
```
Single table: <5 minutes
Single row: <1 minute
Full database: <30 minutes
```

---

## Maintenance

### Regular Tasks
```
Weekly: VACUUM ANALYZE
Monthly: REINDEX
Quarterly: Statistics review
```

### Monitoring Queries
```
-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname != 'pg_catalog'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Slow queries (requires pg_stat_statements)
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;
```

---

**Last Updated**: 2026-07-07  
**Next Review**: 2026-10-07  
**Owner**: CTO / Database Architect
