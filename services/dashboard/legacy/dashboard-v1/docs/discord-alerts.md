# Discord Alerts System

Real-time notification service that alerts Discord members of breaking 2nd Amendment news with role mentions and color-coded priority indicators.

## Architecture

```
content-reviewer (30m) → High-priority articles with sentiment
                              ↓
discord-alerts (15m) → Check for unsent alerts
                              ↓
         ┌──────────────────────────────┐
         ↓                              ↓
   Regular News                   Breaking News
   (Green/Yellow/Red)         (All red with mention)
   Discord #news-alerts       Discord #breaking-news
```

## Overview

The Discord Alerts System:
1. Queries high-priority articles every 15 minutes
2. Checks which articles haven't been alerted yet
3. Sends appropriate alerts based on sentiment:
   - **Positive (Green ✅):** "Victory for 2nd Amendment"
   - **Negative (Red ⚠️):** "Action needed to defend rights"
   - **Neutral (Red 📰):** "News update"
4. Sends breaking news alerts to separate channel
5. Mentions relevant Discord roles
6. Records alerts in database to prevent duplicates
7. Tracks engagement and member interactions

## Alert Types

### Regular News Alerts

**Triggered by:** High-priority articles with any sentiment

**Format:**
```
[Channel: #news-alerts]

Embed with:
- Title: Emoji + Article Title
- Description: First 300 chars of content
- Color: Based on sentiment (Green/Red)
- Fields: Priority level, Sentiment type
- Link to full article
```

**Role Mentions:**
- Positive articles: `@2A-Advocates` role mention
- Negative articles: `@Alert-Needed` role mention

### Breaking News Alerts

**Triggered by:** High-priority POSITIVE articles (victories, favorable rulings)

**Format:**
```
[Channel: #breaking-news]

🚨 **BREAKING NEWS** 🚨
@Breaking-News-Subscribers

Embed with:
- Large red banner
- Article title and full description
- Source attribution
- Direct link to article
```

**Special Mentions:**
- All subscribers pinged
- Red color indicates urgency
- Separate channel for visibility

## Setup

### 1. Create Discord Channels

In your Discord server:

```
#news-alerts          - Regular 2nd Amendment news
#breaking-news        - Critical breaking news
```

### 2. Create Discord Roles

For role mentions:

```
@2A-Advocates          - Users interested in 2nd Amendment content
@Alert-Needed          - Users who want to know about threats/restrictions
@Breaking-News-Subscribers - Users who get breaking news pings
```

### 3. Get Webhook URLs

For each channel:
1. Go to Channel Settings → Integrations → Webhooks
2. Create Webhook
3. Copy Webhook URL

### 4. Set Environment Variables

```bash
# Webhook URLs
export DISCORD_NEWS_WEBHOOK_URL="https://discord.com/api/webhooks/..."
export DISCORD_BREAKING_NEWS_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Role IDs (get from Server Settings → Roles)
export DISCORD_2A_ROLE_ID="123456789"
export DISCORD_ALERT_ROLE_ID="987654321"
export DISCORD_BREAKING_NEWS_ROLE_ID="555555555"
```

### 5. Start Agent

```bash
pm2 start ecosystem.config.js --name discord-alerts
```

## Operation

### Alert Cycle (every 15 minutes)

```
Start → Query high-priority articles
  ↓
  For each article not yet alerted:
    • Check sentiment (positive/negative/neutral)
    • If positive → Send breaking news alert
    • Else → Send regular news alert
    • Record in database
  ↓
  Log results → Schedule next cycle (15 min)
```

### Typical Output

```
[DISCORD] ========================================
[DISCORD] Starting alert cycle
[DISCORD] ========================================
[DISCORD] Found 3 articles to alert
[DISCORD] ✅ Alerted: Supreme Court Rules 2nd Amendment...
[DISCORD] Alert sent
[DISCORD] ✅ Alerted: New Gun Legislation Proposed...
[DISCORD] Breaking news alert sent
[DISCORD] ========================================
[DISCORD] Alerts sent: 2
[DISCORD] Duration: 342ms
[DISCORD] Errors: 0
[DISCORD] ========================================
```

## Database Schema

### `news_alerts_sent` Table

Tracks all sent alerts:

```sql
CREATE TABLE news_alerts_sent (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL,              -- Article being alerted
  alert_type VARCHAR(50),                  -- 'news_alert', 'breaking_news'
  channel_name VARCHAR(100),               -- 'news-alerts', 'breaking-news'
  platform VARCHAR(50),                    -- 'discord'
  alert_message TEXT,                      -- Alert text sent
  sent_at TIMESTAMP DEFAULT NOW(),         -- When sent
  delivery_status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Fields

| Field | Purpose |
|-------|---------|
| `article_id` | Reference to news article |
| `alert_type` | Type of alert sent |
| `channel_name` | Discord channel posted to |
| `platform` | 'discord' |
| `delivery_status` | 'sent' = successfully posted |

## Sentiment-Based Routing

### Positive Sentiment (✅ Green)

**Indicators:**
- "Supreme Court upholds", "Victory", "Affirms gun rights"

**Action:**
- Send breaking news alert to #breaking-news
- Mention @Breaking-News-Subscribers
- Send secondary alert to #news-alerts with @2A-Advocates mention
- Color: Bright green (#2ECC71)

**Example:**
```
✅ BREAKING: Supreme Court Upholds Second Amendment Rights
Court decision affirms constitutional protections for firearm ownership
[Learn more →]
```

### Negative Sentiment (⚠️ Red)

**Indicators:**
- "Ban proposed", "Restrictions", "Threat to rights"

**Action:**
- Send alert to #news-alerts with @Alert-Needed mention
- Red color indicates urgency
- Include CTA for action

**Example:**
```
⚠️ New Gun Control Bill Proposed in Congress
Federal legislation seeks to restrict ammunition sales
Action needed: Contact your representatives
[Read more →]
```

### Neutral Sentiment (📰 Gray)

**Indicators:**
- "Study shows", "Report indicates", "News release"

**Action:**
- Send alert to #news-alerts
- No special role mention
- Red color (news/information)

**Example:**
```
📰 New Research on Gun Safety Released
Academic study analyzes firearm usage patterns
[Learn more →]
```

## Role Mentions

### @2A-Advocates
- Receives positive news about 2nd Amendment victories
- Alerted when favorable legislation passes
- Given opportunities to celebrate wins

### @Alert-Needed
- Receives alerts about potential threats to rights
- Notified of proposed restrictions
- Called to action for advocacy campaigns

### @Breaking-News-Subscribers
- Gets all breaking news alerts
- Highest priority notifications
- Red alert status for visibility

## Duplicate Prevention

Alerts are only sent once per article:

```sql
WHERE na.id NOT IN (
  SELECT article_id FROM news_alerts_sent 
  WHERE platform = 'discord' 
  AND delivery_status = 'sent'
)
```

If an article needs re-alerting:

```bash
DELETE FROM news_alerts_sent 
WHERE article_id = 42 AND platform = 'discord';
```

Then the article will be alerted next cycle.

## Performance

| Metric | Value |
|--------|-------|
| Alert Interval | 15 minutes |
| Alerts/Cycle | 1-5 |
| Processing Time | 200-500ms |
| Memory Usage | ~25MB |
| CPU Usage | <1% |
| Latency | <1 second to Discord |

## Monitoring

```bash
# View logs
pm2 logs discord-alerts

# Real-time monitoring
pm2 monit

# Check status
pm2 status

# Show full metrics
pm2 show discord-alerts
```

### Check Alert Stats

```bash
# Total alerts sent
SELECT COUNT(*) FROM news_alerts_sent WHERE platform = 'discord';

# Alerts in last 24 hours
SELECT COUNT(*) FROM news_alerts_sent 
WHERE platform = 'discord' AND sent_at > NOW() - INTERVAL '1 day';

# By channel
SELECT channel_name, COUNT(*) FROM news_alerts_sent 
WHERE platform = 'discord' GROUP BY channel_name;
```

## Troubleshooting

### Alerts Not Sending

1. **Check webhook URLs:**
   ```bash
   echo $DISCORD_NEWS_WEBHOOK_URL
   echo $DISCORD_BREAKING_NEWS_WEBHOOK_URL
   ```

2. **Verify high-priority articles exist:**
   ```bash
   SELECT COUNT(*) FROM content_reviews 
   WHERE priority_level = 'high';
   ```

3. **Check for sent alerts:**
   ```bash
   SELECT COUNT(*) FROM news_alerts_sent 
   WHERE platform = 'discord' AND delivery_status = 'sent';
   ```

4. **View logs:**
   ```bash
   pm2 logs discord-alerts --lines 100
   ```

### Invalid Webhook

- Copy fresh webhook URL from Channel Settings
- Verify bot has permission to post
- Check URL hasn't expired

### Role Mentions Not Working

- Verify role ID is numeric (not mention text)
- Ensure bot has permission to mention roles
- Check role exists in server

## Integration with Other Systems

```
news-scraper (4h) → articles
    ↓
content-reviewer (30m) → high-priority
    ↓
discord-alerts (15m) ← CHECK FOR ALERTS
    ↓
social-media-agent (2h) ← ALSO POSTS CONTENT
```

## Next Steps

1. **Task 9** - Telegram Enhanced Notifications
2. **Task 10** - Admin Dashboard with Analytics
3. **Task 11** - Engagement Tracking
4. **Task 12** - Member Leaderboards
5. **Task 13-14** - Final testing and deployment
