# Content Review Agent

AI-powered article analysis service that runs every 30 minutes to evaluate scraped news articles for relevance, sentiment, and social media potential.

## Architecture

```
news-scraper (every 4h) → news_articles table
                              ↓
content-reviewer (every 30m) → Analyzes articles
                              ↓
                         content_reviews table
                              ↓
                    social-media-agent (posts high-priority content)
```

## Overview

The Content Review Agent:
1. Queries new articles from `news_articles` table
2. Analyzes each article for:
   - **Relevance Score** (0-1): How relevant is it to 2nd Amendment?
   - **Sentiment**: Positive/Negative/Neutral tone
   - **Key Points**: Important takeaways
   - **Implications**: What does this mean?
3. Scores priority level (High/Medium/Low)
4. Determines if suitable for social media
5. Stores analysis in `content_reviews` table
6. Marks articles as processed
7. Schedules next review cycle

## Scoring System

### Relevance Score (0-1 scale)

**Keywords by weight:**

| Type | Keywords | Weight |
|------|----------|--------|
| **Primary** | 2nd Amendment, gun rights, Second Amendment, 2A | +0.4 |
| **Secondary** | gun control, regulations, supreme court, atf, amendment | +0.2 |
| **Tertiary** | constitutional, rights, legislation, congress, law | +0.05 |
| **Title Bonus** | If primary keyword in title | +0.15 |
| **Source Boost** | Reuters, AP, NPR, Politico, NYT, Washington Post | +0.1 |

**Categories:**
- `0.8+` → HIGHLY_RELEVANT (High Priority)
- `0.6-0.79` → RELEVANT (Medium Priority)
- `0.4-0.59` → SOMEWHAT_RELEVANT (Low Priority)
- `0.2-0.39` → LOOSELY_RELATED (Archive)
- `<0.2` → NOT_RELEVANT (Skip)

### Sentiment Analysis

**Positive (score > +0.2):**
- Keywords: victory, success, upholds, affirms, freedom, defense
- Meaning: Pro-2nd Amendment, favorable to gun rights
- Social Media: Share, celebrate, engage community

**Negative (score < -0.2):**
- Keywords: ban, restriction, threat, prohibited, danger, violence
- Meaning: Anti-gun, restrictive stance
- Social Media: Alert to action, mobilize community

**Neutral (score ≈ 0):**
- Keywords: report, study, analysis, data
- Meaning: Balanced, factual reporting
- Social Media: Educational, discussion-focused

### Priority Levels

| Level | Criteria | Recommended | Use Case |
|-------|----------|-------------|----------|
| **HIGH** | Relevance ≥ 0.8 | Yes | Feature content, lead posts |
| **MEDIUM** | Relevance ≥ 0.6 | Yes | Regular social posts |
| **LOW** | Relevance ≥ 0.4 | Maybe | Archive for context |

## Operation

### Review Cycle (every 30 minutes)

```
Start → Query unreviewed articles (limit 50)
  ↓
  For each article:
    • Calculate relevance score
    • Analyze sentiment
    • Extract key points (5 max)
    • Extract implications (3 max)
    • Determine priority level
    • Generate summary
  ↓
  Store review → Mark article as processed
  ↓
  Log results → Schedule next cycle (30 min)
```

### Typical Output

```
[REVIEWER] ========================================
[REVIEWER] Starting content review cycle
[REVIEWER] ========================================
[REVIEWER] Found 12 articles to review
[REVIEWER] ✅ Reviewed: Supreme Court Rules 2nd Amendment... (0.92 relevance, high priority)
[REVIEWER] ✅ Reviewed: New Gun Bill Proposed in Congress... (0.75 relevance, medium priority)
[REVIEWER] ✅ Reviewed: Study Shows Gun Violence Trends... (0.65 relevance, medium priority)
[REVIEWER] ========================================
[REVIEWER] Review cycle complete
[REVIEWER] Articles reviewed: 12
[REVIEWER] Reviews stored: 12
[REVIEWER] Duration: 2341ms
[REVIEWER] Errors: 0
[REVIEWER] ========================================
```

## Setup

### 1. Start Content Reviewer

```bash
# Via existing ecosystem.config.js
pm2 restart ecosystem.config.js

# Or just this agent
pm2 start agents/content-reviewer.js --name content-reviewer
```

### 2. Monitor Operation

```bash
# View logs
pm2 logs content-reviewer

# Monitor in real-time
pm2 monit

# Check status
pm2 status
```

### 3. Verify in Database

```bash
# Count reviews created
SELECT COUNT(*) FROM content_reviews;

# See high-priority articles
SELECT na.title, cr.relevance_score, cr.sentiment, cr.priority_level
FROM news_articles na
JOIN content_reviews cr ON na.id = cr.article_id
WHERE cr.priority_level = 'high'
ORDER BY cr.relevance_score DESC;
```

## Database Schema

### `content_reviews` Table

```sql
CREATE TABLE content_reviews (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT UNIQUE NOT NULL,        -- Link to news_articles
  relevance_score DECIMAL(3,2) NOT NULL,    -- 0.00 to 1.00
  relevance_reason VARCHAR(500),            -- Why this score
  sentiment VARCHAR(20),                    -- 'positive','negative','neutral'
  key_points TEXT[],                        -- JSON array of strings
  implications TEXT[],                      -- JSON array of implications
  ai_summary TEXT,                          -- Short summary
  ai_analysis TEXT,                         -- Detailed analysis
  recommended_for_social BOOLEAN DEFAULT true, -- Post on social media?
  priority_level VARCHAR(20),               -- 'high','medium','low'
  reviewed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Key Fields

| Field | Type | Purpose |
|-------|------|---------|
| `article_id` | FK | Reference to article being reviewed |
| `relevance_score` | Decimal | 0.00 (irrelevant) to 1.00 (highly relevant) |
| `sentiment` | String | Tone of article (positive/negative/neutral) |
| `key_points` | Array | Important takeaways from article |
| `implications` | Array | What this means for 2nd Amendment advocacy |
| `recommended_for_social` | Boolean | Should social-media-agent post this? |
| `priority_level` | String | How urgent/important is this? |

## Performance

Typical metrics:

| Metric | Value |
|--------|-------|
| Review Interval | 30 minutes |
| Articles/Cycle | 8-15 |
| Processing Time | 1-3 seconds |
| Memory Usage | ~40MB |
| CPU Usage | <3% |
| Database Connections | 1 |

## Error Handling

### Common Issues

**"Found 0 articles to review"**
- Normal if news-scraper hasn't run yet
- Check: `SELECT COUNT(*) FROM news_articles WHERE is_processed = false;`
- Wait for news-scraper (runs every 4 hours)

**"Database connection failed"**
- Verify DATABASE_URL environment variable
- Check PostgreSQL is running
- Test: `psql $DATABASE_URL -c "SELECT NOW();"`

**Process keeps restarting**
- Check logs: `pm2 logs content-reviewer`
- Check database connectivity
- Verify all required tables exist

### Monitoring

```bash
# View error tracking
pm2 show content-reviewer

# Get last 100 log lines
pm2 logs content-reviewer --lines 100

# Real-time monitoring
pm2 monit
```

## Integration with Other Agents

### Downstream: social-media-agent

Content Reviewer outputs → Social Media Agent inputs:

```
Review: HIGH priority + recommended_for_social = true
   ↓
Social Media Agent fetches this article
   ↓
Generates platform-specific content (Twitter, Instagram, etc.)
   ↓
Posts to social media
```

### Upstream: news-scraper

News Scraper outputs → Content Reviewer inputs:

```
News Scraper: Creates new articles
   ↓
Content Reviewer: Analyzes for relevance/sentiment
   ↓
Marks is_processed = true
```

## Customization

### Adjust Review Frequency

Edit `agents/content-reviewer.js`:

```javascript
const REVIEW_INTERVAL = 15 * 60 * 1000; // 15 minutes instead of 30
```

Then restart: `pm2 restart content-reviewer`

### Add Custom Keywords

Edit `calculateRelevanceScore()` function:

```javascript
const CUSTOM_KEYWORDS = ['your-keyword', 'another-term'];
CUSTOM_KEYWORDS.forEach((kw) => {
  if (fullText.includes(kw)) score += 0.15;
});
```

### Adjust Batch Size

Edit review cycle:

```javascript
LIMIT 100  // Review more articles per cycle
```

## Troubleshooting

```bash
# Kill and restart
pm2 delete content-reviewer
pm2 start agents/content-reviewer.js --name content-reviewer

# Test manually
node agents/content-reviewer.js

# Check database state
SELECT 
  COUNT(DISTINCT na.id) as total_articles,
  COUNT(cr.id) as reviewed_articles,
  COUNT(DISTINCT CASE WHEN cr.priority_level = 'high' THEN na.id END) as high_priority
FROM news_articles na
LEFT JOIN content_reviews cr ON na.id = cr.article_id;
```

## Next Steps

After content-reviewer is running:

1. **Task 7** - Social Media Agent: Posts content to platforms
2. **Task 8** - Discord Alerting: Notifies Discord users
3. **Task 9** - Telegram Alerting: Sends Telegram notifications
