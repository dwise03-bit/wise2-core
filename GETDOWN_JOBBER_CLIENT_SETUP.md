# Get Down Pressure Washing — Jobber Integration Setup

Welcome! This is your step-by-step guide to connecting your Jobber field service data to the WISE² Revenue Engine.

**Timeline**: 15–30 minutes to full connection  
**Complexity**: Low — mostly copy-paste credentials  
**Support**: Ask us if you get stuck at any step

---

## What You'll Get

After setup, your WISE² dashboard will automatically pull:

- ✅ **All customers** from Jobber
- ✅ **Scheduled jobs** and service history
- ✅ **Sent estimates** and close rates
- ✅ **Invoices** and payment tracking
- ✅ **Revenue metrics** in real-time
- ✅ **Crew dispatch** and scheduling
- ✅ **Pipeline health** and forecasting

**No more manual data entry or switching between apps.**

---

## Step 1: Get Your Jobber API Credentials

### 1.1 Log in to Jobber

Go to **https://app.getjobber.com** and sign in.

### 1.2 Navigate to API Settings

- Click your **profile icon** (top right)
- Select **Settings**
- In the left sidebar, find **API** (or **Developers**)
- Click **API**

### 1.3 Generate or Copy Your Access Token

You should see one of two screens:

**If you already have a token:**
- Find it in the list
- Click **Show** or **Copy** to reveal the full token
- Skip to Step 2

**If you don't have a token:**
- Click **Create a new token** or **+ New Personal Access Token**
- Give it a name: `WISE² Revenue Engine`
- Leave scope as default (read access to data)
- Click **Create** or **Generate**
- **Copy the token immediately** — you won't see it again

### 1.4 Get Your Account ID

Still in **Settings** → **Account**:
- Look for **Account ID** or **Jobber ID**
- Copy it (usually a 6–10 digit number or alphanumeric code)

**You now have**:
- ✅ Account ID
- ✅ Access Token

---

## Step 2: Provide Credentials to WISE²

Send us these two pieces of information (encrypted or via secure channel):

```
Account ID: [paste here]
Access Token: [paste here]
```

**We will:**
1. Add them to your production environment
2. Test the connection
3. Run an initial full sync
4. Confirm all data is flowing

---

## Step 3: Verify the Connection

Once we've set up the integration, you'll see a **Sync Status** dashboard showing:

- ✅ Last sync time
- ✅ Number of customers synced
- ✅ Number of jobs, estimates, invoices, payments
- ✅ Sync health (green = working, red = needs attention)

### Check It Yourself (Optional)

If you're technical, you can verify:

```bash
# Check sync status
curl https://[your-domain]/api/integrations/jobber/sync/status

# Expected response:
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

---

## Step 4: Start Using Live Data

Your WISE² dashboard is now showing **real data from Jobber**:

### Dashboard

- **Revenue MTD** — actual invoiced amounts
- **Open Pipeline** — real opportunities by stage
- **Job Health** — scheduled vs completed
- **Customer Score** — retention and growth signals

### Pages That Update Automatically

| Page | What Updates |
|------|--------------|
| **Pipeline** | Drag cards to move deals between stages (syncs back to Jobber) |
| **Dispatch** | Crew assignment and job scheduling |
| **Customers** | All customer data, service history, contract value |
| **Invoices** | Real invoice numbers, amounts, due dates |
| **Reports** | Revenue charts, capacity planning, forecasts |

### Frequency

Data syncs automatically **every 15 minutes**. If you need it fresher or less often, let us know.

---

## Troubleshooting

### "Integration not showing data"

**Check**: Is sync running?
- Ask us to verify the sync status endpoint
- Look at sync logs for errors

**Check**: Did Jobber data actually export?
- Log into Jobber and confirm customers/jobs exist
- Try a manual sync via `/api/integrations/jobber/sync` (ask us to do this)

### "Seeing old data, not recent changes"

- **Expected**: 15-minute delay (data refreshes every 15 min)
- **Request manual sync** if you need immediate update

### "Some customers/jobs are missing"

- **Check** in Jobber: Are they marked as archived or inactive?
- **Sync only pulls active records** (not archived)
- If needed, we can expand the sync to include archived data

### "Token isn't working / connection failed"

- **Jobber side**: Confirm token is still active (not revoked)
- **Our side**: Check that credentials were set correctly
- **Solution**: Generate a new token in Jobber Settings → API and send it to us

---

## What Data Is Synced?

### Automatically Synced

| Jobber Object | WISE² Use |
|---|---|
| **Customers** | Customer list, contact info, service history |
| **Jobs** | Dispatch board, scheduling, revenue tracking |
| **Estimates** | Pipeline stage, close rates, follow-up prompts |
| **Invoices** | Accounting, revenue recognition, aging |
| **Payments** | Cash flow, collection status |

### NOT Synced (By Design)

- Invoices don't send emails (you stay in control)
- Estimates don't auto-send (you approve first)
- Payment records don't auto-import (you reconcile)

**This keeps you in the driver's seat** — WISE² is information-only at this stage, not autopilot.

---

## FAQ

**Q: Does this send data *to* Jobber?**  
A: Not yet. Right now it's one-way: Jobber → WISE². We can add two-way sync later if needed (e.g., update job status in WISE², it syncs back to Jobber).

**Q: Will this slow down Jobber?**  
A: No. We pull data via Jobber's API (not scraping), and sync every 15 minutes—very lightweight.

**Q: What if I change data in Jobber?**  
A: You'll see the update in WISE² within 15 minutes (the next sync).

**Q: Can I change data in WISE²?**  
A: Yes, for things like follow-up status, crew assignment, etc. Those stay local to WISE² for now. We can sync *back* to Jobber later.

**Q: Is my data secure?**  
A: Your Jobber access token is stored securely and only used to pull your own data. We don't share it, log it, or use it for anything else.

---

## Next Steps

1. **Gather credentials**: Account ID + Access Token from Jobber
2. **Send to us securely** (encrypted email or shared doc)
3. **We configure and test** (usually same day)
4. **You start using live data** — no more switching between apps

---

## Support

If you get stuck at any point:

- **Email**: [support email]
- **Phone**: [support phone]
- **Docs**: https://[your-docs-url]

We're here to make this smooth!
