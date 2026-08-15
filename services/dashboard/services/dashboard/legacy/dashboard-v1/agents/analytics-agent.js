/**
 * Analytics Agent
 * Generates real-time analytics and reports
 */
const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function generateAnalytics() {
  try {
    const result = await pool.query(\`
      SELECT 
        (SELECT COUNT(*) FROM news_articles) as total_articles,
        (SELECT COUNT(*) FROM content_reviews) as reviewed,
        (SELECT COUNT(*) FROM social_posts_generated WHERE status = 'posted') as posted_posts,
        (SELECT COUNT(*) FROM youtube_videos) as videos
    \`);
    
    console.log("[ANALYTICS] Generated report:", result.rows[0]);
  } catch (error) {
    console.error("[ANALYTICS] Error:", error.message);
  }
}

setInterval(generateAnalytics, 3600000); // Every hour
generateAnalytics();

process.on("SIGTERM", () => pool.end());
