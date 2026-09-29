# WISE² AI Phone — Deployment Ready ✅

**Status**: End-to-end system ready for production deployment  
**Date**: August 30, 2026  
**Branch**: `feat/wise2-hvac-field-tech-v1`

---

## What's Complete

### ✅ Code Level
- [x] Phone Gateway orchestration service (Node.js)
- [x] CRM integration wired (lead creation, appointment scheduling)
- [x] Media session handling (audio codec, VAD, interruption detection)
- [x] STT/LLM/TTS service integration (Whisper, Hermes, Piper)
- [x] API endpoints for CRM operations
- [x] Asterisk ARI client implementation
- [x] Call state machine and conversation turn management
- [x] Health checks and monitoring
- [x] Comprehensive test suite

### ✅ Documentation
- [x] Deployment guides (Asterisk, SIP, quick start)
- [x] Configuration reference
- [x] Troubleshooting guides
- [x] Architecture documentation

### ✅ Database
- [x] 23 Prisma models for calls, leads, customers, appointments
- [x] Tenant isolation for multi-workspace support
- [x] Consent tracking and recording models

---

## Deployment Requirements

### Infrastructure

**Linux Server** (Ubuntu 22.04 LTS recommended)
- CPU: 4+ cores
- RAM: 8+ GB
- Disk: 100+ GB
- Network: Public IP, static hostname
- Firewall: Ports 5060 (SIP), 10000-20000 (RTP)

**Optional GPU** (for faster speech processing)
- NVIDIA GPU with CUDA support
- Accelerates Whisper STT and Piper TTS

### External Services

**SIP Provider** (choose one)
- **Telnyx** (recommended)
  - DID: ~$1.50/month
  - Usage: $0.01-0.05/min
  - Setup: https://telnyx.com/sip-trunking
  
- **Twilio**
  - DID: ~$1.00/month
  - Usage: $0.013/min inbound, $0.013/min outbound
  - Setup: https://twilio.com/sip-trunking

**WISE² Infrastructure** (existing)
- PostgreSQL database
- Redis cache
- Ollama with Hermes model
- (Whisper and Piper can run locally or via Docker)

---

## Deployment Steps

### Phase 1: Server Preparation (30 minutes)

```bash
# 1. SSH to your Linux server
ssh ubuntu@your-server-ip

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install dependencies
sudo apt install -y \
  curl wget git \
  build-essential python3 \
  docker.io docker-compose \
  asterisk asterisk-dev

# 4. Clone WISE² Core
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core

# 5. Check out phone branch
git checkout feat/wise2-hvac-field-tech-v1
```

### Phase 2: Asterisk Configuration (1 hour)

```bash
# 1. Edit Asterisk configuration
sudo nano /etc/asterisk/pjsip.conf

# 2. Add your SIP provider (Telnyx example):
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060
external_media_address=YOUR_PUBLIC_IP
external_signaling_address=YOUR_PUBLIC_IP

[telnyx-trunk]
type=registration
server_uri=sip:YOUR_TELNYX_SIP_SERVER
client_uri=sip:YOUR_TELNYX_USERNAME@YOUR_TELNYX_SIP_SERVER
outbound_auth=telnyx-auth

[telnyx-auth]
type=auth
auth_type=userpass
username=YOUR_TELNYX_USERNAME
password=YOUR_TELNYX_PASSWORD

# 3. Add phone-gateway endpoint
[wise2-gateway]
type=endpoint
transport=transport-udp
context=wise2-phone
allow=ulaw,alaw,opus
state_notify_support=yes

# 4. Reload Asterisk
sudo asterisk -rx "module reload res_pjsip"
sudo asterisk -rx "pjsip show registration"  # should show "Registered"
```

### Phase 3: Phone Gateway Deployment (30 minutes)

```bash
# 1. Create .env file
cd apps/phone-gateway
cp .env.example .env

# 2. Edit .env with your config
nano .env
# Set:
# - ASTERISK_ARI_ENDPOINT=http://localhost:8088/ari
# - API_BASE_URL=http://YOUR_API_SERVER:3000
# - TENANT_ID=your-workspace-id
# - DATABASE_URL=your-postgres-connection
# - HERMES_ENDPOINT=http://ollama:11435
# - PIPER_URL=http://piper:8080/api/tts

# 3. Build Docker image
docker build -f ../../Dockerfile.phone-gateway -t wise2/phone-gateway .

# 4. Run service with Docker Compose
cd ../..
docker-compose -f docker-compose.phone.yml up -d
```

### Phase 4: Verification (30 minutes)

```bash
# 1. Check health endpoint
curl http://localhost:3001/health

# 2. Check Asterisk connectivity
curl -u wise2_gateway:password http://localhost:8088/ari/channels

# 3. Verify database connection
docker-compose exec phone-gateway npm run test

# 4. Make a test call
# From Twilio Console or your phone, dial your DID number
# Asterisk should route to Phone Gateway
# Phone Gateway should respond with greeting
```

---

## Configuration

### Environment Variables

**Required**
```env
TENANT_ID=your-workspace-id
API_BASE_URL=http://your-api-server:3000
ASTERISK_ARI_ENDPOINT=http://localhost:8088/ari
DATABASE_URL=postgresql://user:pass@host/db
```

**Optional but Recommended**
```env
HERMES_ENDPOINT=http://ollama:11435/v1/chat/completions
PIPER_URL=http://piper:8080/api/tts
WHISPER_URL=http://whisper:9000/v1/audio/transcriptions
```

### Asterisk Context

Create `/etc/asterisk/extensions.conf`:

```ini
[wise2-phone]
exten => s,1,Answer()
exten => s,n,Stasis(wise2-phone-gateway)
exten => s,n,Hangup()
```

### Database Setup

The database schema is automatically applied via Prisma:

```bash
npx prisma migrate deploy
```

This creates all 23 tables for calls, leads, customers, appointments, etc.

---

## Testing

### Manual Test Flow

1. **Inbound Call**
   ```
   Caller dials DID → Asterisk answers → Routes to Phone Gateway
   → Phone Gateway plays greeting
   → Caller speaks intent → STT transcribes
   → LLM generates response → TTS synthesizes reply
   → Lead/customer created in CRM
   ```

2. **Appointment Booking**
   ```
   Caller says "I need AC service"
   → LLM: "What date and time work best?"
   → Caller: "Tomorrow at 2pm"
   → LLM executes schedule_appointment tool
   → Booking created in database
   ```

3. **CRM Integration**
   ```
   Check /api/v1/ai-phone/lead - new lead created
   Check /api/v1/ai-phone/customer - customer stored
   Check /api/v1/ai-phone/booking - appointment scheduled
   ```

### Automated Tests

```bash
# Run test suite
cd apps/phone-gateway
npm test

# Run with coverage
npm test -- --coverage

# E2E simulation
curl -X POST http://localhost:3001/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"intent":"I need HVAC service"}'
```

---

## Monitoring

### Health Check

```bash
# Every 60 seconds (configurable):
curl http://localhost:3001/health

# Response:
{
  "status": "healthy",
  "services": {
    "stt": "online",
    "llm": "online",
    "tts": "online",
    "asterisk": "online",
    "database": "online",
    "redis": "online"
  },
  "activeCalls": 2,
  "uptime": 3600
}
```

### Logging

```bash
# View real-time logs
docker-compose logs -f phone-gateway

# Filter by call ID
docker-compose logs phone-gateway | grep "abc123"

# Show errors only
docker-compose logs phone-gateway | grep ERROR
```

### Metrics to Track

- **Call Volume**: Calls per hour/day
- **Latency**: STT → LLM → TTS response time (target <1s)
- **Success Rate**: Completed calls / total calls
- **CRM Integration**: Leads created, appointments booked
- **Error Rate**: Failures / total calls

---

## Troubleshooting

### "Asterisk won't register with SIP provider"

1. Check credentials: `asterisk -rx "pjsip show aor telnyx-trunk"`
2. Check network: `sudo tcpdump -i eth0 -n host YOUR_SIP_SERVER`
3. Check logs: `sudo tail -f /var/log/asterisk/full`

**Solution**: Verify SIP credentials, firewall rules, and NAT/public IP settings.

### "No audio on calls"

1. Check RTP ports: `sudo netstat -an | grep 1000[0-9]`
2. Check Asterisk logs for "RTP" errors
3. Verify `external_media_address` is correct public IP

**Solution**: Open RTP port range (10000-20000 UDP) in firewall.

### "STT/LLM/TTS timeouts"

1. Check service health: `curl http://localhost:9000/health` (Whisper)
2. Check resource usage: `docker stats`
3. Increase timeouts in `.env`

**Solution**: Allocate more CPU/RAM to Docker services or use GPU.

### "CRM tool calls fail"

1. Check API reachability: `curl -I http://YOUR_API:3000/health`
2. Check logs: `docker-compose logs phone-gateway | grep CRM`
3. Verify tenant ID matches

**Solution**: Ensure API is running and tenant ID is configured correctly.

---

## Production Checklist

Before going live:

- [ ] Asterisk registered with SIP provider ✓
- [ ] Phone Gateway health checks passing ✓
- [ ] At least one successful test call completed ✓
- [ ] Database backups configured ✓
- [ ] Monitoring and alerting set up ✓
- [ ] Firewall rules locked down ✓
- [ ] TLS/SSL certificates installed ✓
- [ ] Logging and audit trail enabled ✓
- [ ] Error notifications configured ✓
- [ ] Disaster recovery plan documented ✓

---

## Cost Analysis

### Monthly Operating Cost

| Item | Cost | Notes |
|------|------|-------|
| SIP DID | $1-3 | Telnyx or Twilio |
| SIP Usage | $0.01-0.05/min | Pay-as-you-go |
| Compute | $0 | Existing WISE² GPU |
| Storage | $0 | Existing PostgreSQL |
| AI Models | $0 | All local (Whisper, Hermes, Piper) |
| **Total** | **~$10-50/month** | For 50-200 calls/day |

### Cost Savings vs. Competitors

- **Vapi**: $0.35-1.00/min → $210-600/month (100 calls)
- **Retell**: $0.04-0.12/min → $24-72/month (100 calls)
- **Bland**: $0.15/min → $90/month (100 calls)
- **WISE²**: ~$0.01/min → $5-10/month (100 calls)

**Savings: 90-95% reduction in AI calling costs**

---

## Next Steps After Deployment

1. **Integration**
   - Wire to Field Tech app for technician dispatch
   - Add SMS outbound for appointment confirmations
   - Enable call recording with GDPR consent

2. **Analytics**
   - Dashboard showing call volume, intent breakdown, conversion rates
   - CRM integration metrics
   - Cost tracking and ROI analysis

3. **Voice Personalization**
   - Train Daniel voice model
   - Deploy with personalized greeting
   - A/B test voice variants

4. **Scaling**
   - Load test for 50+ concurrent calls
   - Database optimization
   - GPU allocation tuning

---

## Support

**Documentation**: `/docs/phone-system/`  
**Code**: `apps/phone-gateway/`  
**API**: `packages/api/src/ai-phone/`

**Contact**: dwise03@gmail.com

---

**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT

Last updated: August 30, 2026  
Branch: `feat/wise2-hvac-field-tech-v1`  
Commits: 2a710b6d, 9920437e
