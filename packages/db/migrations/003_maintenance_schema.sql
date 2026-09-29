-- ============================================================================
-- WISE² Maintenance Tasks Schema
-- Migration: 003_maintenance_schema.sql
-- ============================================================================

-- Maintenance Tasks Table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled',
  recurrence VARCHAR(255),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  tags TEXT[],
  metadata JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task Executions Table
CREATE TABLE IF NOT EXISTS task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  output TEXT,
  error TEXT,
  duration_ms INT,
  executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for maintenance_tasks table
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned_to ON maintenance_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_scheduled_date ON maintenance_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_created_by ON maintenance_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_created_at ON maintenance_tasks(created_at);

-- Create indexes for task_executions table
CREATE INDEX IF NOT EXISTS idx_task_executions_task_id ON task_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status);
CREATE INDEX IF NOT EXISTS idx_task_executions_created_at ON task_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_task_executions_executed_by ON task_executions(executed_by);
