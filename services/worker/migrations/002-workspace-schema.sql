-- ============================================================================
-- WISE² Workspace Model (Multi-Tenant Architecture)
-- ============================================================================

-- Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  workspace_type VARCHAR(100) DEFAULT 'business', -- business, demo, template
  config JSONB DEFAULT '{}'::jsonb, -- Workspace-specific configuration
  theme JSONB DEFAULT '{"mode": "dark", "palette": "enterprise"}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb, -- Enabled features/modules
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_owner (owner_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Workspace Members (RBAC)
CREATE TABLE IF NOT EXISTS workspace_members (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member, viewer, guest
  permissions JSONB DEFAULT '[]'::jsonb, -- Custom permissions
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP,
  UNIQUE(workspace_id, user_id),
  INDEX idx_workspace (workspace_id),
  INDEX idx_user (user_id),
  INDEX idx_role (role)
);

-- Workspace Modules (Feature Registry)
CREATE TABLE IF NOT EXISTS workspace_modules (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  module_name VARCHAR(100) NOT NULL, -- crm, projects, automation, etc.
  enabled BOOLEAN DEFAULT true,
  config JSONB, -- Module-specific configuration
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, module_name),
  INDEX idx_workspace (workspace_id),
  INDEX idx_module (module_name)
);

-- Workflow Definitions (Business Process Templates)
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL, -- Array of workflow steps with conditions
  template_id VARCHAR(100), -- Reference to template (e.g., 'lead_capture')
  trigger_type VARCHAR(100), -- lead_created, order_received, etc.
  enabled BOOLEAN DEFAULT true,
  automation_enabled BOOLEAN DEFAULT false,
  approval_required BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workspace (workspace_id),
  INDEX idx_template (template_id),
  INDEX idx_enabled (enabled)
);

-- Workflow Executions (Track process instances)
CREATE TABLE IF NOT EXISTS workflow_executions (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_definition_id INTEGER NOT NULL REFERENCES workflow_definitions(id),
  trigger_data JSONB,
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, failed, paused
  results JSONB DEFAULT '{}'::jsonb, -- Step results
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_workspace (workspace_id),
  INDEX idx_workflow (workflow_definition_id),
  INDEX idx_status (status),
  INDEX idx_created (started_at)
);

-- Issues (Master Troubleshooter)
CREATE TABLE IF NOT EXISTS workspace_issues (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- infrastructure, business, automation, security, ux
  severity VARCHAR(50) NOT NULL, -- critical, warning, info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_description TEXT,
  impact_metric DECIMAL(10, 2), -- Quantified impact
  recommended_action TEXT,
  auto_fix_available BOOLEAN DEFAULT false,
  fix_automation_id INTEGER REFERENCES workflow_definitions(id),
  status VARCHAR(50) DEFAULT 'open', -- open, acknowledged, fixing, fixed, dismissed
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  INDEX idx_workspace (workspace_id),
  INDEX idx_category (category),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_detected (detected_at)
);

-- AI Agent Status (Digital Workforce)
CREATE TABLE IF NOT EXISTS ai_agent_status (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL, -- Hermes, Creative AI, Finance AI, etc.
  agent_type VARCHAR(100), -- orchestrator, creative, finance, inventory, support, infrastructure
  status VARCHAR(50) DEFAULT 'ready', -- ready, working, error, offline
  current_task VARCHAR(255),
  task_progress INTEGER DEFAULT 0, -- 0-100
  queue_size INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2), -- Percentage
  uptime_percentage DECIMAL(5, 2),
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_error TEXT,
  config JSONB,
  INDEX idx_workspace (workspace_id),
  INDEX idx_agent (agent_name),
  INDEX idx_status (status),
  INDEX idx_type (agent_type)
);

-- Workspace Analytics (Metrics & KPIs)
CREATE TABLE IF NOT EXISTS workspace_analytics (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15, 2),
  metric_date DATE DEFAULT CURRENT_DATE,
  period VARCHAR(50), -- daily, weekly, monthly
  tags JSONB, -- Additional dimensions
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workspace (workspace_id),
  INDEX idx_metric (metric_name),
  INDEX idx_date (metric_date)
);

-- Workspace Audit Log
CREATE TABLE IF NOT EXISTS workspace_audit_log (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id INTEGER,
  changes JSONB, -- What changed
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workspace (workspace_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);

-- Add workspace_id to existing tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id);
ALTER TABLE automation_jobs ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id);

-- Create indexes for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_customers_workspace ON customers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_automations_workspace ON automation_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions(workspace_id);
