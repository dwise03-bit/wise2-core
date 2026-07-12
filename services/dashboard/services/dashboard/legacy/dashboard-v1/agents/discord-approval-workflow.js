/**
 * Discord Article Approval Workflow
 * Posts pending articles to Discord for human approval via reactions
 * ✅ to approve, ❌ to reject
 */

const pg = require('pg');
const axios = require('axios');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const DISCORD_WEBHOOK = process.env.DISCORD_NEWS_WEBHOOK_URL;
const APPROVAL_CHANNEL_ID = process.env.DISCORD_APPROVAL_CHANNEL_ID;

const approvalState = {
  isRunning: false,
  lastRun: null,
  articlesPosted: 0,
  errors: [],
};

/**
 * Post pending article to Discord for approval
 */
async function postArticleForApproval(article) {
  try {
    if (!DISCORD_WEBHOOK) {
      console.log('[APPROVAL] Discord webhook not configured');
      return null;
    }

    const embed = {
      title: article.title,
      description: article.content.substring(0, 300) + '...',
      url: article.source_url,
      color: 16711680, // Red
      fields: [
        {
          name: 'Source',
          value: article.source_name,
          inline: true,
        },
        {
          name: 'Article ID',
          value: `${article.id}`,
          inline: true,
        },
        {
          name: 'Instructions',
          value: '✅ = Approve for social media\n❌ = Reject',
          inline: false,
        },
      ],
      footer: {
        text: `Article ID: ${article.id}`,
      },
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(DISCORD_WEBHOOK, {
      content: '📰 **New Article Pending Approval**',
      embeds: [embed],
    });

    // Store message ID for reaction tracking
    const messageData = response.data;
    if (messageData.id) {
      await pool.query(
        `UPDATE news_articles SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{discord_message_id}', to_jsonb($1::text))
         WHERE id = $2`,
        [messageData.id, article.id]
      );
    }

    return messageData;
  } catch (error) {
    console.error('[APPROVAL] Error posting article:', error.message);
    return null;
  }
}

/**
 * Get pending articles
 */
async function getPendingArticles() {
  try {
    const result = await pool.query(
      `SELECT id, title, content, source_name, source_url, created_at
       FROM news_articles
       WHERE is_processed = false
       AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 5`
    );
    return result.rows;
  } catch (error) {
    console.error('[APPROVAL] Error fetching pending articles:', error.message);
    return [];
  }
}

/**
 * Approve article (mark for social media)
 */
async function approveArticle(articleId) {
  try {
    // Mark as processed
    await pool.query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);

    // Create high-priority review
    await pool.query(
      `INSERT INTO content_reviews (article_id, relevance_score, sentiment, priority_level, recommended_for_social)
       VALUES ($1, 0.9, 'positive', 'high', true)
       ON CONFLICT (article_id) DO UPDATE SET
         priority_level = 'high',
         recommended_for_social = true`,
      [articleId]
    );

    console.log(`[APPROVAL] ✅ Article ${articleId} approved for social media`);
    return true;
  } catch (error) {
    console.error('[APPROVAL] Error approving article:', error.message);
    return false;
  }
}

/**
 * Reject article
 */
async function rejectArticle(articleId) {
  try {
    await pool.query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);
    console.log(`[APPROVAL] ❌ Article ${articleId} rejected`);
    return true;
  } catch (error) {
    console.error('[APPROVAL] Error rejecting article:', error.message);
    return false;
  }
}

/**
 * Run approval cycle
 */
async function runApprovalCycle() {
  if (approvalState.isRunning) return;
  approvalState.isRunning = true;
  approvalState.errors = [];

  const startTime = Date.now();

  try {
    console.log('[APPROVAL] ========================================');
    console.log('[APPROVAL] Starting approval workflow cycle');
    console.log('[APPROVAL] ========================================');

    const pending = await getPendingArticles();
    console.log(`[APPROVAL] Found ${pending.length} pending articles`);

    for (const article of pending) {
      await postArticleForApproval(article);
      approvalState.articlesPosted++;
    }

    const duration = Date.now() - startTime;

    console.log('[APPROVAL] ========================================');
    console.log(`[APPROVAL] Articles posted: ${approvalState.articlesPosted}`);
    console.log(`[APPROVAL] Duration: ${duration}ms`);
    console.log(`[APPROVAL] Errors: ${approvalState.errors.length}`);
    console.log('[APPROVAL] ========================================');

    approvalState.lastRun = new Date();
  } catch (error) {
    console.error('[APPROVAL] Fatal error:', error);
  } finally {
    approvalState.isRunning = false;
  }
}

/**
 * Initialize and start
 */
async function start() {
  console.log('[APPROVAL] Discord Approval Workflow starting...');

  try {
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('[APPROVAL] Database connected:', testResult.rows[0].now);

    console.log('[APPROVAL] Running initial approval cycle...');
    await runApprovalCycle();

    const APPROVAL_INTERVAL = 30 * 60 * 1000; // 30 minutes

    setInterval(async () => {
      await runApprovalCycle();
    }, APPROVAL_INTERVAL);

    console.log('[APPROVAL] Workflow ready - checking for pending articles every 30 minutes');
  } catch (error) {
    console.error('[APPROVAL] Startup error:', error);
    process.exit(1);
  }
}

// API endpoints for manual approval
async function handleDiscordReaction(articleId, reaction) {
  if (reaction === '✅') {
    await approveArticle(articleId);
  } else if (reaction === '❌') {
    await rejectArticle(articleId);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[APPROVAL] Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[APPROVAL] Shutting down...');
  await pool.end();
  process.exit(0);
});

// Export for API route
module.exports = {
  handleDiscordReaction,
  approveArticle,
  rejectArticle,
};

start();
