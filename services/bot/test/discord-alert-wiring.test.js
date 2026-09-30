const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "../../..");

test("Compose passes the alerts webhook into the bot at runtime", () => {
  const compose = fs.readFileSync(path.join(repoRoot, "docker-compose.yml"), "utf8");
  const botService = compose.match(/\n  bot:\n([\s\S]*?)(?=\n  [a-zA-Z0-9_-]+:\n)/)?.[1] || "";

  assert.match(
    botService,
    /DISCORD_WEBHOOK_ALERTS:\s*\$\{DISCORD_WEBHOOK_ALERTS\}/,
  );
});

test("generated Discord webhook secrets are not tracked as source", () => {
  assert.equal(
    fs.existsSync(path.join(repoRoot, "services/bot/.env.webhooks")),
    false,
  );
});
