/**
 * Telegram Bot Enhanced
 * PM2-managed Telegram bot with real-time alerts and subscriptions
 * Handles /start, /subscribe, /digest, /stats commands
 */

const TelegramBot = require('node-telegram-bot-api');
const pg = require('pg');
const axios = require('axios');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const botState = {
  usersActive: 0,
  messagesProcessed: 0,
  commandsHandled: {},
};

/**
 * Handle /start command
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || 'User';

  try {
    console.log(`[TELEGRAM] User started: ${username} (${userId})`);

    // Register user
    await pool.query(
      `INSERT INTO telegram_subscriptions (user_id, chat_id, username)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()`,
      [userId, chatId, username]
    );

    // Send welcome + subscription prompt
    const welcome = `👋 Welcome to 2nd Amendment News!\n\nI'll send you breaking news, court decisions, and important updates about your constitutional rights.\n\nChoose how often you want notifications:`;

    bot.sendMessage(chatId, welcome, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔴 Breaking News Only', callback_data: 'sub_breaking' },
            { text: '📰 Daily Digest', callback_data: 'sub_daily' },
          ],
          [{ text: '📢 All Updates', callback_data: 'sub_all' }],
          [{ text: '❌ No Thanks', callback_data: 'sub_none' }],
        ],
      },
    });

    botState.usersActive++;
  } catch (error) {
    console.error('[TELEGRAM] Error in /start:', error.message);
    bot.sendMessage(chatId, '❌ Error: Could not register. Please try again.');
  }
});

/**
 * Handle subscription callbacks
 */
bot.on('callback_query', async (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    if (data.startsWith('sub_')) {
      const subType = data.replace('sub_', '');
      const isSubscribed = subType !== 'none';

      await pool.query(
        `INSERT INTO telegram_subscriptions (user_id, chat_id, subscription_type, is_subscribed)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
         subscription_type = EXCLUDED.subscription_type,
         is_subscribed = EXCLUDED.is_subscribed`,
        [userId, chatId, subType === 'none' ? 'breaking' : subType, isSubscribed]
      );

      let response = '';
      if (subType === 'breaking') {
        response = '✅ You\'ll get alerts for major victories and breaking news!';
      } else if (subType === 'daily') {
        response = '📰 You\'ll get a daily digest at 9 AM!';
      } else if (subType === 'all') {
        response = '📢 You\'ll get all updates in real-time!';
      } else {
        response = '❌ You\'ve been unsubscribed.';
      }

      bot.answerCallbackQuery(query.id);
      bot.editMessageText(response, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });
    }

    botState.commandsHandled[data] = (botState.commandsHandled[data] || 0) + 1;
  } catch (error) {
    console.error('[TELEGRAM] Error handling callback:', error.message);
    bot.answerCallbackQuery(query.id, { text: '❌ Error processing request' });
  }
});

/**
 * Handle /stats command
 */
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN subscription_type = 'breaking' THEN 1 ELSE 0 END) as breaking,
              SUM(CASE WHEN subscription_type = 'daily' THEN 1 ELSE 0 END) as daily,
              SUM(CASE WHEN subscription_type = 'all' THEN 1 ELSE 0 END) as all_updates
       FROM telegram_subscriptions WHERE is_subscribed = true`
    );

    const stats = result.rows[0];

    const message = `📊 *2nd Amendment News Stats*\n\n` +
      `Subscribers: ${stats.total}\n` +
      `🔴 Breaking News: ${stats.breaking}\n` +
      `📰 Daily Digest: ${stats.daily}\n` +
      `📢 All Updates: ${stats.all_updates}`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('[TELEGRAM] Error in /stats:', error.message);
    bot.sendMessage(chatId, '❌ Error getting statistics');
  }
});

/**
 * Handle /digest command
 */
bot.onText(/\/digest/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const result = await pool.query(
      `SELECT na.title, na.source_url, cr.sentiment, cr.relevance_score
       FROM news_articles na
       JOIN content_reviews cr ON na.id = cr.article_id
       WHERE cr.priority_level IN ('high', 'medium')
       AND na.created_at > NOW() - INTERVAL '1 day'
       ORDER BY cr.relevance_score DESC
       LIMIT 5`
    );

    if (result.rows.length === 0) {
      bot.sendMessage(chatId, '📋 No articles found for today.');
      return;
    }

    let digest = '📋 *Today\'s 2nd Amendment Digest*\n\n';

    result.rows.forEach((article: any, index: number) => {
      digest += `*${index + 1}. ${article.title}*\n`;
      digest += `Relevance: ${(article.relevance_score * 100).toFixed(0)}%\n`;
      digest += `[Read More](${article.source_url})\n\n`;
    });

    bot.sendMessage(chatId, digest, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('[TELEGRAM] Error in /digest:', error.message);
    bot.sendMessage(chatId, '❌ Error fetching digest');
  }
});

/**
 * Handle /help command
 */
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const help = `📚 *Available Commands*\n\n` +
    `/start - Subscribe to news alerts\n` +
    `/stats - See subscriber statistics\n` +
    `/digest - Get today's digest\n` +
    `/help - Show this help message`;

  bot.sendMessage(chatId, help, { parse_mode: 'Markdown' });
});

/**
 * Handle any text message
 */
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    // Non-command message
    botState.messagesProcessed++;

    bot.sendMessage(msg.chat.id,
      '💡 I\'m a news alert bot. Use /help for available commands.'
    );
  }
});

/**
 * Broadcast alert to all subscribed users
 */
async function broadcastAlert(title, content, url, sentiment, priority) {
  try {
    console.log('[TELEGRAM] Broadcasting alert to subscribers...');

    let subscriptionFilter = '';

    if (priority === 'high' && sentiment === 'positive') {
      subscriptionFilter = "AND subscription_type IN ('breaking', 'all')";
    } else if (priority === 'high') {
      subscriptionFilter = "AND subscription_type IN ('breaking', 'daily', 'all')";
    } else {
      subscriptionFilter = "AND subscription_type = 'all'";
    }

    const result = await pool.query(
      `SELECT chat_id FROM telegram_subscriptions 
       WHERE is_subscribed = true ${subscriptionFilter}`
    );

    let emoji = '📰';
    if (sentiment === 'positive') emoji = '✅';
    if (sentiment === 'negative') emoji = '⚠️';

    const message = `${emoji} *${title}*\n\n${content}\n\n[Read More](${url})`;

    let sent = 0;

    for (const { chat_id } of result.rows) {
      try {
        await bot.sendMessage(chat_id, message, { parse_mode: 'Markdown' });
        sent++;
      } catch (error) {
        console.error(`[TELEGRAM] Error sending to ${chat_id}:`, error.message);
      }
    }

    console.log(`[TELEGRAM] Broadcast complete: ${sent} messages sent`);
  } catch (error) {
    console.error('[TELEGRAM] Error broadcasting alert:', error.message);
  }
}

/**
 * Start bot
 */
console.log('[TELEGRAM] Bot initialized');
console.log('[TELEGRAM] Listening for messages...');

// Error handling
bot.on('polling_error', (error) => {
  console.error('[TELEGRAM] Polling error:', error);
});

bot.on('error', (error) => {
  console.error('[TELEGRAM] Bot error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[TELEGRAM] Shutting down...');
  bot.stopPolling();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[TELEGRAM] Shutting down...');
  bot.stopPolling();
  await pool.end();
  process.exit(0);
});

// Export broadcast function for external use
module.exports = { broadcastAlert, bot };
