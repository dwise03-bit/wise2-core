# Wise Defense SaaS - Deployment Guide

## Environment Setup

### Critical Environment Variables

The following environment variables **must** be set for agents to run:

```bash
# Email Service (Required for scheduler-agent, engagement-agent)
RESEND_API_KEY=re_test_key_placeholder
RESEND_FROM_EMAIL=noreply@wisedefense.com

# Database (Required for all agents)
DATABASE_URL=postgresql://postgres:password@localhost:5432/wisedefense?sslmode=disable
```

### Setup Steps

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in required values:**
   - Edit `.env` and add all API keys and credentials
   - At minimum, set `RESEND_API_KEY` (even a test key works)
   - Set `DATABASE_URL` pointing to your PostgreSQL instance

3. **Start PM2 agents:**
   ```bash
   cd dashboard
   pm2 start ecosystem.config.js
   ```

## Known Issues & Fixes

### Agent Crashes with "RESEND_API_KEY environment variable not set"

**Symptom:**
- `engagement-agent` and `scheduler-agent` crash immediately
- Error: `[ENGAGEMENT] RESEND_API_KEY environment variable not set`

**Fix:**
1. Add to `.env`:
   ```bash
   RESEND_API_KEY=re_test_key_placeholder
   ```

2. Reload ecosystem config:
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js
   ```

## Database Initialization

All database tables are auto-created via migrations. On first deployment:

```bash
# Tables are created automatically when agents start
# No manual migration step needed
```

## Agent Monitoring

Monitor agent health with:

```bash
pm2 status                    # Show all agents
pm2 logs agent-name          # View logs
pm2 logs --err --nostream    # View errors only
pm2 restart all              # Restart all agents
```

## Production Checklist

- [ ] DATABASE_URL configured correctly
- [ ] RESEND_API_KEY set (can be test key)
- [ ] All agents show "online" status
- [ ] No errors in `pm2 logs`
- [ ] API endpoints responding (GET / returns 200)

## References

- `.env.example` - Template of all required environment variables
- `dashboard/ecosystem.config.js` - PM2 agent configuration
- `dashboard/agents/` - Agent implementation files
