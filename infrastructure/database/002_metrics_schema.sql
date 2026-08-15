-- Wise² Metrics Schema Migration
-- Adds tables for storing system, user, and production metrics
-- Version: 1.0.0
-- Created: 2026-07-20

-- ============================================================================
-- System Metrics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metric type
  metric_type VARCHAR(50) NOT NULL
    CHECK (metric_type IN ('git', 'docker', 'nginx', 'database', 'system')),

  -- Git metrics
  git_branch VARCHAR(255),
  git_total_commits INTEGER,
  git_commits_since_tag INTEGER,
  git_status VARCHAR(50),
  git_uncommitted_changes JSONB,

  -- Docker metrics
  docker_running_containers INTEGER,
  docker_total_containers INTEGER,
  docker_cpu_percent NUMERIC(5,2),
  docker_memory_mb NUMERIC(10,2),

  -- Nginx metrics
  nginx_available BOOLEAN,
  nginx_requests_count INTEGER,
  nginx_error_rate NUMERIC(5,2),
  nginx_avg_response_time_ms INTEGER,

  -- Database metrics
  database_connections_active INTEGER,
  database_connections_idle INTEGER,
  database_cache_hit_ratio NUMERIC(5,2),
  database_size_mb NUMERIC(10,2),

  -- Raw data
  raw_data JSONB DEFAULT '{}',

  -- Metadata
  collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_collected_at ON system_metrics(collected_at);
CREATE INDEX idx_system_metrics_created_at ON system_metrics(created_at);

-- ============================================================================
-- User Events Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Event type
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL
    CHECK (event_category IN (
      'sound_lab',
      'live_studio',
      'jingle_lab',
      'voice_lab',
      'content_factory',
      'client_showcase',
      'command_center',
      'other'
    )),

  -- Event details
  action VARCHAR(100) NOT NULL,
  status VARCHAR(50),

  -- Resource reference
  resource_id VARCHAR(255),
  resource_type VARCHAR(100),

  -- Metadata
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',

  -- Request tracking
  session_id VARCHAR(255),
  request_id VARCHAR(255),

  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_type ON user_events(event_type);
CREATE INDEX idx_user_events_category ON user_events(event_category);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
CREATE INDEX idx_user_events_session_id ON user_events(session_id);

-- ============================================================================
-- Production Metrics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS production_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Production type
  production_type VARCHAR(100) NOT NULL,

  -- Aggregation
  aggregation_type VARCHAR(50) NOT NULL
    CHECK (aggregation_type IN ('hourly', 'daily', 'weekly', 'monthly')),

  -- Counts
  total_count INTEGER DEFAULT 0,
  successful_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Metrics
  avg_duration_seconds NUMERIC(10,2),
  avg_size_mb NUMERIC(10,2),

  -- Time window
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,

  -- Raw data
  raw_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_production_metrics_type ON production_metrics(production_type);
CREATE INDEX idx_production_metrics_period ON production_metrics(period_start, period_end);
CREATE INDEX idx_production_metrics_created_at ON production_metrics(created_at);

-- ============================================================================
-- Daily Active Users Aggregation Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  day DATE NOT NULL UNIQUE,

  -- User metrics
  total_active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,

  -- Session metrics
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration_seconds NUMERIC(10,2),

  -- Engagement metrics
  avg_events_per_user NUMERIC(10,2),

  -- Raw data
  raw_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_active_users_day ON daily_active_users(day);
CREATE INDEX idx_daily_active_users_created_at ON daily_active_users(created_at);

-- ============================================================================
-- Revenue Metrics Table (from Stripe webhooks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date
  metric_date DATE NOT NULL,

  -- Revenue metrics
  revenue_cents BIGINT DEFAULT 0,
  mrr_cents BIGINT DEFAULT 0,

  -- Subscription metrics
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  churned_subscriptions INTEGER DEFAULT 0,

  -- Customer metrics
  total_customers INTEGER DEFAULT 0,
  arpu_cents NUMERIC(10,0),

  -- Transaction data
  transaction_count INTEGER DEFAULT 0,

  -- Raw data
  raw_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revenue_metrics_date ON revenue_metrics(metric_date);
CREATE INDEX idx_revenue_metrics_created_at ON revenue_metrics(created_at);

-- ============================================================================
-- Error Tracking Table (from Sentry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS error_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Error identification
  error_type VARCHAR(255) NOT NULL,
  error_message TEXT,
  error_fingerprint VARCHAR(255),

  -- Error severity
  severity VARCHAR(50) NOT NULL
    CHECK (severity IN ('critical', 'error', 'warning', 'info', 'debug')),

  -- Source
  source_service VARCHAR(100),
  source_file VARCHAR(255),
  source_line INTEGER,

  -- Stack trace
  stack_trace TEXT,

  -- Occurrences
  occurrence_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMP,
  last_occurrence TIMESTAMP,

  -- Raw data
  raw_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_error_metrics_type ON error_metrics(error_type);
CREATE INDEX idx_error_metrics_severity ON error_metrics(severity);
CREATE INDEX idx_error_metrics_service ON error_metrics(source_service);
CREATE INDEX idx_error_metrics_created_at ON error_metrics(created_at);

-- ============================================================================
-- Performance Metrics Table (Core Web Vitals)
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Page
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),

  -- Core Web Vitals
  lcp_ms NUMERIC(10,2),  -- Largest Contentful Paint
  fid_ms NUMERIC(10,2),  -- First Input Delay
  cls NUMERIC(5,3),      -- Cumulative Layout Shift

  -- Additional metrics
  fcp_ms NUMERIC(10,2),  -- First Contentful Paint
  ttfb_ms NUMERIC(10,2), -- Time to First Byte

  -- Aggregation
  sample_count INTEGER DEFAULT 1,

  -- Time window
  measurement_period DATE NOT NULL,

  -- Raw data
  raw_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_metrics_url ON performance_metrics(page_url);
CREATE INDEX idx_performance_metrics_period ON performance_metrics(measurement_period);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);

-- ============================================================================
-- View: Hourly Metrics Aggregation
-- ============================================================================

CREATE OR REPLACE VIEW hourly_metrics_summary AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  metric_type,
  count(*) as sample_count,
  created_at
FROM system_metrics
GROUP BY DATE_TRUNC('hour', created_at), metric_type
ORDER BY hour DESC;

-- ============================================================================
-- View: Daily Production Summary
-- ============================================================================

CREATE OR REPLACE VIEW daily_production_summary AS
SELECT
  DATE(created_at) as day,
  production_type,
  COUNT(*) as total_events,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  AVG(duration_seconds) as avg_duration_seconds
FROM user_events
WHERE event_category IN ('sound_lab', 'live_studio', 'jingle_lab', 'voice_lab', 'content_factory')
GROUP BY DATE(created_at), production_type
ORDER BY day DESC;
