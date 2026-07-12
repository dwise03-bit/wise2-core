/**
 * Discord Approval Workflow API
 * Handles approve/reject for pending articles
 */

import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, action } = body;

    if (!articleId || !action) {
      return Response.json(
        { error: 'Missing articleId or action' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Mark as processed
      await query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);

      // Create high-priority review
      await query(
        `INSERT INTO content_reviews (article_id, relevance_score, sentiment, priority_level, recommended_for_social)
         VALUES ($1, 0.9, 'positive', 'high', true)
         ON CONFLICT (article_id) DO UPDATE SET
           priority_level = 'high',
           recommended_for_social = true`,
        [articleId]
      );

      return Response.json(
        { success: true, message: 'Article approved for social media' },
        { status: 200 }
      );
    } else if (action === 'reject') {
      // Mark as processed (rejected)
      await query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);

      return Response.json(
        { success: true, message: 'Article rejected' },
        { status: 200 }
      );
    }

    return Response.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Approval error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get pending articles for approval dashboard
    const result = await query(
      `SELECT id, title, content, source_name, source_url, created_at
       FROM news_articles
       WHERE is_processed = false
       ORDER BY created_at DESC
       LIMIT 10`
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error('Fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
