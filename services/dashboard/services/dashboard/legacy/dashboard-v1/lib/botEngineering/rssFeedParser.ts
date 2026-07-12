/**
 * RSS Feed Parser
 * Parses RSS feeds from news sources
 */

import axios from 'axios';
import { query } from '@/lib/db';
import { isDuplicate } from './duplicateDetector';

export interface RSSArticle {
  title: string;
  content: string;
  source_url: string;
  source_name: string;
  author?: string;
  published_at?: Date;
  image_url?: string;
  source_type: string;
}

/**
 * Parse RSS feed and extract articles
 */
export async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<RSSArticle[]> {
  const articles: RSSArticle[] = [];

  try {
    console.log(`[RSS] Fetching feed: ${sourceName}`);
    const response = await axios.get(feedUrl, { timeout: 10000 });

    // Simple XML parsing (in production, use xml2js or cheerio)
    const feedText = response.data;

    // Extract items using regex (basic approach)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = feedText.match(itemRegex) || [];

    for (const item of items.slice(0, 10)) {
      // Limit to 10 per source
      try {
        const title = extractXMLValue(item, 'title');
        const link = extractXMLValue(item, 'link');
        const description = extractXMLValue(item, 'description');
        const pubDate = extractXMLValue(item, 'pubDate');
        const author = extractXMLValue(item, 'author');

        if (title && link && !await isDuplicate(link)) {
          articles.push({
            title,
            content: description || title,
            source_url: link,
            source_name: sourceName,
            author,
            published_at: pubDate ? new Date(pubDate) : undefined,
            source_type: 'rss',
          });
        }
      } catch (itemError) {
        console.error('[RSS] Error parsing item:', itemError);
      }
    }

    console.log(`[RSS] Extracted ${articles.length} articles from ${sourceName}`);
  } catch (error) {
    console.error(`[RSS] Error fetching feed ${sourceName}:`, error);
  }

  return articles;
}

/**
 * Store parsed articles in database
 */
export async function storeArticles(articles: RSSArticle[]): Promise<number> {
  let stored = 0;

  for (const article of articles) {
    try {
      const result = await query(
        `INSERT INTO news_articles (title, content, summary, source_name, source_url, author, published_at, image_url, source_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (source_url) DO NOTHING
         RETURNING id`,
        [
          article.title,
          article.content,
          article.content.substring(0, 200),
          article.source_name,
          article.source_url,
          article.author,
          article.published_at,
          article.image_url,
          article.source_type,
        ]
      );

      if (result.rows.length > 0) {
        stored++;
      }
    } catch (error) {
      console.error('[RSS] Error storing article:', error);
    }
  }

  return stored;
}

/**
 * Helper: Extract XML value
 */
function extractXMLValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : '';
}
