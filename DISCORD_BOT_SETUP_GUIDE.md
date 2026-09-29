# WISE² Discord Bot - Automated Channel Setup Guide

## 🚀 Setup Channels Command

The bot can now automatically create all Discord channels and webhooks in one command!

### Command
```
/setup-channels
```

**Requirements:**
- Must be a Discord server administrator
- Bot must have permission to create channels and webhooks
- Runs once per server

---

## 📋 What Gets Created

### Channels (9 total)
1. **#deployments** — Deployment notifications
2. **#alerts** — System alerts & warnings
3. **#builds** — Build logs & CI/CD status
4. **#decisions** — Logged decisions (ADR format)
5. **#daily-sync** — Daily status synchronization
6. **#status** — System health & metrics
7. **#ai-workforce** — AI agents & automation
8. **#ecosystem** — Platform modules & features
9. **#general** — General discussion

### Webhooks (6 total)
Automatically created for webhook-enabled channels:
- DISCORD_WEBHOOK_DEPLOYMENTS
- DISCORD_WEBHOOK_ALERTS
- DISCORD_WEBHOOK_BUILDS
- DISCORD_WEBHOOK_DECISIONS
- DISCORD_WEBHOOK_DAILY_SYNC
- DISCORD_WEBHOOK_STATUS

---

## 🎯 How to Use

### Step 1: Run the Command
In your Discord server, type:
```
/setup-channels
```

### Step 2: Confirm Admin Status
The bot checks if you're an admin. If you are, it proceeds.

### Step 3: Automatic Setup
The bot will:
- ✅ Create all 9 channels
- ✅ Set channel descriptions
- ✅ Create webhooks for each
- ✅ Generate webhook URLs
- ✅ Save configuration to `.env.webhooks` file

### Step 4: Update Environment
The bot creates a `.env.webhooks` file with all webhook URLs:
```
DISCORD_WEBHOOK_DEPLOYMENTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_BUILDS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DECISIONS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DAILY_SYNC=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_STATUS=https://discord.com/api/webhooks/...
```

Copy these values to your `.env` file in `/services/bot/.env`

---

## ✅ Setup Complete

After running `/setup-channels`:

1. All 9 channels are created in Discord
2. Webhooks are automatically configured
3. Bot is ready to send notifications
4. Configuration file is generated

---

## 📝 What Happens Next

### To Enable Full Functionality:

1. **Copy webhook URLs** from `.env.webhooks` to `.env`:
```bash
cp services/bot/.env.webhooks.tmp services/bot/.env.snippet
```

2. **Update .env file** in `/services/bot/.env`:
   - Replace placeholder webhook URLs with real ones from `.env.webhooks`

3. **Restart the bot**:
```bash
pm2 restart wise2-bot
```

4. **Test the bot**:
```
/status     — Should work normally
/alert      — Should send to #alerts channel
/sync       — Should send to #daily-sync
```

---

## 🔄 Usage Scenarios

### First-Time Setup
```
User: /setup-channels
Bot:  Creates all channels and webhooks
User: Copy webhook URLs to .env
User: pm2 restart wise2-bot
Bot:  Fully operational!
```

### Channel Already Exists
If a channel already exists (e.g., #general), the bot:
- ✅ Skips creation
- ✅ Creates webhook if missing
- ✅ Reports it exists
- ✅ Continues with other channels

### Permission Error
If you're not an admin:
```
❌ Permission Denied
Only administrators can use this command
```

---

## 🛠️ Troubleshooting

### Bot Can't Create Channels
**Issue:** "Missing Permissions"  
**Fix:** Give bot "Manage Channels" permission in server settings

### Webhook Creation Failed
**Issue:** Webhook already exists  
**Fix:** Delete old webhook first, then re-run command

### Missing Webhook URLs
**Issue:** Some webhooks weren't created  
**Fix:** Check Discord permissions, re-run command for failed channels

### Can't Find .env.webhooks File
**Issue:** File not created  
**Fix:** Check bot logs: `pm2 logs wise2-bot`

---

## 🎯 All 12 Bot Commands

| Command | Type | Purpose |
|---------|------|---------|
| `/status` | Core | System health check |
| `/deploy` | Core | Deployment info |
| `/phase` | Core | Project progress |
| `/tasks` | Core | Pending work |
| `/decision` | Core | Log decisions |
| `/sync` | Core | Daily sync |
| `/alert` | Core | Send alerts |
| `/ecosystem` | WISE² | Module overview |
| `/modules` | WISE² | Feature list |
| `/ai-workforce` | WISE² | AI agents |
| `/platform` | WISE² | System status |
| `/setup-channels` | Admin | Create channels |

---

## 📊 Full Setup Timeline

```
1. Bot Running (PM2)
   ↓
2. User runs /setup-channels (Admin only)
   ↓
3. Bot creates 9 channels
   ↓
4. Bot creates 6 webhooks
   ↓
5. Bot saves webhook URLs to .env.webhooks
   ↓
6. User copies URLs to .env
   ↓
7. pm2 restart wise2-bot
   ↓
8. Bot fully operational! ✅
```

---

## 🚀 Next Steps

After setup:
1. Try `/status` command
2. Try `/ecosystem` to see modules
3. Try `/alert channel:alerts message:test` to test webhooks
4. Monitor logs: `pm2 logs wise2-bot`

---

## 💡 Pro Tips

- **Skip existing channels**: Running `/setup-channels` again will skip channels that already exist
- **Recreate webhooks**: Delete webhook in Discord, re-run `/setup-channels` to recreate
- **Backup URLs**: Save `.env.webhooks` in case you need webhook URLs later
- **Update .env manually**: If you prefer, copy URLs from Discord directly

---

**Status:** ✅ Ready to use  
**Commands:** 12 total  
**Automation:** Full channel & webhook creation  
**Deployment:** PM2 24/7
