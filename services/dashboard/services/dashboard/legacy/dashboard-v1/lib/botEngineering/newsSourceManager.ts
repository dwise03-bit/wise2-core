/**
 * News Source Manager
 * Manages news sources configuration and state
 */

import { query } from '@/lib/db';

export interface NewsSource {
  id: number;
  source_name: string;
  source_type: 'rss' | 'api' | 'web';
  source_url: string;
  api_key?: string;
  is_active: boolean;
  priority_order: number;
  keywords: string[];
  last_scraped_at?: Date;
}

export async function getActiveSources(): Promise<NewsSource[]> {
  try {
    const result = await query(
      `SELECT * FROM news_scraper_config WHERE is_active = true ORDER BY priority_order ASC`
    );
    return result.rows as NewsSource[];
  } catch (error) {
    console.error('[NEWS_MANAGER] Error fetching sources:', error);
    return [];
  }
}

export async function addSource(
  sourceName: string,
  sourceType: 'rss' | 'api' | 'web',
  sourceUrl: string,
  keywords: string[],
  apiKey?: string
): Promise<NewsSource | null> {
  try {
    const result = await query(
      `INSERT INTO news_scraper_config (source_name, source_type, source_url, keywords, api_key, priority_order)
       VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(priority_order), 0) + 1 FROM news_scraper_config))
       RETURNING *`,
      [sourceName, sourceType, sourceUrl, keywords, apiKey]
    );
    return (result.rows[0] as NewsSource) || null;
  } catch (error) {
    console.error('[NEWS_MANAGER] Error adding source:', error);
    return null;
  }
}

export async function updateLastScraped(sourceId: number): Promise<void> {
  try {
    await query(
      `UPDATE news_scraper_config SET last_scraped_at = NOW() WHERE id = $1`,
      [sourceId]
    );
  } catch (error) {
    console.error('[NEWS_MANAGER] Error updating last_scraped_at:', error);
  }
}

export async function deactivateSource(sourceId: number): Promise<void> {
  try {
    await query(
      `UPDATE news_scraper_config SET is_active = false WHERE id = $1`,
      [sourceId]
    );
  } catch (error) {
    console.error('[NEWS_MANAGER] Error deactivating source:', error);
  }
}

// Pre-configured 2nd Amendment news sources
export async function initializeDefaultSources(): Promise<void> {
  try {
    const defaultSources = [
      {
        name: 'Reuters 2A',
        type: 'api',
        url: 'https://newsapi.org/v2/everything',
        keywords: ['2nd Amendment', 'gun rights', 'Second Amendment', 'firearms'],
      },
      {
        name: 'AP News RSS',
        type: 'rss',
        url: 'https://apnews.com/hub/gun-violence/feed',
        keywords: ['gun', 'firearms', 'amendment'],
      },
      {
        name: 'NPR Politics',
        type: 'rss',
        url: 'https://feeds.npr.org/1014/rss.xml',
        keywords: ['2nd Amendment', 'gun control', 'regulation'],
      },
      {
        name: 'Politico',
        type: 'rss',
        url: 'https://www.politico.com/rss/gun-control.xml',
        keywords: ['gun', '2A', 'amendment'],
      },
    ];

    for (const source of defaultSources) {
      const existing = await query(
        `SELECT id FROM news_scraper_config WHERE source_name = $1`,
        [source.name]
      );

      if (existing.rows.length === 0) {
        await addSource(source.name, source.type as any, source.url, source.keywords);
        console.log(`[NEWS_MANAGER] Added source: ${source.name}`);
      }
    }
  } catch (error) {
    console.error('[NEWS_MANAGER] Error initializing sources:', error);
  }
}
