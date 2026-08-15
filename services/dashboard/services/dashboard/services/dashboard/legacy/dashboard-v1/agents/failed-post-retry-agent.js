const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function retryFailedPosts() {
  try {
    const failed = await pool.query("SELECT * FROM social_posts_generated WHERE status = 'failed' LIMIT 5");
    console.log(\`[RETRY] Found \${failed.rows.length} failed posts\`);
    
    for (const post of failed.rows) {
      await pool.query("UPDATE social_posts_generated SET status = 'pending' WHERE id = \$1", [post.id]);
    }
  } catch (error) {
    console.error("[RETRY] Error:", error.message);
  }
}

setInterval(retryFailedPosts, 600000); // Every 10 min
retryFailedPosts();

process.on("SIGTERM", () => pool.end());
