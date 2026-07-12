#!/bin/bash
# Wise² Database Initialization Script
# Runs inside PostgreSQL container during startup
# Creates initial schema and structure

set -e

echo "Wise² Database Initialization Starting..."

# Create extensions
echo "Creating PostgreSQL extensions..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Enable UUID support
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Enable JSON support (already built-in with PostgreSQL 14+)
  -- For full-text search capability
  CREATE EXTENSION IF NOT EXISTS "pg_trgm";

  -- For query analysis
  CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

  GRANT USAGE ON SCHEMA public TO public;
EOSQL

echo "PostgreSQL extensions created successfully"

# Grant permissions
echo "Setting up permissions..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Create app user (if not already created)
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = 'wise2_app') THEN
      CREATE USER wise2_app WITH PASSWORD 'wise2_app_password';
    END IF;
  END
  \$\$;

  -- Grant permissions
  GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO wise2_app;
  GRANT ALL PRIVILEGES ON SCHEMA public TO wise2_app;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wise2_app;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wise2_app;
  GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO wise2_app;

  -- Set default privileges for future objects
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wise2_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wise2_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO wise2_app;
EOSQL

echo "Permissions configured successfully"

# Initialize schema from schema.sql (if it exists)
if [ -f "/docker-entrypoint-initdb.d/01-schema.sql" ]; then
  echo "Applying database schema..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/01-schema.sql
  echo "Schema applied successfully"
else
  echo "Warning: schema.sql not found at /docker-entrypoint-initdb.d/01-schema.sql"
fi

echo "Wise² Database Initialization Complete ✓"
