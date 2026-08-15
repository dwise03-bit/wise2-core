/**
 * Analytics Trends API
 * Historical engagement and sentiment trends
 */

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'engagement'; // engagement, sentiment, viral
    const days = parseInt(searchParams.get('days') || '30');

    if (metric === 'engagement') {
      const result = await getEngagementTrends(days);
      return NextResponse.json(result);
    } else if (metric === 'sentiment') {
      const result = await getSentimentTrends(days);
      return NextResponse.json(result);
    } else if (metric === 'viral') {
      const result = await getViralTrends(days);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
  } catch (error) {
    console.error('[API] Trends error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}

async function getEngagementTrends(days: number) {
  const result = await query(
    `SELECT 
      DATE(me.created_at) as date,
      COUNT(*) as count,
      COUNT(DISTINCT me.member_id) as unique_users,
      ROUND(AVG(CASE WHEN me.action_type = 'like' THEN 1 ELSE 0 END)::numeric, 2) as like_rate
     FROM member_engagement me
     WHERE me.created_at > NOW() - INTERVAL '${days} days'
     GROUP BY DATE(me.created_at)
     ORDER BY date ASC`
  );

  return {
    metric: 'engagement',
    period_days: days,
    data: result.rows,
    total: result.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0),
  };
}

async function getSentimentTrends(days: number) {
  const result = await query(
    `SELECT 
      DATE(na.created_at) as date,
      cr.sentiment,
      COUNT(*) as count,
      ROUND(AVG(cr.relevance_score)::numeric, 2) as avg_relevance
     FROM news_articles na
     JOIN content_reviews cr ON na.id = cr.article_id
     WHERE na.created_at > NOW() - INTERVAL '${days} days'
     GROUP BY DATE(na.created_at), cr.sentiment
     ORDER BY date ASC, sentiment DESC`
  );

  return {
    metric: 'sentiment',
    period_days: days,
    data: result.rows,
  };
}

async function getViralTrends(days: number) {
  const result = await query(
    `SELECT 
      DATE(sp.created_at) as date,
      sp.platform,
      COUNT(*) as posts,
      ROUND(AVG(sp.engagement_count)::numeric, 2) as avg_engagement,
      MAX(sp.engagement_count) as peak_engagement
     FROM social_posts_generated sp
     WHERE sp.created_at > NOW() - INTERVAL '${days} days'
     AND sp.status = 'posted'
     GROUP BY DATE(sp.created_at), sp.platform
     ORDER BY date ASC, avg_engagement DESC`
  );

  return {
    metric: 'viral',
    period_days: days,
    data: result.rows,
  };
}
