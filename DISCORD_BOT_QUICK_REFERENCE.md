# WISE² Discord Bot — Quick Reference Card

## 🎯 11 Available Commands

### Core Commands (7)

| Command | Purpose | Example |
|---------|---------|---------|
| `/status` | System health check | Shows git, docker, commits |
| `/deploy` | Deployment info | See deployment details |
| `/phase` | Project phase | Current progress (Phase 5-6) |
| `/tasks` | Pending work | List inbox items |
| `/decision` | Log decision | `/decision topic:my-topic description:details` |
| `/sync` | Daily sync | Today's log |
| `/alert` | Send alert | `/alert channel:alerts message:test` |

### WISE² Commands (4)

| Command | Purpose | Shows |
|---------|---------|-------|
| `/ecosystem` | 🌐 Module overview | All WISE² modules & services |
| `/modules` | 📦 Complete list | Production & emerging features |
| `/ai-workforce` | 🤖 Agent status | AI automation, workflows |
| `/platform` | 🚀 System status | Server, services, tech stack |

---

## 📱 How to Use

1. **Open Discord** → Danny-wise2 server
2. **Type**: `/` (slash character)
3. **Select**: Command from autocomplete
4. **Fill**: Required fields (if any)
5. **Send**: Enter key

---

## 🎨 Brand Colors

- 🔵 **Primary Blue** (#0055FF) — Info, status
- 🔴 **Accent Red** (#FF5535) — Alerts, warnings  
- 🟢 **Success Green** (#2CD588) — Confirmations
- ⚫ **Dark Black** (#000000) — Background

---

## 🚀 Management Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs wise2-bot

# Restart
pm2 restart wise2-bot

# Stop
pm2 stop wise2-bot

# Monitor
pm2 monit
```

---

## 📊 Command Descriptions

### `/status` 
Shows system health:
- Git status (clean/dirty)
- Running Docker containers
- Recent commits (last 5)
- Deployment health

### `/ecosystem`
Complete WISE² overview:
- 6 Core modules (SoundLab, Live Studio, Dashboard, AI Center, CRM, Creative)
- Deployment URLs
- Module status

### `/modules`
Detailed module list:
- Production modules (8)
- Emerging features (5)
- Deployment status

### `/ai-workforce`
AI automation status:
- 17 specialist agents
- Execution modes
- Integration points
- Scheduled tasks

### `/platform`
Full platform status:
- Server location
- Service health
- Tech stack
- Active modules

### `/phase`
Project progress:
- Current phase (Phase 5-6)
- Completed phases (1-4)
- In-progress items
- Website & studio status

### `/tasks`
Pending work list:
- Items from data/inbox/
- Top 5 most recent
- Easy task tracking

### `/decision`
Log a decision:
```
/decision topic:feature-name description:Implementation details
```
Saves to data/decisions/

### `/deploy`
Deployment information:
- Server details
- Deployment method
- Status history

### `/sync`
Daily synchronization:
- Today's log (data/daily-logs/)
- Summary of work
- Blockers & next actions

### `/alert`
Send team alert:
```
/alert channel:alerts message:Important message severity:high
```
Posts to Discord webhooks

---

## 🎯 Common Use Cases

**Check if system is healthy:**
```
/status
```

**See what modules we have:**
```
/ecosystem
```

**Check AI automation status:**
```
/ai-workforce
```

**Log a decision:**
```
/decision topic:database-choice description:Using PostgreSQL for scalability
```

**See today's plan:**
```
/sync
```

**List what needs to be done:**
```
/tasks
```

**Send urgent alert:**
```
/alert channel:alerts message:Production issue detected severity:high
```

---

## ✅ Status

- ✅ Bot: Online (Wise defense llc#2601)
- ✅ Commands: 11 deployed
- ✅ Process: Running via PM2
- ✅ Deployment: 24/7 uptime
- ✅ Branding: WISE² customized

---

**Type `/` in Discord to see all available commands!**
