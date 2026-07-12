/**
 * Discord Alerts Agent
 * PM2-managed service that sends real-time alerts for breaking 2nd Amendment news
 * Runs every 15 minutes to notify Discord members of high-priority articles
 */

const pg = require('pg');
const axios = require('axios');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const alertState = {
  isRunning: false,
  lastRun: null,
  alertsSent: 0,
  errors: [],
};

/**
 * Send Discord alert via webhook
 */
async function sendDiscordAlert(title, content, url, sentiment, priority, imageUrl) {
  try {
    const webhookUrl = process.env.DISCORD_NEWS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('[DISCORD] News webhook not configured');
      return false;
    }

    let color = 15158332; // Red
    let emoji = '📰';
    let mention = '';

    if (sentiment === 'positive') {
      color = 3066993; // Green
      emoji = '✅';
      mention = process.env.DISCORD_2A_ROLE_ID
        ? `<@&${process.env.DISCORD_2A_ROLE_ID}> `
        : '';
    } else if (sentiment === 'negative') {
      color = 15158332; // Red
      emoji = '⚠️';
      mention = process.env.DISCORD_ALERT_ROLE_ID
        ? `<@&${process.env.DISCORD_ALERT_ROLE_ID}> `
        : '';
    }

    const embed = {
      title: `${emoji} ${title}`,
      description: content.substring(0, 300),
      url,
      color,
      fields: [
        {
          name: 'Priority',
          value: priority.toUpperCase(),
          inline: true,
        },
        {
          name: 'Sentiment',
          value: sentiment,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    if (imageUrl) {
      embed.image = { url: imageUrl };
    }

    const message = {
      content: mention || undefined,
      embeds: [embed],
    };

    await axios.post(webhookUrl, message);
    console.log('[DISCORD] Alert sent');
    return true;
  } catch (error) {
    console.error('[DISCORD] Error sending alert:', error.message);
    return false;
  }
}

/**
 * Send breaking news alert
 */
async function sendBreakingNewsAlert(title, content, url, source) {
  try {
    const webhookUrl = process.env.DISCORD_BREAKING_NEWS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('[DISCORD] Breaking news webhook not configured');
      return false;
    }

    const message = {
      content: `🚨 **BREAKING NEWS** 🚨\n${
        process.env.DISCORD_BREAKING_NEWS_ROLE_ID
          ? `<@&${process.env.DISCORD_BREAKING_NEWS_ROLE_ID}>`
          : ''
      }`,
      embeds: [
        {
          title,
          description: content,
          url,
          color: 16711680,
          fields: [
            {
              name: 'Source',
              value: source,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await axios.post(webhookUrl, message);
    console.log('[DISCORD] Breaking news alert sent');
    return true;
  } catch (error) {
    console.error('[DISCORD] Error sending breaking alert:', error.message);
    return false;
  }
}

/**
 * Record alert in database
 */
async function recordAlert(articleId, channel) {
  try {
    await pool.query(
      `INSERT INTO news_alerts_sent (article_id, alert_type, channel_name, platform, delivery_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [articleId, 'news_alert', channel, 'discord', 'sent']
    );
  } catch (error) {
    console.error('[DISCORD] Error recording alert:', error.message);
  }
}

/**
 * Check if alert already sent
 */
async function isAlertSent(articleId) {
  try {
    const result = await pool.query(
      `SELECT id FROM news_alerts_sent
       WHERE article_id = $1 AND platform = 'discord' AND delivery_status = 'sent'
       LIMIT 1`,
      [articleId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('[DISCORD] Error checking alert:', error.message);
    return false;
  }
}

/**
 * Run alert cycle
 */
async function runAlertCycle() {
  if (alertState.isRunning) {
    console.log('[DISCORD] Cycle running, skipping');
    return;
  }

  alertState.isRunning = true;
  alertState.alertsSent = 0;
  alertState.errors = [];

  const startTime = Date.now();

  try {
    console.log('[DISCORD] ========================================');
    console.log('[DISCORD] Starting alert cycle');
    console.log('[DISCORD] ========================================');

    // Find high-priority articles from last 6 hours that haven't been alerted
    const result = await pool.query(
      `SELECT na.id, na.title, na.content, na.source_url, na.source_name, na.image_url,
              cr.sentiment, cr.priority_level
       FROM news_articles na
       JOIN content_reviews cr ON na.id = cr.article_id
       WHERE cr.priority_level = 'high'
       AND na.created_at > NOW() - INTERVAL '6 hours'
       AND na.id NOT IN (
         SELECT article_id FROM news_alerts_sent
         WHERE platform = 'discord' AND delivery_status = 'sent'
       )
       ORDER BY na.created_at DESC
       LIMIT 3`
    );

    const articles = result.rows;
    console.log(`[DISCORD] Found ${articles.length} articles to alert`);

    for (const article of articles) {
      // Skip if already sent
      if (await isAlertSent(article.id)) {
        continue;
      }

      let alerted = false;

      // Send breaking news for positive high-priority
      if (article.sentiment === 'positive') {
        alerted = await sendBreakingNewsAlert(
          article.title,
          article.content.substring(0, 300),
          article.source_url,
          article.source_name
        );
      } else {
        // Send regular alert for other sentiments
        alerted = await sendDiscordAlert(
          article.title,
          article.content.substring(0, 300),
          article.source_url,
          article.sentiment,
          article.priority_level,
          article.image_url
        );
      }

      if (alerted) {
        await recordAlert(article.id, 'news-alerts');
        alertState.alertsSent++;
        console.log(`[DISCORD] ✅ Alerted: ${article.title.substring(0, 50)}`);
      }
    }

    const duration = Date.now() - startTime;

    console.log('[DISCORD] ========================================');
    console.log(`[DISCORD] Alerts sent: ${alertState.alertsSent}`);
    console.log(`[DISCORD] Duration: ${duration}ms`);
    console.log(`[DISCORD] Errors: ${alertState.errors.length}`);
    console.log('[DISCORD] ========================================');

    alertState.lastRun = new Date();
  } catch (error) {
    console.error('[DISCORD] Fatal error:', error);
    alertState.errors.push({ error: error.message });
  } finally {
    alertState.isRunning = false;
  }
}

/**
 * Start agent
 */
async function start() {
  console.log('[DISCORD] Alerts Agent starting...');

  try {
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('[DISCORD] Database connected:', testResult.rows[0].now);

    console.log('[DISCORD] Running initial alert cycle...');
    await runAlertCycle();

    // Run every 2 hours
    const ALERT_INTERVAL = 2 * 60 * 60 * 1000;

    setInterval(async () => {
      await runAlertCycle();
    }, ALERT_INTERVAL);

    console.log('[DISCORD] Agent ready - alerts every 2 hours');
  } catch (error) {
    console.error('[DISCORD] Startup error:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('[DISCORD] Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[DISCORD] Shutting down...');
  await pool.end();
  process.exit(0);
});

start();
