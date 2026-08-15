# WISE² ENTERPRISE DEMO MODE
## Complete Setup & Integration Guide

**Codename**: SHOWTIME  
**Version**: 1.0  
**Status**: PRODUCTION-READY  

---

## 🎬 OVERVIEW

WISE² Demo Mode transforms the entire platform into a self-contained demonstration environment perfect for:

- ✅ Customer presentations
- ✅ Sales meetings
- ✅ Trade shows
- ✅ Investor pitches
- ✅ Product training
- ✅ Offline showcases
- ✅ Raspberry Pi kiosks

**Key Feature**: Users see a completely functional SaaS platform with realistic data, never encountering errors, empty tables, or connection failures.

---

## 🚀 QUICK START

### Enable Demo Mode

Add to your `.env`:

```bash
DEMO_MODE=true
DEMO_SPEED=normal  # normal, fast, presentation, tradeshow, offline
```

Restart all services:

```bash
pm2 restart all
```

Access demo control panel:

```
http://localhost:3002/demo/panel
```

---

## 📊 WHAT'S INCLUDED

### ✅ Pre-populated Demo Data

**8 Sample Customers**:
- Acme HVAC Inc
- The Golden Fork Restaurant
- Sterling Law Group
- Downtown Medical
- BuildRight Construction
- AutoCare Plus
- Fashion Forward Boutique
- Sunset Properties Real Estate

**6 Demo Users** with realistic profiles:
- Alex Chen (Admin)
- Sarah Johnson (CEO)
- Michael Rodriguez (Operations)
- Emily Watson (Sales)
- David Park (Support)
- Lisa Chen (Marketing)

**5 Active Projects** with progress tracking

**Realistic Metrics**:
- $5.6M Annual Revenue
- $468K Monthly Recurring Revenue
- 8 Active Customers
- 847K AI Tokens Used
- 99.98% Uptime

### ✅ Live Simulation Engine

Automatically generates:
- ✓ Activity logs
- ✓ Deployments
- ✓ Support tickets
- ✓ Payments
- ✓ Customer interactions
- ✓ AI conversations
- ✓ Metrics updates

### ✅ 5 Simulation Speeds

| Speed | Use Case | Events/Second |
|-------|----------|---------------|
| **normal** | Default presentations | 0.33 |
| **fast** | Sales meetings | 1 |
| **presentation** | Real-time demos | 2 |
| **tradeshow** | High-energy booths | 4 |
| **offline** | Kiosk mode | 10 |

### ✅ Demo Control Panel

Web interface to manage:
- Start/Stop simulation
- Change simulation speed
- Reset demo data
- Generate fresh data
- View live events
- Monitor statistics

---

## 🔧 INTEGRATION STEPS

### Step 1: Add Demo Engine to Services

In your main API (`services/api/index.js`):

```javascript
const { DEMO_MODE, demoMiddleware, demoAPI } = require('../demo/demo-engine');
const demoAdmin = require('../demo/demo-admin');

// Add demo middleware
app.use(demoMiddleware);

// Mount demo routes
app.use('/demo', demoAdmin);

// Use demo data when in demo mode
if (DEMO_MODE) {
  app.get('/api/customers', (req, res) => {
    res.json(demoAPI.getCustomers());
  });

  app.get('/api/metrics', (req, res) => {
    res.json(demoAPI.getMetrics());
  });
}
```

### Step 2: Update Dashboard

Update dashboard to show DEMO badge when `res.locals.demo === true`:

```jsx
{res.locals.demo && (
  <div className="demo-badge">🎬 DEMO MODE</div>
)}
```

### Step 3: Mock Discord

If `DEMO_MODE`, generate fake Discord messages:

```javascript
if (DEMO_MODE) {
  const fakeMessages = [
    "✅ Deployment successful",
    "📊 Analytics updated",
    "💰 New invoice created",
    "🤖 AI Agent completed task",
  ];
  // Send fake messages to Discord every 5 seconds
}
```

### Step 4: AI Responses

Replace LLM calls with simulated responses:

```javascript
if (DEMO_MODE) {
  return demoAPI.generateAIResponse(prompt);
}
```

### Step 5: Database Queries

For demo mode, return simulated data instead of queries:

```javascript
if (DEMO_MODE) {
  return demoAPI.getCustomers();
}
// else: real database query
```

---

## 🎮 DEMO CONTROL PANEL

Access at: `http://localhost:3002/demo/panel`

### Features

**Simulation Controls**:
- ▶️ Start simulation
- ⏹️ Stop simulation
- 🔄 Reset all data
- 📊 Generate fresh data

**Speed Settings**:
- Normal (default)
- Fast (2x speed)
- Presentation (6x speed)
- Trade Show (12x speed)
- Offline (30x speed)

**Live Statistics**:
- Customers
- Projects
- Support tickets
- Generated events

**Event Stream**:
- Real-time activity feed
- Auto-updating every 2 seconds

---

## 🍗 DEMO DATA EXAMPLES

### Sample Customer

```json
{
  "id": 1,
  "name": "Acme HVAC Inc",
  "industry": "HVAC",
  "employees": 12,
  "revenue": 450000,
  "status": "active"
}
```

### Sample Project

```json
{
  "id": 1,
  "name": "Website Redesign",
  "customer": "Acme HVAC",
  "status": "active",
  "progress": 65
}
```

### Sample Metrics

```json
{
  "revenue": 5620000,
  "mrr": 468333,
  "customers": 8,
  "projects": 5,
  "aiUsage": 847293,
  "uptime": 99.98
}
```

---

## 🔒 SECURITY & SAFETY

**Demo Watermarks**:
- All responses include `X-Demo-Mode: true` header
- Dashboard shows 🎬 DEMO badge
- Internal "Demo Data" watermark on all records

**Safety Features**:
- ✅ No real payments processed
- ✅ No real emails sent
- ✅ No Stripe API calls
- ✅ No production data exposed
- ✅ Isolated simulation engine
- ✅ Safe for touchscreen/kiosk mode

---

## 📱 RASPBERRY PI KIOSK MODE

For Raspberry Pi deployments:

```bash
# .env
DEMO_MODE=true
DEMO_SPEED=tradeshow
KIOSK_MODE=true
HIDE_CONTROLS=true
AUTO_REFRESH=true
FULLSCREEN=true
```

Features:
- Auto-launches dashboard
- Hides browser controls
- Fullscreen mode
- Auto-refresh every 30s
- Touchscreen optimized
- Optimized for 4GB RAM

---

## 🧪 TESTING

### Test Demo Mode Locally

```bash
# Terminal 1: Start API with demo mode
DEMO_MODE=true npm start

# Terminal 2: Open demo panel
curl http://localhost:3002/demo/panel

# Terminal 3: Monitor events
curl http://localhost:3002/demo/events
```

### Verify Demo Data

```bash
# Get customers
curl http://localhost:3002/api/customers

# Get metrics
curl http://localhost:3002/api/metrics

# Get users
curl http://localhost:3002/demo/users
```

---

## 🚀 DEPLOYMENT

### Docker

Add to Dockerfile:

```dockerfile
ENV DEMO_MODE=false
ENV DEMO_SPEED=normal

# Run with demo enabled
docker run -e DEMO_MODE=true wise2-api
```

### Docker Compose

```yaml
services:
  api:
    environment:
      - DEMO_MODE=true
      - DEMO_SPEED=presentation
```

### Production

Always ship with `DEMO_MODE=false` in production.

For demo events, use a separate demo service:

```bash
# Production API
DEMO_MODE=false npm start

# Separate demo service
npm run demo
```

---

## 📊 SIMULATION ENGINE DETAILS

### Event Queue

Events are generated in real-time:

```
Every N seconds (based on speed setting):
  - Generate random activity log
  - Every 3rd event: update metrics
  - Add event to queue
  - Emit to connected clients
```

### Available Activities

- "AI Agent processed invoice"
- "User logged in"
- "Email sent to leads"
- "Website impressions recorded"
- "CRM updated"
- "Support ticket resolved"
- "Revenue recorded"
- "Infrastructure health check"
- "Storage usage updated"

### Customization

Extend `demoData` in `demo-engine.js`:

```javascript
demoData.activities.push("Your custom activity here");
demoData.customers.push({ /* your customer */ });
```

---

## ⚡ PERFORMANCE

**Memory Usage**: ~50-100MB (including simulation)  
**CPU Usage**: <5% (simulation thread)  
**Startup Time**: <2 seconds  
**Event Generation**: 10-4000 events/min (based on speed)  

---

## 🎯 USE CASES

### Customer Presentation

```bash
DEMO_MODE=true
DEMO_SPEED=presentation
# Shows realistic activity every 500ms
# Perfect for live demos
```

### Trade Show Booth

```bash
DEMO_MODE=true
DEMO_SPEED=tradeshow
# Events every 250ms
# Highly animated and engaging
```

### Sales Meeting

```bash
DEMO_MODE=true
DEMO_SPEED=fast
# Events every 1 second
# Professional and controlled
```

### Training Session

```bash
DEMO_MODE=true
DEMO_SPEED=normal
# Events every 3 seconds
# Time to explain features
```

### Offline Kiosk

```bash
DEMO_MODE=true
DEMO_SPEED=offline
KIOSK_MODE=true
# Runs completely offline
# Auto-launching and looping
```

---

## 📋 CHECKLIST

Before presenting:

- [ ] Enable DEMO_MODE=true
- [ ] Set appropriate DEMO_SPEED
- [ ] Open demo control panel
- [ ] Start simulation
- [ ] Verify all services responsive
- [ ] Check for demo badge/watermark
- [ ] Test on target device (laptop/tablet/Pi)
- [ ] Disable any external API calls
- [ ] Confirm internet connectivity not required
- [ ] Set up demo reset between presentations

---

## 🆘 TROUBLESHOOTING

**No events appearing?**
- Check DEMO_MODE=true in .env
- Restart services: `pm2 restart all`
- Open demo panel and click "Start Simulation"

**Demo panel not loading?**
- Verify route: `http://localhost:3002/demo/panel`
- Check port (default 3002)

**Metrics not updating?**
- Check simulation is running in demo panel
- Verify DEMO_SPEED is set (default: normal)

**Data looks stale?**
- Click "Reset Data" in demo panel
- Or: `curl -X POST http://localhost:3002/demo/reset`

---

## 📚 ADDITIONAL RESOURCES

- [Demo Engine Source](./demo-engine.js)
- [Admin Panel Source](./demo-admin.js)
- [Integration Examples](./examples/)
- [Simulation Architecture](./ARCHITECTURE.md)

---

**Ready to dazzle your prospects! 🎬✨**
