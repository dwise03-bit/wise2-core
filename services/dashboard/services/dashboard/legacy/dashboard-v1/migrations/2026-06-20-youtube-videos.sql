-- YouTube Videos Table
-- Stores AI-generated faceless YouTube videos from approved articles

CREATE TABLE IF NOT EXISTS youtube_videos (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  video_path VARCHAR(500),
  youtube_video_id VARCHAR(50),
  youtube_url VARCHAR(500),
  script TEXT,
  audio_path VARCHAR(500),
  thumbnail_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'generated', -- generated, uploaded, published, failed
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP DEFAULT NOW(),
  uploaded_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_youtube_videos_article_id ON youtube_videos(article_id);
CREATE INDEX idx_youtube_videos_status ON youtube_videos(status);
CREATE INDEX idx_youtube_videos_published_at ON youtube_videos(published_at DESC);
CREATE INDEX idx_youtube_videos_youtube_video_id ON youtube_videos(youtube_video_id);

-- Grant permissions
ALTER TABLE youtube_videos OWNER TO postgres;

-- Add comment
COMMENT ON TABLE youtube_videos IS 'AI-generated faceless YouTube videos from approved news articles';
