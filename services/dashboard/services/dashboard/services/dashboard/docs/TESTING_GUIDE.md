# Testing Guide — Wise² Core

Complete guide for testing Wise² Core services locally and in docker-compose.

---

## Quick Start

### Start Everything
```bash
cd wise2-core
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

### Health Check All Services
```bash
curl http://localhost:3000/health      # API
curl http://localhost:3001/             # Dashboard
curl http://localhost:9090              # Prometheus
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

### Stop Everything
```bash
docker-compose down
```

---

## Individual Service Testing

### 1. API Service Testing

#### Build Test
```bash
cd services/api
docker build -t wise-api:test .
# Expected: Successful build with "Successfully tagged wise-api:test"
```

#### Container Test
```bash
# Start dependencies
docker-compose up -d postgres redis

# Start API
docker-compose up -d api

# Wait for startup
sleep 5

# Health check
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "ok",
#   "service": "api",
#   "uptime": 5.123,
#   "timestamp": "2026-07-07T..."
# }
```

#### API Endpoints Test
```bash
# Root endpoint
curl http://localhost:3000/

# Expected response:
# {"status":"Wise Defense SaaS Running"}
```

#### Cleanup
```bash
docker-compose down
```

### 2. Dashboard Service Testing

#### Build Test
```bash
cd services/dashboard
docker build -t wise-dashboard:test .
# Expected: Successful Next.js build (will take 1-2 minutes)
```

#### Container Test
```bash
# Start API first (dashboard depends on it)
docker-compose up -d api

# Start dashboard
docker-compose up -d dashboard

# Wait for startup (Next.js build takes time)
sleep 30

# Health check
curl http://localhost:3001/

# Expected: HTML response (Next.js page)
```

#### Logs Check
```bash
docker-compose logs dashboard

# Look for:
# - "ready - started server on"
# - "compiled client and server successfully"
# - No error messages
```

#### Cleanup
```bash
docker-compose down
```

### 3. Admin Dashboard Testing

#### Build Test
```bash
cd services/admin-dashboard
docker build -t wise-admin:test .
```

#### Container Test
```bash
docker-compose up -d admin-dashboard

# Health check (port 3002)
curl http://localhost:3002/health

docker-compose down
```

### 4. Discord Bot Testing

#### Prerequisites
```bash
# Need Discord bot token in .env
DISCORD_BOT_TOKEN=your_token_here
DISCORD_GUILD_ID=your_guild_id
```

#### Build Test
```bash
cd services/bot
docker build -t wise-bot:test .
```

#### Container Test
```bash
docker-compose up -d bot

# Check logs for connection
docker-compose logs bot

# Expected: Bot connected to Discord (if credentials valid)

docker-compose down
```

### 5. Worker Service Testing

#### Build Test
```bash
cd services/worker
docker build -t wise-worker:test .
```

#### Container Test
```bash
# Start dependencies
docker-compose up -d postgres redis

# Start worker
docker-compose up -d worker

# Check logs
docker-compose logs worker

# Expected: Worker listening on Redis

docker-compose down
```

---

## Integration Testing

### Full Stack Test

#### Setup
```bash
docker-compose build
docker-compose up -d

# Wait for all services to start
sleep 30
```

#### Service Status Check
```bash
docker-compose ps

# Expected output:
# NAME                COMMAND             STATUS          PORTS
# wise2-postgres      postgres...         Up (healthy)    5432
# wise2-redis         redis-server...     Up              6379
# wise2-api           node src/server.js  Up              3000
# wise2-dashboard     node...             Up              3001
# wise2-admin-dash... node...             Up              3002
# wise2-bot           node...             Up              
# wise2-worker        node...             Up              
# wise2-prometheus    /bin/prometheus     Up              9090
# wise2-grafana       /run.sh             Up              3001
```

#### Health Checks
```bash
# All services health checks
echo "API:" && curl -s http://localhost:3000/health | jq .
echo "Dashboard:" && curl -s http://localhost:3001/ | head -20
echo "Admin:" && curl -s http://localhost:3002/health | jq .
echo "Prometheus:" && curl -s http://localhost:9090/-/healthy
```

#### Database Connectivity
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT version();"

# Expected: PostgreSQL version information
```

#### Cache Connectivity
```bash
# Redis
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Expected: PONG
```

#### Network Connectivity
```bash
# Test service-to-service communication

# API to Database
docker-compose exec api curl -s http://api:3000/health | jq .

# Dashboard to API
docker-compose exec dashboard curl -s http://api:3000/health | jq .

# Worker to Redis
docker-compose exec worker redis-cli -h redis ping

# Expected: All respond successfully
```

#### Logs Check
```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs dashboard

# Follow logs (like tail -f)
docker-compose logs -f

# Recent logs only
docker-compose logs --tail=50
```

#### Cleanup
```bash
docker-compose down

# Clean everything including volumes
docker-compose down -v
```

---

## Health Check Procedures

### API Health Check
```bash
# Basic health
curl http://localhost:3000/health

# Full check with status codes
curl -i http://localhost:3000/health

# Expected HTTP 200 with JSON response
```

### Dashboard Health Check
```bash
# Frontend loads
curl -I http://localhost:3001/

# Expected HTTP 200

# Full page load
curl http://localhost:3001/ | head -50
```

### Database Health Check
```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Expected: accepting connections

# Detailed check
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Expected: (1 row)
```

### Redis Health Check
```bash
# Redis
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Expected: PONG

# Detailed check
docker-compose exec redis redis-cli -a $REDIS_PASSWORD info server | head -20
```

### Monitoring Health Check
```bash
# Prometheus
curl -s http://localhost:9090/-/healthy

# Expected: (no output = healthy)

# Prometheus status
curl -s http://localhost:9090/api/v1/status/config | jq .
```

---

## Troubleshooting Tests

### Service Won't Start

#### Check logs
```bash
docker-compose logs SERVICE_NAME

# Look for:
# - Port already in use
# - Connection refused (dependency not running)
# - Out of memory
# - Disk full
```

#### Check ports
```bash
# Find what's using port 3000
lsof -i :3000

# Free up port
kill -9 PID
```

#### Rebuild
```bash
docker-compose build --no-cache SERVICE_NAME
docker-compose up -d SERVICE_NAME
```

### Database Connection Failed

#### Check database is running
```bash
docker-compose ps postgres

# Should show "Up (healthy)"
```

#### Check connection string
```bash
# Verify .env DATABASE_URL is correct
grep DATABASE_URL .env

# Should be: postgresql://user:password@postgres:5432/wise2_core
```

#### Test connection
```bash
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# If fails, restart database
docker-compose restart postgres
```

### Redis Connection Failed

#### Check Redis is running
```bash
docker-compose ps redis

# Should show "Up"
```

#### Test connection
```bash
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Should return PONG
```

### API Can't Connect to Database

#### Check both are running
```bash
docker-compose ps api postgres

# Both should be "Up"
```

#### Check environment
```bash
docker-compose exec api env | grep DATABASE

# Should show DATABASE_URL
```

#### Test from API container
```bash
docker-compose exec api curl -s http://postgres:5432 || echo "Not HTTP"

# Try direct connection
docker-compose exec api pg_isready -h postgres -U postgres
```

### Dashboard Build Fails

#### Check Node version
```bash
docker-compose exec dashboard node --version

# Should be 18+
```

#### Check dependencies
```bash
docker-compose exec dashboard npm ls

# Look for unmet dependencies
```

#### Rebuild without cache
```bash
docker-compose build --no-cache dashboard

# This forces fresh dependency install
```

---

## Performance Testing

### Memory Usage
```bash
docker stats

# Columns: CONTAINER, CPU %, MEM USAGE / LIMIT, MEM %
```

### CPU Usage
```bash
docker-compose stats

# Watch real-time resource usage
```

### Response Times
```bash
# API response time
time curl http://localhost:3000/health

# Dashboard response time
time curl http://localhost:3001/

# Look for "real" time
```

### Database Performance
```bash
# Query slow log
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Connection count
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Continuous Integration Testing

### CI Test Command
```bash
#!/bin/bash
set -e

# Build all services
docker-compose build

# Start infrastructure only
docker-compose up -d postgres redis

# Wait for services
sleep 10

# Run tests per service
echo "Testing API..."
docker-compose up -d api
sleep 5
curl -f http://localhost:3000/health || exit 1

echo "Testing Database..."
docker-compose exec postgres psql -U postgres -d wise2_core -c "SELECT 1;" || exit 1

echo "Testing Redis..."
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping | grep PONG || exit 1

echo "All tests passed!"
docker-compose down
```

---

## Monitoring Tests

### Prometheus Metrics
```bash
# Get available metrics
curl -s http://localhost:9090/api/v1/label/__name__/values | jq '.data[]' | head -20

# Query specific metric
curl -s 'http://localhost:9090/api/v1/query?query=up' | jq '.data.result'
```

### Grafana Dashboards
```bash
# Check Grafana is accessible
curl -s http://localhost:3001/api/health | jq .

# Get configured datasources
curl -s http://localhost:3001/api/datasources | jq '.[] | {name, type}'
```

---

## Success Criteria

All services tested successfully when:

- [x] All services build without errors
- [x] All services start without errors
- [x] All health checks respond
- [x] Database connectivity confirmed
- [x] Redis connectivity confirmed
- [x] Service-to-service communication works
- [x] No critical errors in logs
- [x] Monitoring is collecting metrics
- [x] Grafana dashboards load
- [x] All endpoints respond

---

## Testing Automation

### Test Script
```bash
#!/bin/bash
# test-all.sh - Comprehensive test suite

docker-compose build || exit 1
docker-compose up -d || exit 1

sleep 30

# Health checks
services=(
  "3000:api"
  "3001:dashboard"
  "9090:prometheus"
)

for service in "${services[@]}"; do
  port="${service%%:*}"
  name="${service##*:}"
  
  if curl -f http://localhost:$port/health 2>/dev/null; then
    echo "✅ $name is healthy"
  else
    echo "❌ $name failed health check"
    exit 1
  fi
done

docker-compose down
echo "✅ All tests passed"
```

### Run Tests
```bash
chmod +x test-all.sh
./test-all.sh
```

---

**Testing Guide Version**: 1.0
**Last Updated**: 2026-07-07
**Owner**: QA / Testing Team
