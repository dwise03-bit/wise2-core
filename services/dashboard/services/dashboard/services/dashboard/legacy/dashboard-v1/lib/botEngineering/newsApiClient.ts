/**
 * NewsAPI.org Client
 * Fetches articles from newsapi.org API
 */

import axios from 'axios';
import { query } from '@/lib/db';
import { isDuplicate } from './duplicateDetector';

export interface NewsAPIArticle {
  source: { id: string; name: string };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

/**
 * Search News API for 2nd Amendment articles
 */
export async function searchNews(keywords: string[], apiKey?: string): Promise<NewsAPIArticle[]> {
  const newsApiKey = apiKey || process.env.NEWS_API_KEY;

  if (!newsApiKey) {
    console.warn('[NEWSAPI] No API key provided');
    return [];
  }

  const articles: NewsAPIArticle[] = [];

  try {
    // Search for each keyword
    for (const keyword of keywords.slice(0, 3)) {
      // Limit to 3 keywords
      console.log(`[NEWSAPI] Searching for: ${keyword}`);

      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: keyword,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 20,
          apiKey: newsApiKey,
        },
        timeout: 10000,
      });

      if (response.data.articles) {
        for (const article of response.data.articles) {
          if (!(await isDuplicate(article.url))) {
            articles.push(article);
          }
        }
      }
    }

    // Remove duplicates by URL
    const uniqueArticles = Array.from(new Map(articles.map((a) => [a.url, a])).values());

    console.log(`[NEWSAPI] Found ${uniqueArticles.length} unique articles`);
    return uniqueArticles;
  } catch (error) {
    console.error('[NEWSAPI] Error searching news:', error);
    return [];
  }
}

/**
 * Store NewsAPI articles in database
 */
export async function storeNewsAPIArticles(articles: NewsAPIArticle[]): Promise<number> {
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
          article.content || article.description,
          article.description,
          article.source.name,
          article.url,
          article.author,
          new Date(article.publishedAt),
          article.urlToImage,
          'api',
        ]
      );

      if (result.rows.length > 0) {
        stored++;
      }
    } catch (error) {
      console.error('[NEWSAPI] Error storing article:', error);
    }
  }

  return stored;
}
