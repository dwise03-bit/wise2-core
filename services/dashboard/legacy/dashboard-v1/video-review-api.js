const http = require("http");
const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:SuperSecurePassword123@localhost:5432/wisedefense?sslmode=disable",
  ssl: false,
});

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === "/videos/pending" && req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT id, article_id, title, status, created_at FROM youtube_videos WHERE status = $1 ORDER BY created_at DESC",
        ["pending"]
      );
      res.writeHead(200);
      res.end(JSON.stringify({ videos: result.rows, count: result.rows.length }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  }
  else if (req.url === "/videos/all" && req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT id, article_id, title, status, youtube_url, created_at FROM youtube_videos ORDER BY created_at DESC"
      );
      res.writeHead(200);
      res.end(JSON.stringify({ videos: result.rows, total: result.rows.length }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  }
  else if (req.url.match(/^\/videos\/approve\/\d+$/) && req.method === "POST") {
    const videoId = req.url.split("/")[3];
    try {
      await pool.query("UPDATE youtube_videos SET status = $1 WHERE id = $2", ["approved", videoId]);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: "Video approved" }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  }
  else if (req.url.match(/^\/videos\/reject\/\d+$/) && req.method === "POST") {
    const videoId = req.url.split("/")[3];
    try {
      await pool.query("UPDATE youtube_videos SET status = $1 WHERE id = $2", ["rejected", videoId]);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: "Video rejected" }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  }
  else if (req.url === "/videos/stats" && req.method === "GET") {
    try {
      const result = await pool.query("SELECT status, COUNT(*) as count FROM youtube_videos GROUP BY status");
      res.writeHead(200);
      res.end(JSON.stringify({ stats: result.rows }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(3003, "0.0.0.0", () => {
  console.log("[VIDEO-REVIEW] API running on 0.0.0.0:3003");
});

process.on("SIGTERM", () => {
  pool.end();
  process.exit(0);
});
