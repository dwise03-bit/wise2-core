# Quick Start: WISE² Discord Bot (5 minutes)

## Prerequisites

- Node.js 18+ installed
- Discord server (create one if needed)
- Discord Developer Portal account

## Step 1: Create Bot on Discord

```bash
# 1. Go to https://discord.com/developers/applications
# 2. Click "New Application" → name it "WISE² Bot"
# 3. Go to "Bot" tab → "Add Bot"
# 4. Copy the TOKEN (don't share this!)
# 5. Enable Gateway Intents:
#    - Message Content Intent ✅
#    - Guild Messages Intent ✅
#    - Guilds Intent ✅
```

## Step 2: Get Server ID

In Discord:
1. Enable Developer Mode (Settings → Advanced → Developer Mode)
2. Right-click server icon → "Copy Server ID"

## Step 3: Invite Bot to Server

In Developer Portal (OAuth2 → URL Generator):
- Scopes: `bot`
- Permissions: Send Messages, Embed Links, Read Messages, Use Slash Commands
- Copy the URL and open it to invite bot

## Step 4: Setup Environment

```bash
# Navigate to bot directory
cd services/bot

# Install dependencies
npm install

# Run setup wizard
node setup.js
```

The setup wizard will ask for:
- Bot token
- Client ID
- Client secret
- Guild/Server ID
- Webhook URLs (for 6 channels)

## Step 5: Create Discord Channels

Create these in your server:
- `#deployments`
- `#alerts`
- `#builds`
- `#decisions`
- `#daily-sync`
- `#status`

(Detailed instructions in setup wizard)

## Step 6: Validate Configuration

```bash
node validate.js
```

If all checks pass, you're ready to go!

## Step 7: Start Bot

```bash
npm start
```

**Expected output:**
```
✅ Logged in as WISE² Bot#1234
Guilds: WISE²(123456789)
✅ Successfully reloaded 7 application (/) commands.
✅ Sent startup ping to #status
```

## Step 8: Test Commands

In Discord, try:
- `/status` - System health
- `/deploy` - Deployment info
- `/phase` - Project phase
- `/tasks` - Pending tasks
- `/decision topic:test description:Testing the bot` - Log a decision
- `/sync` - Daily sync
- `/alert channel:alerts message:Test severity:info` - Send alert

## Done! 🎉

Your bot is now live. See README.md for detailed command reference.

---

## Troubleshooting

**Bot shows as offline?**
- Check bot token is valid
- Verify bot is invited to server
- Restart: `npm start`

**Commands not showing?**
- Restart bot: `npm start`
- Slash commands deploy on startup

**Webhooks failing?**
- Verify webhook URLs in `.env` are correct
- Check webhooks still exist in Discord

See DEPLOYMENT.md for platform-specific setup (Replit, Docker, PM2).
