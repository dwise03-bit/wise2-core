-- ============================================================================
-- WISE² Analytics & Audit Schema
-- Migration: 005_analytics_schema.sql
-- ============================================================================

-- User Events Table (for analytics)
CREATE TABLE IF NOT EXISTS user_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(255) NOT NULL,
  event_category VARCHAR(100),
  event_data JSONB,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  resource_id UUID,
  changes JSONB,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for user_events table
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_event_category ON user_events(event_category);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id_created_at ON user_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type_created_at ON user_events(event_type, created_at);

-- Create indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id_created_at ON audit_logs(resource_id, created_at);

-- Partitioning for large tables (optional, for production optimization)
-- SELECT create_hypertable('user_events', 'created_at', if_not_exists => TRUE);
-- SELECT create_hypertable('audit_logs', 'created_at', if_not_exists => TRUE);
