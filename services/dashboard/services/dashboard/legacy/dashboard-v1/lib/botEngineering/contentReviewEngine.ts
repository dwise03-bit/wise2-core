/**
 * Content Review Engine
 * Orchestrates article analysis: relevance, sentiment, key points, implications
 */

import { query } from '@/lib/db';
import { calculateRelevanceScore, getRelevanceCategory } from './relevanceScorer';
import { analyzeSentiment, analyzeTone } from './sentimentAnalyzer';
import { extractKeyPoints, extractImplications, generateBasicSummary } from './keyPointsExtractor';

export interface ContentReview {
  article_id: number;
  relevance_score: number;
  relevance_reason: string;
  sentiment: string;
  key_points: string[];
  implications: string[];
  ai_summary: string;
  recommended_for_social: boolean;
  priority_level: 'high' | 'medium' | 'low';
}

/**
 * Review single article
 */
export async function reviewArticle(articleId: number): Promise<ContentReview | null> {
  try {
    // Fetch article
    const articleResult = await query('SELECT * FROM news_articles WHERE id = $1', [articleId]);

    if (articleResult.rows.length === 0) {
      console.error('[REVIEW] Article not found:', articleId);
      return null;
    }

    const article = articleResult.rows[0];
    const title = article.title || '';
    const content = article.content || '';
    const source = article.source_name || '';

    console.log('[REVIEW] Analyzing article:', title.substring(0, 50) + '...');

    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore(title, content, source);
    const relevanceCategory = getRelevanceCategory(relevanceScore);

    // Analyze sentiment
    const sentimentResult = analyzeSentiment(title, content);
    const toneAnalysis = analyzeTone(title, content);

    // Extract key points
    const keyPoints = extractKeyPoints(title, content, 5);

    // Extract implications
    const implications = extractImplications(title, content, sentimentResult.sentiment);

    // Generate summary
    const summary = generateBasicSummary(title, content, 250);

    // Determine if recommended for social
    const recommendedForSocial = relevanceScore >= 0.6 && sentimentResult.confidence > 0.3;

    // Determine priority level
    let priorityLevel: 'high' | 'medium' | 'low' = 'low';
    if (relevanceScore >= 0.8) {
      priorityLevel = 'high';
    } else if (relevanceScore >= 0.6) {
      priorityLevel = 'medium';
    }

    // Build review object
    const review: ContentReview = {
      article_id: articleId,
      relevance_score: relevanceScore,
      relevance_reason: `${relevanceCategory} (${(relevanceScore * 100).toFixed(0)}% match). ${toneAnalysis.explanation}`,
      sentiment: sentimentResult.sentiment,
      key_points: keyPoints,
      implications,
      ai_summary: summary,
      recommended_for_social: recommendedForSocial,
      priority_level: priorityLevel,
    };

    console.log('[REVIEW] Analysis complete:', {
      relevance: relevanceScore,
      sentiment: sentimentResult.sentiment,
      priority: priorityLevel,
      recommended: recommendedForSocial,
    });

    return review;
  } catch (error) {
    console.error('[REVIEW] Error reviewing article:', error);
    return null;
  }
}

/**
 * Store review in database
 */
export async function storeReview(review: ContentReview): Promise<boolean> {
  try {
    const result = await query(
      `INSERT INTO content_reviews (
        article_id, relevance_score, relevance_reason, sentiment,
        key_points, implications, ai_summary, recommended_for_social, priority_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (article_id) DO UPDATE SET
        relevance_score = EXCLUDED.relevance_score,
        relevance_reason = EXCLUDED.relevance_reason,
        sentiment = EXCLUDED.sentiment,
        key_points = EXCLUDED.key_points,
        implications = EXCLUDED.implications,
        ai_summary = EXCLUDED.ai_summary,
        recommended_for_social = EXCLUDED.recommended_for_social,
        priority_level = EXCLUDED.priority_level,
        reviewed_at = NOW()
      RETURNING id`,
      [
        review.article_id,
        review.relevance_score,
        review.relevance_reason,
        review.sentiment,
        JSON.stringify(review.key_points),
        JSON.stringify(review.implications),
        review.ai_summary,
        review.recommended_for_social,
        review.priority_level,
      ]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('[REVIEW] Error storing review:', error);
    return false;
  }
}

/**
 * Review all unreviewed articles
 */
export async function reviewUnreviewedArticles(): Promise<number> {
  try {
    console.log('[REVIEW] Finding unreviewed articles...');

    // Find articles not yet reviewed
    const result = await query(
      `SELECT id FROM news_articles
       WHERE id NOT IN (SELECT article_id FROM content_reviews)
       AND is_processed = false
       ORDER BY created_at DESC
       LIMIT 50`
    );

    const unreviewedIds = result.rows.map((r: any) => r.id);
    console.log('[REVIEW] Found', unreviewedIds.length, 'unreviewed articles');

    let reviewed = 0;

    for (const articleId of unreviewedIds) {
      try {
        const review = await reviewArticle(articleId);
        if (review) {
          const stored = await storeReview(review);
          if (stored) {
            reviewed++;
            // Mark as processed
            await query('UPDATE news_articles SET is_processed = true WHERE id = $1', [
              articleId,
            ]);
          }
        }
      } catch (error) {
        console.error('[REVIEW] Error in review cycle for article', articleId, error);
      }
    }

    console.log('[REVIEW] Reviewed and stored', reviewed, 'articles');
    return reviewed;
  } catch (error) {
    console.error('[REVIEW] Error in review batch:', error);
    return 0;
  }
}

/**
 * Get high-priority articles for social media
 */
export async function getHighPriorityArticles(limit = 10): Promise<any[]> {
  try {
    const result = await query(
      `SELECT
        na.id, na.title, na.source_url, na.source_name,
        cr.relevance_score, cr.sentiment, cr.key_points, cr.implications, cr.ai_summary
       FROM news_articles na
       JOIN content_reviews cr ON na.id = cr.article_id
       WHERE cr.recommended_for_social = true
       AND cr.priority_level = 'high'
       AND na.id NOT IN (SELECT article_id FROM social_posts_generated)
       ORDER BY cr.relevance_score DESC, na.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('[REVIEW] Error fetching high-priority articles:', error);
    return [];
  }
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  try {
    const total = await query('SELECT COUNT(*) as count FROM content_reviews');
    const byPriority = await query(
      `SELECT priority_level, COUNT(*) as count FROM content_reviews GROUP BY priority_level`
    );
    const byRecommended = await query(
      `SELECT recommended_for_social, COUNT(*) as count FROM content_reviews GROUP BY recommended_for_social`
    );

    return {
      total_reviewed: parseInt(total.rows[0]?.count || '0'),
      by_priority: byPriority.rows,
      by_recommendation: byRecommended.rows,
    };
  } catch (error) {
    console.error('[REVIEW] Error getting stats:', error);
    return {
      total_reviewed: 0,
      by_priority: [],
      by_recommendation: [],
    };
  }
}
