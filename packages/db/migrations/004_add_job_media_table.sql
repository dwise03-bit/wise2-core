-- Add Job Media table for Ray-Ban glasses integration
-- Migration: 004_add_job_media_table

-- Create enum for media type
CREATE TYPE media_type AS ENUM ('photo', 'video');

-- Main job media table
CREATE TABLE IF NOT EXISTS job_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  media_type media_type NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_bytes INTEGER NOT NULL,
  duration_seconds INTEGER,  -- for videos only
  caption TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  glasses_device_id VARCHAR(255),  -- Ray-Ban device serial
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_job_media_job_id FOREIGN KEY (job_id)
    REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_media_technician_id FOREIGN KEY (technician_id)
    REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_job_media_job_id ON job_media(job_id);
CREATE INDEX idx_job_media_technician_id ON job_media(technician_id);
CREATE INDEX idx_job_media_uploaded_at ON job_media(uploaded_at DESC);
CREATE INDEX idx_job_media_media_type ON job_media(media_type);
CREATE INDEX idx_job_media_deleted_at ON job_media(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_job_media_glasses_device ON job_media(glasses_device_id);

-- Media storage configuration per job
CREATE TABLE IF NOT EXISTS media_storage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL UNIQUE,
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'local',
  s3_bucket VARCHAR(255),
  access_level VARCHAR(50) DEFAULT 'private',
  retention_days INTEGER DEFAULT 90,
  auto_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_media_storage_config_job_id FOREIGN KEY (job_id)
    REFERENCES jobs(id) ON DELETE CASCADE
);

-- Live stream sessions table
CREATE TABLE IF NOT EXISTS live_stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id VARCHAR(255) NOT NULL UNIQUE,
  job_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  rtc_server_url TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  viewer_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_stream_job_id FOREIGN KEY (job_id)
    REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_stream_technician_id FOREIGN KEY (technician_id)
    REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_live_stream_job_id ON live_stream_sessions(job_id);
CREATE INDEX idx_live_stream_technician_id ON live_stream_sessions(technician_id);
CREATE INDEX idx_live_stream_started_at ON live_stream_sessions(started_at DESC);
CREATE INDEX idx_live_stream_status ON live_stream_sessions(status);

-- Media processing queue for video transcoding
CREATE TABLE IF NOT EXISTS media_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES job_media(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'queued',
  priority INTEGER DEFAULT 5,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_queue_media_id ON media_processing_queue(media_id);
CREATE INDEX idx_media_queue_status ON media_processing_queue(status);
CREATE INDEX idx_media_queue_priority ON media_processing_queue(priority DESC);
CREATE INDEX idx_media_queue_created_at ON media_processing_queue(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_media_updated_at
  BEFORE UPDATE ON job_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_storage_config_updated_at
  BEFORE UPDATE ON media_storage_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_processing_queue_updated_at
  BEFORE UPDATE ON media_processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for job media stats
CREATE OR REPLACE VIEW job_media_stats AS
SELECT
  j.id as job_id,
  COUNT(jm.id) as total_media,
  COUNT(CASE WHEN jm.media_type = 'photo' THEN 1 END) as photo_count,
  COUNT(CASE WHEN jm.media_type = 'video' THEN 1 END) as video_count,
  COALESCE(SUM(jm.file_size_bytes), 0) as total_size_bytes,
  MAX(jm.uploaded_at) as latest_upload,
  COUNT(DISTINCT jm.technician_id) as contributor_count
FROM jobs j
LEFT JOIN job_media jm ON j.id = jm.job_id AND jm.deleted_at IS NULL
GROUP BY j.id;

-- Rollback script (saves as comment for reference)
-- DROP VIEW IF EXISTS job_media_stats;
-- DROP TABLE IF EXISTS media_processing_queue;
-- DROP TABLE IF EXISTS live_stream_sessions;
-- DROP TABLE IF EXISTS media_storage_config;
-- DROP TABLE IF EXISTS job_media;
-- DROP TYPE IF EXISTS media_type;
