-- Telegram Subscriptions Table
-- Tracks user subscription preferences for Telegram notifications

CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  chat_id VARCHAR(100) NOT NULL,
  username VARCHAR(100),
  subscription_type VARCHAR(50) DEFAULT 'breaking',
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_notified_at TIMESTAMP,
  notification_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_subscriptions_user_id ON telegram_subscriptions(user_id);
CREATE INDEX idx_telegram_subscriptions_chat_id ON telegram_subscriptions(chat_id);
CREATE INDEX idx_telegram_subscriptions_is_subscribed ON telegram_subscriptions(is_subscribed);
CREATE INDEX idx_telegram_subscriptions_subscription_type ON telegram_subscriptions(subscription_type);

-- Telegram Notifications Log
-- Tracks all notifications sent to users

CREATE TABLE IF NOT EXISTS telegram_notifications_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES telegram_subscriptions(user_id) ON DELETE CASCADE,
  article_id BIGINT REFERENCES news_articles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50),
  message_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_notifications_user_id ON telegram_notifications_log(user_id);
CREATE INDEX idx_telegram_notifications_article_id ON telegram_notifications_log(article_id);
CREATE INDEX idx_telegram_notifications_status ON telegram_notifications_log(status);
CREATE INDEX idx_telegram_notifications_sent_at ON telegram_notifications_log(sent_at DESC);
