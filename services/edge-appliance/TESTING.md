# WISE² Edge Appliance Testing Guide

Comprehensive testing strategies for WISE² Edge Appliance.

## Unit Testing

Run unit tests:

```bash
npm run test              # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run with coverage report
```

### Writing Tests

Example test structure:

```typescript
describe('OfflineDB', () => {
  let db: OfflineDB;

  beforeEach(async () => {
    db = new OfflineDB(':memory:', logger);
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
  });

  it('should record commands', () => {
    db.recordCommand({
      id: 'test-1',
      timestamp: Date.now(),
      source: 'test',
      command: 'test command',
      result: { success: true },
    });

    const result = db.getState('test-1');
    expect(result).toBeDefined();
  });
});
```

## Integration Testing

Test component interactions:

```bash
# Test database + sync
npm run test -- OfflineDB SyncManager

# Test automation engine
npm run test -- AutomationEngine

# Test with Docker services
docker-compose up -d
npm run test:integration
docker-compose down
```

## Manual Testing

### 1. Local Development Setup

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### 2. API Testing

#### Health Check
```bash
curl http://localhost:3000/health | jq
```

Expected response:
```json
{
  "nodeId": "edge-node-1",
  "status": "ready",
  "uptime": 12345,
  "components": {
    "database": "ready",
    "agent": "ready",
    "hardware": "ready",
    "voice": "ready",
    "automation": "ready",
    "sync": "ready",
    "health": "ready"
  }
}
```

#### Execute Command
```bash
curl -X POST http://localhost:3000/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "what is the weather?"}'
```

#### Voice Control
```bash
curl -X POST http://localhost:3000/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from WISE²"}'
```

#### GPIO Control
```bash
# Set GPIO pin 17 as output, value high
curl -X POST http://localhost:3000/gpio/17 \
  -H "Content-Type: application/json" \
  -d '{"mode": "out", "value": true}'

# Read GPIO pin 27
curl -X POST http://localhost:3000/gpio/27 \
  -H "Content-Type: application/json" \
  -d '{"mode": "in"}'
```

### 3. Automation Testing

#### Create Cron Trigger
```bash
curl -X POST http://localhost:3000/automations/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test cron",
    "type": "cron",
    "config": {"expression": "*/5 * * * *"},
    "actions": [
      {"type": "voice", "config": {"text": "Cron trigger fired"}}
    ]
  }'
```

#### Test Webhook Trigger
```bash
# Get trigger ID from previous response
TRIGGER_ID="..."

# Fire webhook
curl -X POST http://localhost:3002/webhook/$TRIGGER_ID \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

### 4. Database Testing

```bash
# Connect to SQLite database
sqlite3 /data/wise2-edge.db

# View tables
.tables

# Check commands
SELECT * FROM commands;

# Check triggers
SELECT * FROM triggers;

# Check sync queue
SELECT * FROM sync_queue;

# Integrity check
PRAGMA integrity_check;
```

## Performance Testing

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:3000/health

# Run with POST requests
ab -n 1000 -c 10 -p data.json -T application/json \
  http://localhost:3000/commands
```

### Memory & CPU Profiling

```bash
# Profile with Node built-in tools
node --inspect dist/index.js

# Open DevTools
open chrome://inspect

# Capture heap snapshot
```

### Database Performance

```bash
# Test with many records
sqlite3 /data/wise2-edge.db << 'EOF'
.timer on

-- Test write performance
WITH RECURSIVE cnt(x) AS (
  SELECT 1
  UNION ALL
  SELECT x+1 FROM cnt WHERE x < 10000
)
INSERT INTO commands (id, timestamp, source, command, result)
SELECT 'cmd_' || x, datetime('now'), 'test', 'test command', '{}' FROM cnt;

-- Test query performance
SELECT COUNT(*) FROM commands;
SELECT * FROM commands LIMIT 100;

-- Test with index
CREATE INDEX idx_test ON commands(timestamp);
SELECT * FROM commands WHERE timestamp > datetime('now', '-1 day');
EOF
```

## Hardware Testing

### GPIO Testing

```bash
# List GPIO devices
ls -la /dev/gpio*
gpio readall

# Test write
gpio mode 17 out
gpio write 17 1
gpio write 17 0

# Test read
gpio mode 27 in
gpio read 27
```

### Camera Testing

```bash
# List camera devices
ls /dev/video*

# Capture test image
curl -X POST http://localhost:3000/camera/capture \
  -o test_image.jpg

# Check image
file test_image.jpg
identify test_image.jpg
```

### Microphone Testing

```bash
# List audio devices
arecord -l
aplay -l

# Test recording
arecord -D hw:0,0 -f cd -t wav -d 5 test_audio.wav

# Test playback
aplay test_audio.wav

# Test via API (10 second recording)
# Voice assistant will record automatically on wake word
```

## Network Testing

### Cloud Connectivity

```bash
# Test DNS
nslookup api.wise2.cloud

# Test HTTP connectivity
curl -v https://api.wise2.cloud/health

# Test with authorization
curl -H "Authorization: Bearer $API_KEY" \
  https://api.wise2.cloud/health

# Test sync
curl -X POST http://localhost:3000/sync
```

### WireGuard VPN

```bash
# Check WireGuard interface
sudo wg show

# Test VPN connectivity
ping 10.0.0.1  # VPN server

# Check routing
ip route show

# Monitor traffic
iftop -i wg0  # if iftop installed
```

### Offline Testing

```bash
# Disable network interface
sudo ifdown eth0

# API should still respond (offline mode)
curl http://localhost:3000/health

# Cloud sync should fail gracefully
curl -X POST http://localhost:3000/sync

# Re-enable
sudo ifup eth0

# Sync should resume
curl -X POST http://localhost:3000/sync
```

## Security Testing

### Input Validation

```bash
# Test command injection
curl -X POST http://localhost:3000/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "$(rm -rf /)"; echo "test"}'

# Should execute safely, not actually run rm

# Test large payload
curl -X POST http://localhost:3000/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "'$(python3 -c 'print("x"*1000000)')'"}' 
```

### Authentication

```bash
# Test missing API key
curl -H "Authorization: Bearer invalid" \
  http://localhost:3000/status

# Should return 401 Unauthorized
```

### Rate Limiting

```bash
# Test rapid requests
for i in {1..100}; do
  curl -s http://localhost:3000/health > /dev/null &
done
wait

# Should implement rate limiting
```

## Regression Testing

### Baseline Metrics

Establish baseline performance:

```bash
# Record baseline
curl http://localhost:3000/health/metrics > baseline.json

# Compare on updates
curl http://localhost:3000/health/metrics > current.json
diff baseline.json current.json
```

### Smoke Tests

```bash
# Quick sanity check
#!/bin/bash
set -e

echo "Running smoke tests..."

# Health check
curl -f http://localhost:3000/health > /dev/null
echo "✓ Health check"

# API test
curl -f -X POST http://localhost:3000/commands \
  -H "Content-Type: application/json" \
  -d '{"command": "test"}' > /dev/null
echo "✓ API command"

# Database test
curl -f http://localhost:3000/status | jq '.components.database' | grep ready
echo "✓ Database"

# Voice test
curl -f -X POST http://localhost:3000/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}' > /dev/null
echo "✓ Voice"

echo "All smoke tests passed!"
```

## Continuous Integration Testing

### GitHub Actions Configuration

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      docker:
        image: docker:latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install
        run: npm install
      - name: Lint
        run: npm run lint
      - name: Type Check
        run: npm run type-check
      - name: Test
        run: npm run test
      - name: Build
        run: npm run build
```

## Testing Checklist

Before production deployment:

- [ ] Unit tests pass (100% critical paths)
- [ ] Integration tests pass
- [ ] API endpoints respond correctly
- [ ] Database operations work correctly
- [ ] Sync queue operations work
- [ ] Automation triggers fire correctly
- [ ] Voice control works (if available)
- [ ] GPIO operations work (if available)
- [ ] Health monitoring operational
- [ ] Offline mode works without cloud
- [ ] Memory usage stable
- [ ] CPU usage reasonable
- [ ] No resource leaks
- [ ] Logs are clean (no errors)
- [ ] Security tests pass
- [ ] Performance meets baseline

## Troubleshooting Test Failures

### Test Timeouts

```bash
# Increase timeout
npm run test -- --testTimeout=30000

# Check for hanging promises
npm run test -- --detectOpenHandles
```

### Database Locked

```bash
# Kill hanging processes
pkill -f sqlite3

# Clear lock files
rm /data/wise2-edge.db-*

# Retry tests
npm run test
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

## Reporting Test Results

Generate test report:

```bash
npm run test -- --coverage --coverageReporters=html

# View report
open coverage/index.html

# Export to JSON
npm run test -- --json --outputFile=test-results.json
```

---

**Last Updated**: 2026-07-21
