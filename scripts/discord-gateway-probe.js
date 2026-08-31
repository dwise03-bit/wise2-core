#!/usr/bin/env node
/**
 * Single Discord gateway probe — do not poll in a loop (each login uses a session).
 * Prints READY on success, RESET_AT=<iso> when rate-limited, FAIL=<msg> otherwise.
 */
const path = require("path");
const { createRequire } = require("module");

const botDir = path.join(__dirname, "../services/bot");
const botRequire = createRequire(path.join(botDir, "package.json"));
botRequire("./load-env");
const { Client, GatewayIntentBits } = botRequire("discord.js");

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.log("FAIL=DISCORD_BOT_TOKEN missing");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client
  .login(token)
  .then(async () => {
    console.log("READY");
    await client.destroy();
    process.exit(0);
  })
  .catch((error) => {
    const msg = String(error.message || error);
    const reset = msg.match(/resets at ([0-9TZ.:-]+)/i);
    if (reset) console.log(`RESET_AT=${reset[1]}`);
    console.log(`FAIL=${msg}`);
    process.exit(1);
  });
