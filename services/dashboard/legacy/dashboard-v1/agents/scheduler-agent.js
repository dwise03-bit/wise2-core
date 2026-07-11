/**
 * Scheduler Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Runs scheduled cron-like tasks to send reminder emails before sessions
 * and notify instructors of cancelled sessions.
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
  console.error('[SCHEDULER] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[SCHEDULER] Query error:', { text, params, error: error.message });
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
    console.error(`[SCHEDULER] Failed to get email for user ${userId}:`, error.message);
    return null;
  }
}

/**
 * Send reminder email for upcoming session
 */
async function sendSessionReminder(session, studentEmails) {
  if (!studentEmails || studentEmails.length === 0) {
    console.log(`[SCHEDULER] No student emails for session ${session.id}, skipping`);
    return;
  }

  try {
    const scheduledTime = new Date(session.scheduled_time);
    const timeString = scheduledTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const subject = `Reminder: Your Training Session Tomorrow at ${timeString}`;
    const body = `
Hi there,

This is a reminder that you have a training session scheduled for tomorrow.

Session Details:
- Title: ${session.title}
- Time: ${timeString}
- Duration: ${session.duration_minutes || 'TBD'} minutes
${session.description ? `- Description: ${session.description}` : ''}
${session.location ? `- Location: ${session.location}` : ''}

Please make sure to join on time. If you need to reschedule or cancel, please let us know as soon as possible.

Best regards,
Wise Defense Training Team
    `.trim();

    // Send email to each student
    for (const email of studentEmails) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@wisedefense.com',
          to: email,
          subject,
          html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
        });
        console.log(`[SCHEDULER] Sent reminder email to ${email} for session ${session.id}`);
      } catch (emailError) {
        console.error(
          `[SCHEDULER] Failed to send email to ${email} for session ${session.id}:`,
          emailError.message
        );
      }
    }
  } catch (error) {
    console.error(`[SCHEDULER] Error sending reminder for session ${session.id}:`, error.message);
  }
}

/**
 * Send cancellation email to instructor
 */
async function sendCancellationNotice(session, instructorEmail) {
  if (!instructorEmail) {
    console.log(`[SCHEDULER] No instructor email for session ${session.id}, skipping`);
    return;
  }

  try {
    const scheduledTime = new Date(session.scheduled_time);
    const dateString = scheduledTime.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeString = scheduledTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const subject = `Session Cancelled: ${session.title}`;
    const body = `
Hi,

A training session has been cancelled.

Session Details:
- Title: ${session.title}
- Date: ${dateString}
- Time: ${timeString}
- Duration: ${session.duration_minutes || 'TBD'} minutes
- Student Count: ${session.student_ids?.length || 0}

Please review and take any necessary follow-up actions with enrolled students.

Best regards,
Wise Defense Training System
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@wisedefense.com',
      to: instructorEmail,
      subject,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`[SCHEDULER] Sent cancellation notice to ${instructorEmail} for session ${session.id}`);
  } catch (error) {
    console.error(
      `[SCHEDULER] Error sending cancellation notice for session ${session.id}:`,
      error.message
    );
  }
}

/**
 * Task 1: Send reminder emails for sessions within 24 hours
 * Runs every hour at minute 0
 */
async function taskSendSessionReminders() {
  console.log('[SCHEDULER] Running task: Send session reminders...');

  try {
    // Get current time and 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Query sessions within 24 hours and not yet reminded
    // (sessions where scheduled_time is between now and 24 hours from now)
    const result = await query(
      `SELECT id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, location
       FROM sessions
       WHERE status = 'scheduled'
       AND scheduled_time > $1
       AND scheduled_time <= $2
       AND created_at < (scheduled_time - INTERVAL '24 hours')
       ORDER BY scheduled_time ASC`,
      [now, tomorrow]
    );

    const sessions = result.rows;
    console.log(`[SCHEDULER] Found ${sessions.length} sessions to remind students about`);

    for (const session of sessions) {
      // Get email addresses for all students enrolled in this session
      const studentEmails = [];
      if (session.student_ids && Array.isArray(session.student_ids)) {
        for (const studentId of session.student_ids) {
          const email = await getUserEmail(studentId);
          if (email) {
            studentEmails.push(email);
          }
        }
      }

      // Send reminder emails
      if (studentEmails.length > 0) {
        await sendSessionReminder(session, studentEmails);
      }
    }

    console.log('[SCHEDULER] Session reminder task completed');
  } catch (error) {
    console.error('[SCHEDULER] Error in session reminder task:', error.message);
  }
}

/**
 * Task 2: Notify instructor of cancelled sessions
 * Runs every 30 minutes
 */
async function taskNotifyCancelledSessions() {
  console.log('[SCHEDULER] Running task: Notify cancelled sessions...');

  try {
    const now = new Date();

    // Query recently cancelled sessions (within 1 hour of cancellation)
    const result = await query(
      `SELECT id, instructor_id, title, scheduled_time, duration_minutes, student_ids, status
       FROM sessions
       WHERE status = 'cancelled'
       AND scheduled_time > $1
       AND updated_at > (NOW() - INTERVAL '1 hour')
       ORDER BY updated_at DESC`,
      [now]
    );

    const sessions = result.rows;
    console.log(`[SCHEDULER] Found ${sessions.length} recently cancelled sessions`);

    for (const session of sessions) {
      // Get instructor email
      const instructorEmail = await getUserEmail(session.instructor_id);

      // Send cancellation notice to instructor
      if (instructorEmail) {
        await sendCancellationNotice(session, instructorEmail);
      }
    }

    console.log('[SCHEDULER] Cancelled session notification task completed');
  } catch (error) {
    console.error('[SCHEDULER] Error in cancelled session notification task:', error.message);
  }
}

/**
 * Schedule tasks using setInterval
 */
function scheduleJobs() {
  console.log('[SCHEDULER] Scheduling cron jobs...');

  // Task 1: Send reminders every hour (at the top of the hour)
  function scheduleReminders() {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
    const delayMs = nextHour.getTime() - now.getTime();

    console.log(`[SCHEDULER] First reminder check in ${Math.round(delayMs / 1000)}ms`);

    setTimeout(() => {
      taskSendSessionReminders();
      // Then run every hour
      setInterval(taskSendSessionReminders, 60 * 60 * 1000);
    }, delayMs);
  }

  // Task 2: Notify about cancellations every 30 minutes
  function scheduleCancellations() {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextInterval = Math.ceil(minutes / 30) * 30;
    const nextRun = new Date(now);
    nextRun.setMinutes(nextInterval === 60 ? 0 : nextInterval);
    if (nextInterval === 60) {
      nextRun.setHours(nextRun.getHours() + 1);
    }

    const delayMs = nextRun.getTime() - now.getTime();
    console.log(`[SCHEDULER] First cancellation check in ${Math.round(delayMs / 1000)}ms`);

    setTimeout(() => {
      taskNotifyCancelledSessions();
      // Then run every 30 minutes
      setInterval(taskNotifyCancelledSessions, 30 * 60 * 1000);
    }, delayMs);
  }

  scheduleReminders();
  scheduleCancellations();
}

/**
 * Graceful shutdown handler
 */
async function shutdown() {
  console.log('[SCHEDULER] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[SCHEDULER] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[SCHEDULER] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[SCHEDULER] Agent started. Monitoring sessions...');

  // Verify database connection
  try {
    await pool.query('SELECT 1');
    console.log('[SCHEDULER] Database connection verified');
  } catch (error) {
    console.error('[SCHEDULER] Failed to connect to database:', error.message);
    process.exit(1);
  }

  // Verify Resend API key is set and initialize
  if (!process.env.RESEND_API_KEY) {
    console.error('[SCHEDULER] RESEND_API_KEY environment variable not set');
    process.exit(1);
  }

  // Initialize Resend email client now that we have the key
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('[SCHEDULER] Resend API key configured');

  // Schedule all jobs
  scheduleJobs();
}

// Run the agent
main().catch((error) => {
  console.error('[SCHEDULER] Fatal error:', error);
  process.exit(1);
});
