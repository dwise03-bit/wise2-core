/**
 * Content Review Agent
 * PM2-managed service that analyzes articles for relevance, sentiment, and implications
 * Runs every 30 minutes to review new articles from news-scraper
 */

const pg = require('pg');

// Initialize database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

// Agent state tracking
const reviewerState = {
  isRunning: false,
  lastRun: null,
  articlesReviewed: 0,
  articlesStored: 0,
  errors: [],
};

/**
 * Calculate relevance score based on keywords
 */
function calculateRelevanceScore(title, content, source) {
  const PRIMARY_KEYWORDS = [
    '2nd amendment',
    'second amendment',
    '2a',
    'gun rights',
    'right to bear arms',
    'firearms',
    'shall not be infringed',
  ];

  const SECONDARY_KEYWORDS = [
    'gun control',
    'gun violence',
    'gun regulations',
    'supreme court',
    'scotus',
    'atf',
    'armed',
    'firearm',
    'ammunition',
    'concealed carry',
  ];

  const TERTIARY_KEYWORDS = [
    'constitutional',
    'rights',
    'legislation',
    'congress',
    'senate',
    'bill',
    'law',
    'policy',
    'justice',
    'court',
  ];

  // LOCAL GREENSBORO CRIME KEYWORDS - Boost for local news
  const LOCAL_KEYWORDS = [
    'greensboro',
    'triad',
    'guilford county',
    'high point',
    'jamestown nc',
  ];

  const LOCAL_CRIME_KEYWORDS = [
    'armed robbery',
    'shooting',
    'assault',
    'crime',
    'incident',
    'arrest',
    'suspect',
    'police',
    'officer',
    'gpd',
  ];

  let score = 0;
  const fullText = `${title} ${content}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // PRIMARY keywords: +0.4 each
  PRIMARY_KEYWORDS.forEach((kw) => {
    if (fullText.includes(kw)) score += 0.4;
  });

  // SECONDARY keywords: +0.2 each
  SECONDARY_KEYWORDS.forEach((kw) => {
    if (fullText.includes(kw)) score += 0.2;
  });

  // TERTIARY keywords: +0.05 each
  TERTIARY_KEYWORDS.forEach((kw) => {
    if (fullText.includes(kw)) score += 0.05;
  });

  // LOCAL GREENSBORO + CRIME COMBINATION: +0.5 (high priority for local incidents!)
  const hasLocalKeyword = LOCAL_KEYWORDS.some((kw) => fullText.includes(kw));
  const hasLocalCrimeKeyword = LOCAL_CRIME_KEYWORDS.some((kw) => fullText.includes(kw));

  if (hasLocalKeyword && hasLocalCrimeKeyword) {
    score += 0.5;
    console.log(`[REVIEWER] 🚨 LOCAL CRIME BOOST: ${titleLower.substring(0, 50)}`);
  }

  // LOCAL ONLY (non-crime): +0.2
  if (hasLocalKeyword && !hasLocalCrimeKeyword) {
    score += 0.2;
  }

  // Title bonus
  if (PRIMARY_KEYWORDS.some((kw) => titleLower.includes(kw))) {
    score += 0.15;
  }

  // Title bonus for local crime
  if (hasLocalKeyword && hasLocalCrimeKeyword) {
    score += 0.15;
  }

  // Clamp to 0-1
  score = Math.min(1.0, score);

  // Source credibility boost
  if (source) {
    const credibleSources = ['reuters', 'ap news', 'npr', 'politico', 'nytimes', 'washingtonpost', 'wfmy', 'wxii', 'greensboro'];
    if (credibleSources.some((s) => source.toLowerCase().includes(s))) {
      score = Math.min(1.0, score + 0.1);
    }
  }

  return parseFloat(score.toFixed(2));
}

/**
 * Analyze sentiment of article
 */
function analyzeSentiment(title, content) {
  const POSITIVE_KEYWORDS = [
    'right',
    'rights',
    'freedom',
    'liberty',
    'constitutional',
    'protection',
    'defend',
    'defense',
    'victory',
    'wins',
    'success',
    'upholds',
    'affirms',
    'supports',
  ];

  const NEGATIVE_KEYWORDS = [
    'ban',
    'restriction',
    'control',
    'violence',
    'deaths',
    'tragedy',
    'dangerous',
    'threat',
    'prohibited',
    'illegal',
    'unconstitutional',
  ];

  const fullText = `${title} ${content}`.toLowerCase();
  const words = fullText.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (POSITIVE_KEYWORDS.some((kw) => word.includes(kw))) positiveCount++;
    if (NEGATIVE_KEYWORDS.some((kw) => word.includes(kw))) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  let sentiment = 'neutral';
  let score = 0;

  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    if (score > 0.2) {
      sentiment = 'positive';
    } else if (score < -0.2) {
      sentiment = 'negative';
    }
  }

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
  };
}

/**
 * Extract key points from article
 */
function extractKeyPoints(title, content, maxPoints = 5) {
  const points = [];

  // Title points
  if (/court|judge|ruling|decision/i.test(title)) {
    points.push('Court ruling or legal decision');
  }
  if (/law|legislation|bill|passed/i.test(title)) {
    points.push('New legislation or law change');
  }
  if (/supreme|scotus/i.test(title)) {
    points.push('Supreme Court involvement');
  }
  if (/2nd amendment|gun rights/i.test(title)) {
    points.push('Direct 2nd Amendment focus');
  }

  // Content sentences
  const sentences = content
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  const keywordPatterns = [
    /court|judge|ruling/i,
    /law|legislation|bill/i,
    /protection|defend|protect/i,
    /impact|effect|consequence/i,
  ];

  sentences.forEach((sentence) => {
    if (points.length < maxPoints) {
      let score = 0;
      keywordPatterns.forEach((pattern) => {
        if (pattern.test(sentence)) score++;
      });
      if (score > 0) {
        points.push(sentence.charAt(0).toUpperCase() + sentence.slice(1));
      }
    }
  });

  return points.slice(0, maxPoints);
}

/**
 * Extract implications
 */
function extractImplications(title, content, sentiment) {
  const implications = [];

  if (/ban|restriction|prohibited/i.test(content)) {
    if (sentiment === 'negative') {
      implications.push('May restrict firearm rights - potential advocacy opportunity');
    } else {
      implications.push('Ban or restriction being challenged');
    }
  }

  if (/court.*struck|overturned|unconstitutional/i.test(content)) {
    implications.push('Favorable court ruling for 2nd Amendment');
  }

  if (/supremes|supreme court/i.test(content)) {
    implications.push('Could set national precedent');
  }

  if (/congress|senate|house|bill/i.test(content)) {
    implications.push('Federal legislative action');
  }

  if (!implications.length) {
    implications.push('Article provides context on 2nd Amendment issues');
  }

  return implications.slice(0, 3);
}

/**
 * Review single article
 */
async function reviewArticle(articleId, article) {
  try {
    const relevanceScore = calculateRelevanceScore(article.title, article.content, article.source_name);
    const sentimentResult = analyzeSentiment(article.title, article.content);
    const keyPoints = extractKeyPoints(article.title, article.content);
    const implications = extractImplications(article.title, article.content, sentimentResult.sentiment);

    const recommendedForSocial = relevanceScore >= 0.6 && sentimentResult.score !== 0;

    // Priority assignment: local Greensboro crime gets high priority at lower score threshold
    let priorityLevel = 'low';
    const isLocalGreensboroNews = (
      (article.title.toLowerCase().includes('greensboro') ||
       article.title.toLowerCase().includes('triad') ||
       article.title.toLowerCase().includes('guilford')) &&
      (article.title.toLowerCase().includes('crime') ||
       article.title.toLowerCase().includes('arrest') ||
       article.title.toLowerCase().includes('police') ||
       article.title.toLowerCase().includes('armed') ||
       article.title.toLowerCase().includes('assault'))
    );

    if (isLocalGreensboroNews && relevanceScore >= 0.65) {
      priorityLevel = 'high';
    } else if (relevanceScore >= 0.8) {
      priorityLevel = 'high';
    } else if (relevanceScore >= 0.6) {
      priorityLevel = 'medium';
    }

    const summary = `${article.title}. ${article.content.substring(0, 200)}...`;

    // Store review
    const result = await pool.query(
      `INSERT INTO content_reviews (
        article_id, relevance_score, sentiment,
        key_points, implications, ai_summary, recommended_for_social, priority_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (article_id) DO UPDATE SET
        relevance_score = EXCLUDED.relevance_score,
        sentiment = EXCLUDED.sentiment,
        key_points = EXCLUDED.key_points,
        implications = EXCLUDED.implications,
        ai_summary = EXCLUDED.ai_summary,
        recommended_for_social = EXCLUDED.recommended_for_social,
        priority_level = EXCLUDED.priority_level,
        reviewed_at = NOW()
      RETURNING id`,
      [
        articleId,
        relevanceScore,
        sentimentResult.sentiment,
        JSON.stringify(keyPoints),
        JSON.stringify(implications),
        summary,
        recommendedForSocial,
        priorityLevel,
      ]
    );

    if (result.rows.length > 0) {
      // Mark article as processed
      await pool.query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);

      reviewerState.articlesStored++;

      return {
        articleId,
        relevanceScore,
        sentiment: sentimentResult.sentiment,
        priority: priorityLevel,
        recommended: recommendedForSocial,
      };
    }
  } catch (error) {
    console.error('[REVIEWER] Error reviewing article:', error.message);
    reviewerState.errors.push({
      articleId,
      error: error.message,
      timestamp: new Date(),
    });
  }

  return null;
}

/**
 * Run review cycle
 */
async function runReviewCycle() {
  if (reviewerState.isRunning) {
    console.log('[REVIEWER] Cycle already running, skipping');
    return;
  }

  reviewerState.isRunning = true;
  reviewerState.articlesReviewed = 0;
  reviewerState.articlesStored = 0;
  reviewerState.errors = [];

  const startTime = Date.now();

  try {
    console.log('[REVIEWER] ========================================');
    console.log('[REVIEWER] Starting content review cycle');
    console.log('[REVIEWER] ========================================');

    // Find unreviewed articles
    const result = await pool.query(
      `SELECT id, title, content, source_name FROM news_articles
       WHERE id NOT IN (SELECT article_id FROM content_reviews)
       AND is_processed = false
       ORDER BY created_at DESC
       LIMIT 50`
    );

    const articles = result.rows;
    console.log(`[REVIEWER] Found ${articles.length} articles to review`);

    for (const article of articles) {
      reviewerState.articlesReviewed++;
      const review = await reviewArticle(article.id, article);

      if (review) {
        console.log(
          `[REVIEWER] ✅ Reviewed: ${article.title.substring(0, 60)}... (${review.relevanceScore} relevance, ${review.priority} priority)`
        );
      }
    }

    const duration = Date.now() - startTime;

    console.log('[REVIEWER] ========================================');
    console.log('[REVIEWER] Review cycle complete');
    console.log(`[REVIEWER] Articles reviewed: ${reviewerState.articlesReviewed}`);
    console.log(`[REVIEWER] Reviews stored: ${reviewerState.articlesStored}`);
    console.log(`[REVIEWER] Duration: ${duration}ms`);
    console.log(`[REVIEWER] Errors: ${reviewerState.errors.length}`);
    console.log('[REVIEWER] ========================================');

    reviewerState.lastRun = new Date();
  } catch (error) {
    console.error('[REVIEWER] Fatal error in review cycle:', error);
    reviewerState.errors.push({
      source: 'System',
      error: error.message,
      timestamp: new Date(),
    });
  } finally {
    reviewerState.isRunning = false;
  }
}

/**
 * Initialize and start reviewer
 */
async function start() {
  console.log('[REVIEWER] Content Review Agent starting...');

  try {
    // Test database connection
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('[REVIEWER] Database connected:', testResult.rows[0].now);

    // Run initial review cycle
    console.log('[REVIEWER] Running initial review cycle...');
    await runReviewCycle();

    // Schedule recurring cycles every 30 minutes
    const REVIEW_INTERVAL = 30 * 60 * 1000; // 30 minutes

    setInterval(async () => {
      console.log('[REVIEWER] Starting scheduled review cycle...');
      await runReviewCycle();
    }, REVIEW_INTERVAL);

    console.log('[REVIEWER] Content Review Agent ready');
    console.log(`[REVIEWER] Next review scheduled in 30 minutes`);
  } catch (error) {
    console.error('[REVIEWER] Fatal startup error:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('[REVIEWER] Received SIGTERM, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[REVIEWER] Received SIGINT, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the agent
start();
