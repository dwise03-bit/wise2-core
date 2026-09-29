# Discord Bot v2.0 — Production Deployment Checklist

**Status**: Ready to ship ✅  
**Date**: 2026-09-16  
**Version**: v2.0 (7 features, 43+ commands)

---

## 🚢 PRE-DEPLOYMENT (Do This First)

### Environment Configuration
- [ ] Discord bot token obtained from [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Discord Client ID copied
- [ ] Discord Guild ID copied (Enable Developer Mode → Right-click server → Copy Server ID)
- [ ] Admin user IDs identified (optional but recommended)
- [ ] All values added to `/home/dwise/.env`

**Verification**:
```bash
grep -E "DISCORD_BOT_TOKEN|DISCORD_CLIENT_ID|DISCORD_GUILD_ID" /home/dwise/.env
# Should show 3 lines with values
```

### Discord Bot Setup
- [ ] Application created in Discord Developer Portal
- [ ] Bot added to application
- [ ] Token copied (don't expose in logs/chat)
- [ ] OAuth2 scopes set: `bot`, `applications.commands`
- [ ] Permissions configured (8 required):
  - [ ] Manage Webhooks
  - [ ] Read Messages/View Channels
  - [ ] Send Messages
  - [ ] Manage Messages
  - [ ] Embed Links
  - [ ] Attach Files
  - [ ] Use Slash Commands
  - [ ] Manage Guild (for command registration)
- [ ] Bot invited to server using OAuth2 URL
- [ ] Bot appears in server members list

### Code Verification
```bash
cd /Users/danielwise/Projects/wise2-core/services/wise-discord

# Install dependencies
npm install

# Syntax check
node -c bot.js
# Should output: ✅ Syntax OK

# Feature verification
npm test
# Should output: ✅ ALL TESTS PASSED
```

### Command Registration Test
```bash
# Register commands with Discord
npm run register
# Expected output: ✅ Successfully registered 10 commands: /wise, /content, /ops, /ai, /client, /create, /edge, /revenue, /admin, /deploy
```

---

## 🚀 DEPLOYMENT OPTIONS

### Option A: Direct Deployment (Simple)

```bash
cd /Users/danielwise/Projects/wise2-core/services/wise-discord
npm start
```

**Status**: Bot runs in foreground  
**Pros**: Simple, immediate testing  
**Cons**: Dies if terminal closes  
**Use for**: Development, testing

### Option B: PM2 Deployment (Recommended)

```bash
# Install PM2 globally (if not already)
npm install -g pm2

# Deploy with config
cd /Users/danielwise/Projects/wise2-core/services/wise-discord
pm2 start bot.js --name wise-discord --log-date-format="YYYY-MM-DD HH:mm:ss Z"

# Save configuration
pm2 save

# Enable auto-start on boot
pm2 startup
```

**Status**: Bot runs as managed service  
**Pros**: Auto-restart, persistent, monitoring  
**Cons**: Requires PM2 installation  
**Use for**: Production

### Option C: Systemd Deployment (Advanced)

Create `/etc/systemd/system/wise-discord.service`:
```ini
[Unit]
Description=WISE² Discord Bot
After=network.target

[Service]
Type=simple
User=dwise
WorkingDirectory=/Users/danielwise/Projects/wise2-core/services/wise-discord
ExecStart=/usr/bin/node bot.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PATH=/usr/local/bin:/usr/bin"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable wise-discord
sudo systemctl start wise-discord
sudo systemctl status wise-discord
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Immediate Tests (First 5 minutes)

```bash
# 1. Verify bot is online
# Check Discord server → Bot should have green "online" indicator
# ✅ or ❌

# 2. Test command registration
# In Discord, type "/" → Should see:
#   /wise (original)
#   /content (original)
#   /ops (original)
#   /ai (NEW)
#   /client (NEW)
#   /create (NEW)
#   /edge (NEW)
#   /revenue (NEW)
#   /admin (NEW)
#   /deploy (NEW)
# ✅ or ❌

# 3. Test basic command
# Try: /ai ask query:"Hello world"
# Should respond with AI response
# ✅ or ❌

# 4. Check logs for errors
pm2 logs wise-discord --lines 20
# Should show no ERROR messages
# ✅ or ❌
```

### Extended Tests (First hour)

```bash
# Test each feature module
/ai ask query:"Test"              # ✅ or ❌
/client status workspace:"test"   # ✅ or ❌
/create image prompt:"test"       # ✅ or ❌
/edge network                     # ✅ or ❌
/revenue dashboard                # ✅ or ❌
/admin workspace action:"list"    # ✅ or ❌
/deploy check                     # ✅ or ❌

# Monitor memory usage
pm2 monit
# Should be <200MB (healthy <500MB)
```

### Production Monitoring (24 hours)

| Check | Healthy | Action |
|-------|---------|--------|
| Bot online | Always | Restart if offline |
| Response time | <3s | Check API connectivity |
| Error rate | <1% | Review logs |
| Memory usage | <300MB | Restart if >500MB |
| Command availability | All 10 | Re-register if missing |

---

## 🔧 TROUBLESHOOTING DURING DEPLOYMENT

### Bot Won't Start

```bash
# Check environment variables
env | grep DISCORD

# Check syntax
node -c bot.js

# Check for module errors
node -e "require('./features'); console.log('✅ Features OK')"

# Check logs
pm2 logs wise-discord
```

### Commands Don't Appear

```bash
# Re-register
npm run register

# Clear Discord cache (client)
# Ctrl+Shift+R in Discord desktop

# Check bot permissions
# Discord Server Settings → Integrations → Bot
# Verify "Use Slash Commands" is enabled
```

### API Integration Failing

```bash
# Check Brain API
curl http://127.0.0.1:3011/api/health

# Check Command Center
curl http://127.0.0.1:3004/api/health

# Check network connectivity
ping 127.0.0.1
```

---

## 📊 ROLLBACK PLAN

If deployment fails or issues discovered:

### Immediate Rollback
```bash
# Stop bot
pm2 stop wise-discord
# or: kill <pid>

# Check previous version
git log --oneline -5
# Expected: Recent commits for discord bot

# Revert if needed
git revert <commit-hash>

# Restart
npm start
# or: pm2 start bot.js --name wise-discord
```

### If Critical Issue
1. Stop the bot: `pm2 stop wise-discord`
2. Investigate logs: `pm2 logs wise-discord --lines 50`
3. Check git status: `git status`
4. Identify breaking change
5. Fix or revert
6. Test locally: `npm start`
7. Re-deploy

---

## 🎯 SUCCESS CRITERIA

Deployment is **successful** when:

✅ Bot appears online in Discord (green dot)  
✅ All 10 commands registered and visible  
✅ Slash command autocomplete works  
✅ At least 3 feature commands tested successfully  
✅ Error messages are friendly (no stack traces)  
✅ No crashes in first 24 hours  
✅ Response times consistently <3 seconds  
✅ Memory usage stays <300MB  
✅ All admin can access sensitive commands  
✅ Event logging working (command usage tracked)

---

## 📋 FINAL CHECKLIST

### Before Shipping
- [ ] `.env` configured with all 3 required values
- [ ] Discord bot permissions configured (8 items)
- [ ] Bot invited to server
- [ ] Dependencies installed: `npm install`
- [ ] Syntax verified: `node -c bot.js`
- [ ] Tests passed: `npm test`
- [ ] Commands registered: `npm run register`
- [ ] Documentation reviewed (SETUP_AND_DEPLOY.md)

### During Deployment
- [ ] Bot starts without errors
- [ ] Bot shows online in Discord
- [ ] Commands appear in autocomplete
- [ ] At least 1 command tested
- [ ] Logs show no ERROR messages
- [ ] Memory usage <300MB

### After Deployment
- [ ] Test all 7 features (at least 1 from each)
- [ ] Monitor for 24 hours
- [ ] Document any issues
- [ ] Celebrate! 🎉

---

## 📞 SUPPORT CONTACTS

If issues arise:

1. **Check logs**: `pm2 logs wise-discord`
2. **Review docs**: SETUP_AND_DEPLOY.md
3. **Test connectivity**: `curl http://127.0.0.1:3011/api/health`
4. **Git status**: `git status`
5. **Escalate**: Review TROUBLESHOOTING section

---

## 🚢 SHIP IT!

When all checkboxes are ✅:

```bash
cd /Users/danielwise/Projects/wise2-core/services/wise-discord

# Option A: Simple start
npm start

# Option B: PM2 (Recommended)
pm2 start bot.js --name wise-discord
pm2 save
pm2 startup

# Verify in Discord
# Type "/" → See all commands → Done!
```

**Status**: READY FOR PRODUCTION ✅

---

**Deployment Completed**: [Date will be filled in]  
**Deployed By**: [Your name]  
**Git Commit**: [Latest commit hash]  
**Discord Server**: [Guild ID]  
**Notes**: [Any issues encountered or special setup]
