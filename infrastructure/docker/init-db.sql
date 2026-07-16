-- WISE² Core Database Initialization Script
-- PostgreSQL 15+
-- This script runs automatically when the PostgreSQL container starts
-- It creates the database, user, and initializes the schema

-- ============================================================================
-- Database and User Setup
-- ============================================================================

-- Create the production database if it doesn't exist
CREATE DATABASE wise2_core_prod WITH
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'C.UTF-8'
  LC_CTYPE = 'C.UTF-8'
  TEMPLATE = 'template0';

-- Create the application user with a strong password
-- NOTE: In production, use a strong, randomly generated password via environment variable
CREATE USER wise2_prod_user WITH
  PASSWORD '${POSTGRES_APP_PASSWORD:-wise2_prod_secure_2026}';

-- Grant connection privileges to the application user
GRANT CONNECT ON DATABASE wise2_core_prod TO wise2_prod_user;

-- ============================================================================
-- Schema Initialization (Connected to wise2_core_prod database)
-- ============================================================================

-- Connect to the wise2_core_prod database for schema creation
\c wise2_core_prod

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- Users Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,

  role VARCHAR(50) NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'operator', 'developer', 'viewer')),

  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- ============================================================================
-- Sessions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  token_hash VARCHAR(255) NOT NULL UNIQUE,

  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,

  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_revoked_at ON sessions(revoked_at);

-- ============================================================================
-- Deployments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  configuration JSONB NOT NULL,

  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'preparing', 'ready', 'deployed', 'failed', 'archived')),

  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deployed_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);
CREATE INDEX IF NOT EXISTS idx_deployments_name ON deployments(name);
CREATE INDEX IF NOT EXISTS idx_deployments_is_active ON deployments(is_active);
CREATE INDEX IF NOT EXISTS idx_deployments_deleted_at ON deployments(deleted_at);

-- ============================================================================
-- Deployment Services Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS deployment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,

  service_name VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL
    CHECK (service_type IN ('api', 'dashboard', 'admin', 'bot', 'worker')),

  docker_image VARCHAR(255) NOT NULL,
  docker_tag VARCHAR(255) DEFAULT 'latest',
  container_port INTEGER NOT NULL,
  container_memory VARCHAR(50) DEFAULT '512m',
  container_cpu VARCHAR(50) DEFAULT '0.5',

  environment JSONB DEFAULT '{}',
  secrets JSONB DEFAULT '{}',

  status VARCHAR(50) NOT NULL DEFAULT 'configured'
    CHECK (status IN ('configured', 'starting', 'running', 'restarting', 'stopping', 'stopped', 'failed')),

  health_check_url TEXT,
  health_check_interval INTEGER DEFAULT 30,
  last_health_check_at TIMESTAMP,
  last_health_status VARCHAR(50),

  metrics JSONB DEFAULT '{}',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deployment_services_deployment_id ON deployment_services(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_services_status ON deployment_services(status);
CREATE INDEX IF NOT EXISTS idx_deployment_services_service_type ON deployment_services(service_type);
CREATE INDEX IF NOT EXISTS idx_deployment_services_service_name ON deployment_services(service_name);

-- ============================================================================
-- Services Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  deployment_service_id UUID REFERENCES deployment_services(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  version VARCHAR(50),

  status VARCHAR(50) NOT NULL DEFAULT 'unknown'
    CHECK (status IN ('running', 'stopped', 'restarting', 'failed', 'unknown')),

  is_healthy BOOLEAN DEFAULT false,
  last_health_check_at TIMESTAMP,
  health_check_failures INTEGER DEFAULT 0,

  http_url TEXT,
  port INTEGER,

  cpu_percent FLOAT,
  memory_bytes BIGINT,
  memory_percent FLOAT,
  uptime_seconds BIGINT,

  started_at TIMESTAMP,
  last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_deployment_id ON services(deployment_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_is_healthy ON services(is_healthy);

-- ============================================================================
-- Audit Logs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,

  old_values JSONB,
  new_values JSONB,

  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- Automation Jobs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  trigger JSONB NOT NULL,
  actions JSONB NOT NULL,
  schedule JSONB,

  is_enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,

  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_automation_jobs_user_id ON automation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_is_enabled ON automation_jobs(is_enabled);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_next_run_at ON automation_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_created_at ON automation_jobs(created_at);

-- ============================================================================
-- Automation Tasks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES automation_jobs(id) ON DELETE CASCADE,

  status VARCHAR(50) NOT NULL
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  result JSONB,
  error_message TEXT,

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,

  input_data JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_automation_tasks_job_id ON automation_tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_automation_tasks_status ON automation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_automation_tasks_created_at ON automation_tasks(created_at);

-- ============================================================================
-- Updated At Trigger (Auto-Update Timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS deployments_updated_at_trigger
  BEFORE UPDATE ON deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS deployment_services_updated_at_trigger
  BEFORE UPDATE ON deployment_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS automation_jobs_updated_at_trigger
  BEFORE UPDATE ON automation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Audit Trigger (Auto-Log Changes)
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_log_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(current_setting('app.user_id')::uuid, NULL),
    TG_ARGV[0],
    TG_TABLE_NAME,
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Audit users table
CREATE TRIGGER IF NOT EXISTS audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_function('update');

-- Audit deployments table
CREATE TRIGGER IF NOT EXISTS audit_deployments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON deployments
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_function('update');

-- Audit automation_jobs table
CREATE TRIGGER IF NOT EXISTS audit_automation_jobs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON automation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_function('update');

-- ============================================================================
-- Views
-- ============================================================================

-- View: Active deployments
CREATE OR REPLACE VIEW active_deployments AS
SELECT * FROM deployments
WHERE deleted_at IS NULL AND is_active = true
ORDER BY created_at DESC;

-- View: Deployment status summary
CREATE OR REPLACE VIEW deployment_status_summary AS
SELECT
  d.id,
  d.name,
  d.status,
  COUNT(s.id) as service_count,
  SUM(CASE WHEN s.is_healthy THEN 1 ELSE 0 END) as healthy_services
FROM deployments d
LEFT JOIN services s ON d.id = s.deployment_id
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.status;

-- View: User activity
CREATE OR REPLACE VIEW user_activity AS
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(a.id) as action_count,
  MAX(a.created_at) as last_activity
FROM users u
LEFT JOIN audit_logs a ON u.id = a.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email;

-- ============================================================================
-- Grant Permissions to Application User
-- ============================================================================

GRANT ALL PRIVILEGES ON DATABASE wise2_core_prod TO wise2_prod_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO wise2_prod_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wise2_prod_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wise2_prod_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO wise2_prod_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wise2_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wise2_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO wise2_prod_user;

-- ============================================================================
-- Schema Comments
-- ============================================================================

COMMENT ON TABLE users IS 'System users and accounts';
COMMENT ON TABLE sessions IS 'Active user sessions with JWT tokens';
COMMENT ON TABLE deployments IS 'Application deployment configurations';
COMMENT ON TABLE deployment_services IS 'Services within each deployment';
COMMENT ON TABLE services IS 'Real-time service status and metrics';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all changes';
COMMENT ON TABLE automation_jobs IS 'Scheduled and event-triggered jobs';
COMMENT ON TABLE automation_tasks IS 'Execution history of automation jobs';

-- ============================================================================
-- Initialization Complete
-- ============================================================================

-- Log successful initialization
SELECT now() AS initialization_timestamp, 'Database initialization completed successfully' AS status;
