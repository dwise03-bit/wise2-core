# START HERE - WISE² Discord Bot Setup Guide

Welcome! This file tells you where to go based on what you need to do.

---

## What Do You Want to Do?

### 🚀 "I want to get the bot running NOW" (5 minutes)

Start with **QUICKSTART.md**

→ Creates Discord app, sets up env, runs bot

### 📚 "I want to understand the whole process" (30 minutes)

Follow in this order:
1. **DISCORD_SETUP.md** - How to create bot in Discord
2. **QUICKSTART.md** - How to configure and run
3. **README.md** - Full command reference

### 🔧 "I want to deploy to production" (1-2 hours)

Start here: **DEPLOYMENT.md**

Options:
- Replit (free, easy, 15 min)
- Docker (self-hosted, 20 min)
- PM2 (process manager, 20 min)
- wise2.net (production, 30 min)

### 🐛 "Something isn't working"

1. Run: `node validate.js`
   - Shows what's missing
   - Gives specific error messages

2. Check: **Troubleshooting** section in README.md

3. See: **Common Issues** in DEPLOYMENT.md

### 📖 "I want to understand what was built"

Read: **IMPLEMENTATION_REPORT.md**

Contains:
- What was implemented
- Architecture overview
- Success metrics
- Next steps

### 🧪 "I want to test the bot"

1. Run: `npm install`
2. Run: `node setup.js` (interactive setup)
3. Run: `node validate.js` (verify config)
4. Run: `npm start` (start bot)
5. Try commands in Discord:
   - `/status`
   - `/deploy`
   - `/phase`
   - `/tasks`
   - `/decision topic:test description:demo`
   - `/sync`
   - `/alert channel:status message:test`

---

## Documentation Index

### Quick Reference
- **START_HERE.md** (this file) — Navigation guide
- **QUICKSTART.md** — 5-minute setup

### Setup & Configuration
- **DISCORD_SETUP.md** — How to create bot on Discord
- **IMPLEMENTATION_REPORT.md** — What was built & why

### Detailed Guides
- **README.md** — Full documentation (500+ lines)
- **DEPLOYMENT.md** — Hosting options & deployment
- **PHASE_A_COMPLETE.md** — Technical implementation details

### Scripts (Run These)
- `setup.js` — Interactive configuration wizard
- `validate.js` — Pre-flight configuration check

### Source Code
- `index.js` — Main bot code (450 lines)
- `package.json` — Dependencies
- `.env.example` — Configuration template

---

## Quick Links

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICKSTART.md** | Get running in 5 min | 3 min |
| **DISCORD_SETUP.md** | Create Discord bot | 10 min |
| **README.md** | Full reference | 15 min |
| **DEPLOYMENT.md** | Deploy to production | 10 min |
| **IMPLEMENTATION_REPORT.md** | What was built | 10 min |
| **PHASE_A_COMPLETE.md** | Technical details | 15 min |

---

## The Fast Path (If You're in a Hurry)

```bash
# 1. Setup (5 min)
cd services/bot
node setup.js

# 2. Validate (1 min)
node validate.js

# 3. Run (2 min)
npm install
npm start

# 4. Test (2 min)
# In Discord, type: /status
# You should see system health info

Total time: 10 minutes ✅
```

---

## File Organization

```
services/bot/
├── START_HERE.md                 ← You are here
├── QUICKSTART.md                 ← Start here for setup
├── README.md                     ← Full documentation
├── DISCORD_SETUP.md              ← Discord portal guide
├── DEPLOYMENT.md                 ← Hosting & deployment
├── IMPLEMENTATION_REPORT.md      ← What was built
├── PHASE_A_COMPLETE.md           ← Technical details
│
├── index.js                      ← Main bot code
├── setup.js                      ← Setup wizard (executable)
├── validate.js                   ← Config validator (executable)
│
├── .env.example                  ← Environment template
├── package.json                  ← Dependencies
└── Dockerfile                    ← Container config
```

---

## What This Bot Does

The Discord bot provides 7 commands for WISE² operations:

- **`/status`** — Check system health (git, docker, commits)
- **`/deploy`** — Show deployment information
- **`/phase`** — Show current project phase
- **`/tasks`** — List pending tasks from data/inbox/
- **`/decision`** — Log a new architecture decision
- **`/sync`** — Show today's daily sync log
- **`/alert`** — Send alerts to 6 Discord channels

Each command reads from WISE²'s data layer (files in data/ directory).

---

## Key Features

✅ **Modern Discord.js** - Slash commands (not old prefix commands)  
✅ **Interactive Setup** - Node script guides you through configuration  
✅ **Configuration Validation** - Checks everything before running  
✅ **Data Integration** - Reads from data/daily-logs, data/decisions, data/inbox  
✅ **Webhook Support** - Sends alerts to 6 Discord channels  
✅ **Error Handling** - User-friendly error messages  
✅ **Multiple Deployment Options** - Replit, Docker, PM2, wise2.net  
✅ **Comprehensive Documentation** - 40+ KB of guides  

---

## Common Tasks

### "How do I start the bot?"
→ See **QUICKSTART.md** → Run: `npm start`

### "How do I create the Discord bot?"
→ See **DISCORD_SETUP.md** → Step 1: Create application

### "How do I test if everything works?"
→ Run: `node validate.js`

### "How do I deploy to production?"
→ See **DEPLOYMENT.md** → Choose platform

### "How do I use the /alert command?"
→ See **README.md** → `/alert` section

### "How do I log a decision?"
→ Use: `/decision topic:my-topic description:details`

### "How do I see today's daily sync?"
→ Use: `/sync`

### "How do I list pending tasks?"
→ Use: `/tasks`

### "What if something breaks?"
→ Run: `node validate.js` → See what's missing

---

## Estimated Time Investments

| Task | Time | Effort |
|------|------|--------|
| Discord bot creation | 5 min | Easy |
| Environment setup | 5 min | Easy |
| Local testing | 5 min | Easy |
| Replit deployment | 15 min | Easy |
| Docker deployment | 20 min | Medium |
| Production setup (wise2.net) | 30 min | Medium |
| Phase B planning | 1 hour | High |

---

## Support & Help

**Still have questions?**

1. Check the relevant documentation file (see index above)
2. Run `node validate.js` to diagnose issues
3. Check "Troubleshooting" section in README.md
4. See common issues in DEPLOYMENT.md

**Nothing helps?**

- Check bot logs: `npm start` (shows all output)
- Verify Discord bot has correct permissions
- Verify webhook URLs are valid
- Check .env file is not missing variables

---

## What's Next After Setup?

### Phase A (Current) - ✅ COMPLETE
- Slash commands working
- Data integration tested
- Documentation complete
- Ready for MVP deployment

### Phase B (Next Quarter)
- OAuth2 authentication
- Role-based access control
- Advanced commands
- Scheduled tasks
- GitHub integration

### Phase C (Later)
- Full Kubernetes deployment
- Distributed bot instances
- Advanced monitoring
- Dashboard integration

---

## Remember

⚠️ **Never share your bot token** — It gives full control of the bot  
⚠️ **Never commit .env to git** — Use .env.example template  
⚠️ **Always use node validate.js** — Catches config issues early  
✅ **Use environment variables** — For all secrets

---

## You're Ready! 🚀

Pick your path:

- **Fast Path**: QUICKSTART.md (5 min)
- **Thorough Path**: DISCORD_SETUP.md → README.md (30 min)
- **Production Path**: DEPLOYMENT.md (1-2 hours)

Questions? See the file index above or check DEPLOYMENT.md troubleshooting.

**Let's go!**

---

**Bot Status**: ✅ Ready to Deploy  
**Version**: 1.0 (Phase A MVP)  
**Last Updated**: 2026-07-20
