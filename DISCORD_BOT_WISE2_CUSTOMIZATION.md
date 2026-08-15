# WISE² Discord Bot - Complete Customization Guide

**Status**: ✅ Production Ready  
**Version**: 2.0 (WISE²-Customized)  
**Date**: 2026-07-21  
**Deployment**: PM2 (Running 24/7)

---

## 🎯 What's Customized

The Discord bot is now fully branded and integrated with WISE²:

### 1. **WISE² Color Scheme**
All embeds use the official WISE² brand colors:
- **Primary Blue**: #0055FF — Main actions, info
- **Accent Red**: #FF5535 — Alerts, warnings
- **Success Green**: #2CD588 — Confirmations
- **Dark Black**: #000000 — Background

### 2. **WISE² Branding**
- Footer: "WISE² Organized Chaos Command Center"
- Tagline: "Build. Automate. Dominate."
- All responses reflect WISE² brand voice

### 3. **11 Total Commands**

#### Core Operations (7)
- **`/status`** — System health, git status, docker containers, recent commits
- **`/deploy`** — Deployment information
- **`/phase`** — Project phase and progress tracking
- **`/tasks`** — List pending tasks from data/inbox
- **`/decision`** — Log architecture decisions
- **`/sync`** — Show today's daily sync log
- **`/alert`** — Send alerts to 6 Discord channels

#### WISE² Ecosystem (4 NEW)
- **`/ecosystem`** 🌐 — Complete module overview (SoundLab, Live Studio, Dashboard, CRM, etc.)
- **`/modules`** 📦 — Production-ready modules and emerging features
- **`/ai-workforce`** 🤖 — AI agents status, automation workflows, integration points
- **`/platform`** 🚀 — Server status, services health, tech stack, active modules

---

## 🚀 Running Commands in Discord

1. Open your Discord server (Danny-wise2)
2. Type a slash: `/`
3. Select a command from the autocomplete menu
4. Fill in any required fields
5. Hit Enter

### Examples

```
/ecosystem
→ Shows all WISE² modules and services

/ai-workforce
→ Displays AI agent status and automation workflows

/platform
→ Real-time platform health and deployment status

/status
→ System health check (git, docker, recent commits)

/tasks
→ Lists pending work from data/inbox

/decision topic:feature description:New feature implementation
→ Logs a decision to data/decisions/

/alert channel:alerts message:Production issue severity:high
→ Sends urgent alert to #alerts channel
```

---

## 🎨 Design System Integration

### Embed Styling
All command responses use consistent WISE² design:
- **Title**: Clear, emoji-prefixed headers
- **Description**: Context and summary
- **Fields**: Organized information in key-value pairs
- **Footer**: WISE² branding
- **Timestamp**: Real-time indicators
- **Colors**: Brand-compliant throughout

### Example Response Structure
```
Title: 🌐 WISE² Ecosystem & Modules
Description: The Organized Chaos Command Center — Complete Module Overview
Color: #0055FF (Primary Blue)
Footer: "WISE² Organized Chaos Command Center"
Timestamp: Auto-included
```

---

## 📡 Deployment Architecture

### Current Setup
- **Process Manager**: PM2
- **Status**: ✅ Running (PID: 50490)
- **Memory**: ~83mb
- **Auto-restart**: Enabled
- **Logs**: `/services/bot/logs/`

### Configuration Files
- **Ecosystem Config**: `/ecosystem.config.js`
- **Environment**: `/services/bot/.env`
- **Bot Code**: `/services/bot/index.js`
- **Documentation**: This file

### Start/Stop Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs wise2-bot

# Restart bot
pm2 restart wise2-bot

# Stop bot
pm2 stop wise2-bot

# Start bot
pm2 start ecosystem.config.js
```

---

## 🎯 WISE² Module Integration

The `/ecosystem` and `/modules` commands provide comprehensive views of:

### Core Production Modules
- **SoundLab** — Audio production suite
- **Live Studio** — Multi-platform streaming
- **Dashboard Pro** — Real-time analytics
- **AI Command Center** — Workflow automation
- **CRM Suite** — Customer relationships
- **Creative Studio** — Design & assets

### Emerging Modules
- **DropShip AI** — E-commerce automation
- **Knowledge Graph** — Cross-device sync
- **PromptOS** — Agent routing framework
- **Google Apps** — Workspace integration
- **Klingai Animation** — AI sprite generation

---

## 🤖 AI Workforce Integration

The `/ai-workforce` command shows:
- **17 Specialist Agents** — Developer, Infrastructure, Marketing, Sales, CRM, Finance, Research, etc.
- **Executive Agent** — Business reasoning and coordination
- **Automation Workflows** — Sequential, parallel, pipeline execution modes
- **Integration Points** — Discord, GitHub, Data layer, Webhooks
- **Scheduled Tasks** — Daily sync, deployment health, backups

---

## 🔐 Security & Permissions

### Bot Permissions in Discord
- ✅ Send Messages
- ✅ Embed Links
- ✅ Read Message History
- ✅ Use Application Commands
- ✅ Read Channels/View Channels

### Data Access
- Reads from `/data/daily-logs/` — Daily activity
- Reads from `/data/decisions/` — Logged decisions
- Reads from `/data/inbox/` — Pending tasks
- Reads git status, docker status

### No Sensitive Data
- ✅ No credentials stored in bot
- ✅ No private keys transmitted
- ✅ Environment variables via .env
- ✅ Webhook URLs secured

---

## 📊 Monitoring & Health

### Startup Verification
Bot sends startup ping to #general on each boot with:
- ✅ Login confirmation
- Guild connection status
- Command deployment status
- Ready message

### Continuous Monitoring
```bash
# Watch real-time logs
pm2 logs wise2-bot

# Check memory usage
pm2 monit

# View detailed info
pm2 info wise2-bot
```

---

## 🔄 Customization Checklist

✅ **Color Scheme** — WISE² brand colors in all embeds  
✅ **Commands** — 11 total (7 core + 4 WISE²-specific)  
✅ **Branding** — Footers, descriptions, terminology  
✅ **Module Integration** — Ecosystem, modules, AI workforce  
✅ **Deployment** — PM2 auto-restart, 24/7 uptime  
✅ **Documentation** — This guide (comprehensive)  
✅ **Data Integration** — Reads from WISE² data layer  
✅ **Team Communication** — Slack-like Discord interface  

---

## 🚀 Next Steps (Future Phases)

### Phase 7 — Advanced Features
- Scheduled slash commands
- Interactive buttons and menus
- Admin commands with role-based access
- Automated alerts for deployments
- GitHub integration (PR notifications)

### Phase 8 — Intelligence
- AI-powered responses via PromptOS agents
- Natural language command parsing
- Context-aware suggestions
- ML-based anomaly detection

### Phase 9 — Multi-Guild
- Deploy to multiple Discord servers
- Per-guild configuration
- Centralized management
- White-label customization

---

## 📞 Support & Troubleshooting

### Bot is Offline
```bash
pm2 restart wise2-bot
```

### Commands Not Showing
- Restart the bot
- Reload Discord (Ctrl+R)
- Check bot has correct permissions

### Missing Logs
```bash
pm2 logs wise2-bot --lines 50
```

### Configuration Issues
Check `.env` file:
```bash
cat services/bot/.env | grep DISCORD
```

---

## 📝 Implementation Notes

**File Changes**:
- ✅ `/services/bot/index.js` — Added WISE² colors and 4 new commands
- ✅ `/ecosystem.config.js` — PM2 configuration created
- ✅ `/services/bot/.env` — Discord credentials configured

**Code Quality**:
- ✅ Consistent error handling
- ✅ Branded embed styling
- ✅ Proper command registration
- ✅ Data layer integration

**Testing**:
- ✅ Bot connects to Discord
- ✅ 11 commands deployed successfully
- ✅ PM2 auto-restart working
- ✅ Logs showing clean operation

---

## 🎉 Summary

Your WISE² Discord bot is now:
- ✅ **Fully customized** with brand colors and commands
- ✅ **Production-ready** with 24/7 uptime via PM2
- ✅ **Feature-rich** with 11 commands covering operations
- ✅ **Well-documented** with this comprehensive guide
- ✅ **Integrated** with WISE² ecosystem and data layer
- ✅ **Professional** with WISE² branding throughout

**The bot is live and ready for team collaboration!** 🚀

---

**Last Updated**: 2026-07-21  
**Status**: ✅ Production Ready  
**Maintainer**: WISE² Core Team
