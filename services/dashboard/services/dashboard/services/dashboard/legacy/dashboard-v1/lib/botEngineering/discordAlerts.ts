/**
 * Discord Alerts Module
 * Sends real-time notifications to Discord for breaking 2nd Amendment news
 */

import axios from 'axios';
import { query } from '@/lib/db';

export interface DiscordAlertConfig {
  webhookUrl: string;
  channel: string;
  mentionRole?: string;
  includeImage?: boolean;
}

/**
 * Send alert to Discord webhook
 */
export async function sendDiscordAlert(
  title: string,
  content: string,
  url: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  priority: 'high' | 'medium' | 'low',
  imageUrl?: string
): Promise<boolean> {
  try {
    const webhookUrl = process.env.DISCORD_NEWS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('[DISCORD] Alert webhook not configured');
      return false;
    }

    // Determine color and emoji based on sentiment
    let color = 15158332; // Red (neutral)
    let emoji = '📰';
    let mention = '';

    if (sentiment === 'positive') {
      color = 3066993; // Green
      emoji = '✅';
      mention = process.env.DISCORD_2A_ROLE_ID ? `<@&${process.env.DISCORD_2A_ROLE_ID}> ` : '';
    } else if (sentiment === 'negative') {
      color = 15158332; // Red
      emoji = '⚠️';
      mention = process.env.DISCORD_ALERT_ROLE_ID ? `<@&${process.env.DISCORD_ALERT_ROLE_ID}> ` : '';
    }

    // Build embed
    const embed: any = {
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

    const response = await axios.post(webhookUrl, message);

    console.log('[DISCORD] Alert sent successfully');
    return true;
  } catch (error) {
    console.error('[DISCORD] Error sending alert:', error);
    return false;
  }
}

/**
 * Send breaking news alert (high priority)
 */
export async function sendBreakingNewsAlert(
  title: string,
  content: string,
  url: string,
  source: string
): Promise<boolean> {
  try {
    const webhookUrl = process.env.DISCORD_BREAKING_NEWS_WEBHOOK_URL;

    if (!webhookUrl) {
      return false;
    }

    const message = {
      content: `🚨 **BREAKING NEWS** 🚨\n${process.env.DISCORD_BREAKING_NEWS_ROLE_ID ? `<@&${process.env.DISCORD_BREAKING_NEWS_ROLE_ID}>` : ''}`,
      embeds: [
        {
          title,
          description: content,
          url,
          color: 16711680, // Red
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
    console.error('[DISCORD] Error sending breaking news alert:', error);
    return false;
  }
}

/**
 * Record alert sent
 */
export async function recordAlertSent(
  articleId: number,
  platform: string,
  channel: string
): Promise<boolean> {
  try {
    await query(
      `INSERT INTO news_alerts_sent (article_id, alert_type, channel_name, platform, alert_message, delivery_status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [articleId, 'news_alert', channel, platform, 'Discord news alert sent', 'sent']
    );
    return true;
  } catch (error) {
    console.error('[DISCORD] Error recording alert:', error);
    return false;
  }
}

/**
 * Check if alert already sent for article
 */
export async function isAlertSent(articleId: number, platform: string = 'discord'): Promise<boolean> {
  try {
    const result = await query(
      `SELECT id FROM news_alerts_sent
       WHERE article_id = $1 AND platform = $2 AND delivery_status = 'sent'
       LIMIT 1`,
      [articleId, platform]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('[DISCORD] Error checking alert:', error);
    return false;
  }
}

/**
 * Send alert for high-priority article
 */
export async function alertHighPriorityArticle(articleId: number): Promise<boolean> {
  try {
    // Fetch article and review
    const articleResult = await query('SELECT * FROM news_articles WHERE id = $1', [articleId]);

    if (articleResult.rows.length === 0) {
      return false;
    }

    const article = articleResult.rows[0];

    const reviewResult = await query('SELECT * FROM content_reviews WHERE article_id = $1', [
      articleId,
    ]);

    if (reviewResult.rows.length === 0) {
      return false;
    }

    const review = reviewResult.rows[0];

    // Check if alert already sent
    if (await isAlertSent(articleId, 'discord')) {
      console.log('[DISCORD] Alert already sent for this article');
      return false;
    }

    // Send appropriate alert based on priority and sentiment
    let alerted = false;

    if (review.priority_level === 'high' && review.sentiment === 'positive') {
      alerted = await sendBreakingNewsAlert(
        article.title,
        article.content.substring(0, 300),
        article.source_url,
        article.source_name
      );
    } else if (review.priority_level === 'high') {
      alerted = await sendDiscordAlert(
        article.title,
        article.content.substring(0, 300),
        article.source_url,
        review.sentiment,
        review.priority_level,
        article.image_url
      );
    }

    if (alerted) {
      await recordAlertSent(articleId, 'discord', 'news-alerts');
    }

    return alerted;
  } catch (error) {
    console.error('[DISCORD] Error alerting article:', error);
    return false;
  }
}

/**
 * Get alert statistics
 */
export async function getAlertStats() {
  try {
    const total = await query('SELECT COUNT(*) as count FROM news_alerts_sent WHERE platform = \'discord\'');
    const today = await query(
      `SELECT COUNT(*) as count FROM news_alerts_sent 
       WHERE platform = 'discord' AND sent_at > NOW() - INTERVAL '1 day'`
    );
    const pending = await query(
      `SELECT COUNT(*) as count FROM news_articles na
       WHERE na.id NOT IN (SELECT article_id FROM news_alerts_sent WHERE platform = 'discord')
       AND na.id IN (SELECT article_id FROM content_reviews WHERE priority_level = 'high')`
    );

    return {
      total_alerts: parseInt(total.rows[0]?.count || '0'),
      alerts_today: parseInt(today.rows[0]?.count || '0'),
      pending_alerts: parseInt(pending.rows[0]?.count || '0'),
    };
  } catch (error) {
    console.error('[DISCORD] Error getting stats:', error);
    return {
      total_alerts: 0,
      alerts_today: 0,
      pending_alerts: 0,
    };
  }
}
