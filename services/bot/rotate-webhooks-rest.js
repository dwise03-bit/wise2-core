#!/usr/bin/env node
/**
 * Rotate Discord webhooks via REST API (no gateway session required).
 * Usage: node rotate-webhooks-rest.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const CHANNELS = [
  "deployments",
  "alerts",
  "builds",
  "decisions",
  "daily-sync",
  "status",
];

const WEBHOOK_NAME = "WISE² Bot";
const API = "https://discord.com/api/v10";

async function api(pathname, options = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${pathname}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function main() {
  if (!BOT_TOKEN || !GUILD_ID) {
    console.error("DISCORD_BOT_TOKEN and DISCORD_GUILD_ID required in .env");
    process.exit(1);
  }

  const channels = await api(`/guilds/${GUILD_ID}/channels`);
  const textByName = Object.fromEntries(
    channels.filter((c) => c.type === 0).map((c) => [c.name, c.id])
  );

  const webhooks = {};
  let ok = 0;
  let failed = 0;

  for (const name of CHANNELS) {
    try {
      const channelId = textByName[name];
      if (!channelId) {
        throw new Error(`channel #${name} not found`);
      }

      const existing = await api(`/channels/${channelId}/webhooks`);
      for (const wh of existing.filter((w) => w.name === WEBHOOK_NAME)) {
        await api(`/webhooks/${wh.id}`, { method: "DELETE" });
        console.log(`deleted #${name}`);
      }

      const created = await api(`/channels/${channelId}/webhooks`, {
        method: "POST",
        body: JSON.stringify({ name: WEBHOOK_NAME }),
      });

      webhooks[name] = `https://discord.com/api/webhooks/${created.id}/${created.token}`;
      console.log(`created #${name}`);
      ok++;
    } catch (err) {
      console.error(`failed #${name}: ${err.message}`);
      failed++;
    }
  }

  const envContent = `# Rotated webhooks (gitignored)
DISCORD_WEBHOOK_DEPLOYMENTS=${webhooks.deployments || ""}
DISCORD_WEBHOOK_ALERTS=${webhooks.alerts || ""}
DISCORD_WEBHOOK_BUILDS=${webhooks.builds || ""}
DISCORD_WEBHOOK_DECISIONS=${webhooks.decisions || ""}
DISCORD_WEBHOOK_DAILY_SYNC=${webhooks["daily-sync"] || ""}
DISCORD_WEBHOOK_STATUS=${webhooks.status || ""}
`;

  fs.writeFileSync(path.join(__dirname, ".env.webhooks"), envContent);
  console.log(`saved .env.webhooks (${ok} ok, ${failed} failed)`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
