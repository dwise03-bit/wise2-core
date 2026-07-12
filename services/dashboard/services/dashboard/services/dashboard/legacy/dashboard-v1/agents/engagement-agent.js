/**
 * Engagement Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Runs scheduled cron-like tasks to:
 * - Send weekly drill recommendations to active students (Monday 9am)
 * - Re-engage inactive students (Friday 10am)
 * - Suggest tier upgrades for long-term Starter students (daily)
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - RESEND_API_KEY: Resend email API key
 */

const pg = require('pg');
const { Resend } = require('resend');

// Initialize Resend email client (will be initialized in main())
let resend;

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('[ENGAGEMENT] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[ENGAGEMENT] Query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Get user email by ID
 */
async function getUserEmail(userId) {
  try {
    const result = await query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.email || null;
  } catch (error) {
    console.error(`[ENGAGEMENT] Failed to get email for user ${userId}:`, error.message);
    return null;
  }
}

/**
 * Send weekly drill recommendation email
 */
async function sendWeeklyDrillEmail(user, drill) {
  if (!user.email || !drill) {
    console.log(`[ENGAGEMENT] Missing email or drill for user ${user.id}, skipping`);
    return;
  }

  try {
    const subject = `Your Weekly Drill: ${drill.title}`;
    const body = `
Hi ${user.first_name || 'there'},

It's time for your weekly training drill! Here's a new challenge to strengthen your skills.

Drill Details:
- Title: ${drill.title}
${drill.description ? `- Description: ${drill.description}` : ''}
${drill.duration_minutes ? `- Duration: ${drill.duration_minutes} minutes` : ''}

Ready to get started? Click the link below to view and complete your drill.

[View Drill](${process.env.APP_URL || 'https://wise2.net'}/drills/${drill.id})

Keep up the great work!

Best regards,
Wise Defense Training Team
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@wisedefense.com',
      to: user.email,
      subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`[ENGAGEMENT] Sent weekly drill email to ${user.email} for drill ${drill.id}`);
  } catch (error) {
    console.error(
      `[ENGAGEMENT] Failed to send weekly drill email to ${user.email}:`,
      error.message
    );
  }
}

/**
 * Send re-engagement email for inactive students
 */
async function sendReengagementEmail(user) {
  if (!user.email) {
    console.log(`[ENGAGEMENT] No email for user ${user.id}, skipping re-engagement`);
    return;
  }

  try {
    const subject = `We miss you! Your next training session is waiting`;
    const body = `
Hi ${user.first_name || 'there'},

We noticed you haven't joined us in a while. We miss you!

Your next training session is ready, and we'd love to see you back. Whether you're looking to refresh your skills or master new techniques, our instructors are ready to help.

Book your next session now and get back on track with your training goals.

[Book a Session](${process.env.APP_URL || 'https://wise2.net'}/booking)

Looking forward to seeing you soon!

Best regards,
Wise Defense Training Team
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@wisedefense.com',
      to: user.email,
      subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`[ENGAGEMENT] Sent re-engagement email to ${user.email}`);
  } catch (error) {
    console.error(
      `[ENGAGEMENT] Failed to send re-engagement email to ${user.email}:`,
      error.message
    );
  }
}

/**
 * Send tier upgrade suggestion email
 */
async function sendUpgradeEmail(user) {
  if (!user.email) {
    console.log(`[ENGAGEMENT] No email for user ${user.id}, skipping upgrade suggestion`);
    return;
  }

  try {
    const subject = `You\'re doing great! Ready to upgrade your training?`;
    const body = `
Hi ${user.first_name || 'there'},

Congratulations! You've been actively training on the Starter plan for over a month. Your dedication is impressive.

Now it's time to take your training to the next level with our Pro plan. Unlock:
- Advanced drills and techniques
- Priority booking with our top instructors
- Exclusive video training library
- One-on-one coaching sessions
- And much more!

Upgrade today and supercharge your training experience.

[View Pro Plan](${process.env.APP_URL || 'https://wise2.net'}/pricing)

Ready to level up?

Best regards,
Wise Defense Training Team
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@wisedefense.com',
      to: user.email,
      subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`[ENGAGEMENT] Sent upgrade suggestion email to ${user.email}`);
  } catch (error) {
    console.error(
      `[ENGAGEMENT] Failed to send upgrade email to ${user.email}:`,
      error.message
    );
  }
}

/**
 * Task 1: Send weekly drill recommendation
 * Runs every Monday at 9:00 AM
 */
async function taskSendWeeklyDrills() {
  console.log('[ENGAGEMENT] Running task: Send weekly drill recommendations...');

  try {
    // Get all active students with active memberships (starter, pro, vip)
    const usersResult = await query(
      `SELECT u.id, u.email, u.first_name, m.tier
       FROM users u
       JOIN memberships m ON u.id = m.user_id
       WHERE m.status = 'active'
       AND m.tier IN ('free', 'pro', 'enterprise')
       AND u.is_active = true
       ORDER BY u.created_at DESC`
    );

    const activeUsers = usersResult.rows;
    console.log(`[ENGAGEMENT] Found ${activeUsers.length} active users to send drills to`);

    if (activeUsers.length === 0) {
      console.log('[ENGAGEMENT] No active users found');
      return;
    }

    // Get the latest drill from content table
    const drillResult = await query(
      `SELECT id, title, description, duration_minutes, content_type
       FROM content
       WHERE content_type = 'drill'
       AND status = 'draft' OR status = 'published'
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (drillResult.rows.length === 0) {
      console.log('[ENGAGEMENT] No drills available to send');
      return;
    }

    const drill = drillResult.rows[0];
    console.log(`[ENGAGEMENT] Found drill: "${drill.title}" (ID: ${drill.id})`);

    // Send email to each active user
    for (const user of activeUsers) {
      await sendWeeklyDrillEmail(user, drill);
    }

    console.log('[ENGAGEMENT] Weekly drill task completed');
  } catch (error) {
    console.error('[ENGAGEMENT] Error in weekly drill task:', error.message);
  }
}

/**
 * Task 2: Re-engage inactive students (2+ weeks inactive)
 * Runs every Friday at 10:00 AM
 */
async function taskReengageInactiveStudents() {
  console.log('[ENGAGEMENT] Running task: Re-engage inactive students...');

  try {
    // Find students with NO sessions in past 14 days
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const inactiveResult = await query(
      `SELECT DISTINCT u.id, u.email, u.first_name, m.tier
       FROM users u
       JOIN memberships m ON u.id = m.user_id
       WHERE m.status = 'active'
       AND u.is_active = true
       AND NOT EXISTS (
         SELECT 1 FROM sessions
         WHERE $1 = ANY(student_ids)
         AND scheduled_time > $2
       )
       AND u.created_at < (NOW() - INTERVAL '14 days')
       ORDER BY u.updated_at ASC
       LIMIT 100`
      ,
      [null, twoWeeksAgo]
    );

    // Better approach: use a subquery to find users with no recent sessions
    const inactiveResult2 = await query(
      `SELECT u.id, u.email, u.first_name, m.tier
       FROM users u
       JOIN memberships m ON u.id = m.user_id
       WHERE m.status = 'active'
       AND u.is_active = true
       AND u.id NOT IN (
         SELECT DISTINCT unnest(student_ids)
         FROM sessions
         WHERE scheduled_time > $1
       )
       AND u.created_at < (NOW() - INTERVAL '14 days')
       ORDER BY u.updated_at ASC
       LIMIT 100`,
      [twoWeeksAgo]
    );

    const inactiveUsers = inactiveResult2.rows;
    console.log(`[ENGAGEMENT] Found ${inactiveUsers.length} inactive users to re-engage`);

    // Send re-engagement email to each
    for (const user of inactiveUsers) {
      await sendReengagementEmail(user);
    }

    console.log('[ENGAGEMENT] Re-engagement task completed');
  } catch (error) {
    console.error('[ENGAGEMENT] Error in re-engagement task:', error.message);
  }
}

/**
 * Task 3: Check for tier upgrade opportunity
 * Runs daily at midnight (4+ weeks on Starter plan)
 */
async function taskSuggestTierUpgrades() {
  console.log('[ENGAGEMENT] Running task: Suggest tier upgrades...');

  try {
    // Find Starter (free) tier users active for 4+ weeks
    const fourWeeksAgo = new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000);

    const upgradeResult = await query(
      `SELECT u.id, u.email, u.first_name, m.tier, m.created_at
       FROM users u
       JOIN memberships m ON u.id = m.user_id
       WHERE m.tier = 'free'
       AND m.status = 'active'
       AND u.is_active = true
       AND m.created_at <= $1
       AND EXISTS (
         SELECT 1 FROM progress p
         WHERE p.user_id = u.id
         AND p.status IN ('in_progress', 'completed')
       )
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [fourWeeksAgo]
    );

    const upgradeUsers = upgradeResult.rows;
    console.log(`[ENGAGEMENT] Found ${upgradeUsers.length} users eligible for upgrade suggestions`);

    // Send upgrade email to each
    for (const user of upgradeUsers) {
      await sendUpgradeEmail(user);
    }

    console.log('[ENGAGEMENT] Tier upgrade suggestion task completed');
  } catch (error) {
    console.error('[ENGAGEMENT] Error in tier upgrade task:', error.message);
  }
}

/**
 * Schedule jobs using setInterval
 * Note: These use approximate timing for simplicity. For production, consider using node-cron.
 */
function scheduleJobs() {
  console.log('[ENGAGEMENT] Scheduling engagement campaigns...');

  /**
   * Task 1: Weekly drills - Monday 9:00 AM
   */
  function scheduleWeeklyDrills() {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
    nextMonday.setHours(9, 0, 0, 0);

    const delayMs = nextMonday.getTime() - now.getTime();
    console.log(`[ENGAGEMENT] Weekly drill campaign scheduled for ${Math.round(delayMs / 1000)}ms`);

    setTimeout(() => {
      taskSendWeeklyDrills();
      // Run every 7 days (1 week)
      setInterval(taskSendWeeklyDrills, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
  }

  /**
   * Task 2: Re-engagement - Friday 10:00 AM
   */
  function scheduleReengagement() {
    const now = new Date();
    const nextFriday = new Date(now);
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7;
    nextFriday.setDate(nextFriday.getDate() + (daysUntilFriday || 7));
    nextFriday.setHours(10, 0, 0, 0);

    const delayMs = nextFriday.getTime() - now.getTime();
    console.log(`[ENGAGEMENT] Re-engagement campaign scheduled for ${Math.round(delayMs / 1000)}ms`);

    setTimeout(() => {
      taskReengageInactiveStudents();
      // Run every 7 days (1 week)
      setInterval(taskReengageInactiveStudents, 7 * 24 * 60 * 60 * 1000);
    }, delayMs);
  }

  /**
   * Task 3: Tier upgrades - Daily at midnight
   */
  function scheduleUpgradeSuggestions() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    const delayMs = nextMidnight.getTime() - now.getTime();
    console.log(`[ENGAGEMENT] Tier upgrade suggestions scheduled for ${Math.round(delayMs / 1000)}ms`);

    setTimeout(() => {
      taskSuggestTierUpgrades();
      // Run every 24 hours (1 day)
      setInterval(taskSuggestTierUpgrades, 24 * 60 * 60 * 1000);
    }, delayMs);
  }

  scheduleWeeklyDrills();
  scheduleReengagement();
  scheduleUpgradeSuggestions();
}

/**
 * Graceful shutdown handler
 */
async function shutdown() {
  console.log('[ENGAGEMENT] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[ENGAGEMENT] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[ENGAGEMENT] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[ENGAGEMENT] Agent started. Running engagement campaigns...');

  // Verify database connection
  try {
    await pool.query('SELECT 1');
    console.log('[ENGAGEMENT] Database connection verified');
  } catch (error) {
    console.error('[ENGAGEMENT] Failed to connect to database:', error.message);
    process.exit(1);
  }

  // Verify Resend API key is set and initialize
  if (!process.env.RESEND_API_KEY) {
    console.error('[ENGAGEMENT] RESEND_API_KEY environment variable not set');
    process.exit(1);
  }

  // Initialize Resend email client now that we have the key
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('[ENGAGEMENT] Resend API key configured');

  // Schedule all jobs
  scheduleJobs();
}

// Run the agent
main().catch((error) => {
  console.error('[ENGAGEMENT] Fatal error:', error);
  process.exit(1);
});
