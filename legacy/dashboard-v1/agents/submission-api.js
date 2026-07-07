/**
 * Simple HTTP API for content submission
 * Allows easy testing without Discord
 * Runs on port 4000
 */

const http = require('http');
const pg = require('pg');
const url = require('url');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

async function handleSubmit(title, content, source, videoUrl) {
  try {
    const result = await pool.query(
      `INSERT INTO news_articles (title, content, source_name, source_url, is_processed)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id`,
      [title, content, source || 'API Submission', videoUrl || 'api://submission']
    );

    const articleId = result.rows[0].id;

    // Auto-approve for testing
    await pool.query(
      `INSERT INTO content_reviews (article_id, relevance_score, sentiment, priority_level, recommended_for_social)
       VALUES ($1, 0.95, 'positive', 'high', true)`,
      [articleId]
    );

    return { success: true, articleId, message: 'Article created and approved' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const result = await handleSubmit(data.title, data.content, data.source, data.url);
        res.writeHead(result.success ? 200 : 400);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
  } else if (req.url === '/status' && req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as total,
                SUM(CASE WHEN is_processed THEN 1 ELSE 0 END) as approved
         FROM news_articles`
      );
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'API ready',
        articles: result.rows[0],
        endpoints: {
          'POST /submit': 'Submit article (title, content, source, url)',
          'GET /status': 'Check system status'
        }
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Wise Defense Submission API',
      usage: 'POST to /submit with {title, content, source, url}',
      example: `curl -X POST http://localhost:4000/submit -H "Content-Type: application/json" -d '{"title":"Breaking 2A News","content":"Court ruling...","source":"News","url":"https://..."}'`
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`[SUBMISSION-API] Server running on http://localhost:${PORT}`);
  console.log(`[SUBMISSION-API] POST /submit to create articles`);
  console.log(`[SUBMISSION-API] GET /status to check system`);
});

process.on('SIGTERM', async () => {
  console.log('[SUBMISSION-API] Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[SUBMISSION-API] Shutting down...');
  await pool.end();
  process.exit(0);
});
