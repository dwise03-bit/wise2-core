# REAPER V1 Deployment Guide

**Status**: ✅ Ready for Production  
**Target**: wise2.net (173.208.147.165)  
**Components**: M0 Foundation + M1 Audit Orchestration  
**Integration**: Discord notifications for audit events

---

## Quick Start (Local)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL client (optional, for testing)

### 1. Start Services

```bash
# Set Discord webhook (optional, for notifications)
export DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/YOUR/WEBHOOK"

# Start all services
cd /Users/danielwise/Projects/wise2-core
docker-compose -f docker-compose.reaper.yml up -d
```

### 2. Verify Health

```bash
# Check API
curl http://localhost:3001/api/reaper/health

# Expected response:
# {
#   "status": "OPERATIONAL",
#   "version": "M0_FOUNDATION",
#   "features": ["PROSPECTS", "AUDITS", "WEBSITE_CRAWL", "SCORING", ...]
# }
```

### 3. Create Test Prospect

```bash
curl -X POST http://localhost:3001/api/reaper/prospects \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "sourceUrl": "https://example.com",
    "contactName": "John Doe",
    "contactEmail": "john@testcorp.com"
  }'

# Response:
# {
#   "prospect": {
#     "id": "prospect-123",
#     "companyName": "Test Corp",
#     "status": "DISCOVERY"
#   }
# }
```

### 4. Queue Audit

```bash
curl -X POST http://localhost:3001/api/reaper/prospects/prospect-123/audit \
  -H "Content-Type: application/json" \
  -d '{
    "auditType": "WEBSITE",
    "sourceUrl": "https://example.com"
  }'

# Response:
# {
#   "auditId": "audit-456",
#   "status": "RUNNING",
#   "message": "Audit queued. Check status with GET /api/reaper/audits/audit-456"
# }
```

### 5. Check Results

```bash
# Poll audit status (repeat until status = COMPLETED)
curl http://localhost:3001/api/reaper/audits/audit-456

# Response when complete:
# {
#   "status": "COMPLETED",
#   "findings": [
#     {
#       "severity": "CRITICAL",
#       "title": "Website Not Using HTTPS",
#       "recommendation": "Migrate to HTTPS immediately"
#     },
#     ...
#   ],
#   "scores": {
#     "website": { "rawScore": 72, "confidence": 85 }
#   }
# }
```

---

## Production Deployment (wise2.net)

### 1. Set Up Server

```bash
# SSH into production server
ssh dwise@173.208.147.165

# Ensure Docker is running
sudo systemctl start docker

# Create app directory
mkdir -p /home/dwise/wise2-core
cd /home/dwise/wise2-core

# Clone repository
git clone https://github.com/your-org/wise2-core .
git checkout main
```

### 2. Configure Environment

```bash
# Create .env file on server
cat > /home/dwise/wise2-core/.env << 'EOF'
# Database
DATABASE_URL="postgresql://wise2_local:wise2_local_password@reaper-postgres:5432/wise2_core_dev"

# Redis
REDIS_HOST="reaper-redis"
REDIS_PORT=6379

# Discord
DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/YOUR/WEBHOOK"

# API
PORT=3001
NODE_ENV=production
EOF
```

### 3. Deploy (Automated)

```bash
# From local machine
chmod +x /Users/danielwise/Projects/wise2-core/scripts/deploy-reaper.sh
/Users/danielwise/Projects/wise2-core/scripts/deploy-reaper.sh

# Or manually on server
cd /home/dwise/wise2-core
docker-compose -f docker-compose.reaper.yml up -d
```

### 4. Verify Production

```bash
# Check health
curl http://173.208.147.165:3001/api/reaper/health

# Watch logs
ssh dwise@173.208.147.165 "docker-compose -f docker-compose.reaper.yml logs -f reaper-api"
```

---

## Nginx Configuration (wise2.net)

Add to `/etc/nginx/sites-available/wise2.net`:

```nginx
upstream reaper_api {
  server localhost:3001;
}

server {
  server_name api.wise2.net;
  listen 80;
  
  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  server_name api.wise2.net;
  listen 443 ssl http2;
  
  ssl_certificate /etc/letsencrypt/live/api.wise2.net/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.wise2.net/privkey.pem;
  
  # REAPER API Proxy
  location /reaper/ {
    proxy_pass http://reaper_api/api/reaper/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Allow long-running audits
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
  }
}
```

Reload Nginx:
```bash
sudo nginx -s reload
```

---

## Docker Compose Services

### PostgreSQL (Port 5432)
- Database: wise2_core_dev
- User: wise2_local
- Volume: reaper-postgres-data
- Health: Automatic restart on failure

### Redis (Port 6379)
- Queue backend for BullMQ
- Volume: reaper-redis-data
- Health: Automatic restart on failure

### API Server (Port 3001)
- NestJS application
- Handles: POST/GET prospect, audit queuing, results polling
- Connects to PostgreSQL & Redis
- Discord webhook notifications

### Worker Service
- Processes audit jobs from queue
- Crawls websites (Playwright)
- Collects evidence
- Applies rules
- Calculates scores
- Stores results

---

## Monitoring & Maintenance

### View Logs

```bash
# API logs
docker logs reaper-api -f

# Worker logs
docker logs reaper-worker -f

# All services
docker-compose -f docker-compose.reaper.yml logs -f
```

### Check Health

```bash
# API health
curl https://api.wise2.net/reaper/health

# Queue status
docker exec reaper-redis redis-cli INFO

# Database connection
docker exec reaper-postgres psql -U wise2_local -d wise2_core_dev -c "SELECT COUNT(*) FROM reaper_audit_runs;"
```

### Database Backups

```bash
# Backup database
docker exec reaper-postgres pg_dump -U wise2_local -d wise2_core_dev > backup.sql

# Restore from backup
docker exec -i reaper-postgres psql -U wise2_local -d wise2_core_dev < backup.sql
```

### Clear Old Audits (Optional)

```bash
# Keep last 1000 audits
docker exec reaper-postgres psql -U wise2_local -d wise2_core_dev << EOF
DELETE FROM reaper_audit_runs 
WHERE createdAt < NOW() - INTERVAL '30 days' 
AND status = 'COMPLETED'
LIMIT 1000;
EOF
```

---

## Discord Integration

### Setup Webhook

1. Go to Discord server → Settings → Integrations → Webhooks
2. Create new webhook in #reaper-audits channel
3. Copy webhook URL
4. Set environment variable:
   ```bash
   export DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/..."
   ```

### Events

- **Audit Started**: Company name, URL, status
- **Audit Completed**: Website score, findings count, status

Example message:
```
🔍 Audit Started
Analyzing Example Corp
URL: https://example.com
Status: ⟳ Running...
```

→ (after ~30s)

```
✅ Audit Completed
Example Corp audit finished
Website Score: 72/100
Findings: 5
Status: ⚠️ Needs Work
```

---

## Scaling Considerations

### Concurrent Audits

Current config: 2 workers, process 1-2 audits simultaneously.

To scale:
```yaml
# In docker-compose.reaper.yml, increase worker replicas
reaper-worker:
  deploy:
    replicas: 5  # Scale to 5 concurrent workers
```

### Performance Notes

- Website crawl: ~5-30s per site (depends on complexity)
- Evidence collection: ~1s
- Rule application: ~0.5s
- Score calculation: ~0.1s
- **Total per audit**: ~6-32s average

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_audit_runs_status ON reaper_audit_runs(status);
CREATE INDEX idx_audit_runs_org ON reaper_audit_runs(organizationId);
CREATE INDEX idx_findings_audit ON reaper_findings(auditRunId);
CREATE INDEX idx_scores_business ON reaper_scores(businessId, scoreType);
```

---

## Troubleshooting

### API won't start

```bash
# Check logs
docker logs reaper-api

# Common issues:
# 1. Database not ready → wait and restart
docker restart reaper-api

# 2. Port already in use → change PORT env var
# 3. Redis not running → docker-compose up -d reaper-redis
```

### Worker not processing

```bash
# Check Redis connection
docker exec reaper-redis redis-cli ping

# Check queue status
docker exec reaper-redis redis-cli LLEN bull:reaper-audits:wait

# Restart worker
docker restart reaper-worker
```

### Audits timing out

```bash
# Increase timeout in audit-queue-service.ts
lockDuration: 60000  // Increase from 30000

# Restart all services
docker-compose -f docker-compose.reaper.yml restart
```

---

## API Reference

### Endpoints

| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/reaper/prospects` | Create prospect |
| GET | `/reaper/prospects` | List prospects |
| GET | `/reaper/prospects/:id` | Get prospect detail |
| POST | `/reaper/prospects/:id/audit` | Queue audit |
| GET | `/reaper/audits/:id` | Get audit status/results |
| GET | `/reaper/opportunities` | List opportunities |
| GET | `/reaper/health` | System health |

### Response Codes

- **202 ACCEPTED** - Audit queued successfully
- **200 OK** - Request successful (GET endpoints)
- **201 CREATED** - Resource created
- **400 BAD REQUEST** - Invalid input
- **404 NOT FOUND** - Resource not found
- **500 SERVER ERROR** - Server error

---

## Next Steps

1. ✅ Deploy to wise2.net
2. ✅ Set up Discord notifications
3. ⏳ Monitor audit completion times
4. ⏳ Optimize crawler for performance
5. ⏳ Add social & reputation audits (M2+)

---

**Deployment Ready**: ✅ COMPLETE  
**Estimated Time to Deploy**: 10 minutes  
**Support**: Check logs, review REAPER documentation

