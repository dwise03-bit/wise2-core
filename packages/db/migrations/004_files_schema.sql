-- ============================================================================
-- WISE² File Storage Schema
-- Migration: 004_files_schema.sql
-- ============================================================================

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(50),
  mime_type TEXT,
  s3_key TEXT UNIQUE NOT NULL,
  s3_bucket TEXT,
  checksum TEXT,
  metadata JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Showcase Assets Table
CREATE TABLE IF NOT EXISTS client_showcase_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_ms INT,
  metadata JSONB,
  view_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_s3_key ON files(s3_key);
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_user_id_created_at ON files(user_id, created_at);

-- Create indexes for client_showcase_assets table
CREATE INDEX IF NOT EXISTS idx_showcase_assets_user_id ON client_showcase_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_assets_asset_type ON client_showcase_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_showcase_assets_is_featured ON client_showcase_assets(is_featured);
CREATE INDEX IF NOT EXISTS idx_showcase_assets_created_at ON client_showcase_assets(created_at);
CREATE INDEX IF NOT EXISTS idx_showcase_assets_user_id_created_at ON client_showcase_assets(user_id, created_at);
