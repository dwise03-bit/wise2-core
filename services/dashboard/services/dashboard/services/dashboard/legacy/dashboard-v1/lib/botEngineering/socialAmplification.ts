/**
 * Social Media Amplification System
 * Manages viral content reposting to Twitter, Instagram, LinkedIn
 */

import { query } from '@/lib/db';

/**
 * Get queued posts for social media
 */
export async function getQueuedPosts(limit = 10) {
  try {
    const result = await query(
      `SELECT * FROM bot_social_posts WHERE social_platform = 'queued' LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[SOCIAL] Error getting queued posts:', error);
    return [];
  }
}

/**
 * Mark post as posted to platform
 */
export async function markPostPosted(
  postId: string,
  platform: string,
  postUrl: string
): Promise<void> {
  try {
    await query(
      `UPDATE bot_social_posts SET social_platform = $1, post_url = $2, posted_at = NOW()
       WHERE id = $3`,
      [platform, postUrl, postId]
    );
    console.log(`[SOCIAL] Marked post ${postId} as posted to ${platform}`);
  } catch (error) {
    console.error('[SOCIAL] Error marking post as posted:', error);
    throw error;
  }
}

/**
 * Award viral bonus points to member
 */
export async function awardViralBonus(memberId: string): Promise<void> {
  try {
    await query(
      `INSERT INTO member_progress (member_id, total_points)
       VALUES ($1, 5)
       ON CONFLICT (member_id) DO UPDATE
       SET total_points = member_progress.total_points + 5,
           updated_at = NOW()`,
      [memberId]
    );

    // Record engagement
    await query(
      `INSERT INTO member_engagement (member_id, platform, action_type, metadata)
       VALUES ($1, 'social', 'viral_content', $2)`,
      [memberId, JSON.stringify({ bonus_points: 5 })]
    );

    console.log(`[SOCIAL] Awarded +5 viral bonus to ${memberId}`);
  } catch (error) {
    console.error('[SOCIAL] Error awarding bonus:', error);
  }
}

/**
 * Generate engaging caption for social post
 */
export function generateCaption(post: any): string {
  const emojis = ['🎯', '🔥', '💪', '⚡', '🏆'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return `${emoji} Amazing progress in the Wise Defense community!\n\n"${post.discord_content}"\n\nJoin the training community and level up your skills 🚀\n\nLink in bio #WiseDefense #TrainingCommunity`;
}

/**
 * Get top viral posts for publishing
 */
export async function getTopViralPosts(limit = 5) {
  try {
    const result = await query(
      `SELECT * FROM bot_social_posts
       WHERE engagement_count >= 5 AND social_platform = 'discord'
       ORDER BY engagement_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[SOCIAL] Error getting top viral posts:', error);
    return [];
  }
}
