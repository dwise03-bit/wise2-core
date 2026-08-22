# Jobber Integration Setup Guide

Full integration of Jobber field service data into WISE² Revenue Engine for Get Down Pressure Washing and similar service businesses.

## What This Does

- **Live data sync**: Pulls customers, jobs, estimates, invoices, and payments from Jobber every 15 minutes
- **Dashboard refresh**: All KPIs, pipeline, dispatch board, and metrics reflect real Jobber data
- **Workflow integration**: Follow-ups, estimates, and revenue tracking use actual data
- **No double-entry**: No manual data re-entry between Jobber and WISE²

## Prerequisites

1. **Jobber account** with API access (requires Jobber Pro or higher)
2. **Jobber API credentials**:
   - Account ID
   - Personal access token (generated in Jobber settings)
3. **Environment variables** configured (see below)

## Step 1: Get Jobber API Credentials

1. Log in to **Jobber** → **Settings** → **API**
2. Create a new personal access token (or use existing)
3. Save:
   - **Account ID** (visible in Account Settings)
   - **Access Token** (full token, keep secure)

## Step 2: Configure Environment Variables

### Development (.env.local)

```bash
# Jobber Integration
JOBBER_ACCOUNT_ID=your_account_id_here
JOBBER_ACCESS_TOKEN=your_personal_access_token_here
```

### Production (Vercel / Docker / Your Host)

Set via environment variables in your deployment:

```bash
JOBBER_ACCOUNT_ID=your_account_id_here
JOBBER_ACCESS_TOKEN=your_personal_access_token_here
```

**Important**: Never commit these to git. Use your deployment platform's secrets manager.

## Step 3: Initialize Sync

### Option A: Manual Sync (Testing)

```bash
curl -X POST http://localhost:3000/api/integrations/jobber/sync \
  -H "Content-Type: application/json"
```

### Option B: Automatic Sync (Production)

The sync worker starts automatically:
- Runs initial full sync on startup
- Then syncs every 15 minutes (configurable)
- Logs to console/logs

Monitor the logs:
```bash
# Watch sync logs in production
tail -f logs/sync.log | grep Jobber
```

## Step 4: Verify Integration

### Check Sync Status

```bash
curl http://localhost:3000/api/integrations/jobber/sync/status
```

Response (example):
```json
{
  "lastSync": "2026-08-22T14:30:00.000Z",
  "counts": {
    "customers": 42,
    "jobs": 157,
    "estimates": 23,
    "invoices": 89,
    "payments": 76
  },
  "syncWorkerActive": true,
  "syncIntervalMinutes": 15
}
```

### Check Configuration

```bash
curl http://localhost:3000/api/integrations/jobber/config
```

Response (token masked for security):
```json
{
  "accountId": "ABC123...",
  "tokenStatus": "configured",
  "tokenMasked": "eyJhbGc..."
}
```

## Step 5: Connect Frontend to Live Data

The dashboard automatically detects if Jobber is configured:

1. **If Jobber is configured**: Loads real data from sync
2. **If Jobber is not configured**: Falls back to demo seed data (safe for presentations)

No code changes needed — the data layer auto-detects the environment.

## API Endpoints

### Trigger Manual Sync

```
POST /api/integrations/jobber/sync

Response:
{
  "success": true,
  "syncedAt": "2026-08-22T14:30:00.000Z",
  "counts": { customers: 42, jobs: 157, ... },
  "duration": 3421
}
```

### Get Last Sync Status

```
GET /api/integrations/jobber/sync/status

Response:
{
  "lastSync": "2026-08-22T14:30:00.000Z",
  "counts": { ... },
  "syncWorkerActive": true,
  "syncIntervalMinutes": 15
}
```

### Get Current Config (Masked)

```
GET /api/integrations/jobber/config

Response:
{
  "accountId": "ABC123...",
  "tokenStatus": "configured",
  "tokenMasked": "eyJhbGc..."
}
```

### Update Credentials

```
POST /api/integrations/jobber/config

Body:
{
  "accountId": "new_account_id",
  "accessToken": "new_access_token"
}

Response:
{
  "success": true,
  "message": "Jobber credentials updated",
  "accountId": "new_account_id"
}
```

### Reset Integration

```
POST /api/integrations/jobber/reset

Response:
{
  "success": true,
  "message": "Jobber integration reset"
}
```

## Data Mapping

### Jobber → WISE² Schema

| Jobber | WISE² | Notes |
|--------|-------|-------|
| `customer` | `Customer` | Name, email, phone, addresses |
| `job` | `Job` | Title, status, dates, assigned crew, location |
| `estimate` | `Estimate` | Status, total, line items, validity |
| `invoice` | `Invoice` | Number, status, amount, due date |
| `payment` | `Payment` | Amount, method, date, linked to invoice |

Custom fields and additional Jobber data can be added to the mapper (see `services/jobber-sync.ts`).

## Troubleshooting

### "Jobber integration not configured"

**Problem**: Sync endpoint returns 400 error

**Solution**:
1. Verify `JOBBER_ACCOUNT_ID` and `JOBBER_ACCESS_TOKEN` are set
2. Check environment variable names are exact
3. Restart the server after setting env vars

### "Invalid credentials"

**Problem**: Sync fails with "Invalid credentials"

**Solution**:
1. Verify token in Jobber still exists (not revoked)
2. Confirm account ID matches Jobber account
3. Test token by logging into Jobber settings
4. Generate a new token if needed

### "Sync timeout / slow"

**Problem**: Sync takes >30 seconds or times out

**Solution**:
1. Check internet connection
2. Verify Jobber API is not rate-limited (60 requests/min typical)
3. Reduce sync interval if needed (`services/jobber-sync.ts`, line ~180)
4. Contact Jobber support if API is slow

### Data not updating in dashboard

**Problem**: Dashboard shows old data despite sync running

**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check `lastSync` timestamp in `/api/integrations/jobber/sync/status`
4. Verify sync is actually running (check logs)

## Performance Notes

- **Sync time**: Typically 2–5 seconds for 100+ customers
- **API calls**: ~5 GraphQL queries per sync (batched)
- **Rate limiting**: Jobber allows 60 requests/minute (plenty of headroom)
- **Data freshness**: 15-minute interval balances freshness vs. API load

Adjust interval in `services/jobber-sync.ts` line 187 if needed:
```typescript
setupJobberSyncWorker(accountId, accessToken, db, 30); // 30 minutes
```

## Security

- **Tokens**: Stored in environment variables, never logged or exposed
- **API calls**: Only read operations (list customers, jobs, etc.)
- **Data**: Only customer, job, estimate, invoice, payment data synced
- **Credentials endpoint**: Requires authentication in production (currently open for setup)

**Before production**:
1. Add authentication middleware to `/api/integrations/jobber/*` routes
2. Store tokens in a secrets vault (not environment vars)
3. Audit which data is synced for compliance

## Deployment Checklist

- [ ] Jobber API token generated and tested
- [ ] Environment variables set in deployment platform
- [ ] Sync endpoint tested manually (`curl ... /api/integrations/jobber/sync`)
- [ ] Status endpoint returns valid data
- [ ] Dashboard shows live data (not seed data)
- [ ] Sync logs show no errors (check every 15 min)
- [ ] Authentication added to config endpoint
- [ ] Tokens stored securely (vault, not env vars)

## Support

For Jobber API questions:
- **Docs**: https://developer.getjobber.com/docs/graphql
- **Status**: https://www.getjobber.com/status

For WISE² integration issues:
- Check sync logs: `tail -f logs/sync.log`
- Test endpoint: `POST /api/integrations/jobber/sync`
- Verify credentials: `GET /api/integrations/jobber/config`
