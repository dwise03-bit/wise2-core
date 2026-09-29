# WISE² Sound Labs MASCHINE MIKRO MK3 Integration

Production-ready MIDI bridge for Native Instruments MASCHINE MIKRO MK3 controlling REAPER, AI tools, and WISE² Business OS.

## Architecture

### Hybrid Local-First Design

```
LOCAL MAC (Offline-Capable)
├── MASCHINE MIKRO MK3 (Hardware Controller)
├── MIDI Bridge (Python/FastAPI)
│   ├── REAPER (DAW)
│   ├── Local AI (Ollama)
│   └── Audio Processing
└── WebSocket → UI

        ↓ Network (with fallback)

WISE² VPS (Cloud Services)
├── Sound Labs API
├── AI Cloud Fallback
├── Discord Integration
└── Second Brain / Context Engine
```

**Critical**: Recording works offline. REAPER continues even if VPS is down.

## 4 Deterministic Controller Modes

### MODE 1: NORMAL
REAPER Studio Control
- Transport: PLAY, STOP, RECORD, PAUSE, LOOP, METRONOME
- Track: ARM, MUTE, SOLO
- Navigation: MARKERS, UNDO, REDO, SAVE
- Stable REAPER APIs, no clicking

### MODE 2: AI
WISE² AI Music Tools (16-pad bank)
- 1-4: Generate Beat, Remix, Split Stems, Vocal Clean
- 5-8: Auto Mix, Master, Lyrics Assist, Sound Design
- 9-12: Change Style, BPM/Tempo, Variation, Extend Section
- 13-16: Capture Idea, Ask WISE², Export Stems, AI Settings
- Async processing; MIDI stays responsive

### MODE 3: LIVE
Performance
- 16 sample pads
- Loops, one-shots, FX triggers
- Low-latency local control

### MODE 4: WISE²
Business OS / Second Brain
- 16-pad bank for project/client/content management
- Discord posting, transcription, content generation
- Session summaries, team updates
- Remote control integration

**Safety**: One hardware event = maximum ONE action. No ambiguous mappings.

## Installation

### Prerequisites

```bash
# macOS with Xcode tools
# REAPER running (bridge on port 8787)
# Ollama running (port 11434)
# MASCHINE MIKRO MK3 USB connected
```

### 1. Python Environment

```bash
cd /Users/danielwise/Projects/wise2-core/services/sound-labs/bridge

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy example env
cp ../.env.example .env

# Edit .env with your values
# - REAPER_BRIDGE_TOKEN (from REAPER bridge)
# - VPS_API_TOKEN (from WISE² API)
# - DISCORD_WEBHOOK_URL (optional)
```

### 3. Verify MIDI Connection

```bash
# Test port detection
python3 -c "from bridge.midi_device import MidiDeviceManager; m = MidiDeviceManager(); print(m.detect_ports())"
```

### 4. macOS AutoStart (Optional)

```bash
# Install launchd service
cp bridge/com.wise2.sound-labs-bridge.plist ~/Library/LaunchAgents/

# Load service
launchctl load ~/Library/LaunchAgents/com.wise2.sound-labs-bridge.plist

# Verify
launchctl list | grep wise2

# View logs
tail -f /tmp/wise2-sound-labs-bridge-*.log
```

## Running the Bridge

### Development

```bash
cd bridge
source venv/bin/activate
python main.py

# Or with uvicorn directly
uvicorn main:app --host 127.0.0.1 --port 8788 --reload
```

### Production

```bash
# Via launchd (auto-starts on login)
launchctl load ~/Library/LaunchAgents/com.wise2.sound-labs-bridge.plist

# Manual start
python main.py

# Via PM2 (persistent across shell sessions)
pm2 start main.py --name sound-labs-bridge
pm2 save
```

## API Endpoints

### Health & Status

```
GET  /health                      → Health check
GET  /state                        → Full bridge state
GET  /midi/ports                  → Detect MIDI devices
```

### MIDI Control

```
POST /midi/connect/{input}/{output}     → Connect to ports
POST /midi/disconnect                   → Disconnect
POST /mode/{mode}                       → Switch mode (normal/ai/live/wise2)
```

### WebSocket

```
WS  /ws/state                    → Realtime state updates
```

## Example Usage

### Detect MASCHINE

```bash
curl http://127.0.0.1:8788/midi/ports
```

### Connect Manually

```bash
curl -X POST \
  "http://127.0.0.1:8788/midi/connect/MASCHINE%20MIKRO%20MK3%20In/MASCHINE%20MIKRO%20MK3%20Out"
```

### Check State

```bash
curl http://127.0.0.1:8788/state | jq .
```

### Switch Mode

```bash
curl -X POST http://127.0.0.1:8788/mode/ai
```

### WebSocket State Stream

```bash
# Use wscat or your WebSocket client
wscat -c ws://127.0.0.1:8788/ws/state
```

## Testing

```bash
# Unit tests
cd tests
pytest -v

# Specific test
pytest test_modes.py::TestModeManager::test_mode_switching -v

# Coverage
pytest --cov=bridge --cov-report=html
```

## Hardware Testing

Once software tests pass, test with actual MASCHINE:

1. **Connection**: Unplug/replug USB
2. **All Pads**: Press each pad in all modes
3. **Modes**: Switch modes, verify visual feedback
4. **REAPER**: Test transport, track control
5. **Network**: Disconnect internet, record offline
6. **Reconnect**: Restore connection, verify sync
7. **Restart**: Restart REAPER, BRIDGE, VPS
8. **No Duplicates**: No duplicate commands in logs

## File Structure

```
sound-labs/
├── bridge/
│   ├── main.py                      Main FastAPI server
│   ├── midi_device.py               MIDI detection & connection
│   ├── modes.py                     4 controller modes
│   ├── reaper_client.py             REAPER bridge HTTP client
│   ├── ai_router.py                 Local-first AI routing
│   ├── discord_integration.py       Discord webhooks
│   ├── state_manager.py             State & history
│   ├── pyproject.toml               Poetry config
│   ├── requirements.txt             Pip requirements
│   └── com.wise2.sound-labs-bridge.plist   launchd service
├── web/
│   └── (Sound Labs UI - in progress)
├── protocol/
│   └── (MIDI protocol definitions - in progress)
├── vps/
│   └── (VPS integration code - in progress)
├── tests/
│   ├── test_midi_device.py          MIDI tests
│   └── test_modes.py                Mode tests
└── README.md                         This file
```

## Deployment Checklist

- [ ] Code compiles without errors
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] MASCHINE physically detected and connected
- [ ] All 4 modes tested with real hardware
- [ ] NORMAL mode: REAPER responds to all controls
- [ ] AI mode: AI jobs queue and complete
- [ ] LIVE mode: Sample pads trigger
- [ ] WISE² mode: Discord posts work
- [ ] Offline recording works (VPS down)
- [ ] Reconnection works (VPS restored)
- [ ] Logs capture all actions
- [ ] No secrets in logs/code
- [ ] Mac launchd service auto-starts
- [ ] Health check responds
- [ ] WebSocket state updates in real time
- [ ] Action history maintained
- [ ] Offline queue works
- [ ] Deployment documented
- [ ] Rollback plan documented

## Troubleshooting

### MASCHINE Not Detected

```bash
# List all MIDI ports
python -m mido.ports

# Check system audio devices
system_profiler SPUSBDataType | grep -i maschine

# Verify USB connection
lsusb | grep -i ni
```

### REAPER Bridge Not Responding

```bash
curl -v http://127.0.0.1:8787/health

# Check if running
ps aux | grep reaper-bridge
```

### Ollama Not Available

```bash
# Check if running
ps aux | grep ollama

# Start Ollama
open /Applications/Ollama.app

# List models
curl http://127.0.0.1:11434/api/tags
```

### Port Already in Use

```bash
# Find process using port 8788
lsof -i :8788

# Kill it
kill -9 <PID>
```

## Performance Targets

- MIDI latency: < 10ms (real-time)
- State broadcast: 100Hz (10ms updates)
- AI async: No MIDI blocking
- Reconnection: < 5 seconds
- Offline queue: 100 actions max

## Security Notes

- No credentials in logs
- MIDI ports not exposed in API
- Offline queue survives crashes
- Authorized access only (token-based)
- No shell execution from remote

## Contributing

Before committing:

```bash
# Format code
black bridge/

# Lint
ruff check bridge/

# Test
pytest -v

# Check no secrets
grep -r "sk-\|api[_-]key\|password\|token" bridge/ --include="*.py"
```

## Next Steps

1. **Web UI**: Build cinematic Sound Labs Command Center
2. **VPS Integration**: Deploy to production
3. **Discord Bots**: Extend command suite
4. **Second Brain**: Full context engine integration
5. **Performance**: Optimize latency, add monitoring
6. **Documentation**: API docs, video guides

---

**Status**: Production-ready foundation  
**Version**: 0.1.0  
**Last Updated**: 2026-09-12  
**Owner**: Daniel Wise (dwise03@gmail.com)
