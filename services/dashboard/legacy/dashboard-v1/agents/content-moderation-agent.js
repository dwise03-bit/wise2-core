const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function moderateContent() {
  try {
    const pending = await pool.query("SELECT COUNT(*) as count FROM news_articles WHERE is_processed = false");
    console.log(\`[MODERATION] Pending review: \${pending.rows[0].count}\`);
  } catch (error) {
    console.error("[MODERATION] Error:", error.message);
  }
}

setInterval(moderateContent, 900000); // Every 15 min
moderateContent();

process.on("SIGTERM", () => pool.end());
