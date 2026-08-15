#!/usr/bin/env node
/**
 * WISE² Discord Bot - Direct API Webhook Creator
 * Uses Discord API directly to create webhooks (bypasses permission issues)
 */

require("dotenv").config();
const https = require("https");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const CHANNEL_NAMES = [
  "deployments",
  "alerts",
  "builds",
  "decisions",
  "daily-sync",
  "status",
];

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "discord.com",
      path: `/api/v10${path}`,
      method,
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function createWebhooks() {
  try {
    console.log("🔗 Using Discord API directly...\n");

    // Get all channels in guild
    const channelsRes = await makeRequest(
      "GET",
      `/guilds/${GUILD_ID}/channels`
    );

    if (channelsRes.status !== 200) {
      throw new Error(`Failed to fetch channels: ${channelsRes.status}`);
    }

    const channels = channelsRes.data.filter((ch) => ch.type === 0); // Text channels only
    console.log(`✅ Found ${channels.length} text channels\n`);

    const webhooks = {};
    let created = 0;
    let failed = 0;

    for (const channelName of CHANNEL_NAMES) {
      let channel = channels.find((ch) => ch.name === channelName);

      // Create channel if it doesn't exist
      if (!channel) {
        console.log(`📌 #${channelName}: Creating channel...`);
        const createRes = await makeRequest(
          "POST",
          `/guilds/${GUILD_ID}/channels`,
          {
            name: channelName,
            type: 0, // Text channel
          }
        );

        if (createRes.status !== 201) {
          console.log(
            `❌ #${channelName}: Failed to create - ${createRes.status}`
          );
          failed++;
          continue;
        }

        channel = createRes.data;
        console.log(`✅ #${channelName}: Channel created`);
      }

      // Create webhook
      const webhookRes = await makeRequest(
        "POST",
        `/channels/${channel.id}/webhooks`,
        {
          name: "WISE² Bot",
        }
      );

      if (webhookRes.status === 201 || webhookRes.status === 200) {
        const webhook = webhookRes.data;
        if (webhook && webhook.id && webhook.token) {
          const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
          webhooks[channelName] = webhookUrl;
          console.log(`✅ #${channelName}: Webhook created`);
          created++;
        } else {
          console.log(
            `⚠️  #${channelName}: Channel created but webhook parse failed`
          );
          failed++;
        }
      } else {
        console.log(
          `❌ #${channelName}: ${webhookRes.status} - ${webhookRes.data.message || "Unknown error"}`
        );
        failed++;
      }
    }

    // Save to file
    const envContent = `# Generated webhooks (copy to .env)
DISCORD_WEBHOOK_DEPLOYMENTS=${webhooks.deployments || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_ALERTS=${webhooks.alerts || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_BUILDS=${webhooks.builds || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_DECISIONS=${webhooks.decisions || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_DAILY_SYNC=${webhooks["daily-sync"] || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_STATUS=${webhooks.status || "https://discord.com/api/webhooks/..."}
`;

    const fs = require("fs");
    const path = require("path");
    const envPath = path.join(__dirname, ".env.webhooks");
    fs.writeFileSync(envPath, envContent);

    console.log(`\n✅ Webhooks saved to .env.webhooks`);
    console.log(`📊 Summary: ${created} created, ${failed} failed`);

    if (created > 0) {
      console.log("\n🎯 Next steps:");
      console.log("1. cat .env.webhooks");
      console.log("2. Copy URLs to .env");
      console.log("3. pm2 restart wise2-bot");
    }

    process.exit(created > 0 ? 0 : 1);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createWebhooks();
