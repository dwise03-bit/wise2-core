/**
 * News Scraper Agent
 * PM2-managed service that scrapes 2nd Amendment news every 4 hours
 * Runs continuously, logs to PM2 monitoring
 */

const pg = require('pg');
const axios = require('axios');

// Initialize database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

// Import scraper utilities (inline for PM2 compatibility)
const scraperState = {
  isRunning: false,
  lastRun: null,
  articlesScraped: 0,
  articlesStored: 0,
  errors: [],
};

/**
 * Check if article URL already exists
 */
async function isDuplicate(sourceUrl) {
  try {
    const result = await pool.query('SELECT id FROM news_articles WHERE source_url = $1 LIMIT 1', [
      sourceUrl,
    ]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('[SCRAPER] Error checking duplicate:', error.message);
    return false;
  }
}

/**
 * Store article in database
 */
async function storeArticle(article) {
  try {
    const result = await pool.query(
      `INSERT INTO news_articles (title, content, summary, source_name, source_url, author, published_at, image_url, source_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (source_url) DO NOTHING
       RETURNING id`,
      [
        article.title,
        article.content,
        article.summary || article.content.substring(0, 200),
        article.source_name,
        article.source_url,
        article.author,
        article.published_at,
        article.image_url,
        article.source_type,
      ]
    );

    if (result.rows.length > 0) {
      scraperState.articlesStored++;
      return result.rows[0].id;
    }
    return null;
  } catch (error) {
    console.error('[SCRAPER] Error storing article:', error.message);
    return null;
  }
}

/**
 * Parse RSS feed
 */
async function parseRSSFeed(feedUrl, sourceName) {
  const articles = [];

  try {
    console.log(`[SCRAPER] Fetching RSS feed: ${sourceName}`);
    const response = await axios.get(feedUrl, { timeout: 10000 });

    const feedText = response.data;

    // Extract items using regex
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const items = feedText.match(itemRegex) || [];

    console.log(`[SCRAPER] Found ${items.length} items in ${sourceName} RSS feed`);

    for (const item of items.slice(0, 10)) {
      try {
        const title = extractXMLValue(item, 'title');
        const link = extractXMLValue(item, 'link');
        const description = extractXMLValue(item, 'description');
        const pubDate = extractXMLValue(item, 'pubDate');
        const author = extractXMLValue(item, 'author');

        if (title && link && !(await isDuplicate(link))) {
          articles.push({
            title,
            content: description || title,
            source_url: link,
            source_name: sourceName,
            author,
            published_at: pubDate ? new Date(pubDate) : null,
            source_type: 'rss',
          });
        }
      } catch (itemError) {
        console.error('[SCRAPER] Error parsing RSS item:', itemError.message);
      }
    }

    console.log(`[SCRAPER] Extracted ${articles.length} new articles from ${sourceName}`);
  } catch (error) {
    console.error(`[SCRAPER] Error fetching RSS feed ${sourceName}:`, error.message);
    scraperState.errors.push({
      source: sourceName,
      error: error.message,
      timestamp: new Date(),
    });
  }

  return articles;
}

/**
 * Search News API
 */
async function searchNews(keywords, apiKey) {
  const articles = [];
  const newsApiKey = apiKey || process.env.NEWS_API_KEY;

  if (!newsApiKey) {
    console.warn('[SCRAPER] No NEWS_API_KEY configured');
    return articles;
  }

  try {
    for (const keyword of keywords.slice(0, 2)) {
      console.log(`[SCRAPER] Searching News API for: ${keyword}`);

      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: keyword,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 15,
          apiKey: newsApiKey,
        },
        timeout: 10000,
      });

      if (response.data.articles) {
        for (const apiArticle of response.data.articles) {
          if (!(await isDuplicate(apiArticle.url))) {
            articles.push({
              title: apiArticle.title,
              content: apiArticle.content || apiArticle.description,
              source_url: apiArticle.url,
              source_name: apiArticle.source.name,
              author: apiArticle.author,
              published_at: new Date(apiArticle.publishedAt),
              image_url: apiArticle.urlToImage,
              source_type: 'api',
            });
          }
        }
      }
    }

    console.log(`[SCRAPER] Found ${articles.length} articles from News API`);
  } catch (error) {
    console.error('[SCRAPER] Error searching News API:', error.message);
    scraperState.errors.push({
      source: 'News API',
      error: error.message,
      timestamp: new Date(),
    });
  }

  return articles;
}

/**
 * Get active news sources
 */
async function getActiveSources() {
  try {
    const result = await pool.query(
      'SELECT * FROM news_scraper_config WHERE is_active = true ORDER BY priority_order ASC'
    );
    return result.rows;
  } catch (error) {
    console.error('[SCRAPER] Error fetching sources:', error.message);
    return [];
  }
}

/**
 * Update source last_scraped time
 */
async function updateLastScraped(sourceId) {
  try {
    await pool.query('UPDATE news_scraper_config SET last_scraped_at = NOW() WHERE id = $1', [
      sourceId,
    ]);
  } catch (error) {
    console.error('[SCRAPER] Error updating last_scraped_at:', error.message);
  }
}

/**
 * Extract XML value helper
 */
function extractXMLValue(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : '';
}

/**
 * Run complete scraping cycle
 */
async function runScrapingCycle() {
  if (scraperState.isRunning) {
    console.log('[SCRAPER] Cycle already running, skipping');
    return;
  }

  scraperState.isRunning = true;
  scraperState.articlesScraped = 0;
  scraperState.articlesStored = 0;
  scraperState.errors = [];

  const startTime = Date.now();

  try {
    console.log('[SCRAPER] ========================================');
    console.log('[SCRAPER] Starting news scraping cycle');
    console.log('[SCRAPER] ========================================');

    const sources = await getActiveSources();

    if (sources.length === 0) {
      console.log('[SCRAPER] No active news sources configured');
      return;
    }

    console.log(`[SCRAPER] Processing ${sources.length} news sources`);

    // Process each source
    for (const source of sources) {
      try {
        let articles = [];

        if (source.source_type === 'rss') {
          articles = await parseRSSFeed(source.source_url, source.source_name);
        } else if (source.source_type === 'api') {
          articles = await searchNews(source.keywords || [], source.api_key);
        }

        scraperState.articlesScraped += articles.length;

        // Store articles
        for (const article of articles) {
          await storeArticle(article);
        }

        // Update source state
        await updateLastScraped(source.id);
      } catch (error) {
        console.error(`[SCRAPER] Error processing source ${source.source_name}:`, error.message);
        scraperState.errors.push({
          source: source.source_name,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    const duration = Date.now() - startTime;

    console.log('[SCRAPER] ========================================');
    console.log('[SCRAPER] Scraping cycle complete');
    console.log(`[SCRAPER] Articles found: ${scraperState.articlesScraped}`);
    console.log(`[SCRAPER] Articles stored: ${scraperState.articlesStored}`);
    console.log(`[SCRAPER] Duration: ${duration}ms`);
    console.log(`[SCRAPER] Errors: ${scraperState.errors.length}`);
    console.log('[SCRAPER] ========================================');

    scraperState.lastRun = new Date();
  } catch (error) {
    console.error('[SCRAPER] Fatal error in scraping cycle:', error);
    scraperState.errors.push({
      source: 'System',
      error: error.message,
      timestamp: new Date(),
    });
  } finally {
    scraperState.isRunning = false;
  }
}

/**
 * Initialize and start scraper
 */
async function start() {
  console.log('[SCRAPER] News Scraper Agent starting...');

  try {
    // Test database connection
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('[SCRAPER] Database connected:', testResult.rows[0].now);

    // Run initial scraping cycle
    console.log('[SCRAPER] Running initial scraping cycle...');
    await runScrapingCycle();

    // Schedule recurring cycles every 4 hours
    const SCRAPE_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    setInterval(async () => {
      console.log('[SCRAPER] Starting scheduled scraping cycle...');
      await runScrapingCycle();
    }, SCRAPE_INTERVAL);

    console.log('[SCRAPER] News Scraper Agent ready');
    console.log(`[SCRAPER] Next scrape scheduled in 4 hours`);
  } catch (error) {
    console.error('[SCRAPER] Fatal startup error:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('[SCRAPER] Received SIGTERM, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[SCRAPER] Received SIGINT, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the agent
start();
