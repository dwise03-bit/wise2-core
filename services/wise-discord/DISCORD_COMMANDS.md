# WISE² Discord Bot - Complete Command Reference

All commands automatically available via `/` command autocomplete. 40+ commands deployed, all production-ready.

---

## 🤖 1. AI Command Executor (`/ai`)

Unlock WISE² intelligence directly from Discord.

### `/ai ask`
Ask WISE² AI any question with optional context.
```
/ai ask query:"Summarize Q3 revenue trends" context:"Focus on MRR growth"
```

### `/ai code-review`
AI-powered code review for GitHub PRs.
```
/ai code-review pr_url:"https://github.com/..." focus:"security"
```

### `/ai brief`
Generate AI content briefs (social, email, landing page, ad, product).
```
/ai brief topic:"Product Launch" audience:"SMB Founders" format:"landing"
```

### `/ai analyze`
Analyze text, data, or code (sentiment, summary, keywords, issues, structure).
```
/ai analyze input:"User feedback text" type:"sentiment"
```

### `/ai research`
Research topics with AI (quick overview, deep, competitive).
```
/ai research topic:"Market opportunity" depth:"competitive"
```

---

## 👥 2. Client Dashboard Portal (`/client`)

White-label workspace access and management for clients.

### `/client login`
Get secure OAuth login link to dashboard.
```
/client login workspace:"ACME Inc"
```

### `/client status`
View real-time workspace status & KPIs.
```
/client status workspace:"ACME Inc"
```

### `/client invoice`
Generate and view invoices.
```
/client invoice workspace:"ACME Inc" month:"2026-03"
```

### `/client billing`
View subscription and billing details.
```
/client billing workspace:"ACME Inc"
```

### `/client support`
Create support tickets with priority levels.
```
/client support workspace:"ACME Inc" issue:"API rate limiting" priority:"high"
```

### `/client usage`
View usage analytics and metrics.
```
/client usage workspace:"ACME Inc"
```

### `/client team`
Manage workspace team members.
```
/client team workspace:"ACME Inc"
```

---

## 🎨 3. Creative Studio (`/create`)

AI-powered creative content generation.

### `/create image`
Generate AI images (photorealistic, digital art, 3D, illustration, comic, oil painting).
```
/create image prompt:"Futuristic city skyline" style:"digital_art" size:"1024"
```

### `/create video`
Generate AI videos (explainer, ad, product demo, story, tutorial).
```
/create video brief:"Product launch teaser" type:"ad" duration:"30"
```
⏳ 5-15 minutes, you'll be notified when ready.

### `/create mix`
AI audio mixing with presets (podcast, music, voiceover, ambient, balanced).
```
/create mix project:"Podcast Episode 12" preset:"podcast"
```

### `/create voice`
Text-to-speech voice generation.
```
/create voice text:"Welcome to WISE²" voice:"pro_female"
```

### `/create edit`
Edit existing media with AI instructions.
```
/create edit media_id:"abc123" instruction:"Make it 30% brighter"
```

### `/create batch`
Batch generate multiple variations (1-10).
```
/create batch brief:"Summer campaign ideas" quantity:"5" type:"images"
```

### `/create status`
Check generation job status.
```
/create status job_id:"job_xyz"
```

---

## 🖥️ 4. Edge Device Control (`/edge`)

Manage all edge hardware: Raspberry Pi, BYTE, K10, streaming.

### `/edge network`
View all edge devices online status.
```
/edge network
```

### `/edge pi`
Raspberry Pi control (status, restart, reboot, logs, update).
```
/edge pi device:"wisepi" action:"status"
```

### `/edge byte`
WISE² BYTE device control (status, demo mode, battery, animation, reset).
```
/edge byte action:"status"
```

### `/edge k10`
UNIHIKER K10 device control (status, display test, WiFi, mic test, sync).
```
/edge k10 action:"status"
```

### `/edge stream`
WISE² Live streaming control.
```
/edge stream action:"status"
```

### `/edge monitor`
Real-time network monitoring (CPU, memory, temperature, network, disk).
```
/edge monitor metric:"cpu"
```

### `/edge deploy`
Deploy firmware to edge devices.
```
/edge deploy device_type:"pi" version:"latest"
```

---

## 💰 5. Revenue Command Center (`/revenue`)

Sales operations and revenue analytics.

### `/revenue dashboard`
Full revenue operations dashboard (MRR, pipeline, conversion, deals, leads).
```
/revenue dashboard
```

### `/revenue crm`
CRM operations (lookup, recent contacts, add, call history).
```
/revenue crm action:"lookup" contact:"John Doe"
```

### `/revenue deal`
Deal pipeline management (view pipeline, update stage, close deal, create).
```
/revenue deal action:"pipeline"
```

### `/revenue call`
Phone operations (history, recordings, transcripts, callbacks).
```
/revenue call action:"history"
```

### `/revenue lead`
Lead scoring & management (new leads, hot leads, score, assign).
```
/revenue lead action:"hot"
```

### `/revenue forecast`
Revenue forecast (monthly, quarterly, yearly).
```
/revenue forecast period:"quarter"
```

### `/revenue appointment`
Schedule appointments (demo, discovery, proposal, negotiation, closing).
```
/revenue appointment contact:"Jane Smith" time:"14:30" type:"demo"
```

---

## 🏢 6. Admin & Workspace Management (`/admin`)

Multi-tenant workspace administration.

### `/admin workspace`
Workspace management (create, list, status, delete).
```
/admin workspace action:"create" name:"NewClient"
```

### `/admin invite`
Invite team members to workspace.
```
/admin invite workspace:"ACME Inc" email:"user@example.com" role:"editor"
```

### `/admin member`
Manage members (list, update role, remove, permissions).
```
/admin member workspace:"ACME Inc" action:"list"
```

### `/admin billing`
Workspace billing (view, upgrade plan, invoices, payment method).
```
/admin billing workspace:"ACME Inc" action:"view"
```

### `/admin settings`
Workspace settings (name, domain, logo, SSO, API key).
```
/admin settings workspace:"ACME Inc" setting:"domain"
```

### `/admin audit`
Audit logs & compliance (login, changes, deletions, exports, API).
```
/admin audit workspace:"ACME Inc" event_type:"changes"
```

### `/admin health`
Workspace health & metrics (uptime, API latency, database, storage).
```
/admin health workspace:"ACME Inc"
```

### `/admin backup`
Backup & restore (create, list, restore).
```
/admin backup workspace:"ACME Inc" action:"create"
```

---

## 🚀 7. Deployment & CI/CD (`/deploy`)

DevOps automation and deployment control.

### `/deploy service`
Deploy service to specified version.
```
/deploy service service:"website" version:"v2.3.0"
```

### `/deploy status`
Deployment status for a service.
```
/deploy status service:"api"
```

### `/deploy rollback`
Rollback to previous version.
```
/deploy rollback service:"website" version:"v2.2.0"
```

### `/deploy pipeline`
View CI/CD pipeline status for a branch.
```
/deploy pipeline branch:"main"
```

### `/deploy test`
Run test suite (unit, integration, E2E, all).
```
/deploy test suite:"all"
```

### `/deploy build`
Trigger build for a service.
```
/deploy build service:"website" branch:"main"
```

### `/deploy logs`
View deployment logs (1-50 lines).
```
/deploy logs service:"api" lines:"30"
```

### `/deploy check`
Health check all services.
```
/deploy check
```

---

## 📊 Original Commands (Still Active)

### `/wise` — WISE² Operations
- status, health, brain, devices, device, revenue, alerts, help

### `/content` — Content Studio
- create, batch, ideas, status, queue, brand, rewrite, cancel

### `/ops` — Direct Infrastructure
- manage, restart, health, deploy, config, secrets, audit

---

## 🔐 Authentication & Access

- **Admin-only commands**: `/ai ask`, `/wise brain`, `/ops` — require DISCORD_ADMIN_IDS
- **Ephemeral replies**: `/client`, `/admin` commands are private (only requester sees)
- **JWT tokens**: Bot uses automatic JWT refresh (6-hour cycle) for all API calls
- **Event logging**: All operations logged to event bus for audit trails

---

## 📈 Monitoring & Alerts

Commands publish events to Discord alerts channel:
- `/deploy` operations → #alerts-deployment
- `/admin` operations → #alerts-admin
- `/revenue` changes → #alerts-sales
- Errors/failures → All commands have error handling with details

---

## 💡 Quick Tips

1. **Autocomplete**: Type `/` to see all commands, then `ai`, `client`, `create`, etc.
2. **Ephemeral**: Add `--private` flag to any command to hide response from channel
3. **Batch**: Use `/create batch` for multiple variations at once
4. **Notifications**: Long-running jobs (`/create video`, `/deploy service`) send completion notifications
5. **Help**: Type `/wise help` for command cheat sheet

---

## 🚀 Deployment Checklist

Bot is **production-ready**. Before going live:

- [ ] Set `DISCORD_BOT_TOKEN` in `.env`
- [ ] Set `DISCORD_CLIENT_ID` and `DISCORD_GUILD_ID`
- [ ] Configure `DISCORD_ADMIN_IDS` (comma-separated user IDs)
- [ ] Optional: Configure `DISCORD_SYSTEM_ALERTS_WEBHOOK` for alerts channel
- [ ] Run `npm run register` to register commands with Discord
- [ ] Start bot: `npm start` or `npm run dev`
- [ ] Verify commands appear in Discord guild with `/`

---

## 📝 Version

**v2.0** — 7 feature modules, 40+ commands, production-ready.
Last updated: 2026-09-16
