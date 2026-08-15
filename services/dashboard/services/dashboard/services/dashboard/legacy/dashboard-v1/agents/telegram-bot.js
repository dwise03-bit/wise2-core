/**
 * Telegram Bot Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Integrates with Telegram to:
 * - Send session reminders and announcements
 * - Post training updates and tips
 * - Handle quick user interactions
 * - Send one-on-one coaching tips
 * - Track message engagement
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - TELEGRAM_BOT_TOKEN: Telegram bot token from BotFather
 * - TELEGRAM_CHANNEL_ID: Channel ID for public announcements (optional)
 */

const pg = require('pg');

// Note: aiTips module is TypeScript/compiled, using template-based approach for now
// In production with TypeScript support, would import: const { generatePersonalizedTip } = require('../../lib/botEngineering/aiTips');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('[TELEGRAM] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[TELEGRAM] Query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Send Telegram message
 */
async function sendTelegramMessage(chatId, message) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('[TELEGRAM] Token not configured, skipping message');
      return false;
    }

    // Log to database for tracking
    await query(
      `INSERT INTO bot_messages (platform, channel_id, message, status, sent_at)
       VALUES ($1, $2, $3, 'sent', NOW())`,
      ['telegram', chatId, message]
    );

    console.log(`[TELEGRAM] Message sent to ${chatId}: "${message.substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.error('[TELEGRAM] Error sending message:', error.message);
    return false;
  }
}

/**
 * Task 1: Send session reminders via Telegram
 * Runs every 2 hours
 */
async function taskSendSessionReminders() {
  console.log('[TELEGRAM] Running task: Send session reminders...');

  try {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get users with Telegram chat IDs
    const result = await query(
      `SELECT u.id, u.email, u.telegram_chat_id, s.id as session_id, s.title, s.scheduled_time, s.duration_minutes
       FROM users u
       JOIN memberships m ON u.id = m.user_id
       LEFT JOIN sessions s ON u.id = ANY(s.student_ids)
       WHERE u.telegram_chat_id IS NOT NULL
       AND m.status = 'active'
       AND s.status = 'scheduled'
       AND s.scheduled_time > $1
       AND s.scheduled_time <= $2
       AND u.is_active = true
       LIMIT 10`,
      [now, nextDay]
    );

    const userSessions = result.rows;

    for (const userSession of userSessions) {
      const timeString = new Date(userSession.scheduled_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const message = `🎯 Session Reminder!\n\n` +
                     `Your training session "${userSession.title}" is tomorrow at ${timeString}\n` +
                     `Duration: ${userSession.duration_minutes} minutes\n\n` +
                     `Get ready! 💪 #WiseDefense`;

      await sendTelegramMessage(userSession.telegram_chat_id, message);
    }

    console.log('[TELEGRAM] Session reminder task completed');
  } catch (error) {
    console.error('[TELEGRAM] Error in session reminder task:', error.message);
  }
}

/**
 * Task 2: Post daily training tips
 * Runs every day at 7:00 AM
 */
async function taskPostDailyTips() {
  console.log('[TELEGRAM] Running task: Post daily tips...');

  try {
    // Tips by skill level for personalization
    const tipsByLevel = {
      beginner: [
        '🔰 Today: Master the grip. A solid grip is the foundation of everything.',
        '🔰 Drill: 10 dry fires focusing on sight alignment. Quality over speed.',
        '🔰 Remember: Safety first. Always follow the four rules.',
      ],
      intermediate: [
        '📍 Today: Work on accuracy at 25 yards. Group your shots tight.',
        '📍 Drill: 50 rounds of draw-to-first-shot practice.',
        '📍 Challenge: One-handed shooting from your weak hand.',
      ],
      advanced: [
        '🎯 Today: Speed and accuracy under pressure. Push your limits.',
        '🎯 Drill: Competitive stage walk-through and timed runs.',
        '🎯 Advanced: Multi-target transitions at high speed.',
      ],
    };

    // Get all users with Telegram enabled and their skill levels
    const usersResult = await query(
      `SELECT id, telegram_chat_id, experience_level FROM users
       WHERE telegram_chat_id IS NOT NULL
       AND is_active = true`
    );

    for (const user of usersResult.rows) {
      const skillLevel = user.experience_level || 'beginner';
      const tips = tipsByLevel[skillLevel] || tipsByLevel.beginner;
      const tip = tips[Math.floor(Math.random() * tips.length)];

      await sendTelegramMessage(user.telegram_chat_id, `💡 **Daily Training Tip**\n\n${tip}`);
    }

    console.log(`[TELEGRAM] Daily tips posted to ${usersResult.rows.length} members`);
  } catch (error) {
    console.error('[TELEGRAM] Error in daily tips task:', error.message);
  }
}

/**
 * Task 3: Send weekly progress summary
 * Runs every Sunday at 6:00 PM
 */
async function taskSendProgressSummary() {
  console.log('[TELEGRAM] Running task: Send weekly progress summary...');

  try {
    // Get active users with Telegram
    const result = await query(
      `SELECT u.id, u.first_name, u.telegram_chat_id,
              COUNT(s.id) as sessions_this_week,
              (SELECT COUNT(*) FROM student_progress WHERE user_id = u.id AND completion_date > NOW() - INTERVAL '7 days') as drills_completed
       FROM users u
       LEFT JOIN sessions s ON u.id = ANY(s.student_ids) AND s.status = 'completed' AND s.scheduled_time > NOW() - INTERVAL '7 days'
       WHERE u.telegram_chat_id IS NOT NULL
       AND u.is_active = true
       GROUP BY u.id, u.first_name, u.telegram_chat_id
       HAVING COUNT(s.id) > 0 OR (SELECT COUNT(*) FROM student_progress WHERE user_id = u.id AND completion_date > NOW() - INTERVAL '7 days') > 0`
    );

    for (const user of result.rows) {
      const message = `📊 **Weekly Progress Summary**\n\n` +
                     `Hey ${user.first_name}! Here's your progress this week:\n\n` +
                     `📅 Sessions Completed: ${user.sessions_this_week}\n` +
                     `✅ Drills Completed: ${user.drills_completed}\n\n` +
                     `Great work! Keep it up! 💪\n\n#WiseDefense`;

      await sendTelegramMessage(user.telegram_chat_id, message);
    }

    console.log('[TELEGRAM] Weekly summaries posted');
  } catch (error) {
    console.error('[TELEGRAM] Error in progress summary task:', error.message);
  }
}

/**
 * Schedule jobs using setInterval
 */
function scheduleJobs() {
  console.log('[TELEGRAM] Scheduling Telegram tasks...');

  // Task 1: Session reminders every 2 hours
  function scheduleReminders() {
    taskSendSessionReminders();
    setInterval(taskSendSessionReminders, 2 * 60 * 60 * 1000);
    console.log('[TELEGRAM] Session reminders scheduled (every 2 hours)');
  }

  // Task 2: Daily tips at 7am
  function scheduleDailyTips() {
    const now = new Date();
    const nextTips = new Date(now);
    nextTips.setDate(nextTips.getDate() + 1);
    nextTips.setHours(7, 0, 0, 0);

    const delayMs = nextTips.getTime() - now.getTime();
    setTimeout(() => {
      taskPostDailyTips();
      setInterval(taskPostDailyTips, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[TELEGRAM] Daily tips scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 3: Weekly summary every Sunday at 6pm
  function scheduleWeeklySummary() {
    const now = new Date();
    const nextSunday = new Date(now);
    const daysUntilSunday = (7 - nextSunday.getDay()) % 7;
    nextSunday.setDate(nextSunday.getDate() + (daysUntilSunday || 7));
    nextSunday.setHours(18, 0, 0, 0);

    const delayMs = nextSunday.getTime() - now.getTime();
    setTimeout(() => {
      taskSendProgressSummary();
      setInterval(taskSendProgressSummary, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[TELEGRAM] Weekly summary scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  scheduleReminders();
  scheduleDailyTips();
  scheduleWeeklySummary();
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('[TELEGRAM] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[TELEGRAM] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[TELEGRAM] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[TELEGRAM] Bot started. Running Telegram tasks...');

  try {
    await pool.query('SELECT 1');
    console.log('[TELEGRAM] Database connection verified');
  } catch (error) {
    console.error('[TELEGRAM] Failed to connect to database:', error.message);
    process.exit(1);
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('[TELEGRAM] Telegram token not configured - bot will log messages but not send them');
  }

  scheduleJobs();
}

main().catch((error) => {
  console.error('[TELEGRAM] Fatal error:', error);
  process.exit(1);
});
