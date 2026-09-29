# WISE² Phone Gateway
**Real-Time AI Phone Orchestration Service**

Real-time conversation between callers and AI via Asterisk PBX. Integrates speech-to-text, language models (Hermes/Ollama), and text-to-speech for natural conversational support.

---

## Architecture

```
┌─────────────────┐
│   Caller PSTN   │
└────────┬────────┘
         │ SIP
         ↓
┌─────────────────┐
│   Asterisk 22   │────→ Health/Logging
│     (PBX)       │
└────────┬────────┘
         │ WebSocket/ARI
         ↓
┌─────────────────────────────────────────────────┐
│      WISE² Phone Gateway (Node.js)              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │   STT    │   │   LLM    │   │   TTS    │   │
│  │ Whisper  │   │ Hermes   │   │  Piper   │   │
│  │ (local)  │   │ (Ollama) │   │ (local)  │   │
│  └──────────┘   └──────────┘   └──────────┘   │
│                                                  │
│  Call Orchestrator                             │
│  • State machine • Interruption • Tool calls  │
│                                                  │
└────────┬────────┬────────┬──────────┬───────────┘
         │        │        │          │
         ↓        ↓        ↓          ↓
       PostgreSQL  Redis   CRM    Scheduling
       (calls)    (session)(leads) (appointments)
```

---

## Features

- **Real-time Conversation**: Complete STT → LLM → TTS pipeline under 1 second
- **Interruption Handling**: Caller can interrupt AI speech (barge-in)
- **Tool Calling**: AI can create leads, schedule appointments, dispatch technicians
- **Call Recording**: Automatic recording with consent tracking
- **Fallback Handling**: Graceful degradation if services unavailable
- **CRM Integration**: Real customer data lookup & creation
- **Compliance**: TCPA consent, opt-out tracking, call recording consent
- **Daniel Voice**: Custom voice cloning (when trained)
- **WebSocket Events**: Real-time call status via WebSocket

---

## Setup

### 1. Prerequisites

- Asterisk 22 LTS running with ARI enabled
- PostgreSQL with phone models migrated
- Redis cache
- Existing WISE² Hermes/Ollama
- STT service (Whisper)
- TTS service (Piper or gTTS)
- Node.js 18+

### 2. Install

```bash
cd apps/phone-gateway
npm install
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env with your Asterisk credentials and service URLs
```

Key environment variables:

```env
ASTERISK_ARI_ENDPOINT=http://localhost:8088/ari
ASTERISK_USERNAME=wise2_gateway
ASTERISK_PASSWORD=<secure-password>

WHISPER_URL=http://whisper:8000/v1/audio/transcriptions
HERMES_ENDPOINT=http://ollama:11435/v1/chat/completions
PIPER_URL=http://piper:8080/api/tts

DATABASE_URL=postgresql://wise2:password@postgres:5432/wise2_prod
REDIS_URL=redis://:password@redis:6379/1
```

### 4. Run

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## API Reference

### Health Check

```
GET /health
```

Returns service status:
```json
{
  "status": "healthy",
  "services": {
    "stt": "online",
    "llm": "online",
    "tts": "online",
    "asterisk": "online"
  }
}
```

### Get Active Calls

```
GET /calls
```

Returns:
```json
{
  "activeCallCount": 2,
  "calls": [
    {
      "callId": "550e8400-e29b-41d4-a716-446655440000",
      "channelId": "1627450374.22",
      "callerId": "+1234567890",
      "status": "speaking",
      "duration": 45
    }
  ]
}
```

### Get Call Details

```
GET /calls/:callId
```

Returns full conversation transcript and state.

### Test Call (Development)

```
POST /test/inbound-call
Content-Type: application/json

{
  "callerId": "+1234567890",
  "script": [
    "My air conditioner isn't cooling",
    "It stopped working this morning"
  ]
}
```

Runs a simulated call with provided messages.

### WebSocket Events

```
ws://localhost:3001/ws/calls
```

Subscribe to real-time events:
- `active-calls`: Initial active calls list
- `call-initialized`: New inbound call
- `response-generated`: AI response ready
- `call-ended`: Call disconnected

---

## Call Flow

### Inbound Call

1. **Asterisk receives PSTN call** → Routes via dialplan to Stasis app
2. **ARI webhook** → Phone Gateway receives `StasisStart` event
3. **Initialize call session** → Create CallState, wire up Asterisk channel
4. **Play greeting** → TTS synthesizes greeting, Asterisk plays it
5. **Listen for speech** → VAD detects voice, capture audio
6. **Transcribe** → STT converts audio to text
7. **Generate response** → LLM generates contextual reply
8. **Check tool calls** → Execute CRM operations if requested
9. **Speak response** → TTS synthesizes, Asterisk streams audio
10. **Check for interruption** → If caller spoke, cancel TTS and loop to step 5
11. **Call ends** → Generate transcript summary, clean up session

### Outbound Call (Future)

- Initiate via API or scheduled task
- Similar flow but reversed (AI initiates)
- Used for appointment reminders, follow-ups, etc.

---

## State Machine

```
  ┌─────────────┐
  │   GREETING  │ Play greeting, wait for input
  └─────┬───────┘
        ↓
  ┌─────────────┐
  │ LISTENING   │ Capture caller speech
  └─────┬───────┘
        ↓
  ┌──────────────┐
  │ TRANSCRIBING │ STT conversion
  └─────┬────────┘
        ↓
  ┌────────────┐
  │  THINKING  │ LLM reasoning
  └─────┬──────┘
        ↓
  ┌─────────────┐
  │  SPEAKING   │ TTS output (interruptible)
  └─────┬───────┘
        ├─ [NORMAL END] → LISTENING (loop)
        ├─ [INTERRUPTION] → LISTENING (barge-in)
        └─ [TRANSFER] → TRANSFERRED
        
  ┌────────────┐
  │ TRANSFERRED │ Call handed to human
  └─────┬──────┘
        ↓
  ┌──────────────┐
  │    ENDED     │ Call disconnected
  └──────────────┘
```

---

## Configuration

### Asterisk ARI

Asterisk must have ARI enabled. In `/etc/asterisk/http.conf`:

```ini
[general]
enabled=yes
bindport=8088
bindaddr=0.0.0.0

[ari]
enabled=yes
```

### PJSIP Endpoint

Asterisk dialplan routes calls to Stasis:

```ini
[wise2-phone]
type=endpoint
auth=wise2-auth
aors=wise2-aor
context=inbound-calls

[inbound-calls]
exten => YOUR_DID,1,Stasis(wise2-phone-app)
 same => n,Hangup()
```

### Service Dependencies

Phone Gateway depends on multiple services being up:

| Service | URL | Required | Fallback |
|---------|-----|----------|----------|
| Asterisk ARI | http://localhost:8088/ari | ✓ YES | None (critical) |
| Whisper STT | http://whisper:8000 | ✓ YES | None (critical) |
| Hermes LLM | http://ollama:11435 | ✓ YES | None (critical) |
| Piper TTS | http://piper:8080 | ✓ YES | gTTS (fallback) |
| PostgreSQL | postgresql://postgres:5432 | ✓ YES | None (for CRM) |
| Redis | redis://redis:6379 | ✗ NO | In-memory state |

---

## Development

### Local Testing (No Asterisk)

```bash
npm run dev
curl -X POST http://localhost:3001/test/inbound-call \
  -H "Content-Type: application/json" \
  -d '{
    "callerId": "+1234567890",
    "script": ["My AC isnt cooling"]
  }'
```

### Enable Debug Logs

```bash
LOG_LEVEL=debug npm run dev
```

### Monitor Asterisk Events

```bash
# Terminal 1: Watch Asterisk logs
ssh user@your-server
sudo tail -f /var/log/asterisk/full | grep "wise2-phone"

# Terminal 2: Watch Phone Gateway logs
npm run dev

# Terminal 3: Make test call or softphone call to DID
```

---

## Troubleshooting

### Asterisk Connection Failed

```
Error: Failed to connect to Asterisk ARI
```

Check:
1. Asterisk is running: `sudo systemctl status asterisk`
2. ARI enabled: `grep enabled /etc/asterisk/http.conf`
3. Credentials correct: Match ARI config in Asterisk
4. Firewall: Port 8088 accessible: `curl http://localhost:8088/ari`

### STT Returns Empty

Check:
1. Whisper service running: `curl http://whisper:8000/health`
2. Audio file format: Should be WAV, 16-bit, mono
3. Logs: `docker logs wise2-whisper`

### LLM Response Slow (>1s)

Solutions:
1. Use smaller model: `hermes2` instead of `hermes2-pro`
2. Reduce max_tokens (default 500)
3. Check GPU: `nvidia-smi` (if available)
4. Check load: `top` or `docker stats`

### TTS Audio Distorted

Check:
1. Audio codec: PSTN expects µ-law or alaw, not raw PCM
2. Sample rate: Resample to 8kHz for PSTN
3. Duration mismatch: TTS duration estimate vs actual playback

---

## Performance Tuning

### Asterisk
- Configure RTP timeout: `/etc/asterisk/rtp.conf`
- Enable jitter buffer: `jb_enable=yes`
- Monitor: `asterisk -rx "rtp show stats"`

### LLM
- Use smaller models for faster response
- Reduce `max_tokens` for shorter replies
- Enable GPU acceleration if available

### STT
- Use `small` Whisper model for speed
- Configure VAD for accurate endpoint detection
- Use 8kHz audio (native PSTN format)

### TTS
- Stream chunks instead of waiting for full synthesis
- Cache common phrases
- Use local model (not cloud API)

---

## Security

### Asterisk
- Disable anonymous SIP: No `[anonymous]` endpoint
- Rate limiting via Fail2ban
- Randomized ARI password (32+ chars)
- Firewall: Only allow known IPs to SIP provider

### Phone Gateway
- Mask PII in logs: Phone numbers, addresses redacted
- Validate all CRM operations
- Encrypt PII in database
- Consent tracking for TCPA compliance

### Data
- Call recordings encrypted at rest
- PostgreSQL password rotated
- Redis password strong
- Secrets not in `.env` file in git

---

## Monitoring

### Health Endpoint

```bash
watch -n 5 curl -s http://localhost:3001/health | jq .
```

### Prometheus Metrics (Future)

```
curl http://localhost:3001/metrics
```

Tracks:
- Active call count
- Call duration avg/max
- STT latency p50/p95/p99
- LLM token throughput
- TTS synthesis time
- Error rates by service

---

## Known Limitations

1. **Streaming Audio**: Currently uses chunked playback, not true real-time streaming
2. **Tool Calling**: Mock implementations, needs CRM API integration
3. **Voice Cloning**: Requires training dataset (Daniel voice reference provided)
4. **Outbound**: Scheduled/initiated calls not yet implemented
5. **Hold Music**: Not implemented
6. **Call Transfer**: Human transfer workflow needs dashboard integration

---

## Future Phases

- **Phase 4**: Real-time bidirectional audio streaming
- **Phase 5**: CRM API integration (tool calling)
- **Phase 6**: Phone dashboard for call monitoring
- **Phase 7**: Scheduled outbound calls & campaigns
- **Phase 8**: E2E testing suite
- **Phase 9**: Production deployment & monitoring

---

## Support

Issues? Check:
1. All services healthy: `curl http://localhost:3001/health`
2. Asterisk connected: `ssh server 'asterisk -rx "ari show users"'`
3. Logs: `LOG_LEVEL=debug npm run dev`
4. Test call: `curl -X POST http://localhost:3001/test/inbound-call`

---

**Status**: Phase 3 Initial Implementation  
**Next**: Deploy to production server and integrate with Asterisk ARI
