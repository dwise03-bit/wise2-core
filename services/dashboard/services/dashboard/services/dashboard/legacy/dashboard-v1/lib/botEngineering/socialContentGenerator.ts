/**
 * Social Media Content Generator
 * Generates AI-powered social media posts from reviewed articles
 */

import { query } from '@/lib/db';
import { generateMultiPlatformContent } from './socialContentFormatter';

export interface GeneratedSocialPost {
  article_id: number;
  review_id: number;
  platform: string;
  content_text: string;
  hashtags: string;
  call_to_action: string;
  character_count: number;
  status: string;
}

/**
 * Generate social media content for article
 */
export async function generateSocialContent(articleId: number): Promise<GeneratedSocialPost[] | null> {
  try {
    // Fetch article and review
    const articleResult = await query('SELECT * FROM news_articles WHERE id = $1', [articleId]);
    if (articleResult.rows.length === 0) {
      console.error('[SOCIAL] Article not found:', articleId);
      return null;
    }

    const reviewResult = await query('SELECT * FROM content_reviews WHERE article_id = $1', [
      articleId,
    ]);
    if (reviewResult.rows.length === 0) {
      console.error('[SOCIAL] Review not found for article:', articleId);
      return null;
    }

    const article = articleResult.rows[0];
    const review = reviewResult.rows[0];

    console.log('[SOCIAL] Generating content for:', article.title.substring(0, 50) + '...');

    // Parse key_points and implications from review
    const keyPoints =
      typeof review.key_points === 'string'
        ? JSON.parse(review.key_points)
        : review.key_points || [];
    const implications =
      typeof review.implications === 'string'
        ? JSON.parse(review.implications)
        : review.implications || [];

    // Generate multi-platform content
    const platformContent = generateMultiPlatformContent(
      article.title,
      article.content,
      keyPoints,
      implications,
      review.sentiment,
      article.source_url,
      article.source_name
    );

    // Convert to database format
    const posts: GeneratedSocialPost[] = [];

    for (const [platform, content] of Object.entries(platformContent)) {
      posts.push({
        article_id: articleId,
        review_id: review.id,
        platform,
        content_text: content.content_text,
        hashtags: content.hashtags,
        call_to_action: content.call_to_action,
        character_count: content.character_count,
        status: 'pending',
      });
    }

    console.log('[SOCIAL] Generated', posts.length, 'platform variations');

    return posts;
  } catch (error) {
    console.error('[SOCIAL] Error generating content:', error);
    return null;
  }
}

/**
 * Store generated social posts
 */
export async function storeGeneratedPosts(posts: GeneratedSocialPost[]): Promise<number> {
  let stored = 0;

  for (const post of posts) {
    try {
      const result = await query(
        `INSERT INTO social_posts_generated (
          article_id, review_id, platform, content_text,
          hashtags, call_to_action, character_count, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          post.article_id,
          post.review_id,
          post.platform,
          post.content_text,
          post.hashtags,
          post.call_to_action,
          post.character_count,
          post.status,
        ]
      );

      if (result.rows.length > 0) {
        stored++;
      }
    } catch (error) {
      console.error('[SOCIAL] Error storing post:', error);
    }
  }

  return stored;
}

/**
 * Generate social content for high-priority articles
 */
export async function generateSocialForHighPriority(): Promise<number> {
  try {
    console.log('[SOCIAL] Finding high-priority articles without social content...');

    // Find reviewed articles not yet with social content
    const result = await query(
      `SELECT na.id FROM news_articles na
       JOIN content_reviews cr ON na.id = cr.article_id
       WHERE cr.recommended_for_social = true
       AND cr.priority_level = 'high'
       AND na.id NOT IN (SELECT article_id FROM social_posts_generated)
       ORDER BY cr.relevance_score DESC
       LIMIT 20`
    );

    const articleIds = result.rows.map((r: any) => r.id);
    console.log('[SOCIAL] Found', articleIds.length, 'articles needing content');

    let totalGenerated = 0;

    for (const articleId of articleIds) {
      try {
        const posts = await generateSocialContent(articleId);
        if (posts && posts.length > 0) {
          const stored = await storeGeneratedPosts(posts);
          totalGenerated += stored;
        }
      } catch (error) {
        console.error('[SOCIAL] Error processing article', articleId, error);
      }
    }

    console.log('[SOCIAL] Generated and stored', totalGenerated, 'social posts');
    return totalGenerated;
  } catch (error) {
    console.error('[SOCIAL] Error in generation batch:', error);
    return 0;
  }
}

/**
 * Get pending social posts for platform
 */
export async function getPendingPosts(platform: string, limit = 10): Promise<any[]> {
  try {
    const result = await query(
      `SELECT * FROM social_posts_generated
       WHERE platform = $1 AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT $2`,
      [platform, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('[SOCIAL] Error fetching pending posts:', error);
    return [];
  }
}

/**
 * Mark post as posted
 */
export async function markPostPosted(
  postId: number,
  platform: string,
  postUrl: string
): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE social_posts_generated
       SET status = 'posted', posted_at = NOW(), post_url = $1
       WHERE id = $2 AND platform = $3`,
      [postUrl, postId, platform]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('[SOCIAL] Error marking post as posted:', error);
    return false;
  }
}

/**
 * Get generation statistics
 */
export async function getGenerationStats() {
  try {
    const total = await query('SELECT COUNT(*) as count FROM social_posts_generated');
    const byPlatform = await query(
      `SELECT platform, COUNT(*) as count FROM social_posts_generated GROUP BY platform`
    );
    const byStatus = await query(
      `SELECT status, COUNT(*) as count FROM social_posts_generated GROUP BY status`
    );
    const avgChars = await query(
      'SELECT ROUND(AVG(character_count)) as avg_length FROM social_posts_generated'
    );

    return {
      total_posts: parseInt(total.rows[0]?.count || '0'),
      by_platform: byPlatform.rows,
      by_status: byStatus.rows,
      average_character_count: parseInt(avgChars.rows[0]?.avg_length || '0'),
    };
  } catch (error) {
    console.error('[SOCIAL] Error getting stats:', error);
    return {
      total_posts: 0,
      by_platform: [],
      by_status: [],
      average_character_count: 0,
    };
  }
}
