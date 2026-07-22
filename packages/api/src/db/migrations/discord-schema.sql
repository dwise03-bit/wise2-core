-- Discord Integration Tables
-- Phase 2: Discord Bot + System Sync

-- Discord Users
CREATE TABLE IF NOT EXISTS discord_users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  discriminator VARCHAR(10),
  avatar_url TEXT,
  is_bot BOOLEAN DEFAULT FALSE,
  roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_discord_id (discord_id)
);

-- Discord Messages (Audit Trail)
CREATE TABLE IF NOT EXISTS discord_messages (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  message_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  content TEXT,
  embeds JSONB,
  attachments JSONB,
  message_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_message_id (message_id),
  INDEX idx_guild_id (guild_id),
  INDEX idx_created_at (created_at)
);

-- Discord Commands Log (for monitoring)
CREATE TABLE IF NOT EXISTS discord_commands (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  command VARCHAR(255) NOT NULL,
  options JSONB,
  response_status VARCHAR(50),
  execution_time_ms INT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_guild_id (guild_id),
  INDEX idx_command (command),
  INDEX idx_created_at (created_at)
);

-- Discord Notifications (Status broadcasts)
CREATE TABLE IF NOT EXISTS discord_notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  severity VARCHAR(50),
  channel_id VARCHAR(255),
  message_id VARCHAR(255),
  sent_successfully BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);

-- Discord Roles (for permission mapping)
CREATE TABLE IF NOT EXISTS discord_roles (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(255) NOT NULL,
  role_id VARCHAR(255) UNIQUE NOT NULL,
  role_name VARCHAR(255) NOT NULL,
  permissions TEXT[],
  color INT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role_id (role_id),
  INDEX idx_guild_id (guild_id)
);

-- Discord Channels (for organizing notifications)
CREATE TABLE IF NOT EXISTS discord_channels (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) UNIQUE NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  channel_type VARCHAR(50),
  purpose VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_channel_id (channel_id),
  INDEX idx_guild_id (guild_id)
);

-- Discord Bot Status (heartbeat/monitoring)
CREATE TABLE IF NOT EXISTS discord_bot_status (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(255),
  bot_online BOOLEAN DEFAULT FALSE,
  last_heartbeat TIMESTAMP,
  latency_ms INT,
  commands_served INT DEFAULT 0,
  errors_count INT DEFAULT 0,
  uptime_seconds INT,
  memory_usage_mb INT,
  cpu_usage_percent DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at DESC)
);

-- Create trigger for updated_at on discord_users
CREATE OR REPLACE FUNCTION update_discord_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discord_users_update_timestamp
BEFORE UPDATE ON discord_users
FOR EACH ROW
EXECUTE FUNCTION update_discord_users_timestamp();

-- Create trigger for discord_roles
CREATE OR REPLACE FUNCTION update_discord_roles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discord_roles_update_timestamp
BEFORE UPDATE ON discord_roles
FOR EACH ROW
EXECUTE FUNCTION update_discord_roles_timestamp();
