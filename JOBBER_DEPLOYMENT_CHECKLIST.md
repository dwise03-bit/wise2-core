# Jobber Integration — Deployment Checklist

Complete this checklist before going live with a client.

## Phase 1: Infrastructure Setup

### Code & Configuration

- [ ] Jobber client library deployed (`packages/api/src/integrations/jobber.ts`)
- [ ] Sync service deployed (`packages/api/src/services/jobber-sync.ts`)
- [ ] API routes deployed (`packages/api/src/routes/integrations/jobber-sync.ts`)
- [ ] Environment variables configured (see `.env.example`)
- [ ] TypeScript types deployed (`packages/api/src/types/jobber.ts`)

### Database (If Applicable)

- [ ] Create `jobber_sync_logs` table (schema TBD based on your DB)
- [ ] Create indices on `accountId`, `syncedAt` for performance
- [ ] Test write permissions for sync service

### Documentation

- [ ] `JOBBER_INTEGRATION_SETUP.md` — For internal setup reference ✅
- [ ] `GETDOWN_JOBBER_CLIENT_SETUP.md` — For client onboarding ✅
- [ ] `JOBBER_DEPLOYMENT_CHECKLIST.md` — This document ✅

---

## Phase 2: Testing (Staging)

### Test with Sandbox Credentials

- [ ] Get Jobber sandbox account credentials (if available)
- [ ] Test API client: `curl /api/integrations/jobber/sync/status`
- [ ] Verify sync pulls data correctly
- [ ] Check that all entity types sync (customers, jobs, estimates, invoices, payments)
- [ ] Monitor sync duration (should be < 10 seconds for typical dataset)

### Verify Data Mapping

- [ ] Customer names and emails sync correctly
- [ ] Job titles, dates, and status values map properly
- [ ] Invoice numbers and amounts are accurate
- [ ] Payment methods and dates preserved
- [ ] Revenue figures match Jobber totals

### Dashboard Integration

- [ ] Dashboard displays synced data (not seed data) when Jobber is configured
- [ ] KPIs update after sync: revenue, contracts, pipeline, jobs
- [ ] Historical data persists after sync
- [ ] No data loss or duplication on re-sync

### Error Handling

- [ ] Test with invalid token → see graceful error message
- [ ] Test with no internet → sync retries on next interval
- [ ] Test with large dataset (1000+ customers) → completes successfully
- [ ] Logs show clear error messages for troubleshooting

---

## Phase 3: Security Review

### Secrets Management

- [ ] Jobber tokens stored in secure vault (not in code/git)
- [ ] Environment variables use your deployment platform's secrets
- [ ] Access token is never logged or exposed in responses
- [ ] Token rotation instructions documented

### API Authentication

- [ ] Add authentication middleware to `POST /api/integrations/jobber/config`
- [ ] Restrict `POST /api/integrations/jobber/reset` to admins only
- [ ] Verify `GET /api/integrations/jobber/sync/status` is read-only
- [ ] Consider rate-limiting on sync endpoints

### Data Privacy

- [ ] Confirm only customer, job, estimate, invoice, payment data is synced
- [ ] No internal Jobber fields (e.g., private notes) are exposed
- [ ] Sync logs don't contain customer PII
- [ ] Data retention policy documented (how long sync logs kept?)

---

## Phase 4: Client Onboarding

### Pre-Setup

- [ ] Send client `GETDOWN_JOBBER_CLIENT_SETUP.md`
- [ ] Verify client has Jobber Pro or higher (required for API access)
- [ ] Confirm client can access Jobber API settings
- [ ] Schedule 15-minute setup call (optional but recommended)

### Credential Exchange

- [ ] Client generates Jobber access token in their account
- [ ] Client provides Account ID + Token via secure channel (encrypted email, LastPass, 1Password, etc.)
- [ ] Do NOT ask for credentials via unencrypted email or Slack
- [ ] Confirm token is copied completely (easy to truncate)

### Configuration

- [ ] Add credentials to production environment
- [ ] Trigger manual sync via `/api/integrations/jobber/sync`
- [ ] Verify sync succeeds and counts look reasonable
- [ ] Check sync logs for any warnings or errors

### Verification Call

- [ ] Walk client through dashboard showing live data
- [ ] Highlight which pages are now pulling Jobber data
- [ ] Show sync status page (`/api/integrations/jobber/sync/status`)
- [ ] Demonstrate 15-minute auto-refresh
- [ ] Answer questions about data freshness, what's synced, etc.

### Training

- [ ] Explain that pipeline drag-and-drop is now available (if 2-way sync added)
- [ ] Show how to check sync health
- [ ] Provide troubleshooting guide
- [ ] Share contact info for support
- [ ] Set expectations: 15-minute sync lag is normal

---

## Phase 5: Monitoring & Support

### Post-Launch (First Week)

- [ ] Check sync logs daily for errors
- [ ] Verify data freshness (sync running every 15 min)
- [ ] Monitor API response times (should be <5s)
- [ ] Check for any data discrepancies (e.g., invoice totals match Jobber)
- [ ] Collect feedback from client on accuracy

### Ongoing

- [ ] Set up alerting if sync fails 3+ times in a row
- [ ] Monitor Jobber API rate limits (if hitting limits, increase sync interval)
- [ ] Review sync logs weekly for patterns
- [ ] Plan incremental sync feature (future: only pull changed records)

### Support Playbook

**Client says**: "Data isn't updating"
1. Check last sync time: `GET /api/integrations/jobber/sync/status`
2. If > 15 min ago, trigger manual sync: `POST /api/integrations/jobber/sync`
3. Check sync logs for errors
4. Verify Jobber token is still valid

**Client says**: "Missing customers/jobs"
1. Log into Jobber and verify record exists
2. Check if it's marked archived (sync skips archived by default)
3. Confirm record type is in sync scope (customers, jobs, estimates, invoices, payments)
4. Run full sync again

**Client says**: "Data looks wrong"
1. Spot-check invoice number/amount in Jobber vs WISE²
2. Check if sync is pulling latest data (last sync time)
3. Compare field mapping (e.g., is phone # in right place?)
4. Review mapping code in `services/jobber-sync.ts`

---

## Phase 6: Performance Tuning (After 2 Weeks)

### Evaluate Sync Interval

- [ ] Is 15-minute cadence appropriate? Too frequent? Too slow?
- [ ] Monitor API call counts (should be <100/day for typical client)
- [ ] Adjust interval if needed (see `services/jobber-sync.ts` line 187)

### Optimize Queries

- [ ] Review sync duration trends (improving? getting slower?)
- [ ] If > 30 seconds, consider pagination/incremental sync
- [ ] Profile which data types are slowest to fetch

### Data Retention

- [ ] Define how long to keep sync logs (30 days? 90 days?)
- [ ] Set up automated cleanup if needed
- [ ] Archive old logs for audit trail

---

## Phase 7: Future Enhancements

### Two-Way Sync (Optional)

- [ ] Add logic to send job status updates back to Jobber
- [ ] Add logic to send invoice payment status back to Jobber
- [ ] Test round-trip consistency

### Incremental Sync (Optimization)

- [ ] Query only changed records (updatedAt > lastSync)
- [ ] Significantly faster for large datasets
- [ ] Falls back to full sync if needed

### Webhooks (Advanced)

- [ ] Replace polling with Jobber webhooks
- [ ] Real-time data (not 15-min delay)
- [ ] Lower API costs
- [ ] More complex infrastructure needed

---

## Deployment Steps

### 1. Deploy Code

```bash
# Ensure all files are in place
ls packages/api/src/integrations/jobber.ts
ls packages/api/src/services/jobber-sync.ts
ls packages/api/src/routes/integrations/jobber-sync.ts

# Run tests
npm test

# Deploy to staging
vercel deploy --env staging

# Deploy to production
vercel deploy --prod
```

### 2. Configure Environment

**Staging**:
```bash
# Via Vercel UI or CLI
vercel env add JOBBER_ENABLED staging
vercel env add JOBBER_ACCOUNT_ID staging
vercel env add JOBBER_ACCESS_TOKEN staging
```

**Production**:
```bash
# Via Vercel UI or CLI (same process)
vercel env add JOBBER_ENABLED production
vercel env add JOBBER_ACCOUNT_ID production
vercel env add JOBBER_ACCESS_TOKEN production
```

### 3. Verify Deployment

```bash
# Check that sync worker started
curl https://your-domain/api/integrations/jobber/config

# Should return 400 (not configured yet)
# Not 500 (would indicate deployment error)

# Check logs
vercel logs your-project --tail
```

### 4. Test with Client Credentials

```bash
# Once client provides credentials
curl -X POST https://your-domain/api/integrations/jobber/config \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "client_account_id",
    "accessToken": "client_token"
  }'

# Should return 200 if valid
```

---

## Rollback Procedure

If something goes wrong:

1. **Disable integration**:
   ```bash
   vercel env set JOBBER_ENABLED false
   ```

2. **Dashboard falls back to seed data** (safe mode)

3. **Investigate logs**:
   ```bash
   vercel logs your-project --grep "Jobber"
   ```

4. **Fix issue** in code or configuration

5. **Re-enable**:
   ```bash
   vercel env set JOBBER_ENABLED true
   ```

---

## Sign-Off

- [ ] Engineering lead: _____________________ Date: _______
- [ ] QA lead: _____________________ Date: _______
- [ ] Security review: _____________________ Date: _______
- [ ] Product manager: _____________________ Date: _______

---

## Notes for This Deployment

```
[Space for deployment-specific notes, issues, or decisions]
```
