-- Quality scoring system
CREATE TABLE IF NOT EXISTS quality_scores (
  id SERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  gate_number INT NOT NULL,
  relevance_score INT CHECK (relevance_score >= 0 AND relevance_score <= 100),
  credibility_score INT CHECK (credibility_score >= 0 AND credibility_score <= 100),
  engagement_score INT CHECK (engagement_score >= 0 AND engagement_score <= 100),
  brand_alignment_score INT CHECK (brand_alignment_score >= 0 AND brand_alignment_score <= 100),
  fact_check_score INT CHECK (fact_check_score >= 0 AND fact_check_score <= 100),
  uniqueness_score INT CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100),
  average_score NUMERIC(3,2),
  meets_threshold BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, gate_number)
);

CREATE INDEX idx_quality_scores_article_id ON quality_scores(article_id);
CREATE INDEX idx_quality_scores_meets_threshold ON quality_scores(meets_threshold);

-- Human feedback for training
CREATE TABLE IF NOT EXISTS human_feedback (
  id SERIAL PRIMARY KEY,
  score_id BIGINT NOT NULL REFERENCES quality_scores(id) ON DELETE CASCADE,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('approve', 'reject', 'modify')),
  notes TEXT,
  changes_made JSONB,
  old_scores JSONB,
  new_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_human_feedback_score_id ON human_feedback(score_id);

-- Modified news_articles table
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS current_quality_score NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS is_filtered BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS filter_reason VARCHAR(255),
  ADD COLUMN IF NOT EXISTS override_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_articles_is_filtered ON news_articles(is_filtered);
