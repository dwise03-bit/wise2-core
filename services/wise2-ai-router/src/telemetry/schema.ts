/**
 * Database schema setup for telemetry
 */

export const TELEMETRY_SCHEMA = `
CREATE TABLE IF NOT EXISTS ai_router_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Request identification
  project_id VARCHAR(100),
  agent_id VARCHAR(100),
  user_id VARCHAR(100),
  task_type VARCHAR(50),

  -- Routing decision
  route_mode VARCHAR(10),
  actual_route VARCHAR(10),
  model VARCHAR(100),
  provider VARCHAR(50),

  -- Usage metrics
  input_tokens INT,
  output_tokens INT,
  context_bytes INT,
  latency_ms INT,
  estimated_cost DECIMAL(8, 6),

  -- Cache
  cache_hit BOOLEAN DEFAULT FALSE,

  -- Budget
  budget_pct_at_request INT,
  threshold VARCHAR(20),

  -- Metadata
  privacy_class VARCHAR(20),
  priority VARCHAR(20),

  -- Success/failure
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,

  -- Compliance
  prompt_hash VARCHAR(64),
  response_summary TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_router_events_timestamp
  ON ai_router_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_router_events_project
  ON ai_router_events(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_router_events_user
  ON ai_router_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_router_events_provider
  ON ai_router_events(provider);
CREATE INDEX IF NOT EXISTS idx_ai_router_events_date_project
  ON ai_router_events(DATE(timestamp), project_id);
`;

/**
 * Initialize telemetry schema
 */
export async function initializeSchema(pool: any): Promise<void> {
  try {
    await pool.query(TELEMETRY_SCHEMA);
    console.log('✅ Telemetry schema initialized');
  } catch (error) {
    console.error('Failed to initialize telemetry schema:', error);
    throw error;
  }
}
