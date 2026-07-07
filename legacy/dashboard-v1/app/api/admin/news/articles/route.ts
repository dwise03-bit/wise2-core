/**
 * Articles API
 * Fetch articles with their reviews and engagement data
 */

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const processed = searchParams.get('processed');

    let whereClause = 'WHERE 1=1';

    if (priority) {
      whereClause += ` AND cr.priority_level = '${priority}'`;
    }

    if (processed === 'false') {
      whereClause += ` AND na.is_processed = false`;
    }

    const result = await query(
      `SELECT 
        na.id, na.title, na.source_name, na.source_url, 
        na.is_processed, na.created_at,
        cr.relevance_score, cr.sentiment, cr.priority_level, cr.recommended_for_social
       FROM news_articles na
       LEFT JOIN content_reviews cr ON na.id = cr.article_id
       ${whereClause}
       ORDER BY na.created_at DESC
       LIMIT 100`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API] Articles error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
