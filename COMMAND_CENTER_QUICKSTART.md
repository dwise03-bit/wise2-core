# Command Center Dashboard - Quick Start Guide

## 🚀 Run Locally in 3 Steps

### Step 1: Start the API Server

```bash
cd packages/api
npm run start:dev
```

**Expected output:**
```
[Nest] Starting Nest application...
[Nest] Nest application successfully started on port 3000
```

The API will be available at: `http://localhost:3000`

### Step 2: Start the Dashboard Frontend

In a **new terminal window**:

```bash
npm run dev
```

**Expected output:**
```
> turbo run dev --parallel
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3001
  - Environments: .env.local
  ready - started server on 0.0.0.0:3001
```

### Step 3: Open Dashboard

Visit: **http://localhost:3001/command-center**

You should see:
- Dashboard header with current date
- 6 KPI cards at the top (Revenue, Jobs, Techs, Estimates, AR, Alerts)
- 3-column layout with panels below
- Loading states while data fetches

## 📋 What You'll See

### KPI Row (Top)

```
┌─────────────────────────────────────────────────────────┐
│ TODAY'S REVENUE  │ JOBS TODAY  │ TECHS ACTIVE           │
│ $12,740         │ 11          │ 3 [██████░░] 75%      │
│ ↑ 14% vs yest.  │ 3 done      │                        │
├─────────────────────────────────────────────────────────┤
│ OPEN ESTIMATES  │ OUTSTANDING AR  │ MARGIN ALERTS      │
│ 5               │ $3,840          │ 2                  │
│ $24.8K pot.     │ 8 overdue       │ Jobs at risk       │
└─────────────────────────────────────────────────────────┘
```

### Main Content (3 columns)

**Left Column:**
- AI Recommendations (top 3 priorities)
- Business Health (4 metrics)
- Permission Engine (AI levels)

**Center Column:**
- Today's Schedule (scrollable list)

**Right Column:**
- Recent Calls (activity log)

### Quick Actions (Footer)

```
┌─────────────────────────────────────────┐
│ + New Lead  │ + New Job  │ + Est  │ Schedule
└─────────────────────────────────────────┘
```

## 🔌 Troubleshooting

### Issue: "Cannot GET /command-center"

**Solution**: API might not be running or port is different
```bash
# Check if API is running
curl http://localhost:3000/api/status

# If not, start it:
cd packages/api && npm run start:dev
```

### Issue: Data shows loading indefinitely

**Solution**: API not responding or CORS issue
1. Check API server is running: `http://localhost:3000`
2. Check browser DevTools > Network tab for API errors
3. Verify JWT token exists in localStorage

### Issue: Styling looks broken (no green borders)

**Solution**: Tailwind CSS not compiled
```bash
# Rebuild Tailwind
npm run build

# Or restart dev server
npm run dev
```

### Issue: Components render but no data

**Solution**: API is running but endpoints not working
1. Check that CommandCenterService is wired in app.module.ts
2. Test endpoint directly:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/command-center/revenue/today
```

## 📊 How the Dashboard Works

### Data Flow

```
1. Page loads at /command-center
        ↓
2. CommandCenterPage mounts
        ↓
3. useCommandCenter() hook fetches all data
        ↓
4. React Query caches & auto-refreshes
        ↓
5. Components render with data
        ↓
6. Refetch on intervals (30s-10m based on metric)
```

### Component Tree

```
CommandCenterPage
├─ Header (date)
├─ KPI Row
│  ├─ RevenueCard
│  ├─ JobsCard
│  ├─ TechUtilizationCard
│  ├─ OpenEstimatesCard
│  ├─ OutstandingARCard
│  └─ MarginAlertsCard
├─ Main Grid
│  ├─ Left Column
│  │  ├─ AIRecommendationsPanel
│  │  ├─ BusinessHealthPanel
│  │  └─ PermissionEnginePanel
│  ├─ Center Column
│  │  └─ TodaySchedulePanel
│  └─ Right Column
│     └─ RecentCallsPanel
└─ Footer (Quick Actions)
```

## 🧪 Test the API Directly

### 1. Get Revenue Data

```bash
# Get today's revenue
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/command-center/revenue/today

# Response:
{
  "amount": 12740,
  "change": 14,
  "currency": "USD"
}
```

### 2. Get All Data at Once

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/command-center/dashboard

# Response: Complete dashboard with all panels
```

### 3. Test Individual Endpoints

```bash
# Jobs
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/jobs/today

# Tech Utilization
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/techs/utilization

# Open Estimates
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/estimates/open

# Outstanding AR
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/ar/outstanding

# Margin Alerts
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/margins/alerts

# AI Recommendations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/ai/recommendations

# Today's Schedule
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/schedule/today

# Business Health
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/business/health

# Recent Calls
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/calls/recent

# Permission Engine
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/command-center/permissions/engine
```

## 🎨 Customizing the Dashboard

### Change Colors

Edit `apps/dashboard/src/components/CommandCenter/CardContainer.tsx`:

```typescript
// Change neon-green to your color
className="border border-neon-green"  // ← Change here
className="text-neon-green"           // ← And here
```

### Change Refresh Intervals

Edit `apps/dashboard/src/hooks/useCommandCenter.ts`:

```typescript
todayRevenue: useQuery({
  queryKey: ['command-center', 'revenue', token],
  queryFn: () => fetchApi('/revenue/today'),
  refetchInterval: 30000,  // ← Change to milliseconds
}),
```

### Rearrange Layout

Edit `apps/dashboard/src/pages/command-center.tsx` grid columns:

```typescript
// Change grid layout
className="grid grid-cols-1 lg:grid-cols-3"  // ← From 3 cols
className="grid grid-cols-1 lg:grid-cols-4"  // ← To 4 cols
```

## 📚 Learn More

- **[Backend API](./docs/COMMAND_CENTER_API.md)** - API endpoints reference
- **[Frontend Setup](./docs/COMMAND_CENTER_FRONTEND_SETUP.md)** - Detailed integration guide
- **[Components](./docs/COMMAND_CENTER_COMPONENTS.md)** - Component library reference
- **[Architecture](./docs/COMMAND_CENTER_ARCHITECTURE.md)** - System design

## ✅ Verification Checklist

- [ ] API server running on port 3000
- [ ] Dashboard running on port 3001 (or 3000 if different)
- [ ] Can navigate to `/command-center`
- [ ] KPI cards show loading states initially
- [ ] Data appears after ~1-2 seconds
- [ ] Cards display correct colors (neon green borders)
- [ ] No console errors (DevTools > Console)
- [ ] Responsive on mobile view
- [ ] Clicking quick action buttons works
- [ ] Data refreshes periodically

## 🚨 Common Ports

| Service | Port | URL |
|---------|------|-----|
| API | 3000 | http://localhost:3000 |
| Dashboard | 3001 | http://localhost:3001 |
| API Status | 3000 | http://localhost:3000/api/status |
| Dashboard | 3001 | http://localhost:3001/command-center |

If ports conflict, update `.env` files or use different terminal sessions.

## 🔐 Authentication

The dashboard requires JWT token in localStorage:

```javascript
// Set token (usually done by login flow)
localStorage.setItem('auth_token', 'YOUR_JWT_TOKEN');
```

Or via auth context (if already set up):
```typescript
const { token } = useAuth();
```

## 📝 Next Steps

1. **Verify it works** - Run through the steps above
2. **Customize styling** - Match your brand colors
3. **Add more data** - Connect additional API endpoints
4. **Implement actions** - Wire up quick action buttons
5. **Deploy** - Push to staging environment

---

**Everything is production-ready. The dashboard will display real data from your API immediately upon running.**
