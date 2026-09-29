-- WISE² K10 IMP Device Tracking & Voice Logging
-- Schema for device state, conversations, and analytics

CREATE TABLE IF NOT EXISTS k10_devices (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  device_name VARCHAR(255),
  mac_address VARCHAR(17),
  firmware_version VARCHAR(50),
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  wifi_connected BOOLEAN DEFAULT false,
  battery_level INT,
  face_state INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS k10_conversations (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL REFERENCES k10_devices(device_id) ON DELETE CASCADE,
  conversation_id UUID UNIQUE DEFAULT gen_random_uuid(),
  user_input TEXT,
  asr_recognized TEXT,
  asr_confidence FLOAT,
  ai_response TEXT,
  tts_played BOOLEAN DEFAULT false,
  duration_ms INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES k10_devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS k10_device_state_history (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL REFERENCES k10_devices(device_id) ON DELETE CASCADE,
  device_state INT,
  face_state INT,
  face_expression VARCHAR(50),
  wifi_connected BOOLEAN,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES k10_devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS k10_analytics (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL REFERENCES k10_devices(device_id) ON DELETE CASCADE,
  metric_name VARCHAR(255),
  metric_value FLOAT,
  unit VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES k10_devices(device_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_k10_devices_device_id ON k10_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_k10_devices_last_seen ON k10_devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_k10_conversations_device_id ON k10_conversations(device_id);
CREATE INDEX IF NOT EXISTS idx_k10_conversations_timestamp ON k10_conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_k10_state_history_device_id ON k10_device_state_history(device_id);
CREATE INDEX IF NOT EXISTS idx_k10_state_history_timestamp ON k10_device_state_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_k10_analytics_device_id ON k10_analytics(device_id);
CREATE INDEX IF NOT EXISTS idx_k10_analytics_timestamp ON k10_analytics(timestamp);

-- View: Recent device activity
CREATE OR REPLACE VIEW v_k10_device_activity AS
SELECT
  d.device_id,
  d.device_name,
  d.last_seen,
  d.wifi_connected,
  d.face_state,
  COUNT(c.id) as conversation_count,
  MAX(c.timestamp) as last_conversation
FROM k10_devices d
LEFT JOIN k10_conversations c ON d.device_id = c.device_id
GROUP BY d.device_id, d.device_name, d.last_seen, d.wifi_connected, d.face_state;

-- View: Conversation statistics
CREATE OR REPLACE VIEW v_k10_conversation_stats AS
SELECT
  device_id,
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN asr_recognized IS NOT NULL THEN 1 END) as successful_asr,
  COUNT(CASE WHEN tts_played THEN 1 END) as tts_played,
  AVG(asr_confidence) as avg_confidence,
  AVG(duration_ms) as avg_duration_ms
FROM k10_conversations
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY device_id;
