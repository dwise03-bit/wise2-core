# HVAC Contractor OS - Production Deployment Guide

## Overview

WISE² HVAC Contractor OS v1.0 - AI-powered field service platform combining Ray-Ban wearables, Hermes AI diagnostics, and real-time supervisor dashboards.

**Status**: Ready for Production Deployment  
**Deployed URL**: https://wise2.net/hvac  
**API Base**: https://wise2.net/api/jobs, https://wise2.net/api/diagnostics  
**WebSocket**: wss://wise2.net/jobs  

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WISE² HVAC Contractor OS v1.0             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐  ┌──────────────────────┐          │
│  │  Field Technician   │  │  Supervisor          │          │
│  │  Ray-Ban Meta Pro   │  │  Dashboard           │          │
│  │  - Photo/Video      │  │  - Real-time updates │          │
│  │  - Voice Commands   │  │  - Capture gallery   │          │
│  │  - GPS Location     │  │  - Diagnostics view  │          │
│  └──────────┬──────────┘  └──────────┬───────────┘          │
│             │                        │                       │
│             └────────────┬───────────┘                       │
│                          │                                   │
│            ┌─────────────▼──────────────┐                   │
│            │   Nginx Load Balancer      │                   │
│            │   SSL/TLS Termination      │                   │
│            └─────────────┬──────────────┘                   │
│                          │                                   │
│    ┌─────────────────────┼──────────────────────┐           │
│    │                     │                      │           │
│    ▼                     ▼                      ▼           │
│ ┌──────────┐      ┌──────────────┐     ┌──────────────┐   │
│ │ WebSocket│      │  REST API    │     │  WebSocket   │   │
│ │ Gateway  │      │  Endpoints   │     │  Broadcast   │   │
│ └────┬─────┘      └──────┬───────┘     └──────┬───────┘   │
│      │                   │                      │           │
│      │  Real-time        │  CRUD Operations     │           │
│      │  Job Updates      │  - Jobs              │ Broadcast │
│      │                   │  - Captures          │ to all    │
│      │                   │  - Diagnostics       │ subscribed│
│      │                   │  - Estimates         │ clients  │
│      │                   │  - Presence          │           │
│      │                   │                      │           │
│      └───────────────────┼──────────────────────┘           │
│                          │                                   │
│            ┌─────────────▼──────────────┐                   │
│            │   Core Services            │                   │
│            ├────────────────────────────┤                   │
│            │ - JobCapturesService       │                   │
│            │ - HvacDiagnosticsService   │                   │
│            │ - JobRealtimeGateway       │                   │
│            │ - MediaStorageService      │                   │
│            └─────────────┬──────────────┘                   │
│                          │                                   │
│      ┌───────────────────┼───────────────────┐             │
│      │                   │                   │             │
│      ▼                   ▼                   ▼             │
│  ┌────────┐          ┌────────┐         ┌───────┐        │
│  │Storage │          │Hermes  │         │ Cache │        │
│  │Service │          │AI API  │         │       │        │
│  │S3/Loc. │          │Vision  │         │       │        │
│  └────────┘          └────────┘         └───────┘        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Deployment Checklist

### Pre-Deployment (Development)
- [x] Consolidate all HVAC components into master branch
- [x] Implement Ray-Ban → Job sync (Phase 2)
- [x] Integrate Hermes AI diagnostics (Phase 3)
- [x] Create end-to-end workflow tests (Phase 4)
- [x] All tests passing
- [x] Code reviewed and documented

### Pre-Deployment (Infrastructure)
- [ ] SSH access to 173.208.147.165 (dwise user)
- [ ] Docker and Docker Compose installed
- [ ] Port 3000 available (API backend)
- [ ] Nginx configured with HVAC routes
- [ ] SSL certificates valid (Let's Encrypt)
- [ ] Database backups scheduled
- [ ] Monitoring and alerting configured

### Deployment Steps

#### 1. Pull Latest Master Branch
```bash
cd /home/dwise/wise2-core
git checkout feat/wise2-hvac-contractor-os-master
git pull origin feat/wise2-hvac-contractor-os-master
```

#### 2. Update Environment Variables
```bash
# .env additions
HVAC_ENABLED=true
HERMES_API_URL=http://localhost:3012
HERMES_API_KEY=<secret>
STORAGE_PROVIDER=s3
S3_BUCKET=wise2-hvac-captures
AWS_REGION=us-east-1
```

#### 3. Build Docker Images
```bash
docker-compose -f docker-compose.prod.yml build --no-cache api
docker-compose -f docker-compose.prod.yml build --no-cache website
```

#### 4. Deploy Services
```bash
# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Start new services
docker-compose -f docker-compose.prod.yml up -d api website

# Verify health
curl https://wise2.net/api/health
curl https://wise2.net/hvac/health
```

#### 5. Verify Nginx Configuration
```bash
# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Verify routes
curl -I https://wise2.net/hvac/
curl -I https://wise2.net/api/jobs/
curl -I https://wise2.net/api/diagnostics/
```

#### 6. Run Deployment Tests
```bash
bash scripts/hvac-e2e-test.sh
bash scripts/verify-hvac-deployment.sh
```

### Post-Deployment Verification

#### API Endpoints
```bash
# Health check
curl https://wise2.net/api/hvac/health

# Ray-Ban dashboard
curl https://wise2.net/rayban/

# HVAC dashboard
curl https://wise2.net/hvac/

# Job API
curl -H "Authorization: Bearer <token>" \
  https://wise2.net/api/jobs/job-001/status

# Captures API  
curl -H "Authorization: Bearer <token>" \
  https://wise2.net/api/jobs/job-001/captures

# Diagnostics API
curl -H "Authorization: Bearer <token>" \
  https://wise2.net/api/diagnostics/job/job-001

# WebSocket Gateway
wscat -c wss://wise2.net/jobs
# Send: {"type": "subscribe-job", "jobId": "job-001"}
```

#### Supervisor Dashboard
1. Navigate to https://wise2.net/hvac/
2. Log in with supervisor credentials
3. Verify:
   - [ ] Job list displays
   - [ ] Real-time updates show technician presence
   - [ ] Capture gallery shows photos
   - [ ] Diagnostics results display
   - [ ] Estimates auto-generate

#### Field Technician Interface
1. Pair Ray-Ban Meta Pro glasses with Razr device
2. Navigate to https://wise2.net/hvac/tech
3. Log in with technician credentials
4. Test:
   - [ ] Job dispatch visible
   - [ ] Device linking successful
   - [ ] Photo capture works
   - [ ] Real-time upload to supervisor
   - [ ] Diagnostics analysis starts

#### End-to-End Workflow
1. Create test job: `job-hvac-prod-001`
2. Assign technician: `tech-rayban-001`
3. Link Ray-Ban device: `rayban-pro-test`
4. Capture photo (test image)
5. Verify:
   - [ ] Capture appears in supervisor dashboard in < 2s
   - [ ] Diagnostics analysis starts
   - [ ] Results appear in < 30s
   - [ ] Estimate generates automatically
   - [ ] All events broadcast via WebSocket

### Monitoring & Alerts

#### Health Checks
```bash
# API health
curl https://wise2.net/api/health

# Database connectivity
curl https://wise2.net/api/db/health

# WebSocket gateway
wscat -c wss://wise2.net/jobs
```

#### Log Monitoring
```bash
# API logs
docker logs wise2-api | grep HVAC

# Nginx logs
tail -f /var/log/nginx/wise2.net.access.log | grep hvac

# Error logs
tail -f /var/log/nginx/wise2.net.error.log
```

#### Performance Metrics
- API response time: < 500ms (p95)
- Photo upload: < 5s (500MB file)
- Diagnostics analysis: < 30s (p95)
- WebSocket latency: < 200ms
- Dashboard update latency: < 1s

### Rollback Plan

If deployment fails:
```bash
# Revert to previous version
git checkout main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verify rollback
curl https://wise2.net/api/health
```

### Post-Deployment Tasks

- [ ] Update DNS records (if domain changed)
- [ ] Send deployment notification to team
- [ ] Update status page
- [ ] Monitor error logs for 24 hours
- [ ] Collect performance metrics
- [ ] Schedule post-deployment review
- [ ] Document any issues encountered
- [ ] Plan Phase 6: Advanced Features (mobile app, analytics)

## Production Features

### Real-Time Supervisor Dashboard
- Live job status updates via WebSocket
- Technician presence map with GPS tracking
- Photo gallery with instant thumbnails
- Diagnostics results with AI confidence scores
- Auto-generated estimates with parts breakdown

### Field Technician Interface
- Job dispatch via Ray-Ban glasses display
- Photo/video capture with automatic upload
- Real-time supervisory feedback
- Offline mode (when connectivity lost)
- Voice commands (via Razr device)

### Hermes AI Diagnostics
- Equipment identification (type, brand, model)
- Condition assessment (excellent/good/fair/poor/critical)
- Issue categorization (structural, mechanical, electrical, refrigerant, maintenance)
- Severity-based recommendations (routine, soon, urgent, emergency)
- Automatic estimate generation with labor/parts breakdown

### Data Security
- End-to-end HTTPS/TLS
- JWT authentication
- Role-based access control (supervisor/technician)
- Media encryption at rest (S3)
- Audit logging for all operations

## Support & Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check API health: `curl https://wise2.net/api/health`
- Verify Docker containers running: `docker ps`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`

**WebSocket Connection Failed**
- Ensure Nginx WebSocket headers are set (check hvac-contractor-os.conf)
- Verify firewall allows WSS connections
- Check proxy_read_timeout in Nginx config

**Diagnostics Analysis Slow**
- Check Hermes API availability: `curl http://localhost:3012/health`
- Monitor system resources: `docker stats`
- Review Hermes logs for errors

**Photo Upload Failures**
- Verify S3 credentials and permissions
- Check file size (max 500MB)
- Review storage service logs

### Support Contacts
- On-call engineer: dwise03@gmail.com
- Hermes AI support: ai-support@wise2.net
- Infrastructure: ops@wise2.net

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-15 | Initial production release |
|       |            | - Ray-Ban wearables integration |
|       |            | - Hermes AI diagnostics |
|       |            | - Real-time supervisor dashboard |
|       |            | - Field technician interface |

## References

- [Ray-Ban Wearables Integration](../docs/rayban-integration.md)
- [Hermes AI Diagnostics API](../docs/hermes-diagnostics.md)
- [Job Captures API](../packages/api/src/jobs/job-captures.controller.ts)
- [HVAC Diagnostics Service](../packages/api/src/hvac/hvac-diagnostics.service.ts)
- [End-to-End Test Suite](../packages/api/src/hvac/hvac-e2e-workflow.spec.ts)
