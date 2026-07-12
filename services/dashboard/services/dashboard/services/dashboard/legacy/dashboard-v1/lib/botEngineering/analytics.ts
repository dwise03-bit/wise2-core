/**
 * Bot Analytics Aggregation
 */

import { query } from '@/lib/db';

export async function getDailyActiveUsers(days = 7) {
  try {
    const result = await query(
      `SELECT DATE(created_at) as day, COUNT(DISTINCT member_id) as count
       FROM member_engagement
       WHERE created_at > NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );
    return result.rows;
  } catch (error) {
    console.error('[ANALYTICS] Error getting DAU:', error);
    return [];
  }
}

export async function getEngagementRate() {
  try {
    const total = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
    const active = await query(
      `SELECT COUNT(DISTINCT member_id) as count FROM member_engagement WHERE created_at > NOW() - INTERVAL '1 day'`
    );

    const totalCount = parseInt(total.rows[0]?.count || '0');
    const activeCount = parseInt(active.rows[0]?.count || '0');

    return totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
  } catch (error) {
    console.error('[ANALYTICS] Error calculating engagement rate:', error);
    return 0;
  }
}

export async function getTopPosts(limit = 10) {
  try {
    const result = await query(
      `SELECT discord_message_id, discord_content, engagement_count, member_id
       FROM bot_social_posts
       WHERE engagement_count > 0
       ORDER BY engagement_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[ANALYTICS] Error getting top posts:', error);
    return [];
  }
}

export async function getTierBreakdown() {
  try {
    const result = await query(
      `SELECT tier, COUNT(*) as count FROM users WHERE is_active = true GROUP BY tier`
    );
    return result.rows;
  } catch (error) {
    console.error('[ANALYTICS] Error getting tier breakdown:', error);
    return [];
  }
}

export async function getTotalPoints() {
  try {
    const result = await query(
      `SELECT SUM(total_points) as total_points FROM member_progress`
    );
    return parseInt(result.rows[0]?.total_points || '0');
  } catch (error) {
    console.error('[ANALYTICS] Error getting total points:', error);
    return 0;
  }
}
