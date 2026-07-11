const express = require("express");
const { execSync } = require("child_process");

const app = express();
app.use(express.json());

const SECRET = process.env.DEPLOY_SECRET || "change-me";

function run(cmd) {
  console.log(`[RUN] ${cmd}`);
  return execSync(cmd, { stdio: "inherit" });
}

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "deploy-v6" });
});

// WEBHOOK DEPLOY ENDPOINT
app.post("/deploy", async (req, res) => {
  try {
    if (req.headers["x-secret"] !== SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("🚀 GitHub deploy triggered");

    run("cd .. && git pull origin main");

    // trigger V5 engine
    run("node ../deploy/engine.js");

    res.json({ status: "deploy started" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "deploy failed" });
  }
});

app.listen(4000, () => {
  console.log("Deploy V6 running on port 4000");
});
