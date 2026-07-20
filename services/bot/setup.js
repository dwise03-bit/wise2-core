#!/usr/bin/env node
/**
 * WISE² Discord Bot Setup Guide
 *
 * This script provides interactive setup for Discord bot configuration.
 * It guides through:
 * 1. Bot creation in Discord Developer Portal
 * 2. Webhook creation for channels
 * 3. Environment variable configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   WISE² Discord Bot Setup - Phase A                               ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                    ║
║   This setup wizard will help you configure Discord integration   ║
║   for the WISE² Agentic OS kernel.                                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    const overwrite = await question('Found existing .env. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  console.log(`
Step 1: Discord Developer Portal Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://discord.com/developers/applications
2. Click "New Application" and name it "WISE² Bot"
3. Go to "Bot" tab → "Add Bot"
4. Copy the token under "TOKEN" section

⚠️  IMPORTANT: Never share your bot token!
  `);

  const botToken = await question('Paste your bot token: ');

  if (!botToken || botToken.length < 10) {
    console.error('Invalid token. Setup cancelled.');
    process.exit(1);
  }

  console.log(`
Step 2: Bot Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In Developer Portal:
1. Go to "Bot" → scroll to "Privileged Gateway Intents"
2. Enable: Message Content Intent ✅
3. Go to "OAuth2" → "URL Generator"
4. Scopes: bot
5. Permissions:
   - Send Messages ✅
   - Embed Links ✅
   - Read Messages/View Channels ✅
   - Use Slash Commands ✅

Copy the generated URL and open it to invite bot to your server.
  `);

  const clientId = await question('Paste your Client ID (from OAuth2 → URL Generator): ');
  const clientSecret = await question('Paste your Client Secret: ');

  console.log(`
Step 3: Discord Server Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Get your Guild ID (Server ID):
1. In Discord, enable "Developer Mode" (User Settings → Advanced → Developer Mode)
2. Right-click your server icon → "Copy Server ID"
  `);

  const guildId = await question('Paste your Guild/Server ID: ');

  console.log(`
Step 4: Create Discord Channels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create these 6 channels in your Discord server:
  #deployments    - Deployment notifications
  #alerts         - System alerts & warnings
  #builds         - Build logs & CI/CD status
  #decisions      - Logged decisions (ADR format)
  #daily-sync     - Daily status synchronization
  #status         - System health & metrics

After creating channels, we'll set up webhooks for each.
  `);

  const channelsReady = await question('Have you created all 6 channels? (y/n): ');
  if (channelsReady.toLowerCase() !== 'y') {
    console.log('Please create the channels first, then run this setup again.');
    process.exit(0);
  }

  console.log(`
Step 5: Create Webhooks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each channel, create a webhook:
1. Right-click channel → Settings
2. Go to Integrations → Webhooks
3. Click "New Webhook"
4. Name it something like "WISE² Bot - #channel-name"
5. Click "Copy Webhook URL"

The webhook URL looks like:
https://discord.com/api/webhooks/123456789/abcdef...
  `);

  const webhooks = {};
  const channelNames = ['deployments', 'alerts', 'builds', 'decisions', 'daily-sync', 'status'];

  for (const channel of channelNames) {
    const webhook = await question(`Paste webhook for #${channel}: `);
    if (webhook && webhook.includes('discord.com/api/webhooks/')) {
      webhooks[channel] = webhook;
    } else {
      console.log(`⚠️  Skipping invalid webhook for #${channel}`);
    }
  }

  console.log(`
Step 6: Summary & Save
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  console.log('Configuration:');
  console.log(`  Bot Token: ${botToken.slice(0, 10)}...`);
  console.log(`  Client ID: ${clientId}`);
  console.log(`  Guild ID: ${guildId}`);
  console.log(`  Webhooks: ${Object.keys(webhooks).length}/6 configured`);

  const confirm = await question('\nSave to .env? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    process.exit(0);
  }

  // Build .env content
  const envContent = `# WISE² Discord Bot Configuration
# Generated: ${new Date().toISOString()}

# Bot Authentication
DISCORD_BOT_TOKEN=${botToken}
DISCORD_CLIENT_ID=${clientId}
DISCORD_CLIENT_SECRET=${clientSecret}

# Server/Guild Configuration
DISCORD_GUILD_ID=${guildId}

# Webhooks for Channel Integration
DISCORD_WEBHOOK_DEPLOYMENTS=${webhooks['deployments'] || ''}
DISCORD_WEBHOOK_ALERTS=${webhooks['alerts'] || ''}
DISCORD_WEBHOOK_BUILDS=${webhooks['builds'] || ''}
DISCORD_WEBHOOK_DECISIONS=${webhooks['decisions'] || ''}
DISCORD_WEBHOOK_DAILY_SYNC=${webhooks['daily-sync'] || ''}
DISCORD_WEBHOOK_STATUS=${webhooks['status'] || ''}

# Data Directory (for reading logs and decisions)
DATA_DIR=../../data

# Deployment Info (used by /deploy command)
DEPLOY_SERVER=173.208.147.165 (gpu-nmls)
NODE_ENV=production
`;

  fs.writeFileSync(envPath, envContent);
  console.log(`
✅ Configuration saved to .env
  `);

  console.log(`
Step 7: Start the Bot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run:
  npm install    # Install dependencies if needed
  npm start      # Start the bot

Expected output:
  ✅ Logged in as WISE² Bot#XXXX
  Guilds: WISE²(${guildId})
  ✅ Successfully reloaded 7 application (/) commands.
  ✅ Sent startup ping to #status

Once the bot is online, you can use these commands in Discord:
  /status   - System health check
  /deploy   - Deployment information
  /phase    - Project phase status
  /tasks    - List pending tasks
  /decision - Log a new decision
  /sync     - Show daily sync
  /alert    - Send alert to channel
  `);

  console.log(`
📚 Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

See README.md for:
  - Full command reference
  - Data integration details
  - Troubleshooting guide
  - Phase B roadmap
  `);

  rl.close();
}

main().catch(console.error);
