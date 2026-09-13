# WISE² AR/VR Operations Runbook

Emergency procedures for critical alerts in the WISE² monitoring stack.

---

## 🚨 CRITICAL ALERTS

### RouterDown

**Alert**: Router service at localhost:3100 is not responding for more than 1 minute

**Severity**: CRITICAL  
**Slack Channel**: #wise2-critical-alerts  
**Response Time**: < 5 minutes

#### Check Status
```bash
# Check if process running
ps aux | grep "router"

# Check logs
docker logs wise2-router

# Check port
lsof -i :3100
```

#### Diagnosis
1. **Is the process running?** → If no, restart
2. **Are there error logs?** → Check for DB/network issues
3. **Is port 3100 in use by another process?** → Kill conflicting process
4. **Is the database reachable?** → Check PostgreSQL

#### Recovery Steps
```bash
# Option 1: Restart router process
npm run start:router

# Option 2: Restart Docker container
docker-compose restart wise2-router

# Option 3: Full redeploy
docker-compose down wise2-router
docker-compose up -d wise2-router

# Verify recovery
curl http://localhost:3100/metrics
```

#### Escalation
- If still down after 5 minutes → Page on-call manager
- If database is down → Follow PostgresDown procedure below

---

### OllamaDown

**Alert**: Cannot reach Ollama at localhost:11434 for more than 1 minute

**Severity**: CRITICAL  
**Slack Channel**: #wise2-critical-alerts  
**Response Time**: < 5 minutes

#### Check Status
```bash
# Direct ping
curl http://localhost:11434/api/tags

# Check container
docker ps | grep ollama

# Check GPU (if CUDA enabled)
nvidia-smi
```

#### Diagnosis
1. **Is the container running?** → If no, restart
2. **Are there CUDA/GPU errors?** → Fallback to CPU inference
3. **Is disk full?** → Models take ~5-10GB per model
4. **Memory pressure?** → Check system memory

#### Recovery Steps
```bash
# Restart Ollama
docker-compose restart ollama
sleep 30

# Verify models still loaded
curl http://localhost:11434/api/tags

# If models lost, reload
curl -X POST http://localhost:11434/api/pull \
  -H "Content-Type: application/json" \
  -d '{"name": "qwen2.5-coder"}'
```

#### Escalation
- If models corrupted → Rebuild from backup
- If GPU failing → Switch to CPU-only mode
- Page on-call if not recovered in 10 minutes

---

### BudgetExceeded

**Alert**: Daily budget fully consumed (budget_used_pct >= 100)

**Severity**: CRITICAL  
**Slack Channel**: #wise2-critical-alerts  
**Response Time**: IMMEDIATE

#### Impact
- New API requests being blocked
- Router returns 429 (Too Many Requests)
- Devices degraded to local-only inference

#### Check Actual Spend
```bash
# Check Router budget metrics
curl http://localhost:3100/metrics | grep budget

# Check request logs for anomalies
docker logs wise2-router | grep "budget" | tail -20
```

#### Diagnosis
1. **Was there a traffic spike?** → Check request volume
2. **Are there runaway queries?** → Check slow query log
3. **Is there a cost leak?** → Audit expensive operations
4. **Is budget misconfigured?** → Review limits in router config

#### Recovery Steps
```bash
# Option 1: Reset budget (for legitimate spikes)
# Edit DAILY_BUDGET_CENTS in router config
# Redeploy router

# Option 2: Throttle to tier-2 (70%)
# Allows critical traffic but reduces query size/rate
# Configure in router budget enforcement

# Option 3: Graceful degradation
# Disable expensive features temporarily:
# - RAG enrichment (use local-only)
# - Real-time analytics
# - Streaming responses
```

#### Prevention
- Set up budget alerts at 50%, 75%, 90% thresholds
- Review daily spend at end of business day
- Audit expensive features monthly
- Implement per-feature budget caps

---

### PostgresDown

**Alert**: Cannot connect to telemetry database

**Severity**: CRITICAL  
**Slack Channel**: #wise2-critical-alerts  
**Response Time**: < 5 minutes

#### Check Status
```bash
# Direct connection
psql -h localhost -U postgres -d wise2_telemetry

# Check container
docker ps | grep postgres

# Check disk space
df -h /var/lib/docker
```

#### Diagnosis
1. **Is the container running?** → If no, restart
2. **Is port 5432 accessible?** → Check firewall
3. **Is disk full?** → Database won't accept writes
4. **Are there corruption errors?** → Check logs

#### Recovery Steps
```bash
# Restart PostgreSQL
docker-compose restart postgres
sleep 10

# Verify tables exist
psql -h localhost -U postgres -d wise2_telemetry -c "\dt"

# Check for corruption
docker-compose exec postgres pg_isready
```

#### If Data Corrupted
```bash
# Restore from backup (daily automated backup)
docker-compose down postgres
# Restore from backup volume or S3
docker-compose up -d postgres

# Run migrations
npm run db:migrate
```

#### Escalation
- If disk full → Increase storage immediately
- If corruption → Restore from backup + page manager
- If still down → Contact database vendor support

---

## ⚠️ WARNING ALERTS

### HighLatency

**Alert**: Router latency P95 > 2500ms (SLA threshold)

**Severity**: WARNING  
**Response Time**: < 30 minutes

#### Impact
- Degraded device response (should be < 500ms)
- User experience issues
- Approaching SLA violation

#### Diagnosis
```bash
# Check request latency breakdown
curl http://localhost:3100/metrics | grep router_request_duration

# Check database query latency
curl http://localhost:9187/metrics | grep pg_slow_query

# Check Ollama inference time
curl http://localhost:11434/api/metrics | grep inference_duration
```

#### Root Causes
1. **Database bottleneck** → See PostgresSlowQueries
2. **Ollama overloaded** → See OllamaHighLatency
3. **Network issues** → Check connectivity
4. **Large requests** → Check request size distribution

#### Resolution
```bash
# Scale Ollama (if available)
# Add more GPU memory or increase batch size

# Optimize queries
# Add database indexes for slow queries

# Reduce request size
# Implement request pagination/filtering

# Cache responses
# Enable Redis caching for repeated queries
```

---

### OllamaMemoryHigh

**Alert**: Ollama memory usage > 90%

**Severity**: WARNING  
**Response Time**: < 30 minutes

#### Impact
- Model unloading may occur
- Slower inference as models swap to disk
- Potential OOM crash

#### Check Usage
```bash
# Monitor memory
watch "curl http://localhost:11434/api/metrics | grep memory"

# Check which models loaded
curl http://localhost:11434/api/tags

# Check system memory
free -h
```

#### Options
1. **Unload less-used models**
   ```bash
   # Delete model (if not needed)
   curl -X DELETE http://localhost:11434/api/pull \
     -H "Content-Type: application/json" \
     -d '{"name": "neural-chat"}'
   ```

2. **Increase available memory**
   - Upgrade server RAM
   - Run fewer competing services
   - Configure Ollama memory limits

3. **Enable model pruning**
   - Quantize models (4-bit instead of 16-bit)
   - Use smaller models (7B instead of 13B)

---

### ErrorRateHigh

**Alert**: Router error rate > 0.1% (> 1 in 1000 requests)

**Severity**: WARNING  
**Response Time**: < 30 minutes

#### Check Error Types
```bash
# Get error breakdown
curl "http://localhost:3100/metrics" | grep router_errors

# Check logs for patterns
docker logs wise2-router | grep ERROR | tail -50
```

#### Common Causes
1. **Client errors (4xx)** → Bad requests from devices
2. **Server errors (5xx)** → App crashes or resource exhaustion
3. **Timeout errors** → Slow dependencies
4. **Auth errors** → Credential issues

#### Resolution
```bash
# For 4xx errors
# Add request validation, improve device SDK

# For 5xx errors
# Check logs for stack traces, fix root cause

# For timeouts
# Increase timeout thresholds, optimize queries

# For auth errors
# Verify API keys, check certificate expiry
```

---

### RedisDown

**Alert**: Redis cache is unavailable

**Severity**: WARNING (non-critical, graceful degradation)  
**Response Time**: < 30 minutes

#### Impact
- Cache misses increase
- Latency increases
- Database load increases
- But service continues (fallback to DB)

#### Recovery
```bash
# Restart Redis
docker-compose restart redis
sleep 5

# Verify
redis-cli ping

# Flush cache if corrupted
redis-cli FLUSHALL
```

---

## ℹ️ INFO ALERTS

### NoRayBanDevices

**Alert**: No Ray-Ban devices have checked in recently

**Severity**: INFO  
**Response Time**: Daily review

#### Check
```bash
# See last check-in timestamp
curl http://localhost:3100/metrics | grep rayban_connected_devices
```

#### Action
- **If expected**: No action needed
- **If unexpected**: Check device connectivity, verify API key
- **If persistent**: May indicate device deployment issue

### NoQuestDevices

**Alert**: No Quest devices have checked in recently

**Severity**: INFO  
**Response Time**: Daily review

#### Check
```bash
# See last check-in timestamp
curl http://localhost:3100/metrics | grep quest_connected_devices
```

#### Action
- **If expected**: No action needed
- **If unexpected**: Check device WiFi, verify app running
- **If persistent**: May indicate build/deployment issue

---

## 📊 DASHBOARD INTERPRETATION

### Green Indicators
- Service up and responding
- Latency within SLA
- Error rate < 0.01%
- Budget < 50% used
- Device connectivity active

### Yellow Indicators
- High latency (P95 > 1000ms)
- Error rate 0.01-0.1%
- Memory usage 75-90%
- Budget 50-75% used
- No devices checking in (but expected)

### Red Indicators
- Service down (up=0)
- Latency > 2500ms (SLA breach)
- Error rate > 0.1%
- Memory usage > 90%
- Budget > 90% used
- Critical feature unavailable

---

## 🔧 COMMON OPERATIONS

### Health Check

```bash
#!/bin/bash
# Health check script

echo "=== WISE² AR/VR Health Check ==="

# Check services
services=("router:3100" "ollama:11434" "second-brain:3012" "postgres:5432" "redis:6379")

for service in "${services[@]}"; do
  IFS=':' read -r name port <<< "$service"
  if curl -s http://localhost:$port > /dev/null 2>&1; then
    echo "✓ $name running"
  else
    echo "✗ $name DOWN"
  fi
done

# Check budget
budget=$(curl -s http://localhost:3100/metrics | grep "budget_used_pct" | tail -1 | awk '{print $2}')
echo "Budget used: ${budget}%"

# Check error rate (last 5 minutes)
errors=$(curl -s http://localhost:3100/metrics | grep "router_errors_total" | tail -1 | awk '{print $2}')
echo "Errors (5m): $errors"
```

### Backup Dashboard Settings

```bash
# Export all dashboards
curl http://localhost:3000/api/search?query=* \
  -H "Authorization: Bearer $GRAFANA_TOKEN" | \
  jq '.[] | .id' | \
  while read id; do
    curl "http://localhost:3000/api/dashboards/uid/wise2-arvr-overview" \
      -H "Authorization: Bearer $GRAFANA_TOKEN" > "dashboard-$id.json"
  done
```

### Reset Alerts

```bash
# Restart alertmanager to clear stuck alerts
docker-compose restart alertmanager

# Or manually POST to Alertmanager API
curl -X POST http://localhost:9093/api/v1/alerts -d '[]'
```

---

## 📞 ESCALATION CONTACTS

- **On-call Engineer**: Page via PagerDuty
- **Infrastructure Manager**: For server/network issues
- **Database Administrator**: For PostgreSQL issues
- **Machine Learning Engineer**: For Ollama/model issues

---

**This runbook is a living document. Update procedures as you learn from incidents. Test recovery procedures quarterly.**
