# Discord Developer Portal Setup Guide

Complete step-by-step guide to set up the bot on Discord Developer Portal.

## Overview

This guide covers:
1. Creating a Discord application
2. Adding a bot user
3. Configuring permissions and intents
4. Getting your bot token and client credentials
5. Setting up OAuth2 for authentication
6. Creating webhooks for channels

**Estimated time**: 10-15 minutes

---

## Part 1: Create Discord Application

### Step 1.1: Access Developer Portal

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Log in with your Discord account
3. Click the **"New Application"** button

### Step 1.2: Name Your Application

1. In the popup, enter: `WISE² Bot`
2. Accept the Developer Terms of Service
3. Click **"Create"**

You should now see your application dashboard.

### Step 1.3: Copy Application ID

1. Go to the **"General Information"** tab
2. Look for **"APPLICATION ID"**
3. Click the copy icon next to it
4. Save this as `DISCORD_CLIENT_ID` in your `.env` file

---

## Part 2: Create Bot User

### Step 2.1: Add Bot

1. On the left sidebar, click **"Bot"**
2. Click the **"Add Bot"** button
3. Confirm the action

A new "Bot" section will appear.

### Step 2.2: Copy Bot Token

1. Under the bot name, click **"Reset Token"** → **"Yes, do it!"**
2. A token will appear (looks like: `MTA4NjIyN...`)
3. **IMPORTANT**: Click the copy icon
4. **NEVER** commit this token to git or share it
5. Save as `DISCORD_BOT_TOKEN` in your `.env` file

### Step 2.3: Enable Gateway Intents

These allow the bot to receive certain Discord events:

1. Scroll down to **"Privileged Gateway Intents"**
2. Enable these three:
   - ✅ **Message Content Intent** (read message content)
   - ✅ **Guild Messages Intent** (receive messages)
   - ✅ **Guilds Intent** (track guilds/servers)
3. Click **"Save Changes"**

**Why these?**
- Message Content: Commands need to read message content
- Guild Messages: Bot needs to see server messages
- Guilds: Bot needs to know which servers it's in

---

## Part 3: OAuth2 Setup

### Step 3.1: Access OAuth2 Settings

1. On the left sidebar, click **"OAuth2"**
2. Click **"General"** (if not already there)

### Step 3.2: Copy Client Secret

1. Look for **"CLIENT SECRET"**
2. Click **"Reset Secret"** → **"Yes, do it!"**
3. A secret will appear
4. Click the copy icon
5. Save as `DISCORD_CLIENT_SECRET` in your `.env` file

### Step 3.3: Set Redirect URLs (Optional, for Phase B)

This is for OAuth2 authentication (not needed for Phase A MVP).

For Phase B, you'll add:
```
http://localhost:3000/api/discord/callback
https://wise2.net/api/discord/callback
```

---

## Part 4: Invite Bot to Your Server

### Step 4.1: Get Invite URL

1. Still in OAuth2 section, click **"URL Generator"**
2. Under **"SCOPES"**, check these:
   - ✅ `bot` (bot permissions)

3. Under **"PERMISSIONS"**, check these:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Messages/View Channels
   - ✅ Use Slash Commands
   - ✅ Manage Webhooks (for /alert to work)

4. Copy the generated URL at the bottom

### Step 4.2: Invite Bot to Server

1. Open the copied URL in a new browser tab
2. Select your Discord server from the dropdown
3. Click **"Authorize"**
4. Complete any CAPTCHA
5. You should see "Authorized!" message

The bot is now invited to your server! ✅

---

## Part 5: Get Your Server ID (Guild ID)

### Step 5.1: Enable Developer Mode in Discord

1. Open Discord
2. Go to **Settings** → **Advanced**
3. Toggle **"Developer Mode"** ON
4. Close settings

### Step 5.2: Copy Server ID

1. In Discord, right-click your server name/icon
2. Click **"Copy Server ID"**
3. Save as `DISCORD_GUILD_ID` in your `.env` file

---

## Part 6: Create Discord Channels

Now that your bot is in your server, create these channels:

### Channels to Create

Create these 6 text channels:

```
#deployments     - For deployment notifications
#alerts          - For system alerts and warnings
#builds          - For build logs and CI/CD status
#decisions       - For logged decisions (ADR format)
#daily-sync      - For daily status updates
#status          - For system health and metrics
```

**How to create a channel**:

1. In Discord, right-click on your server name
2. Select **"Create Channel"**
3. Choose **"Text"** channel type
4. Enter channel name (e.g., `deployments`)
5. Click **"Create Channel"**
6. Repeat for all 6 channels

---

## Part 7: Create Webhooks

For each of the 6 channels, create a webhook:

### Step 7.1: Create First Webhook

1. Right-click the **#deployments** channel
2. Click **"Edit Channel"**
3. In the left sidebar, click **"Integrations"**
4. Click **"Webhooks"** (may say "Create Webhook" if none exist)
5. Click **"New Webhook"**

### Step 7.2: Configure Webhook

1. Name it: `WISE² Bot - #deployments`
2. Click **"Copy Webhook URL"** (or find it under the webhook list)
3. Save this URL as `DISCORD_WEBHOOK_DEPLOYMENTS` in `.env`

**Format**: `https://discord.com/api/webhooks/123456789/abcdefgh...`

### Step 7.3: Repeat for Other Channels

Repeat steps 7.1-7.2 for:
- `#alerts` → `DISCORD_WEBHOOK_ALERTS`
- `#builds` → `DISCORD_WEBHOOK_BUILDS`
- `#decisions` → `DISCORD_WEBHOOK_DECISIONS`
- `#daily-sync` → `DISCORD_WEBHOOK_DAILY_SYNC`
- `#status` → `DISCORD_WEBHOOK_STATUS`

**Pro Tip**: Name each webhook clearly so you can identify them later:
- `WISE² Bot - #deployments`
- `WISE² Bot - #alerts`
- etc.

---

## Part 8: Verify Your Credentials

Before starting the bot, verify you have all credentials:

```bash
# In your services/bot/.env file, you should have:

DISCORD_BOT_TOKEN=MTA4NjIyN...                    ← From Part 2.2
DISCORD_CLIENT_ID=123456789                      ← From Part 1.3
DISCORD_CLIENT_SECRET=abc123def456...            ← From Part 3.2
DISCORD_GUILD_ID=987654321                       ← From Part 5.2

DISCORD_WEBHOOK_DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_BUILDS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DECISIONS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DAILY_SYNC=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_STATUS=https://discord.com/api/webhooks/...
```

---

## Part 9: Start the Bot

```bash
cd services/bot
npm install
node validate.js    # Check everything is configured
npm start           # Start the bot
```

**Expected output**:

```
✅ Logged in as WISE² Bot#1234
Guilds: WISE²(123456789)
✅ Successfully reloaded 7 application (/) commands.
✅ Sent startup ping to #status
```

---

## Part 10: Test Commands

In your Discord server, try these commands:

```
/status   ← System health check
/deploy   ← Deployment information
/phase    ← Project phase status
/tasks    ← List pending tasks
/decision topic:test description:Testing bot ← Log decision
/sync     ← Daily sync status
/alert channel:status message:Test severity:info ← Send alert
```

Each command should return a response within a few seconds.

---

## Troubleshooting

### Bot doesn't show in server

- [ ] Verify bot token is correct
- [ ] Verify bot was invited to server
- [ ] Check bot has "View Channels" permission
- [ ] Try kicking bot and re-inviting

### Slash commands don't appear

- [ ] Wait 10 seconds after bot starts
- [ ] Try typing `/` and looking for commands
- [ ] Restart bot: `npm start`
- [ ] Check bot has "Use Slash Commands" permission

### Webhooks return 401/403 errors

- [ ] Verify webhook URL is complete (includes the full path)
- [ ] Check webhook still exists in Discord (Settings > Webhooks)
- [ ] Verify bot has "Manage Webhooks" permission
- [ ] Copy the full URL exactly (no extra spaces)

### Bot comes online but doesn't respond

- [ ] Check bot has "Send Messages" permission in channel
- [ ] Verify slash commands deployed (check bot logs)
- [ ] Try `/status` command (most basic test)
- [ ] Check for errors in bot logs: `npm start`

### "Application did not respond"

- [ ] Bot might be offline (check console)
- [ ] Bot might be processing (takes a few seconds)
- [ ] Check internet connection
- [ ] Restart bot

---

## Security Best Practices

⚠️ **IMPORTANT**:

1. **Never share your bot token** — It gives full control of your bot
2. **Never commit `.env` to git** — Always use `.env.example` template
3. **Use long, random client secret** — Discord generates this
4. **Rotate token if exposed** — "Reset Token" button in Developer Portal
5. **Limit bot permissions** — Give minimum needed (already done in Step 4.1)
6. **Use environment variables** — Never hardcode secrets in code

---

## Next Steps

Once the bot is working:

1. ✅ Test all 7 commands
2. ✅ Verify webhook delivery to all channels
3. ✅ Monitor bot logs for errors
4. ✅ Deploy to Replit or docker (see DEPLOYMENT.md)
5. ✅ Set up monitoring/uptime checking

See README.md for detailed command reference and PHASE_A_COMPLETE.md for implementation summary.

---

## Reference Links

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Docs](https://discord.js.org/)
- [Discord API Docs](https://discord.com/developers/docs)
- [OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)
- [Webhooks Guide](https://discord.com/developers/docs/resources/webhook)

---

**Last Updated**: 2026-07-20  
**Bot Version**: 1.0 (Phase A MVP)
