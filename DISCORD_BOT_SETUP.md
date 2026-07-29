# WISE² Discord Bot Setup & Integration Guide

Complete guide for setting up and testing Discord bot integration across WISE² ecosystem.

## Table of Contents

- [Discord Bot Setup](#discord-bot-setup)
- [Environment Configuration](#environment-configuration)
- [Testing Procedures](#testing-procedures)
- [Website Integration](#website-integration)
- [Command Center Integration](#command-center-integration)
- [Troubleshooting](#troubleshooting)

---

## Discord Bot Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it: `WISE² Bot`
4. Click "Create"

### Step 2: Add Bot to Application

1. Go to "Bot" tab
2. Click "Add Bot"
3. Under "TOKEN", click "Copy" to get bot token
4. Save securely as `DISCORD_BOT_TOKEN`

### Step 3: Configure Bot Permissions

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - Send Messages
   - Embed Links
   - Attach Files

### Step 4: Invite Bot to Server

1. Copy generated URL from URL Generator
2. Open in browser and select your server
3. Authorize

### Step 5: Get Guild/Server ID

1. Enable Developer Mode (Discord Settings > Advanced > Developer Mode)
2. Right-click server > "Copy Server ID"
3. Save as `DISCORD_GUILD_ID`

### Step 6: Create Webhook

1. Server Settings > Integrations > Webhooks
2. "New Webhook" > Name: `WISE² Notifications`
3. Copy webhook URL
4. Save as `DISCORD_WEBHOOK_URL`

---

## Environment Configuration

### Website

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Command Center

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

---

## Testing Procedures

### Test Website Notifications

**1. User Signup**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```
Expected: 🆕 notification in Discord

**2. Contact Form**
```bash
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test",
    "message": "Test message"
  }'
```
Expected: 📧 notification in Discord

### Test Command Center Bot

**1. Start Command Center**
```bash
cd wise2-command-center
npm run dev
```
Expected: "Discord bot logged in" message

**2. Test Slash Commands in Discord**
- `/status` → Shows system status
- `/dashboard` → Shows dashboard link
- `/help` → Lists all commands
- `/notify test message` → Sends notification
- `/sync` → Syncs data

---

## Website Notifications

Automatic Discord notifications for:
- 🆕 New user signups (email/Google/Discord)
- 🔐 Authentication events (login, OAuth)
- 📧 Contact form submissions
- 🔒 Logout events

---

## Command Center Slash Commands

| Command | Purpose |
|---------|---------|
| `/status` | Check system health |
| `/dashboard` | Open dashboard |
| `/notify <msg>` | Send message |
| `/sync` | Sync data |
| `/help` | Show help |

---

## Troubleshooting

### Bot Not Showing Online
- Check `DISCORD_BOT_TOKEN` is correct
- Verify bot hasn't been regenerated
- Restart Command Center

### Slash Commands Not Appearing
- Verify `DISCORD_GUILD_ID` (not client ID)
- Restart bot to re-register commands
- Check bot has `applications.commands` scope

### Notifications Not Appearing
- Check `DISCORD_WEBHOOK_URL` is correct
- Verify webhook hasn't been deleted
- Test webhook: `curl -X POST $DISCORD_WEBHOOK_URL -H "Content-Type: application/json" -d '{"content": "Test"}'`

### Command Timeout Error
- Reduce heavy operations
- Check Command Center logs
- Restart bot

### OAuth Not Working
- Verify redirect URIs in Developer Portal
- Check `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Clear browser cookies

---

## Production Setup

Set environment variables in deployment platform:
- Vercel/Netlify: Use "Secrets" or "Environment Variables"
- Server: Export variables or use `.env` (git-ignored)

Use PM2 for persistent Command Center bot:
```bash
pm2 start npm --name "command-center" -- run dev
pm2 startup
pm2 save
```

---

## Monitoring

Check regularly:
- Bot online status in Discord
- Recent slash commands working
- Webhook notifications appearing
- Bot restart availability

---

Last Updated: 2026-07-29
