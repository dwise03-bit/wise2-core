#!/usr/bin/env node
/**
 * WISE² Discord Bot - Automated Webhook Creator
 * Creates webhooks in all bot channels and saves URLs to .env.webhooks
 */

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const CHANNELS_TO_CREATE = [
  "deployments",
  "alerts",
  "builds",
  "decisions",
  "daily-sync",
  "status",
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildWebhooks],
});

async function createWebhooks() {
  try {
    await client.login(BOT_TOKEN);
    console.log("✅ Bot logged in");

    const guild = await client.guilds.fetch(GUILD_ID).catch(err => {
      console.log(`Guild ID: ${GUILD_ID}`);
      throw new Error(`Could not fetch guild: ${err.message}`);
    });
    console.log(`✅ Found guild: ${guild.name} (${guild.id})`);

    // Fetch all channels
    await guild.channels.fetch();
    console.log("\n📋 Available channels:");
    const textChannels = guild.channels.cache.filter((ch) => ch.type === 0);
    console.log(`Found ${textChannels.size} text channels`);
    textChannels.forEach((ch) => {
      console.log(`  • #${ch.name}`);
    });

    if (textChannels.size === 0) {
      console.log("❌ No text channels found!");
      console.log("Guild ID:", GUILD_ID);
      console.log("Bot is in these guilds:", client.guilds.cache.map(g => `${g.name}(${g.id})`).join(", "));
    }

    const webhooks = {};
    let created = 0;
    let failed = 0;

    for (const channelName of CHANNELS_TO_CREATE) {
      try {
        // Find or create channel
        let channel = guild.channels.cache.find(
          (ch) => ch.name === channelName && ch.type === 0
        );

        if (!channel) {
          console.log(`📌 Channel #${channelName} not found, creating...`);
          channel = await guild.channels.create({
            name: channelName,
            type: 0,
            reason: "WISE² Bot Setup",
          });
          console.log(`✅ Channel #${channelName} created`);
        }

        // Check if webhook already exists
        const existingWebhooks = await channel.fetchWebhooks();
        let webhook = existingWebhooks.find((wh) => wh.name === "WISE² Bot");

        if (webhook) {
          console.log(`📌 #${channelName}: Webhook exists (reusing)`);
          webhooks[channelName] = webhook.url;
          created++;
          continue;
        }

        // Create new webhook
        webhook = await channel.createWebhook({
          name: "WISE² Bot",
          reason: "WISE² Bot Automation",
        });

        console.log(`✅ #${channelName}: Webhook created`);
        webhooks[channelName] = webhook.url;
        created++;
      } catch (error) {
        console.log(`❌ #${channelName}: ${error.message}`);
        failed++;
        webhooks[channelName] = `ERROR: ${error.message}`;
      }
    }

    // Save webhooks to file
    const envContent = `# Generated webhooks (copy to .env)
DISCORD_WEBHOOK_DEPLOYMENTS=${webhooks.deployments || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_ALERTS=${webhooks.alerts || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_BUILDS=${webhooks.builds || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_DECISIONS=${webhooks.decisions || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_DAILY_SYNC=${webhooks["daily-sync"] || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_STATUS=${webhooks.status || "https://discord.com/api/webhooks/..."}
`;

    const envPath = path.join(__dirname, ".env.webhooks");
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Webhooks saved to .env.webhooks");

    console.log(`\n📊 Summary: ${created} created, ${failed} failed`);
    console.log("\n📝 Next steps:");
    console.log("1. cat services/bot/.env.webhooks");
    console.log("2. Copy the URLs to services/bot/.env");
    console.log("3. pm2 restart wise2-bot");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createWebhooks();
