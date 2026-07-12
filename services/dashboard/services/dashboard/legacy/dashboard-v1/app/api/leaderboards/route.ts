/**
 * Leaderboards API
 * Points, streaks, and viral content rankings
 */

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'points'; // points, streaks, viral
    const period = searchParams.get('period') || 'all'; // all, week, month

    let leaderboard = [];

    if (type === 'points') {
      // Top points earners
      leaderboard = await getPointsLeaderboard(period);
    } else if (type === 'streaks') {
      // Active streak competitions
      leaderboard = await getStreakLeaderboard();
    } else if (type === 'viral') {
      // Viral content creators
      leaderboard = await getViralLeaderboard();
    }

    return NextResponse.json({
      type,
      period,
      leaderboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

async function getPointsLeaderboard(period: string) {
  let dateFilter = '';
  
  if (period === 'week') {
    dateFilter = "AND mp.updated_at > NOW() - INTERVAL '7 days'";
  } else if (period === 'month') {
    dateFilter = "AND mp.updated_at > NOW() - INTERVAL '30 days'";
  }

  const result = await query(
    `SELECT 
      ROW_NUMBER() OVER (ORDER BY mp.total_points DESC) as rank,
      u.id,
      u.first_name,
      u.tier,
      mp.total_points,
      mp.streak_current,
      mp.streak_longest,
      COUNT(DISTINCT me.id) as engagement_count
     FROM users u
     LEFT JOIN member_progress mp ON u.id = mp.member_id
     LEFT JOIN member_engagement me ON u.id = me.member_id
     WHERE mp.total_points > 0 ${dateFilter}
     GROUP BY u.id, u.first_name, u.tier, mp.total_points, mp.streak_current, mp.streak_longest
     ORDER BY mp.total_points DESC
     LIMIT 100`
  );

  return result.rows;
}

async function getStreakLeaderboard() {
  const result = await query(
    `SELECT 
      ROW_NUMBER() OVER (ORDER BY mp.streak_current DESC) as rank,
      u.id,
      u.first_name,
      u.tier,
      mp.streak_current,
      mp.streak_longest,
      mp.last_active_date,
      CASE 
        WHEN mp.streak_current >= 30 THEN '🔥 Inferno'
        WHEN mp.streak_current >= 14 THEN '🎯 On Fire'
        WHEN mp.streak_current >= 7 THEN '⚡ Momentum'
        ELSE '🌟 Rising'
      END as streak_badge
     FROM users u
     JOIN member_progress mp ON u.id = mp.member_id
     WHERE mp.streak_current > 0
     ORDER BY mp.streak_current DESC
     LIMIT 50`
  );

  return result.rows;
}

async function getViralLeaderboard() {
  const result = await query(
    `SELECT 
      ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT sp.id) DESC) as rank,
      u.id,
      u.first_name,
      u.tier,
      COUNT(DISTINCT sp.id) as viral_posts,
      COALESCE(SUM(sp.engagement_count), 0) as total_engagement,
      AVG(sp.engagement_count) as avg_engagement
     FROM users u
     LEFT JOIN social_posts_generated sp ON u.id = sp.article_id
     GROUP BY u.id, u.first_name, u.tier
     HAVING COUNT(DISTINCT sp.id) > 0
     ORDER BY COUNT(DISTINCT sp.id) DESC
     LIMIT 50`
  );

  return result.rows;
}
