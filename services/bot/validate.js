#!/usr/bin/env node
/**
 * Bot Configuration Validator
 *
 * Checks that all required environment variables and dependencies are configured.
 * Run this before starting the bot to catch configuration issues early.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const checks = [];

function check(name, condition, errorMsg) {
  checks.push({
    name,
    passed: condition,
    error: errorMsg,
  });
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  WISE² Discord Bot - Configuration Validator                  ║
╚════════════════════════════════════════════════════════════════╝
`);

// Environment Variables
console.log("Checking environment variables...");

check(
  "DISCORD_BOT_TOKEN",
  process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN.length > 10,
  "❌ Bot token missing or invalid"
);

check(
  "DISCORD_CLIENT_ID",
  process.env.DISCORD_CLIENT_ID && /^\d+$/.test(process.env.DISCORD_CLIENT_ID),
  "❌ Client ID missing or invalid (should be numeric)"
);

check(
  "DISCORD_CLIENT_SECRET",
  process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CLIENT_SECRET.length > 5,
  "❌ Client secret missing or invalid"
);

check(
  "DISCORD_GUILD_ID",
  process.env.DISCORD_GUILD_ID && /^\d+$/.test(process.env.DISCORD_GUILD_ID),
  "❌ Guild ID missing or invalid (should be numeric)"
);

// Webhooks
const requiredWebhooks = [
  "DEPLOYMENTS",
  "ALERTS",
  "BUILDS",
  "DECISIONS",
  "DAILY_SYNC",
  "STATUS",
];

requiredWebhooks.forEach((webhook) => {
  const envVar = `DISCORD_WEBHOOK_${webhook}`;
  const value = process.env[envVar];
  check(
    envVar,
    value && value.includes("discord.com/api/webhooks/"),
    `❌ Webhook ${webhook} missing or invalid`
  );
});

// Data Directory
console.log("Checking data directory...");

const dataDir = process.env.DATA_DIR || path.join(__dirname, "../../data");
const logsDir = path.join(dataDir, "daily-logs");
const decisionsDir = path.join(dataDir, "decisions");

check(
  "data/ directory",
  fs.existsSync(dataDir),
  `❌ Data directory not found at ${dataDir}`
);

check(
  "data/daily-logs/",
  fs.existsSync(logsDir),
  `❌ Daily logs directory not found at ${logsDir}`
);

check(
  "data/decisions/",
  fs.existsSync(decisionsDir),
  `❌ Decisions directory not found at ${decisionsDir}`
);

// Dependencies
console.log("Checking dependencies...");

const pkgPath = path.join(__dirname, "package.json");
check("package.json", fs.existsSync(pkgPath), "❌ package.json not found");

try {
  const pkg = require(pkgPath);
  check(
    "discord.js dependency",
    pkg.dependencies["discord.js"],
    "❌ discord.js not in dependencies"
  );
  check(
    "dotenv dependency",
    pkg.dependencies["dotenv"],
    "❌ dotenv not in dependencies"
  );
} catch (e) {
  check("package.json parse", false, `❌ Failed to parse package.json: ${e.message}`);
}

// Node modules
const nodeModulesPath = path.join(__dirname, "node_modules");
check(
  "node_modules installed",
  fs.existsSync(nodeModulesPath),
  "❌ Dependencies not installed. Run: npm install"
);

// Print Results
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Validation Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

const passed = checks.filter((c) => c.passed).length;
const total = checks.length;

checks.forEach((check) => {
  const icon = check.passed ? "✅" : "❌";
  console.log(`${icon} ${check.name.padEnd(30)} ${check.passed ? "OK" : check.error}`);
});

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: ${passed}/${total} checks passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

if (passed === total) {
  console.log("✅ All checks passed! Bot is ready to start.\n");
  console.log("Run: npm start\n");
  process.exit(0);
} else {
  const failed = checks.filter((c) => !c.passed);
  console.log(`❌ ${failed.length} check(s) failed.\n`);
  console.log("Failed checks:\n");
  failed.forEach((check) => {
    console.log(`  • ${check.error}`);
  });
  console.log(`
Resolution steps:
  1. Copy .env template: cp .env.example .env
  2. Run setup wizard: node setup.js
  3. Verify configuration: node validate.js
  4. Start bot: npm start
  `);
  process.exit(1);
}
