# WISE² AI Phone + Twilio — Complete Setup

**Status**: Twilio plugin ready for production  
**Time**: 15 minutes to first working call  
**Cost**: $1-2/month

---

## 5-Step Setup

### Step 1: Create Twilio Account (3 minutes)

1. Go to **twilio.com**
2. Click **Sign up**
3. Verify email + phone
4. Get $15 free trial credit
5. Copy these values:
   - **Account SID**: ACxxxxxxxxxxxxxxxxxxxxxxxxxx
   - **Auth Token**: your_auth_token_here
   - **Phone Number**: +15551234567 (your Twilio number)

### Step 2: Configure Environment (2 minutes)

Create `.env` in project root:

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567

# API Configuration
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace

# AI Services (local)
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions

# Database
DATABASE_URL=postgresql://wise2:password@localhost:5432/wise2_prod
REDIS_URL=redis://:password@localhost:6379/1

# Logging
LOG_LEVEL=info
```

### Step 3: Start Services (3 minutes)

```bash
# 1. Start phone gateway + AI services
docker-compose -f docker-compose.phone.yml up -d

# 2. Verify all services are running
docker-compose ps

# 3. Check health
curl http://localhost:3001/health | jq .
```

Expected output:
```json
{
  "status": "healthy",
  "services": {
    "stt": "online",
    "llm": "online",
    "tts": "online"
  }
}
```

### Step 4: Set Twilio Webhook (3 minutes)

**For Local Testing (with ngrok):**

```bash
# 1. Install ngrok (if needed)
brew install ngrok  # macOS
# or download from ngrok.com

# 2. Start ngrok tunnel
ngrok http 3000
# Copy the HTTPS URL: https://xxxx-xx-xxx-xxx-xx.ngrok.io

# 3. In Twilio Console:
# Go to Phone Numbers → Your Number → Voice
# Incoming Calls → Webhook URL:
# https://xxxx-xx-xxx-xxx-xx.ngrok.io/v1/ai-phone/webhooks/twilio/voice
```

**For Production:**

```
Webhook URL: https://your-domain.com/v1/ai-phone/webhooks/twilio/voice
```

### Step 5: Test (4 minutes)

```bash
# 1. Make a test call from any phone
Call your Twilio number (+15551234567)

# 2. System should:
# - Answer with AI greeting
# - Listen to your request
# - Process and respond
# - Create lead in CRM

# 3. Check logs
docker-compose logs -f phone-gateway

# 4. Verify lead was created
curl http://localhost:3000/v1/ai-phone/leads \
  -H "X-Tenant-ID: default-workspace"
```

---

## What Happens on Incoming Call

```
Caller dials: +1-555-123-4567
    ↓ (Twilio receives)
POST /v1/ai-phone/webhooks/twilio/voice
    ↓ (Phone Gateway)
1. Initialize call session
2. Lookup customer by phone
3. Play greeting (TTS)
    ↓ (Caller speaks)
4. Transcribe (Whisper STT)
5. Process with AI (Hermes LLM)
6. Generate response (TTS)
7. Play to caller
8. Execute tool calls (create lead, schedule appointment)
9. Create call record in CRM
    ↓ (Loop continues until hangup)
10. Generate summary
11. Store transcript
```

---

## Verification Checklist

- [ ] Twilio account created
- [ ] Account SID + Auth Token copied
- [ ] `.env` file configured
- [ ] Docker services running
- [ ] Health check passes
- [ ] Twilio webhook set
- [ ] Test call made
- [ ] Greeting heard
- [ ] Lead created in CRM

---

## Configuration Reference

### Twilio Environment Variables

```bash
# Required
TWILIO_ACCOUNT_SID          # From Twilio Console
TWILIO_AUTH_TOKEN           # From Twilio Console
TWILIO_PHONE_NUMBER         # Your Twilio DID (+1...)

# Optional
TWILIO_WEBHOOK_BASE_URL     # For production domain
TWILIO_WEBHOOK_PATH         # Default: /v1/ai-phone/webhooks/twilio
```

### Phone Gateway Configuration

```bash
# API
API_BASE_URL                # Backend API endpoint
TENANT_ID                   # Workspace ID

# Services
HERMES_ENDPOINT             # LLM endpoint
PIPER_URL                   # TTS endpoint
WHISPER_URL                 # STT endpoint

# Behavior
MAX_CONCURRENT_CALLS        # Default: 10
CALL_TIMEOUT_SECONDS        # Default: 3600
TURN_TIMEOUT_SECONDS        # Default: 30
```

---

## Troubleshooting

### "Twilio webhook not being called"

1. **Check webhook URL is correct**
   ```bash
   # Twilio Console → Phone Numbers → Your Number → Voice
   # Verify URL matches exactly
   ```

2. **Test webhook manually**
   ```bash
   curl -X POST http://localhost:3000/v1/ai-phone/webhooks/twilio/voice \
     -d "From=+15551234567&To=+15552345678&CallSid=CA123"
   ```

3. **Check firewall/CORS**
   - Local testing: use ngrok
   - Production: ensure port 443 (HTTPS) is open

### "Greeting doesn't play"

1. Check TTS service is running
   ```bash
   docker-compose logs piper
   ```

2. Check for timeouts in logs
   ```bash
   docker-compose logs phone-gateway | grep -i timeout
   ```

3. Increase timeout if needed
   ```bash
   export TTS_TIMEOUT_MS=10000
   ```

### "Call drops or audio cuts out"

1. Check Twilio media stream connection
   ```bash
   docker-compose logs phone-gateway | grep -i media
   ```

2. Verify network connectivity to Twilio
   ```bash
   curl -I https://api.twilio.com
   ```

3. Check CPU/memory usage
   ```bash
   docker stats
   ```

### "Lead not created in CRM"

1. Verify API is running
   ```bash
   curl http://localhost:3000/health
   ```

2. Check CRM endpoint
   ```bash
   curl -X POST http://localhost:3000/v1/ai-phone/lead \
     -H "X-Tenant-ID: default-workspace" \
     -H "Content-Type: application/json" \
     -d '{"customerId":"test","intent":"test"}'
   ```

3. Check phone gateway logs for CRM errors
   ```bash
   docker-compose logs phone-gateway | grep CRM
   ```

---

## E2E Testing

Run the complete test suite:

```bash
bash scripts/test-phone-e2e.sh
```

This verifies:
- ✓ API health
- ✓ Phone Gateway connectivity
- ✓ Customer operations
- ✓ Lead creation
- ✓ Appointment booking
- ✓ Call recording

---

## Production Deployment

**Option A: Keep Local (Testing)**
- Phone Gateway on laptop/Mac
- Twilio webhook → ngrok → localhost
- Cost: ~$2/month (Twilio only)
- Limitation: must keep terminal open

**Option B: Deploy to VPS**
- Rent Linux VPS ($10-20/month)
- Deploy Docker containers
- Twilio webhook → VPS public IP
- Cost: ~$15-30/month
- Benefit: Always on, 99.9% uptime

**Option C: Use Existing Server**
- Deploy to WISE² GPU server
- Same Docker setup
- Cost: No additional cost (uses existing infra)

---

## Cost Breakdown

```
Twilio DID (phone number):      $1.00-2.00/month
Twilio inbound minutes:          $0.013/min
Twilio outbound minutes:         $0.013/min
────────────────────────────────────────
Example (100 calls, 50 min/mo):
  $1.50 (DID) + $0.65 (usage) = ~$2.15/month

AI Models (Whisper, Hermes, Piper): FREE (all local)
Compute:                         FREE (existing GPU)
Database:                        FREE (existing)
```

---

## Next Steps

1. **Immediate** (today)
   - [ ] Create Twilio account
   - [ ] Configure `.env`
   - [ ] Start services
   - [ ] Set webhook
   - [ ] Make test call

2. **Short-term** (this week)
   - [ ] Deploy to VPS if needed
   - [ ] Train Daniel voice
   - [ ] Build call dashboard
   - [ ] Integrate Field Tech notifications

3. **Medium-term** (this month)
   - [ ] Outbound calling
   - [ ] SMS integration
   - [ ] Advanced analytics
   - [ ] Load testing

---

## Support

**Can't get it working?**

1. Check Twilio dashboard for incoming calls
2. Check phone gateway logs: `docker-compose logs -f phone-gateway`
3. Verify webhook URL in Twilio console
4. Run E2E test: `bash scripts/test-phone-e2e.sh`

**Documentation:**
- Full deployment: `DEPLOYMENT_READY.md`
- Google Voice alternative: `GOOGLE_VOICE_QUICK_START.md`
- System status: `WISE2_PHONE_SYSTEM_STATUS.md`

---

## Quick Command Reference

```bash
# Start everything
docker-compose -f docker-compose.phone.yml up -d

# View logs
docker-compose logs -f phone-gateway

# Check health
curl http://localhost:3001/health | jq .

# Test CRM integration
bash scripts/test-phone-e2e.sh

# Stop services
docker-compose down

# View active calls
curl http://localhost:3001/calls

# Restart specific service
docker-compose restart phone-gateway
```

---

**Ready?** 

Follow the 5 steps above. First call in 15 minutes. 🚀
