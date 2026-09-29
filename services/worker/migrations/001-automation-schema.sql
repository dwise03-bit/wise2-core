-- ============================================================================
-- WISE² Automation & Digital Workforce Schema
-- ============================================================================

-- Customers table (extended from basic profile)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  source VARCHAR(50), -- 'web', 'email', 'referral', etc.
  status VARCHAR(50) DEFAULT 'lead', -- lead, prospect, customer, inactive
  lifecycle_stage VARCHAR(50) DEFAULT 'lead', -- lead, marketing_qualified, sales_qualified, customer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Activities (engagement log)
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'lead_created', 'email_sent', 'meeting_scheduled', etc.
  description TEXT,
  metadata JSON, -- Additional context
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_type (type),
  INDEX idx_created (created_at)
);

-- Automation jobs (track what Digital Workforce has done)
CREATE TABLE IF NOT EXISTS automation_jobs (
  id SERIAL PRIMARY KEY,
  automation_type VARCHAR(100) NOT NULL, -- 'lead_capture', 'follow_up', etc.
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
  input_data JSON,
  output_data JSON,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_automation_type (automation_type),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Subscriptions (for Stripe billing integration)
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50) NOT NULL, -- 'starter', 'pro', 'enterprise'
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  price_per_cycle DECIMAL(10, 2),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_stripe_customer (stripe_customer_id),
  INDEX idx_status (status)
);

-- Workflow templates (automation definitions)
CREATE TABLE IF NOT EXISTS workflow_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(100) NOT NULL, -- 'lead_created', 'payment_received', etc.
  actions JSON NOT NULL, -- Array of action definitions
  retry_policy JSON, -- { maxRetries, backoffMs, exponential }
  timeout_ms INTEGER DEFAULT 300000,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trigger_type (trigger_type),
  INDEX idx_enabled (enabled)
);

-- Workflow executions (track automation runs)
CREATE TABLE IF NOT EXISTS workflow_executions (
  id SERIAL PRIMARY KEY,
  workflow_template_id INTEGER NOT NULL REFERENCES workflow_templates(id),
  trigger_data JSON,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  result JSON,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workflow (workflow_template_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);
