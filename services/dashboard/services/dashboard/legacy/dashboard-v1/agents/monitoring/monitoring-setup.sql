-- Wise Defense Monitoring System Database Schema
CREATE TABLE IF NOT EXISTS monitoring_cycles (
  id SERIAL PRIMARY KEY,
  cycle_number INT,
  cycle_timestamp TIMESTAMP,
  cycle_duration_seconds INT,

  -- Performance metrics
  uptime_percentage FLOAT,
  uptime_status VARCHAR(20),
  web_vitals_lcp FLOAT,
  web_vitals_fid FLOAT,
  web_vitals_cls FLOAT,
  api_latency_p50 INT,
  api_latency_p95 INT,
  api_latency_p99 INT,

  -- Engagement metrics
  chat_sessions INT,
  chat_bounce_rate FLOAT,
  active_users INT,
  conversion_rate FLOAT,
  popular_buttons JSONB,

  -- Chat analysis
  escalation_rate FLOAT,
  escalation_count INT,
  negative_sentiment_pct FLOAT,
  trending_questions JSONB,
  new_knowledge_gaps JSONB,

  -- Quality metrics
  response_quality_score INT,
  user_satisfaction_pct FLOAT,

  -- Business metrics
  mrr FLOAT,
  arr FLOAT,
  daily_revenue FLOAT,
  churn_rate FLOAT,
  ltv FLOAT,
  chat_adoption FLOAT,
  course_adoption FLOAT,
  booking_adoption FLOAT,
  shop_adoption FLOAT,

  -- Anomalies & recommendations
  anomalies_detected INT,
  anomalies_data JSONB,
  recommendations_count INT,
  recommendations_data JSONB,

  -- Status
  cycle_status VARCHAR(50),
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_timestamp
  ON monitoring_cycles(cycle_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_status
  ON monitoring_cycles(cycle_status);
CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_created
  ON monitoring_cycles(created_at DESC);
