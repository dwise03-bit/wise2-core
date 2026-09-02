# Command Center Dashboard - Architecture & Implementation

## Overview

The Command Center Dashboard is the unified operations nerve center for WISE² business owners. It aggregates real-time metrics across jobs, revenue, scheduling, and AI-driven insights into a single command interface.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard UI                     │
│  (Next.js/React with WISE² Design System)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Command Center API (NestJS REST)                     │
│  GET /command-center/dashboard                              │
│  GET /command-center/revenue/today                          │
│  GET /command-center/jobs/today                             │
│  GET /command-center/techs/utilization                      │
│  GET /command-center/estimates/open                         │
│  GET /command-center/ar/outstanding                         │
│  GET /command-center/margins/alerts                         │
│  GET /command-center/ai/recommendations                     │
│  GET /command-center/schedule/today                         │
│  GET /command-center/business/health                        │
│  GET /command-center/calls/recent                           │
│  GET /command-center/permissions/engine                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         CommandCenterService (Business Logic)               │
│                                                              │
│  ├─ getTodayRevenue()                                       │
│  ├─ getTodayJobs()                                          │
│  ├─ getTechnicianUtilization()                              │
│  ├─ getOpenEstimates()                                      │
│  ├─ getOutstandingAR()                                      │
│  ├─ getMarginAlerts()                                       │
│  ├─ getAiRecommendations()                                  │
│  ├─ getTodaySchedule()                                      │
│  ├─ getBusinessHealth()                                     │
│  ├─ getRecentCalls()                                        │
│  ├─ getPermissionEngine()                                   │
│  └─ getCompleteDashboard()                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Layer (Prisma ORM)                         │
│                                                              │
│  Models:                                                     │
│  ├─ ServiceJob     (Jobs, scheduling, completion)           │
│  ├─ Estimate       (Sales pipeline, proposals)              │
│  ├─ Invoice        (Accounts receivable)                     │
│  ├─ Lead           (Customer interactions, calls)            │
│  ├─ RevenueCustomer (Customers, technicians)                │
│  └─ FollowUp       (Follow-up management)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        PostgreSQL Database (Tenant-Isolated)                │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
packages/api/src/
├── command-center/
│   ├── command-center.service.ts      (Business logic)
│   ├── command-center.controller.ts   (API routes)
│   └── command-center.module.ts       (Module definition)
│
└── app.module.ts                      (Register module)
```

## Key Features

### 1. Real-Time Revenue Tracking
- **Metric**: Daily revenue from completed jobs
- **Comparison**: Day-over-day percentage change
- **Refresh Rate**: 60 seconds
- **Data Source**: ServiceJob model (completed status, amount)

### 2. Job Management
- **Today's Jobs**: Scheduled, in-progress, completed count
- **Job Details**: Customer name, service type, assigned technician
- **Status Tracking**: Real-time job status updates
- **Refresh Rate**: 30 seconds

### 3. Technician Utilization
- **Active Techs**: Number of technicians actively working
- **Utilization %**: Percentage of team working
- **Calculation**: Active jobs / Total technicians
- **Threshold**: Alert if utilization < 50%

### 4. Sales Pipeline
- **Open Estimates**: Count of DRAFT, SENT, VIEWED estimates
- **Pipeline Value**: Total dollar amount of open deals
- **List**: Top 5 most recent estimates
- **Conversion Rate**: SOLD / SENT ratio

### 5. Accounts Receivable
- **Outstanding AR**: Total unpaid invoices
- **Invoice Count**: Number of overdue invoices
- **Days Overdue**: Alert on 30+ day overdue
- **Customer Names**: Which accounts owe money

### 6. Margin Management
- **Low Margin Alert**: Jobs with < 30% profit margin
- **At-Risk Jobs**: Today's scheduled jobs
- **Profitability**: Individual job margin calculations
- **Action Items**: Recommend repricing or renegotiation

### 7. AI-Powered Recommendations
- **Priority 1**: Follow up on old estimates (revenue risk)
- **Priority 2**: Margin alerts (profitability risk)
- **Priority 3**: Customer surveys (satisfaction)
- **Actions**: Clickable recommendations with associated actions

### 8. Today's Schedule
- **Time-Based**: Sorted by appointment time
- **Customer Info**: Name, address, contact
- **Technician Assignment**: Assigned tech and contact info
- **Status**: Real-time job status
- **Scroll View**: Support for 10+ jobs

### 9. Business Health Metrics
- **Week Revenue**: Total completed jobs this week
- **Profit Margin**: Percentage of revenue retained
- **Customer Satisfaction**: Average rating (4.8/5)
- **Repeat Rate**: Percentage of repeat customers

### 10. Recent Calls/Interactions
- **Inbound Calls**: Customer calls received
- **Duration**: Call length tracking
- **Status**: Lead status (CONTACTING, QUOTED, etc.)
- **Timestamps**: When calls occurred

### 11. Permission Engine
- **6 AI Control Levels**:
  - Level 0: Read-only
  - Level 1: Data analysis
  - Level 2: Recommendations
  - Level 3: Action preparation
  - Level 4: Execute actions
  - Level 5: Full automation

## Security & Access Control

### Authentication
- JWT token required on all endpoints
- Bearer token in Authorization header
- Token validation via `JwtAuthGuard`

### Tenant Isolation
- All queries isolated by tenant_id
- `withTenant()` utility enforces isolation
- `isolateQuery()` wrapper ensures tenant context
- No cross-tenant data leakage

### Authorization
- `TenantGuard` validates tenant ownership
- User must have access to tenant
- Permissions controlled via Permission Engine

## Data Refresh Strategy

| Metric | Refresh Interval | Reason |
|--------|------------------|--------|
| Revenue | 60s | High priority, changes frequently |
| Jobs | 30s | Dispatch-critical, real-time |
| Schedule | 60s | Important for planning |
| Tech Util | 60s | Resource allocation |
| Estimates | 2m | Sales pipeline moves slower |
| AR | 5m | Less frequently updated |
| Health | 5m | Aggregate metrics |
| Recommendations | 10m | AI analysis overhead |
| Permissions | 10m | Admin-only changes |

## API Response Performance

### Parallel Endpoint Requests
All endpoints execute database queries in parallel for optimal performance:
- `Promise.all()` for independent queries
- ~200-500ms total response time for complete dashboard
- Cached results where applicable

### Pagination & Filtering (Future)
```typescript
// Optional query parameters (not yet implemented)
GET /command-center/jobs/today?page=1&status=SCHEDULED
GET /command-center/schedule/today?limit=10
GET /command-center/calls/recent?days=7
```

## Error Handling

### Standard Error Responses

**Missing Tenant:**
```json
{
  "statusCode": 403,
  "message": "Missing tenant_id on request"
}
```

**Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Database Error:**
```json
{
  "statusCode": 500,
  "message": "Database connection failed"
}
```

## Integration Points

### With Existing Systems

1. **Revenue OS Module**
   - Reuses dashboard-stats.service base
   - Extends with new endpoints
   - Shares tenant isolation utilities

2. **CherryCount Module**
   - Revenue tracking integration
   - Call recording storage
   - Phone system data

3. **AI Phone System**
   - Recent calls data
   - Call transcription
   - Lead qualification results

4. **Service Job Management**
   - Job scheduling
   - Technician assignment
   - Job completion tracking

5. **Prisma Models**
   - Leverages existing schema
   - No migration required
   - Compatible with current data

## Deployment

### Environment Variables
```bash
# Database connection (auto-configured from existing setup)
DATABASE_URL="postgresql://..."

# API Configuration
COMMAND_CENTER_ENABLED=true
```

### Docker Deployment
The Command Center API runs within the existing NestJS API container:
```dockerfile
# Uses existing Dockerfile
# No new container needed
```

### Database Migrations
No migrations required - uses existing Prisma models.

## Testing

### Unit Tests
```bash
npm test -- command-center.service.spec.ts
```

### Integration Tests
```bash
npm test:e2e -- command-center.e2e.spec.ts
```

### Performance Testing
```bash
# Load test with k6
k6 run tests/command-center-load.js
```

## Future Enhancements

### Phase 2
- [ ] WebSocket real-time updates
- [ ] Custom date ranges
- [ ] Advanced filtering
- [ ] Export to PDF/CSV
- [ ] Email report scheduling

### Phase 3
- [ ] Mobile dashboard layout
- [ ] Predictive analytics
- [ ] Anomaly detection
- [ ] Performance trending
- [ ] Custom KPI configuration

### Phase 4
- [ ] Voice command integration
- [ ] Slack/Teams notifications
- [ ] Mobile app
- [ ] AR visualization
- [ ] Blockchain audit trail

## Monitoring & Observability

### Key Metrics to Monitor
- Dashboard load time
- Database query performance
- API response times
- Error rates
- Tenant isolation violations

### Logging
All queries logged with:
- Tenant ID
- User ID
- Query type
- Response time
- Error details

## Support & Maintenance

### Common Issues

**Slow Dashboard Load:**
1. Check database connection
2. Verify indexes on ServiceJob, Estimate, Invoice
3. Monitor active queries
4. Consider query optimization

**Missing Data:**
1. Verify tenant_id in request
2. Check database sync
3. Validate Prisma schema
4. Check data permissions

**Permission Errors:**
1. Verify JWT token validity
2. Check tenant ownership
3. Validate TenantGuard configuration
4. Review permission engine settings

## References

- [API Documentation](./COMMAND_CENTER_API.md)
- [Frontend Integration Guide](./COMMAND_CENTER_FRONTEND_GUIDE.md)
- [WISE² Design System](./DESIGN_SYSTEM.md)
- [Prisma Schema](../packages/db/schema.prisma)
- [Revenue OS Module](../packages/api/src/revenue-os/)
