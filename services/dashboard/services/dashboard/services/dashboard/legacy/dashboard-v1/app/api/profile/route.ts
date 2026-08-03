/**
 * User Profile API
 * Individual member stats and rankings
 */

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '1';

    // Get user stats
    const userResult = await query(
      `SELECT u.id, u.first_name, u.email, u.tier,
              mp.total_points, mp.streak_current, mp.streak_longest, mp.last_active_date,
              COUNT(DISTINCT me.id) as engagement_count
       FROM users u
       LEFT JOIN member_progress mp ON u.id = mp.member_id
       LEFT JOIN member_engagement me ON u.id = me.member_id
       WHERE u.id = $1
       GROUP BY u.id, u.first_name, u.email, u.tier, mp.total_points, mp.streak_current, mp.streak_longest, mp.last_active_date`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get viral posts
    const viralResult = await query(
      `SELECT COUNT(DISTINCT id) as viral_posts_count, COALESCE(SUM(engagement_count), 0) as total_engagement
       FROM social_posts_generated
       WHERE article_id IN (
         SELECT id FROM news_articles 
         WHERE id IN (SELECT article_id FROM content_reviews WHERE recommended_for_social = true)
       )`
    );

    // Get rankings
    const pointsRankResult = await query(
      `SELECT COUNT(*) + 1 as rank FROM member_progress WHERE total_points > (SELECT total_points FROM member_progress WHERE member_id = $1)`,
      [userId]
    );

    const streakRankResult = await query(
      `SELECT COUNT(*) + 1 as rank FROM member_progress WHERE streak_current > (SELECT streak_current FROM member_progress WHERE member_id = $1)`,
      [userId]
    );

    const viralRankResult = await query(
      `SELECT COUNT(*) + 1 as rank FROM (
        SELECT COUNT(*) as posts FROM social_posts_generated GROUP BY article_id
      ) WHERE posts > (SELECT COUNT(*) FROM social_posts_generated WHERE article_id = $1)`,
      [userId]
    );

    return NextResponse.json({
      ...user,
      viral_posts_count: viralResult.rows[0]?.viral_posts_count || 0,
      total_engagement: viralResult.rows[0]?.total_engagement || 0,
      points_rank: pointsRankResult.rows[0]?.rank || 1,
      streak_rank: streakRankResult.rows[0]?.rank || 1,
      viral_rank: viralRankResult.rows[0]?.rank || 1,
    });
  } catch (error) {
    console.error('[API] Profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
