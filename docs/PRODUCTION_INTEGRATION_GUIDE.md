# WISE² AR/VR Production Integration Guide

Complete end-to-end production deployment for the WISE² AR/VR ecosystem with Ollama inference, Ray-Ban Meta glasses, and Meta Quest 3S.

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     WISE² AR/VR PRODUCTION SYSTEM                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EDGE DEVICES                    INFERENCE                  KNOWLEDGE      │
│  ┌──────────────────┐           ┌──────────────────┐      ┌────────────┐  │
│  │ Ray-Ban Meta     │           │ Ollama Container │      │ Second     │  │
│  │ Glasses (AR)     │◄──────────►│ - qwen2.5-coder  │◄────►│ Brain RAG  │  │
│  │ Camera + Display │ HTTP       │ - neural-chat    │      │ Knowledge  │  │
│  │ Audio/Location   │ REST API   │ Inference Time:  │      │ Base       │  │
│  │                  │            │ 5-30s per query  │      │            │  │
│  └──────────────────┘            └────────┬─────────┘      └────────────┘  │
│            ▲                               │                                │
│            │                               │                                │
│            └───────────┐          ┌────────▼─────────────┐                 │
│                        │          │                      │                 │
│  ┌──────────────────┐  │          │   ROUTER API        │                 │
│  │ Meta Quest 3S    │  │          │   (Port 3100)       │                 │
│  │ (VR Workspace)   │──┼─────────►│                     │                 │
│  │ Hand Tracking    │  │ JSON     │ • Budget Enforce    │                 │
│  │ Spatial Audio    │  │ TLS      │ • Multi-device Sync │                 │
│  │ 72 FPS Render    │  │ WebRTC   │ • Request Routing   │                 │
│  └──────────────────┘  │          │ • Metrics Export    │                 │
│            ▲            │          │                     │                 │
│            └────────────┘          └────────┬────────────┘                 │
│                                             │                              │
│                                    ┌────────▼────────┐                    │
│                                    │  MONITORING     │                    │
│                                    │  (Port 9090)    │                    │
│                                    │                 │                    │
│                                    │ • Prometheus    │                    │
│                                    │ • Grafana       │                    │
│                                    │ • Alertmanager  │                    │
│                                    │ • 25+ Rules     │                    │
│                                    │ • Slack/Paging  │                    │
│                                    └─────────────────┘                    │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Component Inventory

### SDKs
- **RayBanClient** (`services/rayban-meta-sdk/src/client.ts`)
  - High-level wrapper for Ray-Ban integration
  - Methods: analyzeFrame(), diagnoseEquipment(), getPartsRecommendation()
  - Auto-retry with exponential backoff
  - Production example included

- **QuestClient** (`services/quest-meta-sdk/src/client.ts`)
  - High-level wrapper for Quest VR integration
  - Methods: handlePinch(), handleGrab(), handlePoint(), handlePalm()
  - Spatial math utilities + gesture recognition
  - Full error handling

### Applications

**Field Service (Ray-Ban Meta)**
- `apps/ar-field-service/`
- React Native + camera integration
- Equipment frame capture, AI analysis, AR overlay
- Service report generation

**VR Workspace (Meta Quest 3S)**
- `apps/vr-workspace/`
- Unity C# application
- Hand tracking (5 gesture types)
- 72 FPS optimization engine
- Spatial audio positioning

### Infrastructure

**Ollama Inference** (`docker-compose.prod.yml`)
- Container-based inference engine
- Models: qwen2.5-coder, neural-chat (both loaded and verified)
- Local-first architecture (no cloud dependency)
- ~35-40s RTT for complex queries

**Router API** (`services/wise2-ai-router/`)
- Central request routing and budget enforcement
- 4-tier throttling (50%, 70%, 85%, 100%)
- Multi-device response broadcasting
- Prometheus metrics export

**Second Brain** (existing, enhanced)
- RAG context enrichment
- Knowledge base integration
- Semantic search for equipment/procedures

### Monitoring

**Prometheus** (`monitoring/prometheus.yml`)
- Scrapes 8 job types (Router, Ollama, Second Brain, DB, Cache, etc.)
- 15-30 second intervals
- 30-day retention

**Alerting** (`monitoring/alerts.yml`)
- 25+ production-ready rules
- Critical alerts → immediate Slack + PagerDuty
- Warning alerts → standard Slack
- SLA breach detection (99.9% uptime)

**Grafana** (`monitoring/grafana/`)
- Pre-built dashboard (WISE² AR/VR Overview)
- Real-time metrics visualization
- Data source auto-provisioning

---

## Deployment Checklist

### Phase 1: Infrastructure Setup

- [ ] **Install Docker & Docker Compose**
  ```bash
  docker --version  # 20.10+
  docker-compose --version  # 2.0+
  ```

- [ ] **Create deployment directory**
  ```bash
  mkdir -p /opt/wise2-arvr/{ollama,router,monitoring}
  cd /opt/wise2-arvr
  ```

- [ ] **Clone repository**
  ```bash
  git clone <repository-url> .
  ```

- [ ] **Install system dependencies**
  ```bash
  # Ubuntu/Debian
  sudo apt-get install -y curl jq redis-server postgresql

  # macOS
  brew install curl jq redis postgresql
  ```

### Phase 2: Ollama Deployment

- [ ] **Start Ollama container**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d ollama
  sleep 30
  ```

- [ ] **Verify container running**
  ```bash
  docker ps | grep ollama
  curl http://localhost:11434/api/tags
  ```

- [ ] **Load inference models**
  ```bash
  # Load qwen2.5-coder (4.7GB)
  curl -X POST http://localhost:11434/api/pull \
    -H "Content-Type: application/json" \
    -d '{"name": "qwen2.5-coder:7b"}'

  # Load neural-chat (4.1GB)
  curl -X POST http://localhost:11434/api/pull \
    -H "Content-Type: application/json" \
    -d '{"name": "neural-chat:7b"}'

  # Verify both loaded
  curl http://localhost:11434/api/tags | jq '.models[].name'
  ```

- [ ] **Test inference**
  ```bash
  curl -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{
      "model": "qwen2.5-coder",
      "prompt": "What is HVAC?",
      "stream": false
    }'
  ```

### Phase 3: Router API Deployment

- [ ] **Configure environment**
  ```bash
  # Create .env in services/wise2-ai-router/
  cp .env.example .env
  # Set:
  # OLLAMA_URL=http://localhost:11434
  # SECOND_BRAIN_URL=http://localhost:3012
  # DAILY_BUDGET_CENTS=5000  # $50/day
  # LOG_LEVEL=info
  ```

- [ ] **Start Router**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d router
  sleep 10
  ```

- [ ] **Verify Router responding**
  ```bash
  curl http://localhost:3100/health
  curl http://localhost:3100/metrics | head -20
  ```

- [ ] **Test Ray-Ban device endpoint**
  ```bash
  curl -X POST http://localhost:3100/process-frame \
    -H "Content-Type: application/json" \
    -d '{
      "deviceId": "rayban-001",
      "frameData": {"contentType": "AR_EQUIPMENT_ANALYSIS"},
      "gesture": "point",
      "userMessage": "What is this component?"
    }' | jq '.response'
  ```

- [ ] **Test Quest device endpoint**
  ```bash
  curl -X POST http://localhost:3100/process-frame \
    -H "Content-Type: application/json" \
    -d '{
      "deviceId": "quest-001",
      "frameData": {"gesture": "pinch"},
      "userMessage": "Show me data visualization"
    }' | jq '.response'
  ```

### Phase 4: Monitoring Stack Deployment

- [ ] **Start monitoring services**
  ```bash
  cd monitoring
  docker-compose up -d
  sleep 20
  ```

- [ ] **Verify Prometheus scraping**
  ```bash
  curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'
  ```

- [ ] **Verify Grafana dashboard**
  ```bash
  # Access http://localhost:3000
  # Login: admin / admin
  # Navigate to WISE² AR/VR Overview dashboard
  ```

- [ ] **Configure Slack integration** (optional)
  ```bash
  # Create webhook in Slack
  # Update alertmanager.yml with webhook URL
  # docker-compose restart alertmanager
  ```

### Phase 5: Device Application Deployment

#### Ray-Ban Meta Glasses

- [ ] **Build Ray-Ban app**
  ```bash
  cd apps/ar-field-service
  npm install
  npm run build:rayban
  ```

- [ ] **Deploy to Ray-Ban devices**
  ```bash
  npm run deploy:rayban
  ```

- [ ] **Test on device**
  - Open app
  - Point at equipment
  - Verify AI analysis appears as AR overlay
  - Check latency (should be < 2 seconds)

#### Meta Quest 3S

- [ ] **Build Quest app**
  ```bash
  cd apps/vr-workspace
  ./BuildQuest.sh
  ```

- [ ] **Deploy to Meta Quest 3S**
  ```bash
  adb connect <quest-ip>
  adb install -r build/VRWorkspace.apk
  ```

- [ ] **Test on device**
  - Launch app
  - Perform hand gestures (pinch, grab, point, palm)
  - Verify spatial audio responds
  - Monitor FPS (should maintain 72 FPS)
  - Check battery drain (should be < 10%/hour)

### Phase 6: Load Testing

- [ ] **Install load test tools**
  ```bash
  npm install -g artillery
  ```

- [ ] **Run baseline load test**
  ```bash
  # Test 10 concurrent devices, 1 req/sec each
  artillery run load-test.yml \
    --target http://localhost:3100 \
    --duration 300  # 5 minutes
  ```

- [ ] **Verify results**
  ```bash
  # Check Prometheus for latency during test
  curl "http://localhost:9090/api/v1/query?query=histogram_quantile(0.95, rate(router_request_duration_ms[1m]))"

  # Verify no budget overages
  curl "http://localhost:3100/metrics" | grep budget_used_pct
  ```

### Phase 7: Security & Compliance

- [ ] **Enable TLS**
  ```bash
  # Generate certificates
  openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

  # Update docker-compose for TLS
  # Add volumes for certs
  # Update port to 3443
  ```

- [ ] **Configure authentication**
  ```bash
  # Generate API keys for each device
  npm run generate-api-keys

  # Update device SDKs with keys
  ```

- [ ] **Enable HTTPS**
  ```bash
  # Update Router to require HTTPS
  # Update device applications to use HTTPS
  ```

- [ ] **Verify security checklist**
  ```bash
  # [ ] API authentication enabled
  # [ ] TLS certificates installed
  # [ ] Ollama not exposed to public
  # [ ] Database password changed
  # [ ] Monitoring stack behind auth
  # [ ] API rate limiting enabled
  # [ ] Sensitive logs redacted
  ```

---

## Operational Procedures

### Daily Operations

**Morning Check** (08:00 UTC)
```bash
# Health check
bash monitoring/health-check.sh

# Review overnight metrics
# - Any critical alerts fired?
# - Budget used < 20%?
# - Device connectivity stable?

# Check error logs
docker logs wise2-router | grep ERROR | tail -20
docker logs ollama | grep error | tail -20
```

**End-of-Day Review** (17:00 UTC)
```bash
# Export daily metrics
curl "http://localhost:9090/api/v1/query_range?query=budget_used_pct&start=<today_start>&end=<today_end>&step=3600" > daily-budget.json

# Archive logs
tar -czf logs-$(date +%Y%m%d).tar.gz /var/log/wise2-*

# Backup configurations
git add -A && git commit -m "Daily config backup"
```

### Weekly Maintenance

**Every Monday**
```bash
# Review performance trends
# - Latency trends
# - Error rate trends
# - Device adoption
# - Cost trends

# Optimize based on data
# - Add database indexes if slow queries
# - Adjust alert thresholds if false positives
# - Scale resources if approaching limits

# Test disaster recovery
# - Restore from latest backup
# - Verify full system functionality
# - Document any issues
```

### Monthly Capacity Planning

**Every 1st of month**
```bash
# Calculate resource utilization
# - CPU: should be < 60% peak
# - Memory: should be < 75% peak
# - Disk: should be < 80% used
# - Network: should be < 60% peak

# Forecast growth
# - Device count growth rate
# - Request volume growth rate
# - Model size growth (new models)

# Plan upgrades if needed
# - Scale to larger instance
# - Add GPU if available
# - Optimize expensive operations
```

### Incident Response

**Critical Alert Fired**
1. Acknowledge alert immediately in Slack
2. Check Grafana dashboard for service status
3. Review corresponding runbook section (see `monitoring/RUNBOOK.md`)
4. Execute recovery steps
5. Verify service restored
6. Document incident + root cause
7. Schedule postmortem

**Performance Degradation**
1. Check budget usage (might be at throttle tier)
2. Check device connectivity (might be many new devices)
3. Check Ollama latency (might be overloaded)
4. Check database performance (slow queries)
5. Scale resources if needed

---

## Troubleshooting Guide

### Device Can't Connect

```bash
# Check Router responding
curl http://localhost:3100/health

# Check device API key valid
# (RayBanClient/QuestClient will show auth errors)

# Check network connectivity
ping <device-ip>

# Check Router logs for device errors
docker logs wise2-router | grep "deviceId=<device-id>"
```

### Slow Response Times

```bash
# Check which component is slow
# Router latency
curl http://localhost:3100/metrics | grep router_request_duration

# Ollama latency
curl http://localhost:11434/api/metrics | grep inference_duration

# Database latency
curl http://localhost:9187/metrics | grep pg_query_duration

# Scale the slow component
```

### Budget Exceeded

```bash
# Check current spend
curl http://localhost:3100/metrics | grep budget

# Check request patterns
docker logs wise2-router | grep "tokens_used" | head -50

# Implement cost control measures
# - Enable response caching
# - Reduce request size
# - Disable expensive features
```

---

## Performance Baselines

Expected performance under normal load:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Router Latency P95 | < 500ms | > 1000ms | > 2500ms |
| Ollama Inference | 5-30s | > 60s | > 120s |
| Error Rate | < 0.01% | > 0.01% | > 0.1% |
| Budget Used/Day | 30-50% | > 75% | > 100% |
| Device Uptime | > 99% | > 95% | < 95% |
| FPS (Quest) | 72 | 60 | < 60 |

---

## Scaling Strategy

### Horizontal Scaling (add more devices)

```yaml
# docker-compose.prod.yml
services:
  router:
    deploy:
      replicas: 3  # Add more replicas
    environment:
      - LOAD_BALANCER=true
```

### Vertical Scaling (larger instance)

- Upgrade CPU cores (Router can use more threads)
- Upgrade GPU VRAM (Ollama can load larger models)
- Upgrade system RAM (caching + database connections)

### Cost Optimization

- Cache responses (avoid re-inference)
- Batch device requests
- Use smaller models when possible
- Implement request size limits
- Monitor per-feature costs

---

## Disaster Recovery

### Backup Strategy

**Hourly**: Prometheus metrics to S3  
**Daily**: Database backup + model snapshots  
**Weekly**: Full system snapshot + code backup

### Recovery Time Objectives

- **RTO** (Recovery Time Objective): < 15 minutes
- **RPO** (Recovery Point Objective): < 1 hour

### Recovery Procedures

See `monitoring/RUNBOOK.md` for detailed procedures for each component failure.

---

## Success Criteria

✅ All checks pass:
- [ ] Router responding to requests
- [ ] Ollama models loaded and inferring
- [ ] Ray-Ban devices connecting and analyzing
- [ ] Quest devices connecting and responding
- [ ] Monitoring stack collecting metrics
- [ ] Alerts firing and routing correctly
- [ ] Performance within baseline thresholds
- [ ] Load test passes without errors
- [ ] End-to-end latency < 2 seconds
- [ ] Security checklist complete

**System is production-ready when all checks pass and team is trained on runbooks.**

---

## Next Steps

1. **Week 1**: Deploy infrastructure, test basic functionality
2. **Week 2**: Deploy to real devices, test in field
3. **Week 3**: Load testing, performance tuning
4. **Week 4**: Security hardening, disaster recovery drills
5. **Ongoing**: Monitor, optimize, scale as needed

---

**For detailed operational procedures, refer to:**
- `monitoring/SETUP.md` — Monitoring stack configuration
- `monitoring/RUNBOOK.md` — Emergency procedures
- `docs/AR_VR_APPLICATION_GUIDE.md` — Application architecture
- `docs/WEARABLE_INTEGRATION_GUIDE.md` — Device integration details
