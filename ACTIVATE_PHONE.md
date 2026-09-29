# WISE² AI Phone Activation — Your Number: (336) 485-8421

**Status:** Ready to activate  
**Your GV Number:** +1-336-485-8421  
**Timeline:** 15 minutes

---

## Quick Setup (Do This Now)

### Step 1: Get Twilio (5 minutes)

1. Go to **twilio.com**
2. Sign up (free $15 credit)
3. Phone Numbers → Get a Number
4. Copy these:
   ```
   Account SID:    ACxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token:     xxxxxxxxxxxxxxxxxxxxxxxx
   Twilio Number:  +1XXXXXXXXXX
   ```

### Step 2: Configure Environment (2 minutes)

Create `.env` file in project root with your values:

```bash
# Your Google Voice Number
GV_NUMBER=+13364858421

# Twilio (from step 1)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# API (local)
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace

# AI Services (local)
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
WHISPER_URL=http://localhost:9000/v1/audio/transcriptions

# Database
DATABASE_URL=postgresql://wise2:password@localhost:5432/wise2_prod
REDIS_URL=redis://:password@localhost:6379/1
```

### Step 3: Start Services (2 minutes)

```bash
# Start phone gateway + AI services
docker-compose -f docker-compose.phone.yml up -d

# Verify services
docker-compose ps

# Check health
curl http://localhost:3001/health | jq .
```

### Step 4: Forward Google Voice → Twilio (3 minutes)

1. Go to **google.com/voice**
2. Settings → Forwarding phones
3. Add phone: Enter your **Twilio number** from step 1
4. Confirm the verification
5. Done! All calls to your GV number now route to Twilio

### Step 5: Set Twilio Webhook (2 minutes)

**For Local Testing (with ngrok):**

```bash
# 1. Install ngrok
brew install ngrok

# 2. Start ngrok
ngrok http 3000
# Copy the HTTPS URL

# 3. In Twilio Console:
# Go to Phone Numbers → Your Twilio Number → Voice
# Set Webhook URL to:
# https://[ngrok-url]/v1/ai-phone/webhooks/twilio/voice
```

**For Production:**
- Set webhook to: `https://your-domain.com/v1/ai-phone/webhooks/twilio/voice`

### Step 6: Test (1 minute)

```bash
# Call your Google Voice number from any phone
Call: (336) 485-8421

# System should:
# ✓ Answer immediately
# ✓ Play greeting: "Hello! Welcome to WISE²..."
# ✓ Listen to your request
# ✓ Respond intelligently
# ✓ Create lead in CRM

# Check logs
docker-compose logs -f phone-gateway
```

---

## Activation Checklist

- [ ] Twilio account created
- [ ] Account SID copied
- [ ] Auth Token copied
- [ ] Twilio number obtained
- [ ] `.env` file created with credentials
- [ ] Docker services running
- [ ] Health check passes (`curl http://localhost:3001/health`)
- [ ] ngrok tunnel started (if local testing)
- [ ] Twilio webhook configured
- [ ] Google Voice forwarding enabled to Twilio number
- [ ] Test call made
- [ ] Greeting heard
- [ ] Lead created in CRM

---

## What Happens When You Call (336) 485-8421

```
You dial: (336) 485-8421
    ↓
Google Voice receives call
    ↓
GV forwards to your Twilio number
    ↓
Twilio receives and POSTs webhook
    ↓
WISE² Phone Gateway answers
    ↓
TTS: "Hello! Welcome to WISE². How can I help you today?"
    ↓
Caller speaks (e.g., "I need HVAC service")
    ↓
STT: Transcribes audio → "I need HVAC service"
    ↓
LLM: Generates response + tool calls
    ↓
Tool execution:
  - Create lead in CRM ✓
  - Schedule appointment (if requested)
  - Create work order (if needed)
    ↓
TTS: "I've created a new service request. A technician will contact you shortly."
    ↓
Call ends, transcript stored
```

---

## Verification

### Check All Services Running

```bash
docker-compose ps
```

Should show:
```
phone-gateway     up
ollama            up (or your LLM)
whisper           up (or your STT)
piper             up (or your TTS)
```

### Test Webhook Manually

```bash
curl -X POST http://localhost:3000/v1/ai-phone/webhooks/twilio/voice \
  -d "From=+13364858421&To=+1XXXXXXXXXX&CallSid=CA123"
```

### Check CRM Integration

```bash
# After making a test call, verify lead was created:
curl http://localhost:3000/v1/ai-phone/leads \
  -H "X-Tenant-ID: default-workspace" | jq .
```

---

## Troubleshooting

### Call goes to voicemail

**Check:**
1. Is GV forwarding enabled? (Settings → Forwarding phones)
2. Is Twilio webhook URL correct? (Twilio Console → Phone Numbers)
3. Is phone gateway running? (`docker ps`)

**Fix:**
```bash
# Restart phone gateway
docker-compose restart phone-gateway

# Check logs
docker-compose logs phone-gateway | tail -50
```

### No audio/poor quality

**Check:**
1. Is ngrok tunnel still running? (should show "Tunnel established")
2. Is Twilio webhook URL correct in ngrok output?
3. Are AI services running? (`docker-compose ps`)

**Fix:**
```bash
# Restart ngrok with correct port
ngrok http 3000

# Update Twilio webhook with new URL
```

### Greeting doesn't play

**Check:**
1. Is Piper TTS running? (`docker logs piper`)
2. Any errors in phone gateway logs? (`docker logs phone-gateway`)

**Fix:**
```bash
# Restart TTS service
docker-compose restart piper

# Check for timeouts
docker-compose logs phone-gateway | grep -i timeout
```

---

## Next Steps

### Today
- [ ] Complete 15-minute setup above
- [ ] Make test call to (336) 485-8421
- [ ] Verify greeting and CRM integration
- [ ] Run E2E test: `bash scripts/test-phone-e2e.sh`

### This Week
- [ ] Deploy to production VPS (if scaling)
- [ ] Train Daniel voice model
- [ ] Build call dashboard
- [ ] Integrate Field Tech notifications

### This Month
- [ ] Outbound calling
- [ ] SMS integration
- [ ] Advanced analytics
- [ ] Load testing

---

## Cost Summary

```
Google Voice:       FREE (you already have it)
Twilio DID:         $1-2/month
Twilio Usage:       $0.013/min (so ~$0.50 for 50 min)
AI Models:          FREE (all local)
────────────────────────────
Total:              ~$2-3/month
```

**vs. Vapi/Retell: 90-95% savings** 🚀

---

## Support

**Can't get it working?**

1. Read: `TWILIO_SETUP.md` (detailed guide)
2. Run: `bash scripts/test-phone-e2e.sh` (test all components)
3. Check logs: `docker-compose logs phone-gateway`
4. Check Twilio console for incoming calls

**Documentation:**
- Setup guide: `TWILIO_SETUP.md`
- Full reference: `DEPLOYMENT_READY.md`
- Status: `WISE2_PHONE_SYSTEM_STATUS.md`

---

## Ready?

✅ All components built  
✅ Your GV number ready  
✅ 15 minutes to first call

**Go!** → Follow "Quick Setup (Do This Now)" above

---

**Your AI Phone Number: (336) 485-8421**

Time to activate: 15 minutes  
Cost: ~$2/month  
Savings: 90-95% vs. competitors

Let's go! 🚀
