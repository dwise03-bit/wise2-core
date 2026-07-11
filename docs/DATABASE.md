# DATABASE SCHEMA

**WISE² Enterprise**  
**Version**: 10.0  
**Date**: 2026-07-11

---

## DATABASE OVERVIEW

- **Engine**: PostgreSQL 15+
- **Connection Pool**: PgBouncer (max 100 connections)
- **Timezone**: UTC
- **Encoding**: UTF-8

---

## CORE TABLES

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  role ENUM ('user', 'admin', 'creator') DEFAULT 'user',
  subscription_tier ENUM ('free', 'creator', 'pro', 'enterprise') DEFAULT 'free',
  status ENUM ('active', 'suspended', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM ('draft', 'active', 'archived') DEFAULT 'draft',
  project_type ENUM ('sound_labs', 'design', 'video', 'web') DEFAULT 'sound_labs',
  brand_dna JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### tracks
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  name VARCHAR(255),
  audio_url TEXT NOT NULL,
  duration INTEGER,
  volume FLOAT DEFAULT 1.0,
  muted BOOLEAN DEFAULT FALSE,
  effects JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tracks_project_id ON tracks(project_id);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status ENUM ('active', 'paused', 'cancelled') DEFAULT 'active',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## BACKUP & RECOVERY

- **Frequency**: Daily
- **Retention**: 30 days
- **Location**: S3 cross-region
- **RTO**: < 1 hour

---

**Owner**: Wise Defense LLC  
**Last Updated**: 2026-07-11
