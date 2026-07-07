/**
 * Duplicate Detection System
 * Identifies and flags duplicate news articles
 */

import { query } from '@/lib/db';

/**
 * Check if article URL already exists
 */
export async function isDuplicate(sourceUrl: string): Promise<boolean> {
  try {
    const result = await query(
      `SELECT id FROM news_articles WHERE source_url = $1 LIMIT 1`,
      [sourceUrl]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('[DEDUP] Error checking duplicate:', error);
    return false;
  }
}

/**
 * Find similar articles by title (fuzzy matching)
 */
export async function findSimilarArticles(title: string, threshold = 0.8): Promise<any[]> {
  try {
    // Simple title similarity check (at least 80% word overlap)
    const titleWords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    if (titleWords.length === 0) {
      return [];
    }

    const result = await query(
      `SELECT id, title, source_url, published_at FROM news_articles
       WHERE created_at > NOW() - INTERVAL '7 days'
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const similar = result.rows.filter((row: any) => {
      const rowWords = row.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      const overlap = titleWords.filter((w) => rowWords.includes(w)).length;
      const similarity = overlap / Math.max(titleWords.length, rowWords.length);
      return similarity >= threshold;
    });

    return similar;
  } catch (error) {
    console.error('[DEDUP] Error finding similar articles:', error);
    return [];
  }
}

/**
 * Mark article as duplicate of another
 */
export async function markDuplicate(articleId: number, duplicateOfId: number): Promise<void> {
  try {
    await query(
      `UPDATE news_articles SET duplicate_of_id = $1 WHERE id = $2`,
      [duplicateOfId, articleId]
    );
    console.log(`[DEDUP] Marked article ${articleId} as duplicate of ${duplicateOfId}`);
  } catch (error) {
    console.error('[DEDUP] Error marking duplicate:', error);
  }
}

/**
 * Get deduped article count
 */
export async function getDuplicateCount(): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM news_articles WHERE duplicate_of_id IS NOT NULL`
    );
    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('[DEDUP] Error getting duplicate count:', error);
    return 0;
  }
}
