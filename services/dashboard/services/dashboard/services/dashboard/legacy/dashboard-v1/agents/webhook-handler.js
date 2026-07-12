const http = require("http");
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        await pool.query(
          "INSERT INTO news_articles (title, content, source_name, source_url) VALUES (\$1, \$2, \$3, \$4)",
          [data.title, data.content, "Webhook", data.url || "webhook://api"]
        );
        res.writeHead(200);
        res.end("Submitted");
        console.log("[WEBHOOK] Submission received");
      } catch (error) {
        res.writeHead(400);
        res.end("Error");
        console.error("[WEBHOOK] Error:", error.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3002, () => console.log("[WEBHOOK] Server on :3002"));
process.on("SIGTERM", () => { server.close(); pool.end(); });
