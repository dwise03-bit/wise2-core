-- News Intelligence System Database Schema
-- Created: 2026-06-20
-- Tables: news_articles, content_reviews, social_posts_generated, news_alerts_sent

-- Table 1: news_articles - Scraped news stories
CREATE TABLE IF NOT EXISTS news_articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  source_name VARCHAR(100) NOT NULL,
  source_url VARCHAR(500) UNIQUE NOT NULL,
  author VARCHAR(255),
  published_at TIMESTAMP,
  scraped_at TIMESTAMP DEFAULT NOW(),
  image_url VARCHAR(500),
  relevance_score DECIMAL(3, 2),
  sentiment VARCHAR(20),
  keywords TEXT[],
  source_type VARCHAR(50),
  duplicate_of_id BIGINT REFERENCES news_articles(id),
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_articles_source_url ON news_articles(source_url);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_is_processed ON news_articles(is_processed);
CREATE INDEX idx_news_articles_relevance_score ON news_articles(relevance_score DESC);
CREATE INDEX idx_news_articles_created_at ON news_articles(created_at DESC);

-- Table 2: content_reviews - AI analysis of articles
CREATE TABLE IF NOT EXISTS content_reviews (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL UNIQUE REFERENCES news_articles(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3, 2) NOT NULL,
  relevance_reason VARCHAR(500),
  sentiment VARCHAR(20),
  key_points TEXT[],
  implications TEXT,
  fact_check_notes TEXT,
  ai_summary TEXT,
  ai_analysis TEXT,
  recommended_for_social BOOLEAN DEFAULT true,
  priority_level VARCHAR(20),
  reviewed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_reviews_article_id ON content_reviews(article_id);
CREATE INDEX idx_content_reviews_relevance_score ON content_reviews(relevance_score DESC);
CREATE INDEX idx_content_reviews_recommended_for_social ON content_reviews(recommended_for_social);
CREATE INDEX idx_content_reviews_reviewed_at ON content_reviews(reviewed_at DESC);

-- Table 3: social_posts_generated - AI-generated social media content
CREATE TABLE IF NOT EXISTS social_posts_generated (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  review_id BIGINT REFERENCES content_reviews(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  content_text TEXT NOT NULL,
  hashtags VARCHAR(500),
  call_to_action VARCHAR(255),
  image_url VARCHAR(500),
  character_count INTEGER,
  engagement_tips TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  posted_at TIMESTAMP,
  post_url VARCHAR(500),
  engagement_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_social_posts_article_id ON social_posts_generated(article_id);
CREATE INDEX idx_social_posts_platform ON social_posts_generated(platform);
CREATE INDEX idx_social_posts_status ON social_posts_generated(status);
CREATE INDEX idx_social_posts_posted_at ON social_posts_generated(posted_at DESC);
CREATE INDEX idx_social_posts_generated_at ON social_posts_generated(generated_at DESC);

-- Table 4: news_alerts_sent - Track notifications sent
CREATE TABLE IF NOT EXISTS news_alerts_sent (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  channel_name VARCHAR(100),
  recipient_id INTEGER,
  platform VARCHAR(50),
  alert_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivery_status VARCHAR(50) DEFAULT 'sent',
  user_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_alerts_article_id ON news_alerts_sent(article_id);
CREATE INDEX idx_news_alerts_alert_type ON news_alerts_sent(alert_type);
CREATE INDEX idx_news_alerts_platform ON news_alerts_sent(platform);
CREATE INDEX idx_news_alerts_sent_at ON news_alerts_sent(sent_at DESC);
CREATE INDEX idx_news_alerts_delivery_status ON news_alerts_sent(delivery_status);

-- Table 5: news_scraper_config - Configuration for news sources
CREATE TABLE IF NOT EXISTS news_scraper_config (
  id BIGSERIAL PRIMARY KEY,
  source_name VARCHAR(100) NOT NULL UNIQUE,
  source_type VARCHAR(50) NOT NULL,
  source_url VARCHAR(500) NOT NULL,
  api_key VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  priority_order INTEGER,
  scrape_interval_hours INTEGER DEFAULT 4,
  keywords TEXT[],
  last_scraped_at TIMESTAMP,
  last_error VARCHAR(500),
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scraper_config_is_active ON news_scraper_config(is_active);
CREATE INDEX idx_scraper_config_source_type ON news_scraper_config(source_type);

-- Table 6: news_scraper_state - Track scraper state
CREATE TABLE IF NOT EXISTS news_scraper_state (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT NOT NULL UNIQUE REFERENCES news_scraper_config(id) ON DELETE CASCADE,
  last_article_date TIMESTAMP,
  last_rss_guid VARCHAR(500),
  articles_scraped_today INTEGER DEFAULT 0,
  articles_processed_today INTEGER DEFAULT 0,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ready',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scraper_state_source_id ON news_scraper_state(source_id);
CREATE INDEX idx_scraper_state_status ON news_scraper_state(status);
CREATE INDEX idx_scraper_state_next_run_at ON news_scraper_state(next_run_at);
