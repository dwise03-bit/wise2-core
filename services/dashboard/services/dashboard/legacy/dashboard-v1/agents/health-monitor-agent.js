const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function checkHealth() {
  try {
    const health = await pool.query("SELECT NOW()");
    console.log("[HEALTH] ✓ System healthy at", health.rows[0].now);
  } catch (error) {
    console.error("[HEALTH] ✗ Health check failed:", error.message);
  }
}

setInterval(checkHealth, 300000); // Every 5 min
checkHealth();

process.on("SIGTERM", () => pool.end());
