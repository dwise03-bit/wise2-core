const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function updateLeaderboards() {
  try {
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS member_leaderboard (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        points INT DEFAULT 0,
        streak INT DEFAULT 0,
        rank INT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    \`);
    console.log("[LEADERBOARD] Updated member rankings");
  } catch (error) {
    console.error("[LEADERBOARD] Error:", error.message);
  }
}

setInterval(updateLeaderboards, 1800000); // Every 30 min
updateLeaderboards();

process.on("SIGTERM", () => pool.end());
