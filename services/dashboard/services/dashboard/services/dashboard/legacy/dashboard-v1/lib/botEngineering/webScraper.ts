/**
 * Web Scraper
 * Scrapes news from specialized 2nd Amendment news websites
 */

import axios from 'axios';
import { query } from '@/lib/db';
import { isDuplicate } from './duplicateDetector';

export interface ScrapedArticle {
  title: string;
  content: string;
  source_url: string;
  source_name: string;
  published_at?: Date;
  image_url?: string;
}

/**
 * Scrape specialized 2A news sites
 */
export async function scrapeNewssite(
  siteUrl: string,
  sourceName: string,
  selectors: {
    article: string;
    title: string;
    link: string;
    content: string;
    date?: string;
    image?: string;
  }
): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = [];

  try {
    console.log(`[SCRAPER] Scraping: ${sourceName}`);

    const response = await axios.get(siteUrl, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data;

    // Simple regex-based scraping (production would use cheerio)
    const articleRegex = new RegExp(selectors.article, 'g');
    const matches = html.match(articleRegex) || [];

    for (const match of matches.slice(0, 10)) {
      try {
        const title = extractBySelector(match, selectors.title);
        const link = extractBySelector(match, selectors.link);
        const content = extractBySelector(match, selectors.content);

        if (title && link && !(await isDuplicate(link))) {
          const article: ScrapedArticle = {
            title,
            content: content || title,
            source_url: link,
            source_name: sourceName,
            published_at: selectors.date ? new Date(extractBySelector(match, selectors.date)) : undefined,
            image_url: selectors.image ? extractBySelector(match, selectors.image) : undefined,
          };

          articles.push(article);
        }
      } catch (error) {
        console.error('[SCRAPER] Error parsing article:', error);
      }
    }

    console.log(`[SCRAPER] Extracted ${articles.length} articles from ${sourceName}`);
  } catch (error) {
    console.error(`[SCRAPER] Error scraping ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Store scraped articles
 */
export async function storeScrapedArticles(articles: ScrapedArticle[]): Promise<number> {
  let stored = 0;

  for (const article of articles) {
    try {
      const result = await query(
        `INSERT INTO news_articles (title, content, summary, source_name, source_url, published_at, image_url, source_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (source_url) DO NOTHING
         RETURNING id`,
        [
          article.title,
          article.content,
          article.content.substring(0, 200),
          article.source_name,
          article.source_url,
          article.published_at,
          article.image_url,
          'web',
        ]
      );

      if (result.rows.length > 0) {
        stored++;
      }
    } catch (error) {
      console.error('[SCRAPER] Error storing article:', error);
    }
  }

  return stored;
}

/**
 * Helper: Extract by selector
 */
function extractBySelector(html: string, selector: string): string {
  try {
    const regex = new RegExp(selector, 'i');
    const match = html.match(regex);
    return match ? match[1]?.replace(/<[^>]*>/g, '').trim() || '' : '';
  } catch (error) {
    return '';
  }
}
