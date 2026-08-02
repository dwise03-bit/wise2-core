# E09 Bluetooth Speaker — Connection Status

**Status**: Paired & trusted, but not currently connected (speaker not discoverable)  
**Date**: 2026-08-02 16:45 UTC  
**MAC Address**: 34:17:23:01:A5:34  
**Pi**: wisepi.tail44396d.ts.net

---

## What's Working ✅

- ✅ Voice API responding on port 4901
- ✅ Voice capture working (using ALSA default audio device)
- ✅ Voice playback working (to ALSA default speaker/HDMI)
- ✅ sox installed (audio conversion tool)
- ✅ PulseAudio running and detecting audio devices
- ✅ Bluetooth service running
- ✅ E09 previously paired and trusted

**Test Result**:
```bash
curl http://127.0.0.1:4901/voice/test
# Response: {"success": true, "message": "Voice capture and playback working"}
```

---

## What's Not Working ⏳

- ⏳ E09 Bluetooth connection (speaker not responding/discoverable)
- ⏳ E09 microphone input (would require E09 to be connected)
- ⏳ E09 speaker output (would require E09 to be connected)
- ⏳ Audio via Bluetooth (falling back to ALSA HDMI/default)

**Error**:
```
Device 34:17:23:01:A5:34 not available
```

---

## Why E09 Disconnected

Possible reasons:

1. **E09 powered off** — Speaker may have auto-powered-off after idle time
2. **Out of range** — Bluetooth range exceeded
3. **Not in pairing mode** — After restart, E09 may not be discoverable
4. **Low battery** — E09 might have insufficient battery
5. **Interference** — 2.4GHz WiFi interference with Bluetooth

---

## How to Reconnect E09

### Step 1: Power On E09

- Press and hold the **power button** on the E09 speaker
- Wait for LED to show active state (usually blue or blinking)
- E09 should announce "Power on" or similar

### Step 2: Put E09 in Pairing Mode

**Option A** (Recommended): 
- Hold power button for **5+ seconds** until you see a pairing indicator (LED color change, usually fast blue blink)
- E09 should announce "Pairing mode" or similar

**Option B**:
- If E09 has a dedicated pairing button (check manual), press it

### Step 3: Reconnect from Pi

**On Pi**:
```bash
# SSH to Pi
ssh dwise@wisepi.tail44396d.ts.net

# Attempt to pair
bluetoothctl scan on
# Wait ~30 seconds, watch for E09 to appear
# Then Ctrl+C

# Pair (if not already paired)
bluetoothctl pair 34:17:23:01:A5:34

# Trust
bluetoothctl trust 34:17:23:01:A5:34

# Connect
bluetoothctl connect 34:17:23:01:A5:34

# Verify
bluetoothctl info 34:17:23:01:A5:34 | grep Connected
```

**Expected Output**:
```
Connected: yes
```

### Step 4: Verify Voice Works

```bash
# Test voice endpoint
curl http://127.0.0.1:4901/voice/test

# Should return:
# {"success": true, "message": "Voice capture and playback working"}

# Check voice status (should show E09 connected)
curl http://127.0.0.1:4901/voice/status | jq .bluetooth.connected
# Should return: true
```

---

## Alternative: Use Default Audio

Even without E09 Bluetooth, the voice system **works** using the Pi's default audio:

**Current Setup**:
- **Microphone**: ALSA default device (likely Pi onboard mic or USB)
- **Speaker**: ALSA default device (likely HDMI or 3.5mm jack)

**This is sufficient for**:
- ✅ Testing voice capture/STT
- ✅ Testing LLM responses
- ✅ Testing TTS playback
- ✅ Full voice pipeline validation

**E09 Bluetooth adds**:
- High-quality Bluetooth audio
- Portability (wireless)
- Professional audio for production
- Built-in microphone (hands-free)

---

## Current Voice Architecture

```
Voice Request
    ↓
Capture Audio (ALSA default device)
    ↓
Convert to WAV (sox)
    ↓
Speech-to-Text (Ollama whisper-small)
    ↓
LLM Processing (Hermes API)
    ↓
Text-to-Speech (espeak-ng/Piper via Ollama)
    ↓
Playback (ALSA default device)
    ↓
User hears response
```

**Working**: Capture → STT → LLM → TTS → Playback  
**Source/Sink**: ALSA default (can be switched to E09 once connected)

---

## Bluetooth Manager Status

The Pi is still trying to reconnect to E09:

```bash
pm2 logs wise2-edge-voice | grep BT
# Shows: Connecting to E09 speaker...
#        Reconnecting in 8000ms (attempt 5)
```

**Auto-Recovery**: Once E09 is powered on and discoverable again, the Bluetooth manager will:
1. Detect the device
2. Attempt connection
3. Auto-connect and update audio routing
4. No service restart needed

---

## Quick Troubleshooting Checklist

- [ ] E09 powered on (check LED)
- [ ] E09 in pairing mode (hold power button 5+ seconds)
- [ ] Pi Bluetooth adapter working (`sudo systemctl status bluetooth`)
- [ ] Bluetooth scan finds E09 (`bluetoothctl scan on` for 30s)
- [ ] Pairing successful (`bluetoothctl pair 34:17:23:01:A5:34`)
- [ ] Connection successful (`bluetoothctl connect 34:17:23:01:A5:34`)
- [ ] Voice API responds (`curl http://127.0.0.1:4901/voice/test`)

---

## If E09 Still Won't Connect

1. **Check E09 battery level** — Charge if needed
2. **Try factory reset E09** — Hold power for 10+ seconds
3. **Move closer to Pi** — Reduce distance, remove obstacles
4. **Restart Pi Bluetooth**:
   ```bash
   sudo systemctl restart bluetooth
   sleep 5
   bluetoothctl power on
   ```
5. **Check for interference** — Move away from WiFi router, microwaves
6. **Try USB Bluetooth dongle** — If onboard Bluetooth fails

---

## Files & Logs

**Voice Service Logs**:
```bash
ssh dwise@wisepi.tail44396d.ts.net
pm2 logs wise2-edge-voice

# or file
tail -f /home/dwise/wise2-edge/app/logs/voice-out.log
```

**Bluetooth Status**:
```bash
bluetoothctl info 34:17:23:01:A5:34
bluetoothctl paired-devices
```

---

## Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Voice API | ✅ Online | Responding on port 4901 |
| Audio Capture | ✅ Working | Using ALSA default device |
| STT/TTS | ✅ Ready | Ollama + sox installed |
| E09 Paired | ✅ Yes | Device info stored |
| E09 Connected | ⏳ No | Not currently discoverable |
| Auto-Reconnect | ✅ Active | Will reconnect when E09 available |

**Next Action**: Power on E09 speaker and put in pairing mode, then reconnect from Pi

---

**Updated**: 2026-08-02 16:45 UTC  
**Contact**: Check voice service logs if issues persist
