/**
 * Discord Social Share Handler
 * React with 📱 to queue messages for social media posting
 */

const pg = require('pg');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Async function to award points
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

    // Record engagement
    await pool.query(
      `INSERT INTO member_engagement (member_id, platform, action_type, metadata)
       VALUES ($1, $2, $3, $4)`,
      [memberId, 'discord', action, JSON.stringify({ points_awarded: points })]
    );

    console.log(`[SHARE] Awarded ${points} points to ${memberId} for ${action}`);
  } catch (error) {
    console.error('[SHARE] Error awarding points:', error);
  }
}

module.exports = {
  name: 'Social Share Handler',

  async handleShareReaction(reaction, user, client) {
    if (user.bot || reaction.emoji.name !== '📱') return;

    try {
      const message = reaction.message;
      const memberId = message.author.id;

      // Queue for social media posting
      await pool.query(
        `INSERT INTO bot_social_posts (discord_message_id, discord_content, social_platform, member_id, posted_at)
         VALUES ($1, $2, 'queued', $3, NOW())`,
        [message.id, message.content, memberId]
      );

      // Award points
      await awardPoints(memberId, 'social_share', 5);

      // React with confirmation
      await reaction.message.react('✅');
      console.log(`[SHARE] Message ${message.id} queued for social media by ${user.username}`);
    } catch (error) {
      console.error('[SHARE] Error queuing message:', error);
    }
  },
};
