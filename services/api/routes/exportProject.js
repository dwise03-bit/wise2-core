const express = require("express");
const fs = require("fs");
const os = require("os");

const router = express.Router();

router.get("/admin/export-project", async (req, res) => {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const content = `
# Wise Defense SaaS

Generated: ${new Date().toISOString()}

## Server

Hostname: ${os.hostname()}
Platform: ${os.platform()}
CPU Cores: ${os.cpus().length}
Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB

## Services

- API
- Dashboard
- PostgreSQL
- Redis
- Worker
- Discord Bot
- Ollama

## Current Goal

Production-grade SaaS infrastructure

## Roadmap

1. Deployment Automation
2. Control Plane
3. Worker Automation
4. Scaling
5. Monetization
`;

  fs.writeFileSync("/app/docs/AI_CONTEXT.md", content);

  res.json({
    success: true,
    file: "AI_CONTEXT.md"
  });
});

module.exports = router;
