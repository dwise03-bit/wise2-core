# WISE² AI Phone + Google Voice — Quick Setup (5 minutes)

**Option**: Use Google Voice as your phone number, Twilio as the intelligent router.

---

## Why This Approach?

Google Voice doesn't support incoming API automation, but **Twilio + Google Voice forwarding** gives you:

✅ Free/cheap Google Voice number (your personal phone number)  
✅ Incoming AI call handling via Twilio  
✅ No Linux server or Asterisk needed  
✅ Works within 5 minutes  
✅ Same CRM integration as full deployment  

**Cost**: ~$1-2/month (Twilio SIP DID) + $0.01/min usage

---

## 3-Step Setup

### Step 1: Get Twilio Account & Number (2 minutes)

1. Go to **twilio.com**
2. Sign up (free trial: $15 credit)
3. Go to **Phone Numbers** → **Get a Number**
4. Get a number in your area
5. Copy: **Account SID**, **Auth Token**, **phone number**

### Step 2: Forward Google Voice to Twilio (1 minute)

1. Go to **google.com/voice**
2. Settings → Forwarding phones
3. Add phone: **Twilio number** from step 1
4. Answer any confirmation prompt
5. Done - all Google Voice calls now forward to Twilio

### Step 3: Deploy WISE² Phone (2 minutes)

```bash
# In wise2-core:

# 1. Set environment variables
export TWILIO_ACCOUNT_SID="your-account-sid"
export TWILIO_AUTH_TOKEN="your-auth-token"
export TWILIO_PHONE_NUMBER="your-twilio-number"
export API_BASE_URL="http://localhost:3000"
export TENANT_ID="default"

# 2. Start the phone gateway
docker-compose -f docker-compose.phone.yml up -d

# 3. Configure webhook in Twilio
# Go to twilio.com → Phone Numbers → Your Number
# Voice Webhooks → Incoming Calls → 
#   https://YOUR_DOMAIN/v1/ai-phone/webhooks/twilio/voice

# 4. Test
curl http://localhost:3001/health
```

---

## What Happens When Someone Calls

```
Caller dials: +1-555-YOUR-GV-NUMBER
    ↓
Google Voice forwards to: Twilio number
    ↓
Twilio webhook calls: /v1/ai-phone/webhooks/twilio/voice
    ↓
WISE² Phone Gateway answers: "Hello! Welcome to WISE²..."
    ↓
Caller speaks request
    ↓
AI processes via STT→LLM→TTS
    ↓
CRM creates lead/appointment
    ↓
Greeting played to caller
    ↓
Loop continues or transfer to human
```

---

## Configuration

Add to `.env` or export:

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567  # Your Twilio number

# WISE²
API_BASE_URL=http://localhost:3000
TENANT_ID=default-workspace

# Optional: Hermes/Ollama
HERMES_ENDPOINT=http://localhost:11435/v1/chat/completions
PIPER_URL=http://localhost:8080/api/tts
```

---

## Local Development (No Server Needed)

If you're testing locally:

```bash
# 1. Use ngrok to expose localhost
ngrok http 3000

# 2. Set Twilio webhook to ngrok URL
# https://your-ngrok-domain.ngrok.io/v1/ai-phone/webhooks/twilio/voice

# 3. Call your Google Voice number
# → Twilio routes to ngrok
# → Phone Gateway handles it

# 4. Verify: check logs
docker-compose logs -f phone-gateway
```

---

## Verification

### 1. Phone Gateway Running?
```bash
curl http://localhost:3001/health
```

Should show:
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

### 2. Twilio Webhook Working?
```bash
# Make a test call to your Google Voice number
# Check Twilio Console → Phone Calls for incoming call
# Check logs: docker-compose logs phone-gateway
```

### 3. CRM Integration?
```bash
# After a test call, verify lead was created:
curl -X GET http://localhost:3000/v1/ai-phone/leads \
  -H "X-Tenant-ID: default"
```

---

## Comparison

| Approach | Setup Time | Cost/Month | Requirements |
|----------|-----------|-----------|--------------|
| **Google Voice + Twilio (This)** | 5 min | ~$1-2 | Google account, Twilio account |
| Full Asterisk + SIP | 3-5 hours | ~$30-50 | Linux server, SIP provider |
| Vapi/Retell | 10 min | $210-600 | Credit card |

---

## Common Issues

### "Call goes to voicemail instead of AI"

**Solution:**
1. Check Twilio forwarding in Google Voice settings
2. Confirm Twilio webhook URL is correct
3. Verify Twilio auth token in `.env`
4. Check firewall/CORS if using ngrok

### "No audio or poor quality"

**Solution:**
1. Twilio may need higher bandwidth
2. Check `docker-compose logs phone-gateway` for timeouts
3. Increase timeouts in `.env`:
   ```bash
   TRANSCRIPTION_TIMEOUT_MS=15000
   LLM_TIMEOUT_MS=45000
   ```

### "CRM lead not created"

**Solution:**
1. Check API is running: `curl http://localhost:3000/health`
2. Check tenant ID matches: `echo $TENANT_ID`
3. Check logs: `docker-compose logs phone-gateway | grep CRM`

---

## Next Steps

**After testing locally:**

1. **Deploy to production**
   - Get a real Linux server (optional, can stay local)
   - Use same Twilio setup
   - Point webhook to production domain

2. **Train voice**
   - Record your voice
   - Deploy Daniel voice model
   - Use in greetings

3. **Scale**
   - Handle multiple concurrent calls
   - Add scheduling/dispatch
   - Analytics dashboard

---

## Cost Breakdown

```
Google Voice:     FREE (you already have one)
Twilio DID:       $1.00-2.00/month
Twilio Usage:     $0.013-0.035/min
AI Models:        $0 (all local)
─────────────────────────────
Total:            ~$1-5/month

For 100 calls/month (50 min):
$1.50 (DID) + $0.50 (usage) = ~$2/month
```

---

## Deploy Now

```bash
# 1. Set Twilio credentials
export TWILIO_ACCOUNT_SID="ACxxxxxxx"
export TWILIO_AUTH_TOKEN="xxxxx"
export TWILIO_PHONE_NUMBER="+15551234567"
export API_BASE_URL="http://localhost:3000"

# 2. Start services
docker-compose -f docker-compose.phone.yml up -d

# 3. Verify health
curl http://localhost:3001/health

# 4. Set Twilio webhook (in Twilio console):
# https://YOUR_DOMAIN/v1/ai-phone/webhooks/twilio/voice

# 5. Test call
# Call your Google Voice number!
```

---

**Ready?** Make your first AI call in 5 minutes. No Linux server. No Asterisk. No complex setup.

**Questions?** Check:
- `docs/phone-system/DEPLOYMENT_READY.md` for full deployment
- `apps/phone-gateway/README.md` for API details
- `scripts/test-phone-e2e.sh` for end-to-end testing
