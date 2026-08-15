# News Scraper System

Automated 2nd Amendment news intelligence system that runs 24/7 under PM2 process management.

## Architecture

```
news-scraper (PM2 agent) → Database → content-reviewer → social-media-agent
     ↓
  Every 4 hours
     ↓
 • RSS Feed Parser
 • News API Client
 • Web Scraper
     ↓
  Articles
     ↓
  Stored in news_articles table
```

## Components

### News Scraper Agent (`agents/news-scraper.js`)

PM2-managed background service that:
- Runs every 4 hours (14,400 seconds)
- Queries active news sources from `news_scraper_config` table
- Scrapes RSS feeds and News APIs
- Detects and skips duplicates
- Stores new articles in `news_articles` table
- Tracks errors and monitors performance

**Environment Variables:**
```bash
DATABASE_URL=postgresql://user:pass@host/db
NEWS_API_KEY=your-newsapi-key
```

**Features:**
- ✅ Graceful error handling
- ✅ SIGTERM/SIGINT shutdown handling
- ✅ Duplicate URL detection
- ✅ Error tracking and logging
- ✅ Performance monitoring
- ✅ 4-hour scheduling (configurable)

## Database Schema

### `news_scraper_config` - Source Configuration

```sql
CREATE TABLE news_scraper_config (
  id BIGSERIAL PRIMARY KEY,
  source_name VARCHAR(100) UNIQUE,      -- "Reuters News"
  source_type VARCHAR(50),               -- 'rss', 'api', 'web'
  source_url VARCHAR(500),               -- https://example.com/feed
  api_key VARCHAR(500),                  -- Optional API key
  is_active BOOLEAN DEFAULT true,        -- Enable/disable source
  priority_order INTEGER,                -- Process order (1-10)
  keywords TEXT[],                       -- ['keyword1', 'keyword2']
  last_scraped_at TIMESTAMP,             -- Last successful scrape
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `news_articles` - Scraped Articles

```sql
CREATE TABLE news_articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500),                    -- Article headline
  content TEXT,                          -- Full article body
  summary TEXT,                          -- 200-char summary
  source_name VARCHAR(100),              -- Source that published it
  source_url VARCHAR(500) UNIQUE,        -- Original article URL
  author VARCHAR(255),                   -- Article author
  published_at TIMESTAMP,                -- Original publish time
  scraped_at TIMESTAMP DEFAULT NOW(),    -- When we scraped it
  image_url VARCHAR(500),                -- Article image/thumbnail
  relevance_score DECIMAL(3,2),          -- Added by content-reviewer
  sentiment VARCHAR(20),                 -- Added by content-reviewer
  is_processed BOOLEAN DEFAULT false,    -- Reviewed yet?
  duplicate_of_id BIGINT,                -- If duplicate, points to original
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Setup

### 1. Initialize News Sources

```bash
cd dashboard
DATABASE_URL="postgresql://..." node scripts/init-news-sources.js
```

Creates default sources:
- Reuters - Gun Violence (RSS)
- AP News - Gun Violence (RSS)
- NPR - Politics (RSS)
- News API - 2nd Amendment (API)

### 2. Start News Scraper Agent

```bash
# Start via PM2
pm2 start ecosystem.config.js --name news-scraper

# View logs
pm2 logs news-scraper

# Monitor
pm2 monit
```

### 3. Verify Operation

```bash
# Check database for articles
psql wisedefense
SELECT COUNT(*) FROM news_articles;
SELECT title, source_name, created_at FROM news_articles ORDER BY created_at DESC LIMIT 5;
```

## Operation

### Scraping Cycle (every 4 hours)

```
Start → Get Active Sources → Process Each Source
  ↓
  RSS: Parse feed, extract items
  API: Query News API with keywords
  WEB: Scrape custom selectors
  ↓
  Check Duplicates → Store in DB → Update last_scraped_at
  ↓
  Log Results → Schedule Next Run
```

### Typical Cycle Output

```
[SCRAPER] ========================================
[SCRAPER] Starting news scraping cycle
[SCRAPER] ========================================
[SCRAPER] Processing 4 news sources
[SCRAPER] Fetching RSS feed: Reuters News
[SCRAPER] Found 10 items in Reuters RSS feed
[SCRAPER] Extracted 7 new articles from Reuters News
[SCRAPER] Searching News API for: 2nd Amendment
[SCRAPER] Found 15 articles from News API
[SCRAPER] ========================================
[SCRAPER] Articles found: 22
[SCRAPER] Articles stored: 18
[SCRAPER] Duration: 4523ms
[SCRAPER] Errors: 0
[SCRAPER] ========================================
```

## Monitoring

### PM2 Commands

```bash
# View status
pm2 status

# View logs (real-time)
pm2 logs news-scraper

# View stats
pm2 show news-scraper

# Save process list
pm2 save

# Resurrect after reboot
pm2 resurrect
```

### Database Monitoring

```sql
-- Articles scraped today
SELECT COUNT(*) FROM news_articles 
WHERE created_at > NOW() - INTERVAL '1 day';

-- Last scrape time per source
SELECT source_name, last_scraped_at 
FROM news_scraper_config 
ORDER BY last_scraped_at DESC;

-- Duplicate detection
SELECT COUNT(*) FROM news_articles 
WHERE duplicate_of_id IS NOT NULL;

-- Articles per source
SELECT source_name, COUNT(*) 
FROM news_articles 
GROUP BY source_name 
ORDER BY COUNT(*) DESC;
```

## Configuration

### Add New News Source

```bash
psql wisedefense
INSERT INTO news_scraper_config 
  (source_name, source_type, source_url, keywords, is_active, priority_order)
VALUES 
  ('My News Site', 'rss', 'https://example.com/feed', ARRAY['2nd Amendment', 'gun'], true, 5);
```

### Disable Source Temporarily

```bash
UPDATE news_scraper_config 
SET is_active = false 
WHERE source_name = 'Reuters News';
```

### Adjust Scraping Frequency

Edit `agents/news-scraper.js`:

```javascript
const SCRAPE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours instead of 4
```

Then restart: `pm2 restart news-scraper`

## Error Handling

### Common Issues

**"No active news sources configured"**
- Run: `node scripts/init-news-sources.js`
- Verify: `SELECT * FROM news_scraper_config WHERE is_active = true;`

**"No NEWS_API_KEY configured"**
- Set: `export NEWS_API_KEY="your-api-key"`
- Add to `.env` file for persistence

**"Database connection failed"**
- Verify DATABASE_URL environment variable
- Check PostgreSQL is running
- Verify credentials and network access

### Error Tracking

Errors are logged with timestamp and context:

```bash
pm2 logs news-scraper | grep "ERROR"
```

Errors also stored in process memory for monitoring:
```bash
pm2 show news-scraper  # Shows error count
```

## Next Steps

After news scraper is running:

1. **Task 6** - Content Reviewer Agent: Analyzes scraped articles
2. **Task 7** - Social Media Agent: Generates and posts content
3. **Task 8** - Discord Alerting: Notifies Discord users
4. **Task 9** - Telegram Alerting: Broadcasts to Telegram

## Performance

Typical metrics:

| Metric | Value |
|--------|-------|
| Scrape Interval | 4 hours |
| Articles/Cycle | 15-30 |
| Processing Time | 2-5 seconds |
| Memory Usage | ~50MB |
| CPU Usage | <5% |
| Database Connections | 1 |

## Troubleshooting

```bash
# Kill and restart
pm2 delete news-scraper
pm2 start ecosystem.config.js --name news-scraper

# View full logs
pm2 logs news-scraper --lines 100

# Test database connection
node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT NOW()');"
```
