/**
 * News Analytics API
 * Real-time metrics for news scraping, content review, and engagement
 */

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Articles scraped
    const articlesResult = await query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 ELSE 0 END) as today,
              SUM(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as this_week
       FROM news_articles`
    );

    // Content reviews
    const reviewsResult = await query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN priority_level = 'high' THEN 1 ELSE 0 END) as high_priority,
              SUM(CASE WHEN recommended_for_social = true THEN 1 ELSE 0 END) as recommended
       FROM content_reviews`
    );

    // Sentiment breakdown
    const sentimentResult = await query(
      `SELECT sentiment, COUNT(*) as count FROM content_reviews GROUP BY sentiment`
    );

    // Top sources
    const sourcesResult = await query(
      `SELECT source_name, COUNT(*) as count FROM news_articles
       GROUP BY source_name ORDER BY count DESC LIMIT 5`
    );

    // Alerts sent
    const alertsResult = await query(
      `SELECT platform, COUNT(*) as count FROM news_alerts_sent
       GROUP BY platform`
    );

    // Social posts
    const socialResult = await query(
      `SELECT platform, COUNT(*) as total,
              SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted
       FROM social_posts_generated GROUP BY platform`
    );

    // Telegram subscriptions
    const telegramResult = await query(
      `SELECT subscription_type, COUNT(*) as count FROM telegram_subscriptions
       WHERE is_subscribed = true GROUP BY subscription_type`
    );

    return NextResponse.json({
      articles: articlesResult.rows[0],
      reviews: reviewsResult.rows[0],
      sentiment: sentimentResult.rows,
      top_sources: sourcesResult.rows,
      alerts: alertsResult.rows,
      social_posts: socialResult.rows,
      telegram_subscriptions: telegramResult.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
