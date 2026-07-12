require("dotenv").config();
const pg = require("pg");
const QualityScorer = require("../lib/quality-scorer");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const scorer = new QualityScorer();

async function scoreArticles() {
  try {
    const articles = await pool.query(
      `SELECT id, title, content FROM news_articles
       WHERE is_filtered IS NULL AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 50`
    );

    for (const article of articles.rows) {
      try {
        const scores = await scorer.scoreContent(article.content, 1);

        await pool.query(
          `INSERT INTO quality_scores
           (article_id, gate_number, relevance_score, credibility_score, engagement_score,
            brand_alignment_score, fact_check_score, uniqueness_score, average_score, meets_threshold)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (article_id, gate_number) DO UPDATE SET
             average_score = $9, meets_threshold = $10, updated_at = NOW()`,
          [
            article.id,
            1,
            scores.relevance,
            scores.credibility,
            scores.engagement,
            scores.brandAlignment,
            scores.factCheck,
            scores.uniqueness,
            scores.averageScore,
            scores.meetsThreshold,
          ]
        );

        await pool.query(
          `UPDATE news_articles
           SET is_filtered = $1, filter_reason = $2, current_quality_score = $3
           WHERE id = $4`,
          [!scores.meetsThreshold, scores.meetsThreshold ? null : "Below quality threshold", scores.averageScore, article.id]
        );

        console.log(`[QUALITY] Article #${article.id}: ${scores.meetsThreshold ? "PASS" : "FAIL"} (${scores.averageScore})`);
      } catch (error) {
        console.error(`[QUALITY] Article #${article.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("[QUALITY] Error:", error.message);
  }
}

setInterval(scoreArticles, 3600000); // Every hour
scoreArticles();

process.on("SIGTERM", () => {
  console.log("[QUALITY] Shutting down");
  pool.end();
  process.exit(0);
});
