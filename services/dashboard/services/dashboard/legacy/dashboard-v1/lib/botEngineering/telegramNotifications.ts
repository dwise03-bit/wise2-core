/**
 * Telegram Notifications Module
 * Sends real-time alerts and personalized content to Telegram users
 */

import axios from 'axios';
import { query } from '@/lib/db';

export interface TelegramUser {
  user_id: number;
  chat_id: string;
  username?: string;
  is_subscribed: boolean;
  subscription_type: 'breaking' | 'daily' | 'all';
}

/**
 * Send alert to Telegram channel/group
 */
export async function sendTelegramAlert(
  chatId: string,
  title: string,
  content: string,
  url: string,
  sentiment: 'positive' | 'negative' | 'neutral'
): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn('[TELEGRAM] Bot token not configured');
      return false;
    }

    let emoji = '📰';
    if (sentiment === 'positive') emoji = '✅';
    if (sentiment === 'negative') emoji = '⚠️';

    const message = `${emoji} *${title}*\n\n${content}\n\n[Read More](${url})`;

    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('[TELEGRAM] Error sending alert:', error);
    return false;
  }
}

/**
 * Send personalized daily digest
 */
export async function sendDailyDigest(
  chatId: string,
  userId: number
): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return false;
    }

    // Get top 3 articles from today
    const result = await query(
      `SELECT na.title, na.source_url, cr.sentiment, cr.relevance_score
       FROM news_articles na
       JOIN content_reviews cr ON na.id = cr.article_id
       WHERE cr.priority_level = 'high'
       AND na.created_at > NOW() - INTERVAL '1 day'
       ORDER BY cr.relevance_score DESC
       LIMIT 3`
    );

    if (result.rows.length === 0) {
      return false;
    }

    let digest = '📋 *Daily 2nd Amendment Digest*\n\n';

    result.rows.forEach((article: any, index: number) => {
      digest += `*${index + 1}. ${article.title}*\n`;
      digest += `Relevance: ${(article.relevance_score * 100).toFixed(0)}%\n`;
      digest += `[Read](${article.source_url})\n\n`;
    });

    digest += '_Subscribe for more updates_';

    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: digest,
        parse_mode: 'Markdown',
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('[TELEGRAM] Error sending digest:', error);
    return false;
  }
}

/**
 * Send subscription prompt with inline keyboard
 */
export async function sendSubscriptionPrompt(chatId: string): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return false;
    }

    const message = `Choose your notification preference:\n\n🔴 *Breaking News Only* - Get alerts only for major victories\n📰 *Daily Digest* - One summary per day\n📢 *All Updates* - Real-time for every article`;

    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔴 Breaking News', callback_data: 'sub_breaking' },
              { text: '📰 Daily Digest', callback_data: 'sub_daily' },
            ],
            [{ text: '📢 All Updates', callback_data: 'sub_all' }],
            [{ text: '❌ Unsubscribe', callback_data: 'sub_none' }],
          ],
        },
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('[TELEGRAM] Error sending prompt:', error);
    return false;
  }
}

/**
 * Register or update Telegram user subscription
 */
export async function updateSubscription(
  userId: number,
  chatId: string,
  subscriptionType: 'breaking' | 'daily' | 'all' | 'none'
): Promise<boolean> {
  try {
    const isSubscribed = subscriptionType !== 'none';

    // Insert or update subscription
    await query(
      `INSERT INTO telegram_subscriptions (user_id, chat_id, subscription_type, is_subscribed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
       subscription_type = EXCLUDED.subscription_type,
       is_subscribed = EXCLUDED.is_subscribed,
       updated_at = NOW()`,
      [userId, chatId, subscriptionType === 'none' ? 'breaking' : subscriptionType, isSubscribed]
    );

    return true;
  } catch (error) {
    console.error('[TELEGRAM] Error updating subscription:', error);
    return false;
  }
}

/**
 * Get user subscription type
 */
export async function getUserSubscription(
  userId: number
): Promise<'breaking' | 'daily' | 'all' | 'none' | null> {
  try {
    const result = await query(
      `SELECT subscription_type, is_subscribed FROM telegram_subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const { subscription_type, is_subscribed } = result.rows[0];

    return is_subscribed ? subscription_type : 'none';
  } catch (error) {
    console.error('[TELEGRAM] Error getting subscription:', error);
    return null;
  }
}

/**
 * Broadcast alert to subscribed users
 */
export async function broadcastAlert(
  title: string,
  content: string,
  url: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  priority: 'high' | 'medium' | 'low'
): Promise<number> {
  try {
    // Get subscribers based on alert type
    let subscriptionFilter = '';

    if (priority === 'high' && sentiment === 'positive') {
      // Breaking news - only send to breaking/all subscribers
      subscriptionFilter = "AND (subscription_type IN ('breaking', 'all'))";
    } else if (priority === 'high') {
      // High priority - send to all subscribers
      subscriptionFilter = "AND (subscription_type IN ('breaking', 'daily', 'all'))";
    } else {
      // Other - only send to 'all' subscribers
      subscriptionFilter = "AND subscription_type = 'all'";
    }

    const result = await query(
      `SELECT chat_id FROM telegram_subscriptions 
       WHERE is_subscribed = true ${subscriptionFilter}`
    );

    let sent = 0;

    for (const { chat_id } of result.rows) {
      const success = await sendTelegramAlert(chat_id, title, content, url, sentiment);
      if (success) sent++;
    }

    return sent;
  } catch (error) {
    console.error('[TELEGRAM] Error broadcasting alert:', error);
    return 0;
  }
}

/**
 * Get notification statistics
 */
export async function getTelegramStats() {
  try {
    const total = await query('SELECT COUNT(*) as count FROM telegram_subscriptions WHERE is_subscribed = true');
    const byType = await query(
      `SELECT subscription_type, COUNT(*) as count 
       FROM telegram_subscriptions WHERE is_subscribed = true 
       GROUP BY subscription_type`
    );

    return {
      total_subscribers: parseInt(total.rows[0]?.count || '0'),
      by_type: byType.rows,
    };
  } catch (error) {
    console.error('[TELEGRAM] Error getting stats:', error);
    return {
      total_subscribers: 0,
      by_type: [],
    };
  }
}
