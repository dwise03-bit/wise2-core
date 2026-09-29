# WISE² Command Center Dashboard API

The Command Center Dashboard API powers the enterprise operations dashboard with real-time business metrics, job scheduling, revenue tracking, and AI recommendations.

## Base URL

```
GET /command-center/*
```

**Authentication**: All endpoints require JWT token (Bearer token in Authorization header)
**Tenant Isolation**: All endpoints are tenant-isolated; tenant_id is extracted from request context

## Endpoints

### Revenue Metrics

#### Get Today's Revenue
```
GET /command-center/revenue/today
```

**Response:**
```json
{
  "amount": 12740,
  "change": 14,
  "currency": "USD"
}
```

### Jobs

#### Get Today's Jobs Summary
```
GET /command-center/jobs/today
```

**Response:**
```json
{
  "total": 11,
  "completed": 3,
  "inProgress": 2,
  "scheduled": 6,
  "jobs": [
    {
      "id": "job-1",
      "title": "Commercial Residential",
      "customer": "Johnson Residence",
      "status": "SCHEDULED",
      "time": "2026-09-01T08:00:00Z",
      "tech": "Darrin"
    }
  ]
}
```

#### Get Technician Utilization
```
GET /command-center/techs/utilization
```

**Response:**
```json
{
  "active": 3,
  "total": 4,
  "utilization": 75
}
```

### Estimates

#### Get Open Estimates
```
GET /command-center/estimates/open
```

**Response:**
```json
{
  "count": 5,
  "totalValue": 24850,
  "estimates": [
    {
      "id": "est-1",
      "customer": "Smith Commercial",
      "amount": 8500,
      "status": "SENT",
      "createdAt": "2026-08-28T14:30:00Z"
    }
  ]
}
```

### Accounts Receivable

#### Get Outstanding AR
```
GET /command-center/ar/outstanding
```

**Response:**
```json
{
  "totalAmount": 3840,
  "invoiceCount": 8,
  "invoices": [
    {
      "id": "inv-1",
      "customer": "Brown Residence",
      "amount": 850,
      "dueDate": "2026-08-20T00:00:00Z",
      "daysOverdue": 12
    }
  ]
}
```

### Margins & Alerts

#### Get Margin Alerts
```
GET /command-center/margins/alerts
```

**Response:**
```json
{
  "count": 2,
  "alerts": [
    {
      "id": "job-5",
      "customer": "Left Vertical",
      "margin": 22,
      "status": "SCHEDULED"
    }
  ]
}
```

### AI Recommendations

#### Get AI Recommendations
```
GET /command-center/ai/recommendations
```

**Response:**
```json
[
  {
    "priority": 1,
    "title": "Follow up on 5 inactive estimates",
    "description": "Potential $24,850 in revenue waiting",
    "action": "FOLLOW_UP_ESTIMATES"
  },
  {
    "priority": 2,
    "title": "2 jobs need margin review",
    "description": "2 jobs have margins below 30%",
    "action": "REVIEW_MARGINS"
  },
  {
    "priority": 3,
    "title": "Send satisfaction survey",
    "description": "8 customers completed jobs this week",
    "action": "SEND_SURVEY"
  }
]
```

### Schedule

#### Get Today's Schedule
```
GET /command-center/schedule/today
```

**Response:**
```json
[
  {
    "id": "job-1",
    "time": "2026-09-01T08:00:00Z",
    "customer": "Johnson Residence",
    "serviceType": "Commercial",
    "address": "123 Main St",
    "tech": "Darrin",
    "status": "SCHEDULED"
  }
]
```

### Business Health

#### Get Business Health Metrics
```
GET /command-center/business/health
```

**Response:**
```json
{
  "revenue": {
    "value": 84560,
    "label": "Week Revenue"
  },
  "profitMargin": {
    "value": 42,
    "label": "Profit Margin",
    "unit": "%"
  },
  "satisfaction": {
    "value": 4.8,
    "label": "Customer Satisfaction",
    "max": 5
  },
  "repeatRate": {
    "value": 68,
    "label": "Repeat Rate",
    "unit": "%"
  }
}
```

### Communications

#### Get Recent Calls
```
GET /command-center/calls/recent
```

**Response:**
```json
[
  {
    "id": "lead-1",
    "name": "New Lead - AC Not Cooling",
    "type": "inbound_call",
    "time": "2026-09-01T08:42:00Z",
    "status": "CONTACTING",
    "duration": "2:34"
  }
]
```

### Permissions

#### Get Permission Engine Status
```
GET /command-center/permissions/engine
```

**Response:**
```json
{
  "level0": {
    "label": "AI can read",
    "enabled": true
  },
  "level1": {
    "label": "AI can analyze data",
    "enabled": true
  },
  "level2": {
    "label": "AI can make recommendations",
    "enabled": true
  },
  "level3": {
    "label": "AI can prepare actions",
    "enabled": true
  },
  "level4": {
    "label": "AI can execute actions",
    "enabled": false
  },
  "level5": {
    "label": "AI can automate fully",
    "enabled": false
  }
}
```

### Complete Dashboard

#### Get Complete Dashboard (All Panels)
```
GET /command-center/dashboard
```

**Response:**
```json
{
  "timestamp": "2026-09-01T12:00:00Z",
  "todayRevenue": { ... },
  "todayJobs": { ... },
  "techUtilization": { ... },
  "openEstimates": { ... },
  "outstandingAR": { ... },
  "marginAlerts": { ... },
  "aiRecommendations": [ ... ],
  "todaySchedule": [ ... ],
  "businessHealth": { ... },
  "recentCalls": [ ... ],
  "permissionEngine": { ... }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Missing Tenant)
```json
{
  "statusCode": 403,
  "message": "Missing tenant_id on request"
}
```

## Integration Notes

1. **Tenant Isolation**: All queries are automatically tenant-isolated using the `isolateQuery` and `withTenant` utilities
2. **Real-Time Data**: Each endpoint calculates current metrics from live database data
3. **Performance**: The complete dashboard endpoint fetches all panels in parallel for optimal performance
4. **Date Handling**: All dates are in UTC ISO 8601 format
5. **Currency**: All monetary values are in USD (configurable via response.currency)

## Database Dependencies

The API depends on these Prisma models:
- `ServiceJob` - Jobs and scheduling
- `Estimate` - Sales estimates
- `Invoice` - Accounts receivable
- `Lead` - Customer interactions
- `RevenueCustomer` - Customer/technician data
- `FollowUp` - Follow-up management

## Future Enhancements

- [ ] Real-time WebSocket updates for dashboard panels
- [ ] Custom date ranges for metrics
- [ ] Export dashboard data (PDF, CSV)
- [ ] Scheduled email reports
- [ ] Advanced filtering options
- [ ] Performance analytics and trends
- [ ] AI-powered predictive metrics
- [ ] Mobile dashboard layout
