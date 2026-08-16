-- ============================================================================
-- WISE² Faceless Content Studio Schema
-- Migration: 009_content_studio_schema.sql
-- ============================================================================

-- Content Brand Profiles
CREATE TABLE IF NOT EXISTS content_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  voice TEXT,
  audience TEXT,
  visual_style TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  logo_url VARCHAR(2048),
  default_voice VARCHAR(255),
  default_cta TEXT,
  disclaimer TEXT,
  prohibited_phrases TEXT[] DEFAULT '{}',
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_brands_slug ON content_brands(slug);

-- Content Projects (Top-level requests)
CREATE TABLE IF NOT EXISTS content_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  creator_discord_id VARCHAR(255) NOT NULL,
  brand_id UUID NOT NULL REFERENCES content_brands(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  objective VARCHAR(50),
  platform VARCHAR(50) NOT NULL,
  duration_seconds INTEGER,
  style VARCHAR(50),
  source_url VARCHAR(2048),
  status VARCHAR(50) NOT NULL DEFAULT 'idea_received',
  current_version INTEGER DEFAULT 1,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2) DEFAULT 0,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_projects_status ON content_projects(status);
CREATE INDEX idx_content_projects_guild_id ON content_projects(guild_id);
CREATE INDEX idx_content_projects_creator_discord_id ON content_projects(creator_discord_id);
CREATE INDEX idx_content_projects_scheduled_at ON content_projects(scheduled_at);
CREATE INDEX idx_content_projects_platform ON content_projects(platform);

-- Content Versions (Script/caption variants)
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(255),
  hook TEXT,
  script TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  scenes JSONB,
  generation_metadata JSONB,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_versions_project_id ON content_versions(project_id);

-- Content Assets (Generated/uploaded files)
CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES content_versions(id) ON DELETE SET NULL,
  asset_type VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  provider_job_id VARCHAR(255),
  storage_key VARCHAR(2048),
  public_url VARCHAR(2048),
  mime_type VARCHAR(100),
  file_size INTEGER,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_assets_project_id ON content_assets(project_id);
CREATE INDEX idx_content_assets_provider_job_id ON content_assets(provider_job_id);

-- Content Approvals (Approval trail)
CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES content_versions(id) ON DELETE SET NULL,
  approval_type VARCHAR(50) NOT NULL,
  decision VARCHAR(50) NOT NULL,
  discord_user_id VARCHAR(255) NOT NULL,
  notes TEXT,
  interaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_approvals_project_id ON content_approvals(project_id);

-- Content Publish Jobs (Publishing tasks)
CREATE TABLE IF NOT EXISTS content_publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  account_id VARCHAR(255),
  scheduled_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  provider_post_id VARCHAR(255),
  provider_post_url VARCHAR(2048),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_publish_jobs_status ON content_publish_jobs(status);
CREATE INDEX idx_content_publish_jobs_platform ON content_publish_jobs(platform);
CREATE INDEX idx_content_publish_jobs_scheduled_at ON content_publish_jobs(scheduled_at);

-- Content Audit Log (Audit trail)
CREATE TABLE IF NOT EXISTS content_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES content_projects(id) ON DELETE CASCADE,
  guild_id VARCHAR(255) NOT NULL,
  discord_user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  previous_state TEXT,
  next_state TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_audit_log_project_id ON content_audit_log(project_id);
CREATE INDEX idx_content_audit_log_guild_id ON content_audit_log(guild_id);

-- Seed default brands
INSERT INTO content_brands (slug, name, voice, audience, visual_style, primary_color, secondary_color, default_voice, default_cta, disclaimer)
VALUES
  ('wise2', 'WISE²', 'Confident, useful, futuristic, practical and business-focused', 'Business decision makers, entrepreneurs, AI enthusiasts', 'Black, chrome, neon green, enterprise cyberpunk dashboard aesthetic', '#39FF14', '#B020FF', 'voice_id_wise2', 'Build smarter systems with WISE².', NULL),
  ('piff_city', 'PIFF CITY', 'Bold, exclusive, energetic, streetwear-focused and culturally relevant', 'Streetwear enthusiasts, fashion-forward youth, collectors', 'Black, purple, neon green, gritty cinematic city aesthetic', '#39FF14', '#FF00FF', 'voice_id_piff', 'Enter PIFF CITY.', NULL),
  ('wise_shine', 'Wise Shine', 'Professional, clean, approachable and results-focused', 'Car enthusiasts, detail-conscious owners, automotive professionals', 'Gloss black, silver, water, reflections and premium automotive imagery', '#C0C0C0', '#39FF14', 'voice_id_shine', 'Book your Wise Shine detail.', NULL),
  ('wise_defense', 'Wise Defense', 'Calm, responsible, educational and safety-first', 'Firearm owners, safety-conscious individuals, training seekers', 'Black, chrome and deep red tactical training aesthetic', '#8B0000', '#C0C0C0', 'voice_id_defense', 'Train. Teach. Protect.', 'Content must not provide instructions that facilitate weapon construction, modification, evasion, criminal activity or unsafe weapon handling.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- End Migration: 009_content_studio_schema.sql
-- ============================================================================
