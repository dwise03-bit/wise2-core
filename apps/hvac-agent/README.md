# WISE² HVAC Agent - Always-On Field Assistant

**Purpose**: ChatGPT-style conversational AI agent that acts as the main controller for field technicians.

## Architecture

### Core Services
1. **Voice Input** — Always-on microphone, transcription via Whisper/STT
2. **Conversational AI** — Claude/GPT-4 for intelligent responses
3. **Context Management** — Real-time Fieldpiece readings, job data, technician state
4. **Multi-Modal Output** — Voice (TTS), text chat, diagnostic recommendations, dispatch actions
5. **Persistent State** — SQLite + sync queue

### Service Stack
- **Voice Processing**: whisper.cpp (local) or OpenAI Whisper API
- **AI Engine**: Claude API (claude-opus or claude-sonnet)
- **TTS**: ElevenLabs or system TTS
- **Real-time Communication**: WebSocket for low-latency chat
- **Backend**: Express/Node.js on VPS
- **Android Integration**: Kotlin Compose with audio capture + display

## Key Features

### 1. Voice-First Interface
- Always-on background listening (wake word: "WISE" or tap-to-talk)
- Real-time transcription displayed as user types
- Contextual voice commands

### 2. Conversational Diagnostics
- "What's wrong with this unit?" → analyzes Fieldpiece readings
- "What should I check next?" → guided troubleshooting
- "Show me the part number" → looks up equipment database
- "Schedule next call" → integrates with dispatch

### 3. Field Optimization
- Predicts parts needed before arrival
- Suggests best repair sequence
- Tracks labor time, costs
- Auto-generates reports

### 4. Multi-Modal Output
- Text chat (like ChatGPT)
- Voice responses with professional tone
- Inline diagnostics graphs/tables
- Action buttons (Start call, Log time, Order part)

## Data Flow

```
Fieldpiece → Real-time readings (Bluetooth)
    ↓
HVAC Agent (Claude + context)
    ← Reads job history, parts database, technician profile
    ← Processes voice input
    ↓
Multi-modal response (voice + UI)
    ↓
SQLite sync queue → VPS storage
```

## Implementation Phases

### Phase 1: Backend Voice + AI (2-3 hours)
- [ ] Express voice endpoint (WebSocket)
- [ ] Whisper integration (transcription)
- [ ] Claude API integration (conversational)
- [ ] Context manager (Fieldpiece + job data)
- [ ] TTS integration

### Phase 2: Android Voice UI (2-3 hours)
- [ ] Microphone capture + waveform display
- [ ] Real-time transcription display
- [ ] Chat history view (like ChatGPT)
- [ ] Voice playback for responses
- [ ] Integration with HomeScreen

### Phase 3: Smart Diagnostics (1-2 hours)
- [ ] Fieldpiece reading parser
- [ ] Diagnostic rules engine
- [ ] Equipment database lookup
- [ ] Part recommendation system

### Phase 4: Dispatch Integration (1 hour)
- [ ] Schedule/reschedule actions
- [ ] Route optimization
- [ ] Auto-report generation

## Files to Create

**Backend:**
- `apps/hvac-agent/src/` — Express server
  - `voice/` — Whisper/transcription
  - `ai/` — Claude integration
  - `context/` — Fieldpiece + job data manager
  - `tts/` — Text-to-speech
  - `routes/` — WebSocket endpoints

**Android:**
- `fieldtech-android/app/src/main/kotlin/com/wise2/fieldtech/ui/screens/agent/`
  - `AgentScreen.kt` — Main chat interface
  - `VoiceCapture.kt` — Microphone + waveform
  - `AgentViewModel.kt` — State management

**Database:**
- Add `agent_messages`, `agent_sessions` tables to Prisma schema

## Ready to build?
