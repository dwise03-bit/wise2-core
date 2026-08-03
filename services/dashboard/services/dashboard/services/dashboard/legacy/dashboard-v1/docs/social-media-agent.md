# Social Media Posting Agent

Automated posting service that distributes high-quality 2nd Amendment content across all social media platforms every 2 hours.

## Architecture

```
content-reviewer (30m) → High-priority articles with reviews
                              ↓
social-media-agent (2h) → Generate platform-specific content
                              ↓
         ┌───────────┬────────┬────────┬────────┐
         ↓           ↓        ↓        ↓        ↓
      Twitter    Instagram  LinkedIn  Telegram Discord
```

## Overview

The Social Media Posting Agent:
1. Queries high-priority articles with reviews
2. Fetches pending posts from `social_posts_generated` table
3. Posts to each platform (Twitter, Instagram, LinkedIn, Telegram, Discord)
4. Tracks posting status and engagement metrics
5. Awards points to members whose content was shared
6. Schedules next posting cycle (2 hours)

## Platform Support

| Platform | Status | Features | Scheduling |
|----------|--------|----------|------------|
| **Telegram** | ✅ Live | Direct API posting to channels | Every 2 hours |
| **Discord** | ✅ Live | Webhook posting with embeds | Every 2 hours |
| **Twitter** | ⏳ Ready | Awaiting API credentials | Every 2 hours |
| **Instagram** | ⏳ Ready | Graph API integration ready | Every 2 hours |
| **LinkedIn** | ⏳ Ready | Organization posting ready | Every 2 hours |

## Operation

### Posting Cycle (every 2 hours)

```
Start → Process Each Platform
  ↓
  For each of [twitter, instagram, linkedin, telegram, discord]:
    • Fetch pending posts (max 3 per platform)
    • Format content for platform
    • Post to platform API
    • Mark post as 'posted'
    • Update engagement metrics
  ↓
  Log results → Award member points → Schedule next cycle (2h)
```

### Typical Output

```
[SOCIAL] ========================================
[SOCIAL] Starting social media posting cycle
[SOCIAL] ========================================
[SOCIAL] Found 2 pending posts for twitter
[SOCIAL] Processing twitter post from article 42
[SOCIAL] twitter post ready (awaiting API credentials)
[SOCIAL] Found 3 pending posts for telegram
[SOCIAL] Processing telegram post from article 42
[SOCIAL] ✅ Posted to telegram
[SOCIAL] Found 2 pending posts for discord
[SOCIAL] ✅ Posted to discord
[SOCIAL] ========================================
[SOCIAL] Posts published: 2
[SOCIAL]   telegram: 1
[SOCIAL]   discord: 1
[SOCIAL] Duration: 1245ms
[SOCIAL] Errors: 0
[SOCIAL] ========================================
```

## Setup

### 1. Start Social Media Agent

```bash
# Via ecosystem.config.js
pm2 start ecosystem.config.js --name social-media-agent

# Or individual
pm2 start agents/social-media-agent.js --name social-media-agent
```

### 2. Configure Credentials

Set environment variables:

```bash
# Telegram (required for Telegram posting)
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHANNEL_ID="your-channel-id"

# Discord (required for Discord posting)
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Twitter (optional - awaiting setup)
export TWITTER_API_KEY="..."
export TWITTER_API_SECRET="..."
export TWITTER_ACCESS_TOKEN="..."
export TWITTER_ACCESS_SECRET="..."

# Instagram (optional - awaiting setup)
export INSTAGRAM_ACCESS_TOKEN="..."
export INSTAGRAM_BUSINESS_ACCOUNT_ID="..."

# LinkedIn (optional - awaiting setup)
export LINKEDIN_ACCESS_TOKEN="..."
export LINKEDIN_ORG_ID="..."
```

### 3. Monitor

```bash
# View logs
pm2 logs social-media-agent

# Monitor in real-time
pm2 monit

# Check status
pm2 status
```

## Database Integration

### Input: `social_posts_generated` Table

Fetches posts with:
- `platform`: twitter, instagram, linkedin, telegram, discord
- `status = 'pending'`: Ready to post
- `content_text`: Formatted post content
- `hashtags`: Platform-specific hashtags
- `call_to_action`: Engagement prompt

### Output: Updates to Tables

```sql
-- Marks posts as posted
UPDATE social_posts_generated
SET status = 'posted', posted_at = NOW(), post_url = '...'
WHERE id = ? AND platform = ?;

-- Awards member points (if available)
INSERT INTO member_engagement (member_id, platform, action_type, metadata)
VALUES (?, 'social', 'content_amplified', '...');
```

## Post Status Lifecycle

```
Pending → Posted → Tracked Engagement
  ↓        ↓             ↓
Waiting  Live on      Metrics
for      platform     collected
posting
```

**Status Values:**
- `pending`: Generated, ready to post
- `posted`: Successfully published
- `failed`: Posting error
- `draft`: Saved but not ready

## Performance

Typical metrics:

| Metric | Value |
|--------|-------|
| Posting Interval | 2 hours |
| Posts/Cycle | 3-8 |
| Processing Time | 1-3 seconds |
| Memory Usage | ~30MB |
| CPU Usage | <2% |
| Database Connections | 1 |

## Platform-Specific Details

### Telegram

**Requirements:**
- Bot token from @BotFather
- Channel ID (format: -100123456789)
- Bot is member of channel with posting permissions

**Posting:**
- Direct API call to `/sendMessage`
- Supports HTML formatting
- Returns message ID for tracking

**Credentials:**
```bash
TELEGRAM_BOT_TOKEN="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
TELEGRAM_CHANNEL_ID="-100123456789"
```

### Discord

**Requirements:**
- Webhook URL from server settings
- Bot permissions: Send Messages, Embed Links

**Posting:**
- Webhook POST with JSON payload
- Supports embedded messages with colors/fields
- Returns message ID

**Credentials:**
```bash
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/123456/abcdef..."
```

### Twitter (Ready for Setup)

**Requirements:**
- Twitter API v2 credentials
- Bearer token or OAuth tokens
- Tweet write permissions

**Posting:**
- Creates tweet with hashtags
- Includes link to original article
- Tracks engagement

**Setup When Ready:**
```bash
# Get credentials from https://developer.twitter.com
TWITTER_API_KEY="..."
TWITTER_API_SECRET="..."
TWITTER_ACCESS_TOKEN="..."
TWITTER_ACCESS_SECRET="..."
```

## Error Handling

### Common Issues

**"Telegram/Discord not configured"**
- Agent logs but continues
- Posts marked as 'pending' stay unposted
- No error on agent - check logs manually

**"Failed to post to platform"**
- Logs error with platform name
- Post status remains 'pending'
- Retries next cycle

**Database Connection Error**
- Agent exits with error code 1
- PM2 automatically restarts
- Check logs: `pm2 logs social-media-agent`

### Monitoring

```bash
# View errors
pm2 logs social-media-agent | grep ERROR

# Check specific platform
pm2 logs social-media-agent | grep telegram

# Real-time monitoring
pm2 monit
```

## Troubleshooting

### Posts Not Posting

1. **Check credentials:**
   ```bash
   echo $TELEGRAM_BOT_TOKEN
   echo $DISCORD_WEBHOOK_URL
   ```

2. **Verify posts exist:**
   ```bash
   SELECT COUNT(*) FROM social_posts_generated WHERE status = 'pending';
   ```

3. **Check logs:**
   ```bash
   pm2 logs social-media-agent --lines 50
   ```

4. **Restart agent:**
   ```bash
   pm2 restart social-media-agent
   ```

### API Errors

**"Invalid chat_id" (Telegram)**
- Verify TELEGRAM_CHANNEL_ID is in format: -100123456789
- Check bot is member of channel
- Test with: `curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/getMe"`

**"Invalid Webhook" (Discord)**
- Copy fresh webhook URL from server settings
- Verify URL hasn't expired
- Check bot has Send Messages permission

## Integration Workflow

```
Every 2 hours:
  1. news-scraper (4h) → Fetches articles
  2. content-reviewer (30m) → Analyzes for relevance/priority
  3. Social content generator → Creates platform-specific content
  4. social-media-agent → THIS SERVICE → Posts to platforms
       ↓
  5. Discord members see posts
  6. Telegram subscribers notified
  7. Twitter/Instagram/LinkedIn posts live (when credentials added)
  8. Engagement tracked and metrics updated
```

## Next Steps

1. **Task 8** - Discord Alerting: Alert members of breaking news
2. **Task 9** - Telegram Notification: Enhanced Telegram features
3. **Task 10** - Admin Dashboard: Monitor posting activity
4. **Task 11** - Analytics: Track engagement metrics

## Performance Tuning

### Adjust Posting Frequency

Edit `agents/social-media-agent.js`:

```javascript
const POSTING_INTERVAL = 1 * 60 * 60 * 1000; // 1 hour instead of 2
```

Then restart: `pm2 restart social-media-agent`

### Adjust Posts Per Platform

```javascript
const pendingPosts = await getPendingPosts(platform, 5); // Post 5 instead of 3
```

### Batch Size

```javascript
// Currently processes 5 platforms × 3 posts = 15 max per cycle
// Increase by adjusting limit parameter above
```
