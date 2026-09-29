# KNIGHT WING DEPLOYMENT GUIDE

**Deployment Date**: 2026-08-24  
**Environment**: Production  
**Audience**: DevOps, Infrastructure Team  

---

## Deployment Checklist

### Pre-Deployment Verification

```bash
# 1. Verify frontend build
cd apps/website
npm run build

# 2. Check for build errors
npm run lint

# 3. Verify API connectivity
curl https://api.wise2.net/api/health

# 4. Test database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# 5. Verify configuration files
cat data/knight-wing-config.json | jq . > /dev/null
```

### Deployment Steps

#### Step 1: Deploy Website Updates

```bash
# Build the website
cd /Users/danielwise/Projects/wise2-core/apps/website
npm run build

# Deploy to production
docker-compose -f docker-compose.prod.yml build website
docker-compose -f docker-compose.prod.yml up -d website

# Verify deployment
curl https://wisedefensellc.com/wise-defense/dashboard

# Check health
curl https://wisedefensellc.com/health
```

#### Step 2: Deploy API Module

```bash
# Navigate to API package
cd packages/api

# Apply database migration
npm run prisma migrate deploy

# Rebuild API container with WISE Defense module
docker-compose -f docker-compose.prod.yml build api

# Start API service
docker-compose -f docker-compose.prod.yml up -d api

# Verify health endpoint
curl https://api.wise2.net/api/health/wise-defense

# Test authenticated endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.wise2.net/api/wise-defense/dashboard
```

#### Step 3: Configure Database

```bash
# Connect to production database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Verify schema migration
\dt wise_defense.*

# Create Greensboro Tenant
INSERT INTO "Tenant" (
  id, name, domain, status, createdAt
) VALUES (
  'greensboro-001',
  'Greensboro, NC',
  'wisedefensellc.com',
  'ACTIVE',
  NOW()
);

# Verify tenant creation
SELECT * FROM "Tenant" WHERE name LIKE 'Greensboro%';
```

#### Step 4: Initialize Watch Zones

```bash
# Execute watch zone setup script
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -f scripts/setup-greensboro-watch-zones.sql

# Verify zones created
SELECT COUNT(*) FROM "WatchZone" WHERE "tenantId" = 'greensboro-001';
```

#### Step 5: Configure Incident Provider

```bash
# Set environment variables
export INCIDENT_PROVIDER_KEY=$YOUR_API_KEY
export INCIDENT_PROVIDER_URL=$YOUR_PROVIDER_URL

# Test provider connection
curl -H "Authorization: Bearer $INCIDENT_PROVIDER_KEY" \
  $INCIDENT_PROVIDER_URL/test

# Configure in API
kubectl set env deployment/api \
  INCIDENT_PROVIDER_KEY=$INCIDENT_PROVIDER_KEY \
  INCIDENT_PROVIDER_URL=$INCIDENT_PROVIDER_URL \
  INCIDENT_PROVIDER_ENABLED=true
```

#### Step 6: Connect RTL-SDR Edge Appliance

```bash
# SSH to edge device (Raspberry Pi)
ssh pi@raspberrypi.local

# Verify RTL-SDR detection
lsusb | grep -i rtl

# Confirm edge API running
curl http://localhost:3014/health

# Test signal ingestion
curl -X POST http://localhost:3014/api/signals/test
```

#### Step 7: Enable WISE Defense Module

```bash
# Update environment variable
export WISE_DEFENSE_ENABLED=true

# Apply to all deployments
kubectl set env deployment/api WISE_DEFENSE_ENABLED=true
docker-compose -f docker-compose.prod.yml up -d api

# Verify module loaded
curl https://api.wise2.net/api/wise-defense/health
```

#### Step 8: Configure Notifications

```bash
# Setup Discord integration
export DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK
export DISCORD_CHANNEL_ID=$CHANNEL_ID

# Setup Email (Resend)
export RESEND_API_KEY=$YOUR_RESEND_KEY
export ALERT_EMAIL=admin@wisedefensellc.com

# Apply configuration
kubectl set env deployment/api \
  DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK \
  DISCORD_CHANNEL_ID=$CHANNEL_ID \
  RESEND_API_KEY=$YOUR_RESEND_KEY \
  ALERT_EMAIL=admin@wisedefensellc.com \
  NOTIFICATIONS_ENABLED=true
```

### Post-Deployment Verification

#### Test All Endpoints

```bash
# 1. Dashboard endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.wise2.net/api/wise-defense/dashboard

# 2. Incidents endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.wise2.net/api/wise-defense/incidents

# 3. SDR Signals endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.wise2.net/api/wise-defense/sdr/signals

# 4. Watch Zones endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.wise2.net/api/wise-defense/watch-zones

# 5. WebSocket stream
wscat -c wss://api.wise2.net/api/wise-defense/stream \
  --header "Authorization: Bearer $JWT_TOKEN"
```

#### Test Frontend Components

```bash
# Navigate to dashboard
https://wisedefensellc.com/wise-defense/dashboard

# Verify in browser console (should be no errors)
# Check for:
# - WebSocket connection successful
# - Data loaded from API
# - All widgets rendering
# - Real-time updates flowing
```

#### Performance Testing

```bash
# Load test dashboard
curl -w "@scripts/curl-metrics.txt" -o /dev/null -s \
  https://wisedefensellc.com/wise-defense/dashboard

# API response time test
ab -n 100 -c 10 \
  https://api.wise2.net/api/wise-defense/dashboard

# WebSocket stress test
node scripts/websocket-load-test.js \
  --url wss://api.wise2.net/api/wise-defense/stream \
  --connections 50
```

---

## Rollback Procedure

If deployment encounters issues:

```bash
# 1. Rollback website
docker-compose -f docker-compose.prod.yml down website
git checkout HEAD~1 -- apps/website
npm run build
docker-compose -f docker-compose.prod.yml up -d website

# 2. Rollback API
docker-compose -f docker-compose.prod.yml down api
kubectl rollout undo deployment/api
docker-compose -f docker-compose.prod.yml up -d api

# 3. Rollback database (if needed)
npm run prisma migrate resolve --rolled-back 20260818120000_add_wise_defense_safety_radar

# 4. Verify rollback
curl https://api.wise2.net/api/health
curl https://wisedefensellc.com/wise-defense/dashboard
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

```yaml
Metrics:
  - api_wise_defense_latency: <500ms
  - api_wise_defense_error_rate: <1%
  - dashboard_page_load_time: <2s
  - websocket_connection_count: >0
  - sdr_signal_ingestion_rate: >10/min
  - incident_processing_time: <5s
  - database_query_time: <100ms
  - memory_usage: <500MB
  - cpu_usage: <50%
```

### Alert Rules

```yaml
Alerts:
  - name: APIHighLatency
    condition: api_wise_defense_latency > 1000ms
    severity: warning
    action: page

  - name: APIHighErrorRate
    condition: api_wise_defense_error_rate > 5%
    severity: critical
    action: page + email

  - name: WebSocketDisconnected
    condition: websocket_connection_count == 0
    severity: critical
    action: page + slack + email

  - name: SDRSignalLoss
    condition: sdr_signal_ingestion_rate < 1/min
    severity: warning
    action: slack

  - name: DatabaseDown
    condition: database_available == false
    severity: critical
    action: page + email + sms
```

### Logging Configuration

```bash
# Enable verbose logging
export LOG_LEVEL=debug
export LOG_FORMAT=json

# Send logs to centralized system
export LOG_DESTINATION=syslog://logs.wise2.net:514

# Monitor logs
tail -f /var/log/wise-defense/api.log
tail -f /var/log/wise-defense/dashboard.log
tail -f /var/log/wise-defense/sdr.log
```

---

## Known Issues & Workarounds

### Issue 1: 404 on API Health Check

**Symptom**: `GET /api/wise-defense/health` returns 404  
**Cause**: API module not loaded  
**Fix**:
```bash
# Ensure WISE_DEFENSE_ENABLED=true in environment
export WISE_DEFENSE_ENABLED=true
docker-compose up -d api

# Verify module loaded
grep "WISE_DEFENSE_ENABLED" /proc/$API_PID/environ
```

### Issue 2: WebSocket Connection Timeout

**Symptom**: WebSocket fails to connect after 30 seconds  
**Cause**: Firewall blocking WebSocket, or reverse proxy not configured  
**Fix**:
```bash
# Verify firewall allows WebSocket
sudo ufw allow 443/tcp
sudo ufw allow 3016/tcp

# Check Nginx configuration
grep -A 5 "wise-defense" /etc/nginx/sites-enabled/wise2.conf

# Add WebSocket support if missing:
# proxy_upgrade connection Upgrade;
# proxy_set_header Upgrade $http_upgrade;
```

### Issue 3: SDR Signals Not Ingesting

**Symptom**: `GET /sdr/signals` returns empty array  
**Cause**: RTL-SDR not connected or edge processor not running  
**Fix**:
```bash
# Check RTL-SDR device
lsusb | grep -i rtl

# Restart edge processor
sudo systemctl restart wise-defense-sdr

# Verify signal ingestion
curl http://raspberrypi:3014/api/signals/status
```

---

## Performance Tuning

### Database Optimization

```sql
-- Add indexes for faster queries
CREATE INDEX idx_incident_received_timestamp 
  ON "Incident"("receivedTimestamp" DESC);

CREATE INDEX idx_incident_threat_level 
  ON "Incident"("threatLevel");

CREATE INDEX idx_sdr_signal_detected_at 
  ON "SDRSignal"("detectedAt" DESC);

-- Analyze tables
ANALYZE "Incident";
ANALYZE "SDRSignal";
ANALYZE "WatchZone";
```

### API Performance

```bash
# Enable response compression
export COMPRESS_ENABLED=true
export COMPRESS_THRESHOLD=1024

# Increase connection pool
export DB_POOL_MAX=20
export DB_POOL_MIN=5

# Enable caching
export CACHE_TTL=600
export CACHE_BACKEND=redis
```

### Frontend Optimization

```bash
# Enable code splitting
npm run build -- --optimization=true

# Enable service worker
export NEXT_PUBLIC_SW_ENABLED=true

# Enable image optimization
export NEXT_PUBLIC_IMAGE_OPTIMIZATION=true
```

---

## Maintenance Schedule

### Daily
- Monitor error rates and latency
- Review incident ingestion rate
- Check SDR signal reception
- Verify WebSocket connectivity

### Weekly
- Review access logs for anomalies
- Backup database
- Update threat intelligence
- Test incident provider connectivity

### Monthly
- Rotate credentials and API keys
- Review and optimize performance
- Update documentation
- Conduct security audit

---

## Support Contacts

| Role | Contact | Purpose |
|------|---------|---------|
| **Lead Architect** | dwise03@gmail.com | Overall system design, strategy |
| **DevOps** | ops@wise2.net | Deployment, infrastructure |
| **Security** | security@wise2.net | Compliance, vulnerabilities |
| **Incident Response** | oncall@wise2.net | Production issues |

---

## Success Criteria

✅ **Deployment is successful when:**

- [x] All endpoints return 200/OK responses
- [x] WebSocket connects and receives updates
- [x] Dashboard loads in <2 seconds
- [x] Crime Radar shows incidents (or mock data)
- [x] SDR panel displays frequencies (or mock data)
- [x] Watch Zones map renders correctly
- [x] Incident timeline populates
- [x] Real-time updates flowing
- [x] No console errors
- [x] Mobile responsive design works
- [ ] Live incident data ingesting
- [ ] Real SDR signals detected
- [ ] Alerts routing to Discord/Email

---

**Deployment Status**: READY ✅  
**Last Updated**: 2026-08-24  
**Approver**: [Awaiting approval]  
**Go-Live Date**: [Awaiting scheduling]
