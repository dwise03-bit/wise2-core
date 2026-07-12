#!/bin/bash
# Wise² Database Seed Data Script
# Populates development database with test data
# Run this after database initialization

set -e

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-wise2_core}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "Seeding Wise² Database with Test Data..."

# Create connection string
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"

# Seed users
echo "Seeding users..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
  -- Insert test users (passwords are hashed in production, these are for dev only)
  INSERT INTO users (email, password_hash, name, role, is_active) VALUES
    ('admin@wise2.local', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmmS46m', 'Admin User', 'admin', true),
    ('operator@wise2.local', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmmS46m', 'Operator User', 'operator', true),
    ('developer@wise2.local', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmmS46m', 'Developer User', 'developer', true),
    ('viewer@wise2.local', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmmS46m', 'Viewer User', 'viewer', true)
  ON CONFLICT (email) DO NOTHING;

  SELECT COUNT(*) as users_created FROM users;
EOSQL

# Seed deployments (get admin user ID for reference)
echo "Seeding deployments..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
  -- Insert test deployments
  INSERT INTO deployments (user_id, name, description, configuration, status, version)
  SELECT
    id as user_id,
    'Development Deployment' as name,
    'Default development deployment' as description,
    '{"environment": "development", "region": "us-east-1"}' as configuration,
    'ready' as status,
    1 as version
  FROM users WHERE role = 'admin' LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO deployments (user_id, name, description, configuration, status, version)
  SELECT
    id as user_id,
    'Staging Deployment' as name,
    'Staging environment deployment' as description,
    '{"environment": "staging", "region": "us-east-1"}' as configuration,
    'deployed' as status,
    1 as version
  FROM users WHERE role = 'admin' LIMIT 1
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*) as deployments_created FROM deployments;
EOSQL

# Seed services
echo "Seeding services..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
  -- Insert test services
  INSERT INTO services (deployment_id, name, type, status, is_healthy)
  SELECT
    id as deployment_id,
    'API Service' as name,
    'api' as type,
    'running' as status,
    true as is_healthy
  FROM deployments LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO services (deployment_id, name, type, status, is_healthy)
  SELECT
    id as deployment_id,
    'Dashboard Service' as name,
    'dashboard' as type,
    'running' as status,
    true as is_healthy
  FROM deployments LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO services (deployment_id, name, type, status, is_healthy)
  SELECT
    id as deployment_id,
    'Worker Service' as name,
    'worker' as type,
    'running' as status,
    true as is_healthy
  FROM deployments LIMIT 1
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*) as services_created FROM services;
EOSQL

# Seed automation jobs
echo "Seeding automation jobs..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
  -- Insert test automation jobs
  INSERT INTO automation_jobs (user_id, name, description, trigger, actions, schedule, is_enabled)
  SELECT
    id as user_id,
    'Daily Health Check' as name,
    'Checks all services health daily' as description,
    '{"type": "schedule", "cron": "0 0 * * *"}' as trigger,
    '[{"type": "notify", "channels": ["email"]}]' as actions,
    '{"type": "cron", "expression": "0 0 * * *"}' as schedule,
    true as is_enabled
  FROM users WHERE role IN ('admin', 'operator') LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO automation_jobs (user_id, name, description, trigger, actions, is_enabled)
  SELECT
    id as user_id,
    'Backup Database' as name,
    'Backs up database daily' as description,
    '{"type": "schedule", "cron": "0 2 * * *"}' as trigger,
    '[{"type": "backup", "target": "database"}]' as actions,
    true as is_enabled
  FROM users WHERE role = 'admin' LIMIT 1
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*) as jobs_created FROM automation_jobs;
EOSQL

echo ""
echo "✓ Database seeded successfully!"
echo ""
echo "Test Accounts Created:"
echo "  admin@wise2.local (admin)"
echo "  operator@wise2.local (operator)"
echo "  developer@wise2.local (developer)"
echo "  viewer@wise2.local (viewer)"
echo ""
echo "All passwords: (hashed bcrypt for dev)"
echo ""
