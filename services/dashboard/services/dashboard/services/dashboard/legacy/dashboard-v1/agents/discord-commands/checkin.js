/**
 * Discord Check-In Poll Command
 * Logs check-in attempts to database for member activity tracking
 * Note: Full Discord.js integration happens on VPS when discord.js is available
 */

const pg = require('pg');

// Initialize PostgreSQL pool for direct database access
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Award points directly via database
async function awardPoints(memberId, action, points) {
  try {
    await pool.query(
      `INSERT INTO member_progress (member_id, total_points)
       VALUES ($1, $2)
       ON CONFLICT (member_id) DO UPDATE
       SET total_points = member_progress.total_points + $2,
           updated_at = NOW()`,
      [memberId, points]
    );

    await pool.query(
      `INSERT INTO member_engagement (member_id, platform, action_type, metadata)
       VALUES ($1, $2, $3, $4)`,
      [memberId, 'discord', action, JSON.stringify({ points_awarded: points })]
    );

    console.log(`[CHECKIN] Awarded ${points} points to ${memberId}`);
  } catch (error) {
    console.error('[CHECKIN] Error awarding points:', error);
  }
}

module.exports = {
  name: 'Check-In Poll',
  description: 'Daily check-in poll to track member activity',

  // Placeholder - full implementation requires Discord.js client
  async execute(client, channelId) {
    console.log('[CHECKIN] Check-in poll scheduled. Awaiting Discord.js client.');
  },

  awardPoints,
};
