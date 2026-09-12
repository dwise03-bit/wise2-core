# WISE² Sound Labs — MASCHINE USB Troubleshooting

**Issue**: MASCHINE MIKRO MK3 not appearing in MIDI ports or system USB devices

---

## Quick Diagnostics

```bash
# Check if MASCHINE appears in USB
system_profiler SPUSBDataType | grep -i maschine

# Check MIDI ports
python3 -c "import mido; print(mido.get_input_names()); print(mido.get_output_names())"

# Check CoreMIDI
launchctl list | grep midiserver

# Test Bridge Detection
curl http://localhost:8788/midi/ports | jq .
```

---

## Troubleshooting Steps

### **Step 1: Physical Connection**
```
☐ Verify USB cable is firmly connected to MASCHINE and Mac
☐ Try different USB port on Mac (especially USB 3.0 ports)
☐ Check MASCHINE power light is ON (blue)
☐ Wait 10 seconds after plugging in (initialization time)
```

### **Step 2: MASCHINE Power State**
```
☐ MASCHINE LED status:
   - OFF = not powered
   - BLUE = normal
   - AMBER = low battery
   - RED = error

Action: Power cycle MASCHINE if needed
  - Unplug USB
  - Wait 5 seconds
  - Plug USB back in
  - Wait for blue LED
```

### **Step 3: macOS System Check**
```bash
# Restart CoreMIDI
launchctl stop com.apple.midiserver
sleep 2
launchctl start com.apple.midiserver

# Check MIDI Setup
open /Applications/Utilities/Audio\ MIDI\ Setup.app
# MASCHINE should appear in MIDI Devices window
```

### **Step 4: NI Driver Check**
```bash
# List installed audio devices
system_profiler SPAudioDataType | grep -i "native\|instruments\|maschine"

# If MASCHINE appears in Audio but not MIDI:
# → Driver may need reinstall
# → Update NI Komplete (includes drivers)
```

### **Step 5: USB Reset (if needed)**
```bash
# Kill CoreMIDI and restart
launchctl stop com.apple.midiserver
sleep 3
launchctl start com.apple.midiserver

# Or restart Mac (most reliable)
```

---

## When MASCHINE Connects

Once MIDI ports appear, verify with:

```bash
# Test 1: Python MIDI detection
python3 << 'EOF'
import mido
inputs = mido.get_input_names()
outputs = mido.get_output_names()
print("Inputs:", inputs)
print("Outputs:", outputs)
for p in inputs + outputs:
    if "MASCHINE" in p or "Maschine" in p:
        print(f"✅ MASCHINE: {p}")
EOF

# Test 2: Bridge detection
curl http://localhost:8788/midi/ports | jq .

# Test 3: Listen for MIDI messages
python3 << 'EOF'
import mido
try:
    port = [p for p in mido.get_input_names() if 'MASCHINE' in p][0]
    with mido.open_input(port) as inp:
        print(f"Listening on {port}...")
        print("Press a MASCHINE pad...")
        for msg in inp:
            print(f"MIDI: {msg}")
            if msg.type == 'note_on':
                print(f"✅ Pad {msg.note} detected!")
                break
except IndexError:
    print("MASCHINE port not found")
except Exception as e:
    print(f"Error: {e}")
EOF
```

---

## System Readiness Check

✅ **Bridge Status**
```bash
curl http://localhost:8788/health | jq .
# Expected: {"status": "ok", ...}
```

✅ **Soundboard Ready**
```bash
curl http://localhost:8788/soundboard/state | jq .
# Expected: 13 sounds loaded
```

✅ **Studio AI Ready**
```bash
curl http://localhost:8788/ai/models | jq .
# Expected: music_generation, voice_assistant, style_transfer available
```

✅ **Web UI Ready**
```bash
# Open: http://localhost:5173
# Expected: Virtual MASCHINE grid visible, connected status shown
```

---

## Known Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Driver not loaded | No USB device in system | Update NI drivers or reinstall |
| CoreMIDI crashed | No MIDI ports | `launchctl restart com.apple.midiserver` |
| Wrong USB port | Device appears then disconnects | Try different USB port |
| MASCHINE firmware old | MIDI ports don't enumerate | Update MASCHINE firmware via NI |
| Mac USB power issue | Device loses power quickly | Use powered USB hub |
| MASCHINE in MIDI mode | Device appears but no pads | Check MASCHINE settings menu |

---

## Hardware Verification Checklist

Once MASCHINE is detected:

```
MIDI Detection:
☐ MASCHINE appears in mido.get_input_names()
☐ MASCHINE appears in mido.get_output_names()
☐ Bridge detects: curl /midi/ports returns found=true

Pad Testing:
☐ Press pad 1 (bottom-left) - verify note_on
☐ Press pad 16 (top-right) - verify note_on
☐ All 16 pads respond with MIDI messages

Mode Testing:
☐ NORMAL mode - REAPER controls
☐ AI mode - Soundboard triggers
☐ LIVE mode - Sample triggers
☐ WISE² mode - Business controls

Robustness:
☐ Unplug MASCHINE - bridge gracefully disconnects
☐ Plug back in - bridge auto-reconnects
☐ Pad presses after reconnect - work without duplicates
☐ No crash loop or memory leak
```

---

## Support

If MASCHINE still not detected after all steps:

1. Check NI support: https://support.native-instruments.com/
2. Verify Mac OS compatibility (MASCHINE MIKRO MK3 supports macOS 10.11+)
3. Try different Mac or borrow a test machine
4. Check MASCHINE firmware version vs driver version match

---

**Bridge Status**: ✅ Ready  
**Soundboard**: ✅ Ready (13 sounds)  
**Studio AI**: ✅ Ready (music generation)  
**Web UI**: ✅ Ready (port 5173)  

**Blocking**: 🔴 MASCHINE USB detection

---

Generated: 2026-09-12  
WISE² Sound Labs v1.0
