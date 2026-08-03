/**
 * Create News Scraper Database Schema
 * Run on VPS to initialize news tables
 */

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function createSchema() {
  try {
    console.log('🔄 Creating news scraper schema...');

    // Create news_articles table
    await pool.query(`
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
        duplicate_of_id BIGINT,
        is_processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ news_articles created');

    // Create content_reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_reviews (
        id BIGSERIAL PRIMARY KEY,
        article_id BIGINT NOT NULL UNIQUE,
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
      )
    `);
    console.log('✅ content_reviews created');

    // Create social_posts_generated table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_posts_generated (
        id BIGSERIAL PRIMARY KEY,
        article_id BIGINT NOT NULL,
        review_id BIGINT,
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
        generated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ social_posts_generated created');

    // Create news_alerts_sent table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_alerts_sent (
        id BIGSERIAL PRIMARY KEY,
        article_id BIGINT NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        channel_name VARCHAR(100),
        recipient_id INTEGER,
        platform VARCHAR(50),
        alert_message TEXT,
        sent_at TIMESTAMP DEFAULT NOW(),
        delivery_status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ news_alerts_sent created');

    // Create news_scraper_config table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_scraper_config (
        id BIGSERIAL PRIMARY KEY,
        source_name VARCHAR(100) NOT NULL UNIQUE,
        source_type VARCHAR(50) NOT NULL,
        source_url VARCHAR(500) NOT NULL,
        api_key VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        priority_order INTEGER,
        keywords TEXT[],
        last_scraped_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ news_scraper_config created');

    // Verify
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'news_%'"
    );

    console.log('');
    console.log('📊 News tables created: ' + result.rows[0].count);
    console.log('✨ Schema ready for news scraper');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSchema();
