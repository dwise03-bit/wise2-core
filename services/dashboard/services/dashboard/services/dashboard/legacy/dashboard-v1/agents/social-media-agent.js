/**
 * Social Media Posting Agent
 * PM2-managed service that posts generated content to social platforms
 * Runs every 2 hours to batch-post high-quality 2nd Amendment content
 */

const pg = require('pg');
const axios = require('axios');

// Ollama configuration
const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

// Clean HTML entities and heading markup from content
function cleanContent(text) {
  if (!text) return '';
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<\/h[1-6]>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Generate social media posts from reviewed articles using Claude
 */
async function generatePostsFromArticles() {
  try {
    // Find reviewed articles that don't have posts yet
    const result = await pool.query(`
      SELECT
        a.id, a.title, a.content, a.source_url,
        cr.relevance_score, cr.sentiment
      FROM content_reviews cr
      JOIN news_articles a ON cr.article_id = a.id
      WHERE cr.recommended_for_social = true
      AND a.id NOT IN (SELECT DISTINCT article_id FROM social_posts_generated)
      AND cr.relevance_score > 0.7
      ORDER BY cr.relevance_score DESC
      LIMIT 3
    `);

    const articles = result.rows;
    if (articles.length === 0) {
      console.log('[SOCIAL] No new articles to generate posts from');
      return 0;
    }

    console.log(`[SOCIAL] Generating posts for ${articles.length} articles...`);
    let postsCreated = 0;

    for (const article of articles) {
      const prompt = `You are a 2nd Amendment news social media expert. Create concise, engaging social media posts for the following article:

Title: ${article.title}
Source: ${article.source_url}
Summary: ${cleanContent(article.content).substring(0, 300)}...

Generate posts in this JSON format (return ONLY valid JSON, no other text):
{
  "telegram": "A focused, fact-based post for Telegram (150-250 chars) with relevant #hashtags",
  "twitter": "An engaging tweet (under 280 chars) with #hashtags and emoji",
  "instagram": "An engaging Instagram caption (150-250 chars) with call-to-action",
  "linkedin": "A professional LinkedIn post (100-150 chars) for advocacy",
  "discord": "A Discord announcement post (200 chars) with context"
}

Focus on 2nd Amendment advocacy, gun rights, and relevant legislation.`;

      try {
        const response = await axios.post(OLLAMA_API, {
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
        });

        const responseText = response.data.response || '{}';
        // Extract JSON from response (Ollama may include extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const posts = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        // Insert generated posts
        for (const [platform, content] of Object.entries(posts)) {
          if (content && platform !== 'twitter') {
            // Skip twitter for now (need API credentials)
            await pool.query(
              `INSERT INTO social_posts_generated (article_id, platform, content_text, hashtags, status)
               VALUES ($1, $2, $3, $4, 'pending')
               ON CONFLICT DO NOTHING`,
              [article.id, platform, content, '#2A #GunRights #2ndAmendment']
            );
            postsCreated++;
          }
        }

        console.log(`[SOCIAL] Generated posts for article: ${article.title.substring(0, 50)}`);
      } catch (error) {
        console.error('[SOCIAL] Error generating posts:', error.message);
      }
    }

    return postsCreated;
  } catch (error) {
    console.error('[SOCIAL] Error in post generation:', error);
    return 0;
  }
}

// Initialize database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

// Agent state tracking
const postalState = {
  isRunning: false,
  lastRun: null,
  postsPublished: 0,
  platformStats: {},
  errors: [],
};

/**
 * Get pending posts for platform
 */
async function getPendingPosts(platform, limit = 5) {
  try {
    const result = await pool.query(
      `SELECT * FROM social_posts_generated
       WHERE platform = $1 AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT $2`,
      [platform, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[SOCIAL] Error fetching pending posts:', error.message);
    return [];
  }
}

/**
 * Mark post as posted
 */
async function markPostPosted(postId, platform, postUrl) {
  try {
    await pool.query(
      `UPDATE social_posts_generated
       SET status = 'posted', posted_at = NOW(), post_url = $1
       WHERE id = $2 AND platform = $3`,
      [postUrl, postId, platform]
    );
    return true;
  } catch (error) {
    console.error('[SOCIAL] Error marking post:', error.message);
    return false;
  }
}

/**
 * Post to Telegram
 */
async function postToTelegram(post) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChannelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!telegramBotToken || !telegramChannelId) {
    console.log('[SOCIAL] Telegram not configured');
    return null;
  }

  try {
    const cleanedContent = cleanContent(post.content_text);
    const message = `${cleanedContent}\n\n${post.hashtags}`;
    const response = await axios.post(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        chat_id: telegramChannelId,
        text: message,
        parse_mode: 'HTML',
      }
    );
    console.log('[SOCIAL] Posted to Telegram');
    return { platform: 'telegram', status: 'posted', postUrl: `telegram-${response.data.result.message_id}` };
  } catch (error) {
    console.error('[SOCIAL] Telegram error:', error.message);
    return null;
  }
}

/**
 * Post to Discord
 */
async function postToDiscord(post) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!discordWebhookUrl) {
    console.log('[SOCIAL] Discord not configured');
    return null;
  }

  try {
    const message = {
      content: `${post.content_text}\n\n${post.hashtags}`,
      embeds: [{
        title: 'New 2nd Amendment News',
        description: post.content_text.substring(0, 200),
        color: 15158332,
        fields: [{
          name: 'Call to Action',
          value: post.call_to_action,
        }],
        timestamp: new Date().toISOString(),
      }],
    };

    await axios.post(discordWebhookUrl, message);
    console.log('[SOCIAL] Posted to Discord');
    return { platform: 'discord', status: 'posted', postUrl: 'discord' };
  } catch (error) {
    console.error('[SOCIAL] Discord error:', error.message);
    return null;
  }
}

/**
 * Post content
 */
async function postContent(post) {
  console.log(`[SOCIAL] Processing ${post.platform} post from article ${post.article_id}`);

  let result = null;

  switch (post.platform) {
    case 'telegram':
      result = await postToTelegram(post);
      break;
    case 'discord':
      result = await postToDiscord(post);
      break;
    case 'twitter':
    case 'instagram':
    case 'linkedin':
      // These require API credentials - ready for integration
      result = { platform: post.platform, status: 'ready' };
      console.log(`[SOCIAL] ${post.platform} post ready (awaiting API credentials)`);
      break;
  }

  if (result && result.status === 'posted') {
    await markPostPosted(post.id, post.platform, result.postUrl);
    if (!postalState.platformStats[post.platform]) {
      postalState.platformStats[post.platform] = 0;
    }
    postalState.platformStats[post.platform]++;
    postalState.postsPublished++;
    console.log(`[SOCIAL] ✅ Posted to ${post.platform}`);
  }

  return result;
}

/**
 * Run posting cycle
 */
async function runPostingCycle() {
  if (postalState.isRunning) {
    console.log('[SOCIAL] Cycle running, skipping');
    return;
  }

  postalState.isRunning = true;
  postalState.postsPublished = 0;
  postalState.platformStats = {};
  postalState.errors = [];

  const startTime = Date.now();

  try {
    console.log('[SOCIAL] ========================================');
    console.log('[SOCIAL] Starting social media posting cycle');
    console.log('[SOCIAL] ========================================');

    // Generate posts from reviewed articles first
    const postsGenerated = await generatePostsFromArticles();
    if (postsGenerated > 0) {
      console.log(`[SOCIAL] Generated ${postsGenerated} new posts from articles`);
    }

    const platforms = ['twitter', 'instagram', 'linkedin', 'telegram', 'discord'];

    for (const platform of platforms) {
      try {
        const pendingPosts = await getPendingPosts(platform, 3);
        console.log(`[SOCIAL] Found ${pendingPosts.length} pending posts for ${platform}`);

        for (const post of pendingPosts) {
          await postContent(post);
        }
      } catch (error) {
        console.error(`[SOCIAL] ${platform} error:`, error.message);
        postalState.errors.push({ platform, error: error.message });
      }
    }

    const duration = Date.now() - startTime;

    console.log('[SOCIAL] ========================================');
    console.log(`[SOCIAL] Posts published: ${postalState.postsPublished}`);
    Object.entries(postalState.platformStats).forEach(([p, c]) => {
      console.log(`[SOCIAL]   ${p}: ${c}`);
    });
    console.log(`[SOCIAL] Duration: ${duration}ms`);
    console.log(`[SOCIAL] Errors: ${postalState.errors.length}`);
    console.log('[SOCIAL] ========================================');

    postalState.lastRun = new Date();
  } catch (error) {
    console.error('[SOCIAL] Fatal error:', error);
  } finally {
    postalState.isRunning = false;
  }
}

/**
 * Initialize and start
 */
async function start() {
  console.log('[SOCIAL] Social Media Posting Agent starting...');

  try {
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('[SOCIAL] Database connected:', testResult.rows[0].now);

    console.log('[SOCIAL] Running initial posting cycle...');
    await runPostingCycle();

    const POSTING_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

    setInterval(async () => {
      await runPostingCycle();
    }, POSTING_INTERVAL);

    console.log('[SOCIAL] Agent ready - next posting in 2 hours');
  } catch (error) {
    console.error('[SOCIAL] Startup error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SOCIAL] Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[SOCIAL] Shutting down...');
  await pool.end();
  process.exit(0);
});

start();
