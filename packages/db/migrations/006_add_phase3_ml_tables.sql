-- Phase 3: ML Damage Detection + AR Annotations + Voice Commands
-- Created: 2026-09-15

-- ML Detection results from YOLO
CREATE TABLE IF NOT EXISTS ml_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  stream_session_id UUID REFERENCES stream_sessions(id) ON DELETE SET NULL,

  classification VARCHAR(50) NOT NULL CHECK (classification IN ('working', 'broken', 'needs_maintenance')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence DECIMAL(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),

  bounding_box JSONB NOT NULL, -- {x, y, width, height} normalized to 0-1
  location JSONB, -- {x, y, width, height} in pixel coordinates

  recommendations TEXT[], -- Auto-generated recommendations
  model_version VARCHAR(50), -- YOLO model version used

  image_url VARCHAR(2048), -- S3 URL to analyzed image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_job_detection (job_id, created_at DESC),
  INDEX idx_classification (classification),
  INDEX idx_severity (severity)
);

-- AR scene state (per job)
CREATE TABLE IF NOT EXISTS ar_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,

  camera_feed_url VARCHAR(2048),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_active_scenes (is_active) WHERE is_active = true
);

-- AR annotations (drawings, detection boxes)
CREATE TABLE IF NOT EXISTS ar_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES ar_scenes(id) ON DELETE CASCADE,

  annotation_type VARCHAR(50) NOT NULL CHECK (annotation_type IN ('circle', 'arrow', 'rectangle', 'text', 'detection_box')),
  points JSONB, -- [{x, y}, ...] for multi-point annotations
  color VARCHAR(7), -- Hex color #RRGGBB
  opacity DECIMAL(3, 2) DEFAULT 1.0 CHECK (opacity >= 0 AND opacity <= 1),
  text_content TEXT, -- For text annotations

  detection_id UUID REFERENCES ml_detections(id) ON DELETE SET NULL, -- For ML boxes

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',

  INDEX idx_scene_annotations (scene_id),
  INDEX idx_expiry (expires_at)
);

-- Annotation history (immutable log)
CREATE TABLE IF NOT EXISTS ar_annotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES ar_scenes(id) ON DELETE CASCADE,
  annotation_id UUID REFERENCES ar_annotations(id) ON DELETE SET NULL,

  action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  annotation_data JSONB, -- Full annotation snapshot

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_history_scene (scene_id, created_at DESC),
  INDEX idx_history_action (action)
);

-- Voice commands processed
CREATE TABLE IF NOT EXISTS voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  speaker VARCHAR(20) NOT NULL CHECK (speaker IN ('technician', 'supervisor')),
  intent VARCHAR(100) NOT NULL,
  raw_text TEXT,

  confidence DECIMAL(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  parameters JSONB, -- Extracted parameters {type, color, etc.}

  execution_status VARCHAR(20) DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executed', 'failed')),
  execution_result JSONB, -- Action result

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_job_commands (job_id, created_at DESC),
  INDEX idx_intent (intent),
  INDEX idx_speaker (speaker)
);

-- Voice guidance audio (supervisor to technician)
CREATE TABLE IF NOT EXISTS voice_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_id UUID REFERENCES voice_commands(id) ON DELETE SET NULL,

  supervisor_id UUID NOT NULL,
  technician_id UUID NOT NULL,

  guidance_text TEXT NOT NULL,
  audio_url VARCHAR(2048), -- S3 URL to TTS audio
  audio_duration_ms INT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_supervisor_guidance (supervisor_id, created_at DESC),
  INDEX idx_technician_guidance (technician_id, created_at DESC)
);

-- ML model training jobs
CREATE TABLE IF NOT EXISTS ml_training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  dataset_path VARCHAR(2048) NOT NULL,
  model_name VARCHAR(100),

  epochs INT DEFAULT 50,
  batch_size INT DEFAULT 16,
  learning_rate DECIMAL(10, 6),

  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'training', 'completed', 'failed')),
  progress DECIMAL(5, 2) DEFAULT 0, -- 0-100

  metrics JSONB, -- {loss, accuracy, precision, recall, f1}
  model_path VARCHAR(2048), -- S3 or local path

  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_progress (progress)
);

-- Auto-cleanup for expired annotations (24-hour retention)
CREATE OR REPLACE FUNCTION cleanup_expired_annotations()
RETURNS void AS $$
BEGIN
  DELETE FROM ar_annotations WHERE expires_at < CURRENT_TIMESTAMP;
  DELETE FROM ar_scenes WHERE is_active = false AND updated_at < CURRENT_TIMESTAMP - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Trigger for cleanup (run via cron: SELECT cleanup_expired_annotations())
-- Or schedule: SELECT cron.schedule('cleanup-ar-annotations', '0 2 * * *', 'SELECT cleanup_expired_annotations()');

-- Grants (adjust for your roles)
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_detections TO app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ar_scenes TO app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ar_annotations TO app_role;
GRANT SELECT, INSERT ON ar_annotation_history TO app_role;
GRANT SELECT, INSERT, UPDATE ON voice_commands TO app_role;
GRANT SELECT, INSERT ON voice_guidance TO app_role;
GRANT SELECT, INSERT, UPDATE ON ml_training_jobs TO app_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_annotations() TO app_role;
