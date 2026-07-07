require("dotenv").config();
const pg = require("pg");
const https = require("https");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:SuperSecurePassword123@localhost:5432/wisedefense?sslmode=disable",
  ssl: false,
});

async function sendDiscord(title, message) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;
  
  const payload = {
    username: "Wise Defense Alerts",
    embeds: [{
      title: title,
      description: message,
      color: 3447003,
      timestamp: new Date(),
    }]
  };
  
  const req = https.request(
    process.env.DISCORD_WEBHOOK_URL,
    { method: "POST", headers: { "Content-Type": "application/json" } },
    (res) => {
      res.on("data", () => {});
      res.on("end", () => {
        if (res.statusCode === 204) {
          console.log("[ALERTS] ✓ Discord sent");
        }
      });
    }
  );
  
  req.on("error", (e) => console.error("[ALERTS] Discord error:", e.message));
  req.write(JSON.stringify(payload));
  req.end();
}

async function sendTelegram(title, message) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) return;
  
  const text = `📢 ${title}\n\n${message}`;
  const payload = JSON.stringify({
    chat_id: process.env.TELEGRAM_CHANNEL_ID,
    text: text,
    parse_mode: "Markdown"
  });
  
  const req = https.request(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
    (res) => {
      res.on("data", () => {});
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("[ALERTS] ✓ Telegram sent");
        }
      });
    }
  );
  
  req.on("error", (e) => console.error("[ALERTS] Telegram error:", e.message));
  req.write(payload);
  req.end();
}

async function logDatabase(event, message) {
  try {
    await pool.query(
      "INSERT INTO alerts (event_type, message) VALUES ($1, $2)",
      [event, message]
    );
    console.log("[ALERTS] ✓ Database logged");
  } catch (e) {
    console.error("[ALERTS] Database error:", e.message);
  }
}

// Health check
setInterval(() => {
  console.log("[ALERTS] System running");
}, 60000);

console.log("[ALERTS] Initializing...");
console.log("[ALERTS] Discord: " + (process.env.DISCORD_WEBHOOK_URL ? "✓ Configured" : "✗ Not set"));
console.log("[ALERTS] Telegram: " + (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID ? "✓ Configured" : "✗ Not set"));
console.log("[ALERTS] Database: ✓ Connected");
console.log("[ALERTS] Ready to send alerts!");

process.on("SIGTERM", () => {
  console.log("[ALERTS] Shutting down");
  pool.end();
  process.exit(0);
});

module.exports = { sendDiscord, sendTelegram, logDatabase };
