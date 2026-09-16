# Discord Bot v2.0 — Setup & Deployment Guide

**Status**: Production-ready  
**Last Updated**: 2026-09-16  
**Version**: v2.0 (7 features, 43+ commands)

---

## 🚀 Quick Start (5 minutes)

### 1. Get Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application (or select existing)
3. Go to "Bot" → Click "Add Bot"
4. Copy token under USERNAME
5. Enable these **Intents**:
   - Server Members Intent ✓
   - Message Content Intent ✓
6. Go to OAuth2 → URL Generator
7. Select scopes: `bot`, `applications.commands`
8. Select permissions:
   - Manage Webhooks
   - Read Messages/View Channels
   - Send Messages
   - Manage Messages
   - Embed Links
   - Attach Files
9. Copy generated URL → Invite bot to your server

### 2. Configure Environment
```bash
# Edit or create /home/dwise/.env
DISCORD_BOT_TOKEN=your_token_from_step_1
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_server_id

# Optional but recommended
DISCORD_ADMIN_IDS=your_user_id_1,your_user_id_2
```

**How to find IDs**:
- **CLIENT_ID**: Discord Developer Portal → Application ID
- **GUILD_ID**: Enable Developer Mode in Discord → Right-click server → Copy Server ID
- **ADMIN_IDS**: Enable Developer Mode → Right-click user → Copy User ID

### 3. Register Commands
```bash
cd /Users/danielwise/Projects/wise2-core/services/wise-discord
npm install    # If needed
npm run register
# Output: ✅ Successfully registered 10 commands
```

### 4. Start Bot
```bash
npm start
# Or for development:
npm run dev
```

### 5. Test in Discord
Type `/` in any channel → See all 10 commands with autocomplete

---

## 📋 Full Setup Checklist

### Pre-Deployment

- [ ] Discord Application created
- [ ] Bot token copied to `.env`
- [ ] Client ID in `.env`
- [ ] Guild ID in `.env`
- [ ] Bot permissions configured (8 required)
- [ ] Bot invited to server
- [ ] Dependencies installed: `npm install`
- [ ] Syntax validated: `node -c bot.js`

### Deployment

- [ ] Run `npm run register`
- [ ] Start bot: `npm start`
- [ ] Verify bot online in Discord (green dot)
- [ ] Test one command: `/ai ask "hello"`
- [ ] Check bot logs for errors

### Post-Deployment

- [ ] Configure admin IDs for sensitive commands
- [ ] Test each feature module (7 groups)
- [ ] Monitor logs for 24 hours
- [ ] Set up alert webhooks (optional)
- [ ] Document any custom integrations

---

## 🧪 Testing Procedures

### Unit Tests (No Discord Needed)
```bash
# All features load
npm test 2>&1 | grep "ALL TESTS PASSED"

# Output should show:
# ✅ 7 feature modules
# ✅ 43+ subcommands
# ✅ Ready for deployment
```

### Integration Tests (With Discord)

#### Test 1: Bot Connection
```bash
# Start bot
npm start

# Check Discord:
# - Bot appears online (green dot)
# - No error messages in console
```

#### Test 2: Command Registration
In Discord, type `/` and verify all commands appear:
- `/wise` ✓
- `/content` ✓
- `/ops` ✓
- `/ai` ✓ (NEW)
- `/client` ✓ (NEW)
- `/create` ✓ (NEW)
- `/edge` ✓ (NEW)
- `/revenue` ✓ (NEW)
- `/admin` ✓ (NEW)
- `/deploy` ✓ (NEW)

#### Test 3: Feature Module Test
Try each feature (sample commands):

**AI Executor**:
```
/ai ask query:"What is WISE²?"
```

**Client Portal**:
```
/client status workspace:"Demo"
```

**Creative Studio**:
```
/create image prompt:"A futuristic city"
```

**Edge Control**:
```
/edge network
```

**Revenue Ops**:
```
/revenue dashboard
```

**Admin Ops**:
```
/admin workspace action:"list"
```

**Deploy Ops**:
```
/deploy check
```

#### Test 4: Error Handling
Try invalid inputs:
```
/ai ask query:""  # Empty query
/client status workspace:"NonExistent"  # Invalid workspace
/deploy service service:"fake" version:"v0"  # Fake service
```

Expected behavior:
- ✅ Friendly error messages
- ✅ No bot crashes
- ✅ No sensitive data in errors

#### Test 5: Admin-Only Commands
As non-admin, try:
```
/ai ask query:"test"
```

Expected behavior:
- ✅ Response: "❌ Unauthorized — WISE² admin access required."

---

## 🔧 Configuration Options

### Environment Variables

```bash
# Required
DISCORD_BOT_TOKEN=string          # Discord bot token
DISCORD_CLIENT_ID=string          # Application ID
DISCORD_GUILD_ID=string           # Server ID for commands

# Optional but recommended
DISCORD_ADMIN_IDS=id1,id2,id3     # Comma-separated user IDs
DISCORD_SYSTEM_ALERTS_WEBHOOK=url # Webhook for system alerts

# Optional (with defaults)
BRAIN_API_URL=string              # Default: http://127.0.0.1:3011/api
COMMAND_CENTER_URL=string         # Default: http://127.0.0.1:3004
JWT_SECRET=string                 # JWT signing secret
EVENTS_SECRET=string              # Event bus secret
```

### PM2 Deployment

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'wise-discord',
    script: './bot.js',
    cwd: '/Users/danielwise/Projects/wise2-core/services/wise-discord',
    env: {
      NODE_ENV: 'production',
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
      DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    error_file: '.logs/discord-error.log',
    out_file: '.logs/discord-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};
```

Deploy with PM2:
```bash
pm2 start ecosystem.config.js --name wise-discord
pm2 save
pm2 startup
```

---

## 📊 Monitoring

### Log Files
```bash
# Real-time logs
npm start

# Background logs (with PM2)
pm2 logs wise-discord

# Check specific issues
pm2 logs wise-discord --err
```

### Health Check
```bash
# API endpoint (if configured)
curl http://localhost:3004/api/health

# Discord bot status
# Check Discord server → See if bot is online
```

### Metrics to Monitor

| Metric | Healthy | Unhealthy |
|--------|---------|-----------|
| Bot Status | Online (green) | Offline (gray) |
| Command Response | <3s | >10s |
| Error Rate | <1% | >5% |
| Memory Usage | <150MB | >500MB |
| Uptime | 99.9%+ | <99% |

---

## 🚨 Troubleshooting

### Bot Won't Start

**Error**: `Cannot find module 'discord.js'`
```bash
# Solution:
npm install
```

**Error**: `Invalid Token`
```bash
# Solution:
# 1. Verify token in .env is correct
# 2. Token should not have spaces
# 3. Regenerate token in Discord Developer Portal
```

**Error**: `DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID required`
```bash
# Solution:
# Ensure all three are set in /home/dwise/.env
env | grep DISCORD
```

### Commands Not Appearing

**Issue**: Slash commands don't show in Discord
```bash
# Solution 1: Re-register commands
npm run register

# Solution 2: Check bot permissions
# In Discord Server Settings → Integrations → Bot
# Verify "Use Slash Commands" permission is enabled

# Solution 3: Restart Discord client
# Ctrl+Shift+R in Discord desktop app
```

### Command Errors

**Error**: "❌ Internal error: Brain API 500"
```bash
# Solution:
# Check if Brain API is running
curl http://127.0.0.1:3011/api/health

# If down, restart it:
docker-compose up brain
```

**Error**: "❌ Error: Cannot find module './features'"
```bash
# Solution:
# Verify features folder exists:
ls -la services/wise-discord/features/

# All 8 feature files should be present
```

### Performance Issues

**Bot is slow to respond**:
```bash
# Check memory usage:
ps aux | grep node

# If >500MB, restart:
npm start
# Or with PM2:
pm2 restart wise-discord
```

---

## 📈 Production Checklist

Before going live to production:

- [ ] All 7 feature modules tested
- [ ] Error handling verified
- [ ] Admin IDs configured
- [ ] Logging configured
- [ ] Monitoring in place
- [ ] Backup/restore plan documented
- [ ] On-call runbook created
- [ ] Stakeholders notified

---

## 🔐 Security Notes

1. **Token Security**
   - Never commit `.env` to git
   - Rotate token if ever exposed
   - Use unique token per environment

2. **Admin Access**
   - Configure DISCORD_ADMIN_IDS carefully
   - Test admin-only commands
   - Audit all /admin operations

3. **API Security**
   - All requests authenticated with JWT
   - Sensitive data in ephemeral replies
   - No credentials in error messages

4. **Rate Limiting**
   - Discord enforces API rate limits
   - Long operations (video, deployment) are async
   - Notifications sent on completion

---

## 📞 Support

### Debug Mode
```bash
# Enable verbose logging
DEBUG=wise:* npm start

# Or for specific module:
DEBUG=wise:ai:* npm start
```

### Testing Endpoint
```bash
# Quick health check
curl http://localhost:3004/api/health

# Check if Brain API responds
curl http://127.0.0.1:3011/api/health
```

### Log Analysis
```bash
# Errors in last hour
grep "ERROR\|❌" .logs/discord-out.log | tail -20

# Slow responses (>5s)
grep "time: [5-9]\|time: [0-9][0-9]" .logs/discord-out.log
```

---

## 🎉 Success Criteria

When deployment is successful:

✅ Bot appears online in Discord  
✅ All 10 commands registered  
✅ Slash command autocomplete works  
✅ At least 3 features tested successfully  
✅ Error handling verified  
✅ No crashes in first 24 hours  
✅ Response times <3 seconds  

**Status**: READY FOR PRODUCTION 🚀
