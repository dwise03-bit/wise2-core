/**
 * Virality Tracking System
 * Tracks message reactions and auto-queues viral content
 */

import { query } from '@/lib/db';

const VIRAL_THRESHOLD = 5;

/**
 * Track virality and return if message is viral
 */
export async function trackVirality(
  messageId: string,
  memberId: string,
  reactionCount: number
): Promise<boolean> {
  try {
    // Check if message already tracked
    const existing = await query(
      `SELECT engagement_count FROM bot_social_posts WHERE discord_message_id = $1`,
      [messageId]
    );

    if (existing.rows.length === 0) {
      // New message
      await query(
        `INSERT INTO bot_social_posts (discord_message_id, member_id, engagement_count, social_platform)
         VALUES ($1, $2, $3, 'discord')`,
        [messageId, memberId, reactionCount]
      );
    } else {
      // Update existing
      await query(
        `UPDATE bot_social_posts SET engagement_count = $1 WHERE discord_message_id = $2`,
        [reactionCount, messageId]
      );
    }

    const isViral = reactionCount >= VIRAL_THRESHOLD;

    if (isViral) {
      console.log(`[VIRALITY] Message ${messageId} is viral (${reactionCount} reactions)`);
    }

    return isViral;
  } catch (error) {
    console.error('[VIRALITY] Error tracking:', error);
    return false;
  }
}

/**
 * Check if message is viral
 */
export async function isViral(messageId: string): Promise<boolean> {
  try {
    const result = await query(
      `SELECT engagement_count FROM bot_social_posts WHERE discord_message_id = $1`,
      [messageId]
    );

    if (!result.rows[0]) return false;
    return result.rows[0].engagement_count >= VIRAL_THRESHOLD;
  } catch (error) {
    console.error('[VIRALITY] Error checking virality:', error);
    return false;
  }
}

/**
 * Get viral posts (for social media queue)
 */
export async function getViralPosts(limit = 10): Promise<any[]> {
  try {
    const result = await query(
      `SELECT * FROM bot_social_posts
       WHERE engagement_count >= $1 AND social_platform = 'discord'
       ORDER BY engagement_count DESC
       LIMIT $2`,
      [VIRAL_THRESHOLD, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[VIRALITY] Error getting viral posts:', error);
    return [];
  }
}
