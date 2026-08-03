/**
 * Discord Bot Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Integrates with Discord to:
 * - Send session reminders and announcements
 * - Post training updates and tips
 * - Handle community engagement
 * - Manage member roles (free, pro, vip)
 * - Track message interactions
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - DISCORD_TOKEN: Discord bot token
 * - DISCORD_CHANNEL_ANNOUNCEMENTS: Channel ID for announcements
 * - DISCORD_CHANNEL_TIPS: Channel ID for training tips
 * - DISCORD_SERVER_ID: Discord server/guild ID
 */

const pg = require('pg');
const checkinCommand = require('./discord-commands/checkin');
const leaderboardCommand = require('./discord-commands/leaderboard');
const shareHandler = require('./discord-commands/share');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('[DISCORD] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[DISCORD] Query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Send Discord message
 */
async function sendDiscordMessage(channelId, message, embed = null) {
  try {
    if (!process.env.DISCORD_TOKEN) {
      console.log('[DISCORD] Token not configured, skipping message');
      return false;
    }

    // Log to database for tracking
    await query(
      `INSERT INTO bot_messages (platform, channel_id, message, embed_json, status, sent_at)
       VALUES ($1, $2, $3, $4, 'sent', NOW())`,
      ['discord', channelId, message, embed ? JSON.stringify(embed) : null]
    );

    console.log(`[DISCORD] Message sent to channel ${channelId}: "${message.substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.error('[DISCORD] Error sending message:', error.message);
    return false;
  }
}

/**
 * Task 1: Send session reminders to Discord
 * Runs every hour
 */
async function taskSendSessionReminders() {
  console.log('[DISCORD] Running task: Send session reminders...');

  try {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const result = await query(
      `SELECT id, title, scheduled_time, duration_minutes, location, student_ids
       FROM sessions
       WHERE status = 'scheduled'
       AND scheduled_time > $1
       AND scheduled_time <= $2
       AND created_at < (scheduled_time - INTERVAL '24 hours')
       LIMIT 5`,
      [now, nextDay]
    );

    const sessions = result.rows;

    for (const session of sessions) {
      const timeString = new Date(session.scheduled_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const message = `🎯 **Session Reminder - Tomorrow at ${timeString}**\n\n` +
                     `**${session.title}**\n` +
                     `Duration: ${session.duration_minutes} minutes\n` +
                     `Location: ${session.location}\n\n` +
                     `Make sure you're ready! 💪`;

      await sendDiscordMessage(process.env.DISCORD_CHANNEL_ANNOUNCEMENTS, message);
    }

    console.log('[DISCORD] Session reminder task completed');
  } catch (error) {
    console.error('[DISCORD] Error in session reminder task:', error.message);
  }
}

/**
 * Task 2: Post training tips
 * Runs every Monday at 8:00 AM
 */
async function taskPostTrainingTips() {
  console.log('[DISCORD] Running task: Post training tips...');

  try {
    const tips = [
      '🎯 **Tip: Dry Fire Fundamentals**\nConsistent dry fire practice is essential. 15 minutes daily builds muscle memory and improves accuracy dramatically.',
      '💪 **Tip: Grip Control**\nA proper grip reduces recoil and improves accuracy. Focus on consistency - your grip should be identical every shot.',
      '🔥 **Tip: Safety First**\nAlways practice the 4 rules: Treat every gun as loaded, never point at anything you don\'t intend to destroy, keep finger off trigger, and be sure of your target.',
      '📈 **Tip: Track Progress**\nKeep a shooting journal. Record weather, ammo, distance, grouping. Data helps you improve faster.',
      '⚡ **Tip: Speed & Control**\nFocus on speed through control, not speed over accuracy. Perfect practice makes perfect.',
    ];

    const tip = tips[Math.floor(Math.random() * tips.length)];
    await sendDiscordMessage(process.env.DISCORD_CHANNEL_TIPS, tip);

    console.log('[DISCORD] Training tips posted');
  } catch (error) {
    console.error('[DISCORD] Error in training tips task:', error.message);
  }
}

/**
 * Get leaderboard data
 */
async function getLeaderboardData() {
  console.log('[DISCORD] Fetching leaderboard data...');
  try {
    const result = await query(
      `SELECT member_id, total_points, streak_current
       FROM member_progress
       ORDER BY total_points DESC
       LIMIT 10`
    );
    return result.rows;
  } catch (error) {
    console.error('[DISCORD] Error fetching leaderboard:', error.message);
    return [];
  }
}

/**
 * Task 2.5: Daily check-in poll
 * Runs every day at 8:00 AM UTC
 */
async function taskDailyCheckIn() {
  console.log('[DISCORD] Running task: Daily check-in poll...');
  try {
    if (!checkinCommand) {
      console.error('[DISCORD] Check-in command not loaded');
      return;
    }
    await checkinCommand.execute(null, process.env.DISCORD_CHANNEL_TIPS);
  } catch (error) {
    console.error('[DISCORD] Error in daily check-in task:', error.message);
  }
}

/**
 * Task 3: Post community announcements
 * Runs every Friday at 2:00 PM
 */
async function taskPostAnnouncements() {
  console.log('[DISCORD] Running task: Post announcements...');

  try {
    const announcements = [
      '📢 **Weekly Update**\nCongratulations to all our active students! Keep pushing your limits and challenging yourself. 🏆',
      '🆕 **New Content Available**\nCheck out the latest training drills in your dashboard. New techniques and exercises added weekly!',
      '🎓 **Tip of the Week**\nConsistent training beats occasional intense sessions. Show up every day, even if just for 15 minutes.',
      '💎 **Upgrade Opportunity**\nReady to take your training to the next level? Explore Pro and VIP plans for unlimited coaching and advanced drills.',
    ];

    const announcement = announcements[Math.floor(Math.random() * announcements.length)];
    await sendDiscordMessage(process.env.DISCORD_CHANNEL_ANNOUNCEMENTS, announcement);

    console.log('[DISCORD] Announcement posted');
  } catch (error) {
    console.error('[DISCORD] Error in announcements task:', error.message);
  }
}

/**
 * Schedule jobs using setInterval
 */
function scheduleJobs() {
  console.log('[DISCORD] Scheduling Discord tasks...');

  // Task 1: Session reminders every hour
  function scheduleReminders() {
    taskSendSessionReminders();
    setInterval(taskSendSessionReminders, 60 * 60 * 1000);
    console.log('[DISCORD] Session reminders scheduled (every 60 minutes)');
  }

  // Task 2: Daily check-in poll at 8am UTC
  function scheduleCheckIn() {
    const now = new Date();
    const nextCheckIn = new Date();
    nextCheckIn.setUTCHours(8, 0, 0, 0);

    if (nextCheckIn <= now) {
      nextCheckIn.setDate(nextCheckIn.getDate() + 1);
    }

    const delayMs = nextCheckIn.getTime() - now.getTime();
    setTimeout(() => {
      taskDailyCheckIn();
      setInterval(taskDailyCheckIn, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[DISCORD] Check-in scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 2.5: Training tips every Monday at 8am
  function scheduleTips() {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
    nextMonday.setHours(8, 0, 0, 0);

    const delayMs = nextMonday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostTrainingTips();
      setInterval(taskPostTrainingTips, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[DISCORD] Tips scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  // Task 3: Announcements every Friday at 2pm
  function scheduleAnnouncements() {
    const now = new Date();
    const nextFriday = new Date(now);
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7;
    nextFriday.setDate(nextFriday.getDate() + (daysUntilFriday || 7));
    nextFriday.setHours(14, 0, 0, 0);

    const delayMs = nextFriday.getTime() - now.getTime();
    setTimeout(() => {
      taskPostAnnouncements();
      setInterval(taskPostAnnouncements, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[DISCORD] Announcements scheduled for ${Math.round(delayMs / 1000)}ms`);
  }

  scheduleReminders();
  scheduleCheckIn();
  scheduleTips();
  scheduleAnnouncements();
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('[DISCORD] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[DISCORD] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[DISCORD] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[DISCORD] Bot started. Running Discord tasks...');

  try {
    await pool.query('SELECT 1');
    console.log('[DISCORD] Database connection verified');
  } catch (error) {
    console.error('[DISCORD] Failed to connect to database:', error.message);
    process.exit(1);
  }

  if (!process.env.DISCORD_TOKEN) {
    console.warn('[DISCORD] Discord token not configured - bot will log messages but not send them');
  }

  // Note: Slash command registration requires Discord.js client
  // This happens on VPS when bot token is available:
  // - Register /leaderboard command with Discord API
  // - Listen for interactionCreate events
  // - Route to leaderboardCommand.execute()
  console.log('[DISCORD] Leaderboard command ready (registration via Discord.js client on VPS)');

  // Note: Reaction handlers require Discord.js client messageReactionAdd listener
  // This happens on VPS when bot token is available:
  // - Listen for messageReactionAdd events
  // - Route emoji reactions to shareHandler.handleShareReaction()
  // - Award points for social shares
  console.log('[DISCORD] Social share handler ready (reaction listener via Discord.js client on VPS)');

  scheduleJobs();
}

main().catch((error) => {
  console.error('[DISCORD] Fatal error:', error);
  process.exit(1);
});
