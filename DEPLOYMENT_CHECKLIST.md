# WISE² Revenue Command Center — Deployment Checklist

**Status**: Ready for Production Deployment  
**Build Date**: 2026-09-01  
**Commit**: `54cef369`

---

## Quick Start

```bash
# 1. Run migration (requires DATABASE_URL env var set)
cd packages/db && npx prisma migrate deploy

# 2. Build and start API
cd packages/api && npm run build && npm start

# 3. Restart Discord bot
cd services/bot && npm start

# 4. Verify health
curl http://localhost:3000/revenue/dashboard?period=today
```

---

## Pre-Deployment Checklist

- [ ] All code reviewed and tested
- [ ] Commit `54cef369` verified in git
- [ ] Environment variables configured
  - [ ] `DATABASE_URL` set
  - [ ] `DISCORD_BOT_TOKEN` set
  - [ ] `DISCORD_CLIENT_ID` set
  - [ ] `DISCORD_GUILD_ID` set

---

## Deployment Steps

### 1. Database Migration
```bash
cd packages/db
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

Verify 8 tables created:
```bash
psql "$DATABASE_URL" -c "\dt public.offer* public.deal* public.lead_score* public.quote* public.revenue* public.follow_up*"
```

### 2. API Build & Start
```bash
cd packages/api
npm run build      # Check for TypeScript errors
npm start          # Start on port 3000
```

### 3. Discord Bot Restart
```bash
cd services/bot
npm start          # Or: pm2 restart wise2-bot
```

### 4. Verify Endpoints

**API Health**:
```bash
curl http://localhost:3000/revenue/dashboard?period=today
# Expected: {summary: {...}, timestamp}
```

**Discord Commands**:
```
/revenue today
/lead score <id>
/deal create lead_id:<id>
```

---

## Service Status

| Service | Component | Status | Command |
|---------|-----------|--------|---------|
| API | packages/api | ✅ Ready | npm start |
| Bot | services/bot | ✅ Ready | npm start |
| Database | Prisma migration | ✅ Ready | prisma migrate deploy |

---

## Testing

### Unit Tests (Recommended)
```bash
cd packages/api
npm test revenue   # Run revenue service tests
```

### Manual Verification
1. **Database**: Run SELECT on each revenue table
2. **API**: Test 5 core endpoints (dashboard, leads, deals, attribution, pipeline)
3. **Discord**: Post /revenue, /lead, /deal commands
4. **Phone Bridge**: POST to /revenue/phone/call-initiated

---

## Rollback Plan

If deployment fails:

```bash
# 1. Stop services
pm2 stop wise2-api wise2-bot

# 2. Revert commit
git revert 54cef369

# 3. Restore database (drop new tables)
psql "$DATABASE_URL" << 'SQL'
DROP TABLE IF EXISTS follow_up_tasks CASCADE;
DROP TABLE IF EXISTS revenue_events CASCADE;
DROP TABLE IF EXISTS deal_activities CASCADE;
DROP TABLE IF EXISTS deal_events CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS lead_scores CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
SQL

# 4. Restart services
pm2 restart wise2-api wise2-bot
```

---

## Success Criteria

- [ ] All 8 database tables exist
- [ ] API responds to health check (<500ms)
- [ ] Discord bot online with 5 new commands registered
- [ ] Phone webhook accepting calls
- [ ] No errors in service logs
- [ ] Revenue dashboard displays data

---

## Support

**Deployment Help**: See WISE2_REVENUE_CC_COMPLETE.md  
**Issues**: Check logs via `pm2 logs`  
**Revert**: `git revert 54cef369`

---

**Ready to deploy**. Follow steps 1-4 above in order.
