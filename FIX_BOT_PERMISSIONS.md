# Fix WISE² Bot Permissions for Webhooks

## Problem
Bot successfully created channels but can't create webhooks due to missing permissions.

## Solution: Update Bot Permissions

### Step 1: Go to Discord Developer Portal
1. Visit: https://discord.com/developers/applications
2. Select **"Wise defense llc"** application
3. Go to **"OAuth2"** → **"URL Generator"**

### Step 2: Update Scopes & Permissions

**Scopes** (select these):
- ✅ `bot`
- ✅ `applications.commands`

**Permissions** (select these):
- ✅ Send Messages
- ✅ Embed Links
- ✅ Read Messages/View Channels
- ✅ Use Slash Commands
- ✅ Manage Webhooks ← **ADD THIS**
- ✅ Manage Channels ← **ADD THIS**

### Step 3: Re-invite Bot
1. Copy the generated OAuth2 URL
2. Open it in browser
3. Select your server (Danny-wise2)
4. Click "Authorize"
5. Complete the CAPTCHA

### Step 4: Verify Permissions
In Discord server settings:
1. Go to **Server Settings** → **Integrations** → **Bots and Apps**
2. Select **"Wise defense llc"**
3. Verify it has these permissions:
   - ✅ Send Messages
   - ✅ Manage Channels
   - ✅ Manage Webhooks

### Step 5: Run Setup Again
Back in Discord, type:
```
/setup-channels
```

Bot will now successfully create webhooks! ✅

---

## Alternative: Manual Permission Setup

If re-inviting doesn't work, manually set permissions:

1. **Server Settings** → **Roles**
2. Find **@Wise defense llc** role
3. Click to edit
4. Under **Permissions**, enable:
   - ✅ Manage Channels
   - ✅ Manage Webhooks
   - ✅ Send Messages
   - ✅ Manage Messages (optional, for cleanup)

---

## Verify Webhook URLs

After running `/setup-channels` successfully, check:
```bash
cat services/bot/.env.webhooks
```

Should show:
```
DISCORD_WEBHOOK_DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_BUILDS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DECISIONS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DAILY_SYNC=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_STATUS=https://discord.com/api/webhooks/...
```

---

## Update Bot Environment

Copy webhook URLs to bot environment:

```bash
# Copy generated webhooks to .env
cat services/bot/.env.webhooks >> services/bot/.env

# Or manually update each line in services/bot/.env
```

---

## Restart Bot

```bash
pm2 restart wise2-bot
```

---

## Channels Already Created ✅

Good news: The 9 channels were successfully created:
- ✅ #deployments
- ✅ #alerts
- ✅ #builds
- ✅ #decisions
- ✅ #daily-sync
- ✅ #status
- ✅ #ai-workforce
- ✅ #ecosystem
- ✅ #general

Just need to create the webhooks for them!

---

## Quick Checklist

- [ ] Go to Discord Developer Portal
- [ ] Add "Manage Webhooks" permission
- [ ] Add "Manage Channels" permission
- [ ] Re-invite bot with new permissions
- [ ] Run `/setup-channels` again
- [ ] Copy webhook URLs from `.env.webhooks`
- [ ] Update `.env` with webhook URLs
- [ ] Run `pm2 restart wise2-bot`
- [ ] Test: `/alert channel:alerts message:test`

---

**Status:** Channels created ✅ | Webhooks pending ⏳
