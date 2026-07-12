const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

async function healthCheck() {
  try {
    const res = await fetch("http://localhost:3000/health");
    return res.ok;
  } catch {
    return false;
  }
}

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "v10",
    uptime: process.uptime(),
    mode: "zero-click"
  });
});

/* =========================
   GITHUB WEBHOOK (V10 CORE)
========================= */
app.post("/webhook/github", async (req, res) => {
  try {
    console.log("📦 GitHub push detected → auto deploy starting");

    await run("cd ~/wise-defense-saas && git pull origin main");
    await run("cd ~/wise-defense-saas && docker compose build");
    await run("cd ~/wise-defense-saas && docker compose up -d");

    await new Promise(r => setTimeout(r, 8000));

    const ok = await healthCheck();

    if (!ok) {
      console.log("❌ HEALTH FAILED → ROLLBACK");
      await run("cd ~/wise-defense-saas && docker compose restart");
      return res.status(500).json({ status: "rollback" });
    }

    res.json({ status: "auto-deploy-success" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "deploy failed" });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(4000, () => {
  console.log("🚀 V10 Zero-Click CI/CD Engine running on port 4000");
});
