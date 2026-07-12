/**
 * Streak Tracking System
 * Tracks member streaks (current & longest)
 */

import { query } from '@/lib/db';

/**
 * Update member streak (call when member is active)
 */
export async function updateStreak(
  memberId: string
): Promise<{ current: number; longest: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get current progress
    const result = await query(
      `SELECT streak_current, streak_longest, last_active_date
       FROM member_progress WHERE member_id = $1`,
      [memberId]
    );

    const current = result.rows[0];

    if (!current) {
      // New member
      await query(
        `INSERT INTO member_progress (member_id, streak_current, streak_longest, last_active_date)
         VALUES ($1, 1, 1, $2)`,
        [memberId, today]
      );
      return { current: 1, longest: 1 };
    }

    const lastActive = current.last_active_date;
    const lastActiveDate = new Date(lastActive);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastActiveDate.getTime()) / (24 * 60 * 60 * 1000));

    let newStreak = current.streak_current;
    if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak = current.streak_current + 1;
    }
    // If daysDiff === 0, already active today, don't increment

    const newLongest = Math.max(newStreak, current.streak_longest);

    await query(
      `UPDATE member_progress
       SET streak_current = $1, streak_longest = $2, last_active_date = $3, updated_at = NOW()
       WHERE member_id = $4`,
      [newStreak, newLongest, today, memberId]
    );

    return { current: newStreak, longest: newLongest };
  } catch (error) {
    console.error('[STREAK] Error updating streak:', error);
    throw error;
  }
}

/**
 * Get member's current streak
 */
export async function getStreak(
  memberId: string
): Promise<{ current: number; longest: number }> {
  try {
    const result = await query(
      'SELECT streak_current, streak_longest FROM member_progress WHERE member_id = $1',
      [memberId]
    );

    if (!result.rows[0]) {
      return { current: 0, longest: 0 };
    }

    return {
      current: result.rows[0].streak_current,
      longest: result.rows[0].streak_longest,
    };
  } catch (error) {
    console.error('[STREAK] Error getting streak:', error);
    return { current: 0, longest: 0 };
  }
}
