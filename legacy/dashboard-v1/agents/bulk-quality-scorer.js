// Bulk Quality Scorer — scores all unscored articles in batches
// Run once manually or via PM2 (exits when done)

require("dotenv").config();
const pg = require("pg");
const QualityScorer = require("../lib/quality-scorer");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
const scorer = new QualityScorer();

const BATCH = 5; // concurrent Ollama calls

async function scoreBatch(articles) {
  return Promise.all(
    articles.map(async (article) => {
      try {
        const scores = await scorer.scoreContent(article.content, article.title);
        const avg = Math.round(
          (scores.relevance + scores.credibility + scores.engagement +
           scores.brandAlignment + scores.factCheck + scores.uniqueness) / 6
        );
        const passes = avg >= 68;

        await pool.query(
          `INSERT INTO quality_scores
             (article_id, gate_number, relevance_score, credibility_score, engagement_score,
              brand_alignment_score, fact_check_score, uniqueness_score, average_score, meets_threshold, created_at)
           VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
           ON CONFLICT (article_id, gate_number) DO UPDATE
             SET average_score = EXCLUDED.average_score,
                 meets_threshold = EXCLUDED.meets_threshold,
                 updated_at = NOW()`,
          [article.id, scores.relevance, scores.credibility, scores.engagement,
           scores.brandAlignment, scores.factCheck, scores.uniqueness, avg, passes]
        );

        await pool.query(
          `UPDATE news_articles SET current_quality_score=$1, is_filtered=$2 WHERE id=$3`,
          [avg, !passes, article.id]
        );

        const mark = passes ? "✅" : "❌";
        console.log(`  ${mark} #${article.id} "${article.title.substring(0, 50)}" → ${avg}/100`);
        return { id: article.id, avg, passes };
      } catch (err) {
        console.error(`  ⚠️  #${article.id} failed: ${err.message}`);
        return null;
      }
    })
  );
}

async function run() {
  const { rows: total } = await pool.query(
    `SELECT COUNT(*) FROM news_articles WHERE current_quality_score IS NULL AND LENGTH(content) > 50`
  );
  const count = parseInt(total[0].count);
  console.log(`\n🎯 Bulk Quality Scorer`);
  console.log(`   ${count} unscored articles to process\n`);

  let offset = 0;
  let passed = 0, failed = 0;

  while (offset < count) {
    const { rows } = await pool.query(
      `SELECT id, title, content FROM news_articles
       WHERE current_quality_score IS NULL AND LENGTH(content) > 50
       ORDER BY id DESC LIMIT $1`,
      [BATCH]
    );
    if (rows.length === 0) break;

    console.log(`Batch ${Math.floor(offset / BATCH) + 1} (articles ${offset + 1}–${offset + rows.length}):`);
    const results = await scoreBatch(rows);
    results.forEach(r => { if (r) { r.passes ? passed++ : failed++; } });
    offset += rows.length;
  }

  console.log(`\n════════════════════════════════`);
  console.log(`✅ Passed: ${passed}  ❌ Failed: ${failed}`);
  console.log(`Total scored: ${passed + failed}/${count}`);
  console.log(`════════════════════════════════\n`);

  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
