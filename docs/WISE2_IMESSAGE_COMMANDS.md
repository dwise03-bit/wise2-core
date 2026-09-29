# WISE² iMessage Commands - Quick Reference

**Status**: Production Ready  
**Updated**: 2026-08-20

---

## Quick Start

Just send natural messages to WISE². No special syntax required:

```
Wise, status
Wise, what's broken?
Wise, check production
```

WISE² understands context, intent, and risk levels automatically.

---

## Command Categories

### 📊 System Status

**Check overall health:**
```
Wise, status
Wise, system status
Wise, are things working?
```

**Get comprehensive diagnostics:**
```
Wise, health check
Wise, what's wrong?
Wise, diagnose
```

**Check specific components:**
```
Wise, check Hermes
Wise, check the database
Wise, is the VPS up?
Wise, what's using memory?
```

---

### 🏠 Mac Local Status

```
Wise, what's running on my Mac?
Wise, is Hermes online?
Wise, check local services
Wise, how much disk is free?
Wise, which apps are running?
```

---

### 🌐 VPS Production Status

```
Wise, check production
Wise, is the API healthy?
Wise, check the VPS
Wise, show server status
Wise, what failed on production?
```

---

### 💻 Development & Code

**Have Claude Code review or fix things:**
```
Wise, have the local coder audit the API
Wise, have Claude review the changes
Wise, fix this error: <error message>
Wise, debug why the tests are failing
Wise, run the test suite
```

**Code operations:**
```
Wise, build the application
Wise, what's the current git status?
Wise, show me the diff
Wise, check the repository
```

---

### 🚀 Deployment

**Check deployment status:**
```
Wise, show recent deployments
Wise, what's running in production?
Wise, did the last deploy work?
```

**Deploy (requires confirmation):**
```
Wise, deploy staging
Wise, deploy production
```

You'll receive a confirmation message:
```
⚠️ Production Deployment
Target: wise2.io
Services affected: API, Dashboard, Worker
Risk: HIGH

Confirm: CONFIRM abc123
```

Reply with the confirmation code.

**Rollback (requires confirmation):**
```
Wise, rollback production
Wise, undo the last deploy
```

---

### 👥 Customer & Lead Management

**Customer queries:**
```
Wise, show my customers
Wise, who's active right now?
Wise, check Craig's status
Wise, show Craig's demo
Wise, is Paige's demo up?
```

**Lead management:**
```
Wise, today's leads
Wise, who needs follow-up?
Wise, show the pipeline
Wise, leads from this week
```

**Create demos:**
```
Wise, create a demo
Wise, create a demo for Paige
Wise, create a starter pack
Wise, generate onboarding for <customer>
```

---

### 🎬 Automation & Workflows

**Customer automation:**
```
Wise, run customer follow-ups
Wise, send today's summary
Wise, generate reports
Wise, check automation status
```

**Business workflows:**
```
Wise, what automation ran today?
Wise, did the backup complete?
Wise, run the nightly cleanup
```

---

### 🤖 AI & Models

**Local AI:**
```
Wise, use local AI for this: <prompt>
Wise, think about this locally: <question>
Wise, what models are available?
Wise, check local AI status
```

**Cloud AI (Claude):**
```
Wise, use Claude for deep analysis
Wise, have Claude reason about this
Wise, ask Claude: <question>
```

**Model management:**
```
Wise, list available models
Wise, which model works best for X?
Wise, GPU status
```

---

### 🔍 Search & Memory

**Search WISE² knowledge:**
```
Wise, search for <topic>
Wise, find information about X
Wise, what do I know about Y?
```

**Memory & notes:**
```
Wise, remember this: <note>
Wise, what did we talk about?
Wise, show today's log
Wise, what happened yesterday?
```

---

### 📋 Logs & Monitoring

**View logs:**
```
Wise, show API errors
Wise, what went wrong?
Wise, inspect the logs
Wise, show worker errors
```

**Monitoring:**
```
Wise, what's my uptime?
Wise, check error rate
Wise, show response times
Wise, are there alerts?
```

---

### 🛡️ Security & Administration

**Authorized senders only:**

```
Wise, list authorized senders
Wise, who can control me?
Wise, add <phone> as operator
Wise, remove <phone> from access
```

**System lock (emergency):**
```
Wise, lock operations
Wise, unlock operations
```

While locked:
- ✅ Read-only queries work
- ❌ Deployments blocked
- ❌ Changes blocked
- ❌ Dangerous operations blocked

**Security checks:**
```
Wise, security audit
Wise, check for vulnerabilities
Wise, are credentials rotated?
```

---

### 💼 Business Modules

**HVAC:**
```
Wise, show HVAC status
Wise, check thermostat
Wise, HVAC diagnostics
Wise, create HVAC demo
```

**Defense:**
```
Wise, show defense status
Wise, check safety radar
Wise, defense alerts
```

**Trading (Aether):**
```
Wise, show trading status
Wise, market analysis
Wise, recent trades
```

**Sound Lab:**
```
Wise, sound lab status
Wise, create audio
Wise, list compositions
```

**Jingle Lab:**
```
Wise, jingle lab status
Wise, create a jingle
Wise, music generation
```

**Live Studio:**
```
Wise, stream status
Wise, start broadcast
Wise, streaming quality
```

---

### 📈 Reports & Analytics

```
Wise, daily summary
Wise, weekly report
Wise, show analytics
Wise, customer dashboard
Wise, revenue report
```

---

### ❓ Help

```
Wise, help
Wise, what can you do?
Wise, show commands
Wise, how do I...?
```

---

## Risk Levels & Confirmations

### Level 0: Execute Immediately ✅

Read-only, safe operations:
- Status checks
- Log viewing
- Report generation
- Search

**Example:**
```
Wise, status
→ ✅ Immediate response
```

---

### Level 1: Auto-Execute 🟢

Reversible operations:
- Builds
- Tests
- Demo creation

**Example:**
```
Wise, run the tests
→ ✅ Executes immediately
(no confirmation needed)
```

---

### Level 2: Requires Confirmation ⚠️

Mutating operations:
- Deploy staging
- Edit configuration
- Customer data changes

**Example:**
```
Wise, deploy staging
→ ⚠️ "Please confirm: CONFIRM abc123"
(reply with confirmation code)
```

---

### Level 3: Explicit Confirmation 🔐

Destructive operations (owner only):
- Production deployment/rollback
- Database operations
- Delete operations
- Security changes

**Example:**
```
Wise, delete the database
→ 🔐 "DESTRUCTIVE OPERATION"
   "Reply: CONFIRM <code>"
   (confirmation expires in 5 minutes)
```

---

## Response Format

WISE² responses include:

**Status Check:**
```
✅ WISE² Status
Mac Hermes: online
VPS: online
All systems operational
```

**Queued Job:**
```
✅ Job Queued
ID: job_abc123
Task: Build application
Executor: Mac
Status: Running...
```

**Error:**
```
❌ Error
Service: Postgres
Issue: Connection refused
Action: Restarting database...
```

**Pending Confirmation:**
```
⚠️ Staging Deployment
Target: staging.wise2.io
Changes: 3 commits
Risk: MEDIUM

Confirm: CONFIRM abc123
Code expires in 5 minutes
```

---

## Message Format Tips

**WISE² understands:**

- ✅ Natural language ("what's broken?")
- ✅ Partial sentences ("status")
- ✅ Full requests ("show me the production logs")
- ✅ Questions ("is the VPS up?")
- ✅ Commands ("deploy staging")

**WISE² responds within:**

- 📊 Status queries: 1-2 seconds
- 🔨 Local operations: 5-30 seconds
- 🌐 Remote queries: 2-10 seconds
- 🚀 Deployments: 2-5 minutes
- 💻 Code operations: 1-10 minutes

---

## Common Workflows

### Morning Check

```
Wise, status
Wise, today's leads
Wise, show recent errors
```

### Before Deployment

```
Wise, show recent commits
Wise, run the tests
Wise, deploy staging
```

### Customer Demo

```
Wise, create a demo for [customer]
Wise, show [customer]'s preview URL
Wise, what's the status?
```

### Emergency Response

```
Wise, what's broken?
Wise, show production errors
Wise, check VPS
Wise, restart the API
```

---

## Troubleshooting Commands

**If WISE² doesn't respond:**

```
Wise, status
Wise, is anyone home?
Wise, restart Hermes
```

**If a sender isn't authorized:**

```
Wise, who can control me?
Wise, add this number
```

**If something goes wrong:**

```
Wise, what happened?
Wise, show me the logs
Wise, debug the error
```

---

## Pro Tips

1. **Be specific**: "Check production API" is better than "status"
2. **Use context**: WISE² remembers recent operations
3. **Confirm important actions**: Always review confirmation messages
4. **Check before emergency**: "Wise, is this safe?" before risky ops
5. **Save time**: Use short queries on good connections
6. **Use lock mode**: "Wise, lock operations" if you want safety

---

## Limitations & Notes

❌ **Cannot**:
- Access sensitive data (passwords, tokens)
- Change critical infrastructure without confirmation
- Execute arbitrary scripts
- Bypass security policies

✅ **Can**:
- View operational status
- Trigger safe automation
- Request confirmations for risky ops
- Get help and guidance

---

**WISE² IMP is your remote command center.**

Send natural language. WISE² handles the rest.

Questions? → `Wise, help`
