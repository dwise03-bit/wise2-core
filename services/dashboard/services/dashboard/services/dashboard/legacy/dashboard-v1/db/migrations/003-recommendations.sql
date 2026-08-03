-- Product recommendations system
CREATE TABLE IF NOT EXISTS product_recommendations (
  id SERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relevance_score INT CHECK (relevance_score >= 0 AND relevance_score <= 100),
  was_clicked BOOLEAN DEFAULT false,
  conversion BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, product_id)
);

CREATE INDEX idx_recommendations_article_id ON product_recommendations(article_id);
CREATE INDEX idx_recommendations_conversion ON product_recommendations(conversion);
