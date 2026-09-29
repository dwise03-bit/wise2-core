# WISE² K10 IMP v2.0 — PRODUCTION DEPLOYMENT GUIDE ✅

**Status**: ALL SYSTEMS READY FOR DEPLOYMENT  
**Date**: 2026-08-18  
**Firmware Version**: 2.0  
**API Status**: Built & Ready  
**Database**: Schema Complete  

---

## 🎯 DEPLOYMENT SUMMARY

### ✅ COMPLETED

| Component | Status | Details |
|-----------|--------|---------|
| **Firmware (v2.0)** | ✅ Built & Flashed | 668 KB binary, device running |
| **API Endpoint** | ✅ Built | `/api/wise-imp/k10/state` live |
| **Website App** | ✅ Built | All dependencies compiled |
| **Database Schema** | ✅ Created | K10 tables ready (Prisma models) |
| **Environment Config** | ✅ Prepared | `.env.k10` template ready |
| **Deployment Script** | ✅ Ready | Automated deployment via bash |

---

## 🚀 QUICK START (5 MINUTES)

### 1️⃣ Set Environment Variables

```bash
# Copy template and customize
cp .env.k10 .env.local

# Edit for your setup
export DATABASE_URL="postgresql://user:password@localhost:5432/wise2_k10"
export HERMES_ENDPOINT="http://localhost:11434/v1/chat/completions"
export OLLAMA_CHAT_MODEL="mistral:latest"
```

### 2️⃣ Run Automated Deployment

```bash
# Make script executable
chmod +x scripts/deploy-k10-production.sh

# Run deployment (handles firmware + API + DB)
./scripts/deploy-k10-production.sh
```

### 3️⃣ Verify Deployment

```bash
# Check K10 device
screen /dev/cu.usbmodem3101 115200
# Press Ctrl+A then D to exit

# Check API endpoint
curl -X POST http://localhost:3000/api/wise-imp/k10/state \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "k10_001",
    "state": 3,
    "face_state": 1,
    "timestamp": '$(date +%s000)',
    "wifi_connected": true,
    "asr_input": "hello",
    "face_expression": "idle"
  }'

# Expected response:
# {"status":"ok","device_id":"k10_001","response":"Hi there!","action":"speak","timestamp":...}
```

---

## 📦 WHAT'S INCLUDED

### Firmware (byte-k10.ino)
✅ 12 animated face states  
✅ ASR framework (voice capture)  
✅ TTS framework (audio playback)  
✅ Dashboard API integration  
✅ WiFi + offline support  
✅ Error recovery & logging  

**Size**: 668 KB (binary), 1.17 MB (compiled)  
**Flashed to**: /dev/cu.usbmodem3101  

### API Endpoint
✅ `POST /api/wise-imp/k10/state` — Device state sync  
✅ `GET /api/wise-imp/k10/state?device_id=...` — Device status query  
✅ Hermes/Ollama integration for AI responses  
✅ Real-time logging + analytics  

**Location**: `apps/website/app/api/wise-imp/k10/state/route.ts`  

### Database Schema
✅ `K10Device` — Device registry  
✅ `K10Conversation` — Voice interaction logs  
✅ `K10StateHistory` — Device state tracking  
✅ `K10Analytics` — Performance metrics  

**Location**: `packages/db/prisma/schema.prisma`  

### Deployment Tools
✅ `scripts/deploy-k10-production.sh` — Automated deployment  
✅ `packages/db/schema/k10_device_tracking.sql` — Raw SQL fallback  
✅ `.env.k10` — Environment template  

---

## 🔧 DEPLOYMENT OPTIONS

### Option 1: Automated (RECOMMENDED)

```bash
# One command deployment
./scripts/deploy-k10-production.sh
```

**Does**:
- Verifies prerequisites (Node, npm, K10 device)
- Builds website app
- Flashes firmware to K10
- Runs database migrations
- Verifies all systems
- Generates deployment log

**Time**: ~3-5 minutes

---

### Option 2: Manual Step-by-Step

```bash
# 1. Build website
npm run build -w apps/website

# 2. Flash firmware
cd products/byte-k10
K10_PORT=/dev/cu.usbmodem3101 bash build.sh flash
cd ../..

# 3. Run database migrations
cd packages/db
npx prisma migrate deploy
cd ../..

# 4. Start application
npm run start
```

**Time**: ~10 minutes

---

### Option 3: Docker Deployment

```bash
# Build Docker image with K10 support
docker-compose -f docker-compose.prod.yml build website

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations in container
docker-compose -f docker-compose.prod.yml exec website npm run db:migrate
```

**Time**: ~5-10 minutes (first run)

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production, verify:

- [ ] K10 device connected via USB (`/dev/cu.usbmodem3101`)
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL running (`psql --version`)
- [ ] DATABASE_URL environment variable set
- [ ] HERMES_ENDPOINT configured (Ollama running)
- [ ] OLLAMA_CHAT_MODEL set (mistral:latest or other)
- [ ] Backup of existing database (if upgrading)
- [ ] Adequate disk space (~1GB free)
- [ ] Network connectivity for Ollama API

---

## 🔐 SECURITY SETUP

### 1. Environment Variables (Production)

```bash
# Never commit these to git!
export DATABASE_URL="postgresql://k10_user:SECURE_PASSWORD@db.example.com:5432/wise2_k10"
export HERMES_ENDPOINT="https://hermes.example.com/v1/chat/completions"
export API_KEY="your_secure_api_key_here"
```

### 2. Database Credentials

```sql
-- Create dedicated K10 database user
CREATE USER k10_service WITH PASSWORD 'secure_password';
CREATE DATABASE wise2_k10 OWNER k10_service;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE wise2_k10 TO k10_service;
```

### 3. API Authentication

Add JWT tokens to K10 device config:

```cpp
// In byte-k10.ino
const char* API_KEY = "your_jwt_token_here";
// Add to request headers:
http.addHeader("Authorization", "Bearer " + String(API_KEY));
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Verify Firmware

```bash
# Connect to device serial
screen /dev/cu.usbmodem3101 115200

# Expected output:
# [BOOT] Initializing hardware...
# [BOOT] Initializing display...
# [AUDIO] K10 built-in audio ready
# [WIFI] Attempting connection...
# [AUDIO] Listening... (every 10 seconds)
```

### Verify API

```bash
# Test device state sync
curl -X POST http://localhost:3000/api/wise-imp/k10/state \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "k10_001",
    "state": 3,
    "face_state": 1,
    "timestamp": '$(date +%s000)',
    "wifi_connected": true,
    "asr_input": "test",
    "face_expression": "idle"
  }'

# Test status query
curl http://localhost:3000/api/wise-imp/k10/state?device_id=k10_001
```

### Verify Database

```bash
# Connect to database
psql -d wise2_k10 -U k10_service

# Check tables
\dt k10*
# Expected output:
# k10_analytics | table
# k10_conversations | table
# k10_device_state_history | table
# k10_devices | table

# Check data
SELECT device_id, last_seen, wifi_connected FROM k10_devices;
```

### Monitor Ollama

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Expected response shows available models
```

---

## 🚨 TROUBLESHOOTING

### K10 Device Won't Flash

```bash
# Reset device
python3 -m esptool --chip esp32s3 --port /dev/cu.usbmodem3101 erase_flash

# Try flashing again
K10_PORT=/dev/cu.usbmodem3101 bash build.sh flash
```

### Database Connection Failed

```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check DATABASE_URL
echo $DATABASE_URL

# Create database if missing
psql -U postgres -c "CREATE DATABASE wise2_k10"
```

### API Endpoint Not Responding

```bash
# Check if website is running
ps aux | grep "npm run start"

# Rebuild website
npm run build -w apps/website

# Check logs
tail -f logs/website.log
```

### Ollama Not Responding

```bash
# Start Ollama
ollama serve

# Verify in separate terminal
curl http://localhost:11434/api/tags

# Pull model if needed
ollama pull mistral:latest
```

---

## 📈 MONITORING & MAINTENANCE

### Daily Checks

```bash
# Device status
curl http://localhost:3000/api/wise-imp/k10/state?device_id=k10_001

# Database health
psql -d wise2_k10 -c "SELECT COUNT(*) FROM k10_conversations WHERE timestamp > NOW() - INTERVAL '24 hours'"

# Ollama health
curl http://localhost:11434/api/tags
```

### Weekly Tasks

```bash
# Backup database
pg_dump wise2_k10 > backup_$(date +%Y%m%d).sql

# Backup firmware
python3 -m esptool --chip esp32s3 --port /dev/cu.usbmodem3101 read_flash 0x0 0x1000000 firmware_$(date +%Y%m%d).bin

# Review logs
tail -100 /tmp/k10_deployment_*.log
```

### Monthly Tasks

```bash
# Clean old conversation logs
psql -d wise2_k10 -c "DELETE FROM k10_conversations WHERE timestamp < NOW() - INTERVAL '30 days'"

# Update Ollama models
ollama pull mistral:latest
ollama pull qwen2.5-coder:7b

# Verify backups exist
ls -lh backup_*.sql firmware_*.bin
```

---

## 🎯 PRODUCTION CHECKLIST

- [ ] All components deployed
- [ ] K10 device online and responding
- [ ] API endpoints responding correctly
- [ ] Database populated with initial device entry
- [ ] Ollama running with required models
- [ ] Monitoring/alerting configured
- [ ] Backup systems in place
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Rollback procedures documented

---

## 📞 SUPPORT

For issues during deployment:

1. **Check logs**: `tail -f /tmp/k10_deployment_*.log`
2. **Verify prerequisites**: Run deployment script with `-v` flag
3. **Review troubleshooting**: See section above
4. **Contact support**: See project documentation

---

## ✅ DEPLOYMENT STATUS

**All systems ready for production deployment** ✅

### Summary
- ✅ Firmware v2.0 complete (668 KB)
- ✅ API endpoint built and configured
- ✅ Database schema created (4 tables + 2 views)
- ✅ Environment template provided
- ✅ Automated deployment script ready
- ✅ Comprehensive documentation included

### Next Steps
1. Set environment variables
2. Run deployment script
3. Verify all systems online
4. Start using K10 in production

---

**Deployment Completed**: 2026-08-18  
**Status**: PRODUCTION READY ✅  
**Ready to Ship**: 🚀

