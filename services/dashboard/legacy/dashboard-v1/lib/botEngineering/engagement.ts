/**
 * Engagement Points System
 * Tracks member engagement, awards points, and records interactions
 */

import { query } from '@/lib/db';

/**
 * Award points to a member
 */
export async function awardPoints(
  memberId: string,
  action: string,
  points: number
): Promise<void> {
  try {
    // Update or insert member_progress
    await query(
      `INSERT INTO member_progress (member_id, total_points)
       VALUES ($1, $2)
       ON CONFLICT (member_id) DO UPDATE
       SET total_points = member_progress.total_points + $2,
           updated_at = NOW()`,
      [memberId, points]
    );

    // Record engagement
    await recordEngagement(memberId, 'system', action, { points_awarded: points });
  } catch (error) {
    console.error('[ENGAGEMENT] Error awarding points:', error);
    throw error;
  }
}

/**
 * Get member's current points
 */
export async function getMemberPoints(memberId: string): Promise<number> {
  try {
    const result = await query(
      'SELECT total_points FROM member_progress WHERE member_id = $1',
      [memberId]
    );
    return result.rows[0]?.total_points ?? 0;
  } catch (error) {
    console.error('[ENGAGEMENT] Error getting points:', error);
    return 0;
  }
}

/**
 * Record engagement event to database
 */
export async function recordEngagement(
  memberId: string,
  platform: string,
  actionType: string,
  metadata?: any
): Promise<void> {
  try {
    await query(
      `INSERT INTO member_engagement (member_id, platform, action_type, metadata)
       VALUES ($1, $2, $3, $4)`,
      [memberId, platform, actionType, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('[ENGAGEMENT] Error recording engagement:', error);
    throw error;
  }
}
