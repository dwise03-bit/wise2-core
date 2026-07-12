/**
 * News Scraper Orchestrator
 * Coordinates RSS, API, and web scraping to collect 2nd Amendment news
 */

import { parseRSSFeed, storeArticles } from './rssFeedParser';
import { searchNews, storeNewsAPIArticles } from './newsApiClient';
import { getActiveSources, updateLastScraped } from './newsSourceManager';
import { getDuplicateCount } from './duplicateDetector';
import { query } from '@/lib/db';

export interface ScrapingResult {
  totalArticles: number;
  storedArticles: number;
  duplicates: number;
  duration: number;
}

/**
 * Run full news scraping cycle
 */
export async function runNewsScraper(): Promise<ScrapingResult> {
  const startTime = Date.now();
  let totalArticles = 0;
  let storedArticles = 0;

  try {
    console.log('[SCRAPER] Starting news scraping cycle...');

    const sources = await getActiveSources();

    if (sources.length === 0) {
      console.log('[SCRAPER] No active news sources configured');
      return { totalArticles: 0, storedArticles: 0, duplicates: 0, duration: 0 };
    }

    // Process each source
    for (const source of sources) {
      try {
        console.log(`[SCRAPER] Processing source: ${source.source_name}`);

        let articles: any[] = [];

        // Route by source type
        if (source.source_type === 'rss') {
          articles = await parseRSSFeed(source.source_url, source.source_name);
          if (articles.length > 0) {
            const stored = await storeArticles(articles);
            storedArticles += stored;
          }
        } else if (source.source_type === 'api') {
          articles = await searchNews(source.keywords || [], source.api_key);
          if (articles.length > 0) {
            const stored = await storeNewsAPIArticles(articles);
            storedArticles += stored;
          }
        } else if (source.source_type === 'web') {
          console.log('[SCRAPER] Web scraping requires custom selectors (not yet implemented)');
        }

        totalArticles += articles.length;

        // Update last scraped time
        await updateLastScraped(source.id);
      } catch (error) {
        console.error(`[SCRAPER] Error processing source ${source.source_name}:`, error);
      }
    }

    const duplicates = await getDuplicateCount();
    const duration = Date.now() - startTime;

    console.log('[SCRAPER] Scraping cycle complete');
    console.log(`  - Total articles found: ${totalArticles}`);
    console.log(`  - Articles stored: ${storedArticles}`);
    console.log(`  - Total duplicates in DB: ${duplicates}`);
    console.log(`  - Duration: ${duration}ms`);

    return { totalArticles, storedArticles, duplicates, duration };
  } catch (error) {
    console.error('[SCRAPER] Fatal error in scraping cycle:', error);
    return { totalArticles, storedArticles, duplicates: 0, duration: Date.now() - startTime };
  }
}

/**
 * Get scraping statistics
 */
export async function getScrapingStats() {
  try {
    const articleCount = await query('SELECT COUNT(*) as count FROM news_articles');
    const processedCount = await query(
      'SELECT COUNT(*) as count FROM news_articles WHERE is_processed = true'
    );
    const duplicateCount = await query(
      'SELECT COUNT(*) as count FROM news_articles WHERE duplicate_of_id IS NOT NULL'
    );
    const sourceCount = await query(
      'SELECT COUNT(*) as count FROM news_scraper_config WHERE is_active = true'
    );

    return {
      total_articles: parseInt(articleCount.rows[0]?.count || '0'),
      processed_articles: parseInt(processedCount.rows[0]?.count || '0'),
      duplicate_articles: parseInt(duplicateCount.rows[0]?.count || '0'),
      active_sources: parseInt(sourceCount.rows[0]?.count || '0'),
    };
  } catch (error) {
    console.error('[SCRAPER] Error getting stats:', error);
    return {
      total_articles: 0,
      processed_articles: 0,
      duplicate_articles: 0,
      active_sources: 0,
    };
  }
}
