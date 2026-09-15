-- Ray-Ban Phase 2: Streaming infrastructure tables

-- Stream sessions: Active live streams
CREATE TABLE stream_sessions (
  id VARCHAR(255) PRIMARY KEY,
  job_id VARCHAR(255) NOT NULL,
  technician_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'live', -- live, ended, failed
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INT,

  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id),
  INDEX idx_technician_id (technician_id),
  INDEX idx_status (status),
  INDEX idx_started_at (started_at)
);

-- Stream recordings: WebM recordings with S3 storage
CREATE TABLE stream_recordings (
  id VARCHAR(255) PRIMARY KEY,
  stream_id VARCHAR(255),
  job_id VARCHAR(255) NOT NULL,
  format VARCHAR(50) NOT NULL DEFAULT 'webm', -- webm, mp4
  codec VARCHAR(100) NOT NULL DEFAULT 'vp9/opus',
  status VARCHAR(50) NOT NULL DEFAULT 'recording', -- recording, completed, failed
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration INT,
  s3_key VARCHAR(500),

  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_job_id (job_id),
  INDEX idx_status (status),
  INDEX idx_ended_at (ended_at)
);

-- Stream viewers: Supervisor sessions watching streams
CREATE TABLE stream_viewers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stream_id VARCHAR(255) NOT NULL,
  supervisor_id VARCHAR(255) NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  duration_seconds INT,

  FOREIGN KEY (stream_id) REFERENCES stream_sessions(id) ON DELETE CASCADE,
  INDEX idx_stream_id (stream_id),
  INDEX idx_supervisor_id (supervisor_id),
  INDEX idx_joined_at (joined_at)
);

-- Stream annotations: Real-time drawings and markups
CREATE TABLE stream_annotations (
  id VARCHAR(255) PRIMARY KEY,
  stream_id VARCHAR(255) NOT NULL,
  supervisor_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- circle, arrow, rectangle, text, freehand
  x INT NOT NULL,
  y INT NOT NULL,
  x2 INT,
  y2 INT,
  color VARCHAR(10) NOT NULL, -- hex color
  text TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (stream_id) REFERENCES stream_sessions(id) ON DELETE CASCADE,
  INDEX idx_stream_id (stream_id),
  INDEX idx_supervisor_id (supervisor_id),
  INDEX idx_created_at (created_at)
);

-- Stream audio: Voice guidance from supervisor to technician
CREATE TABLE stream_audio (
  id VARCHAR(255) PRIMARY KEY,
  stream_id VARCHAR(255) NOT NULL,
  supervisor_id VARCHAR(255) NOT NULL,
  audio_data LONGBLOB NOT NULL,
  duration INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (stream_id) REFERENCES stream_sessions(id) ON DELETE CASCADE,
  INDEX idx_stream_id (stream_id),
  INDEX idx_supervisor_id (supervisor_id),
  INDEX idx_created_at (created_at)
);

-- Stream statistics: Bitrate, FPS, latency metrics
CREATE TABLE stream_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stream_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  video_bitrate INT,
  fps INT,
  resolution VARCHAR(20),
  latency_ms INT,
  jitter_ms INT,
  packet_loss FLOAT,

  FOREIGN KEY (stream_id) REFERENCES stream_sessions(id) ON DELETE CASCADE,
  INDEX idx_stream_id (stream_id),
  INDEX idx_timestamp (timestamp)
);

-- Stored procedures for cleanup
DELIMITER $$

CREATE PROCEDURE cleanup_old_recordings()
BEGIN
  DECLARE cutoff_time TIMESTAMP;
  SET cutoff_time = DATE_SUB(NOW(), INTERVAL 24 HOUR);

  DELETE FROM stream_recordings
  WHERE status = 'completed' AND ended_at < cutoff_time;

  DELETE FROM stream_stats
  WHERE timestamp < cutoff_time;
END$$

DELIMITER ;

-- Trigger for automatic stream session cleanup
DELIMITER $$

CREATE TRIGGER stream_stats_retention
AFTER INSERT ON stream_stats
FOR EACH ROW
BEGIN
  DELETE FROM stream_stats
  WHERE stream_id = NEW.stream_id
    AND timestamp < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END$$

DELIMITER ;
