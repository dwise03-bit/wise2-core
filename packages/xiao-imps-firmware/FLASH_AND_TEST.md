# WISE² IMPS Firmware — Flash & Test Guide

**Quick Start**: Flashing XIAO ESP32-S3 with microphone firmware

---

## Step 1: Verify Hardware Setup ✅

Before flashing, physically verify:

```
XIAO ESP32-S3 Connections:

┌─────────────────────────────────────┐
│         XIAO ESP32-S3               │
├─────────────────────────────────────┤
│ D2 (GPIO 2)   → Microphone WS       │
│ D3 (GPIO 3)   → Microphone SCK      │
│ D4 (GPIO 4)   → Microphone SD       │
│ GND           → Microphone GND      │
│ 3.3V          → Microphone VDD      │
│                                     │
│ GPIO 20       → CYD UART RX         │ ⚠️ Verify with schematic
│ GPIO 21       → CYD UART TX         │ ⚠️ Verify with schematic
│ GND           → CYD GND             │
│ 3.3V          → CYD 3.3V            │
└─────────────────────────────────────┘
```

### Microphone Specifications
- **Type**: I2S MEMS microphone
- **Interface**: I2S (3-wire: WS, SCK, SD)
- **Sample Rate**: 16 kHz
- **Bit Depth**: 16-bit mono
- **Format**: Left-justified, left channel only

---

## Step 2: Flash the Firmware

### Option A: Using esptool.py (Recommended)

```bash
# Install esptool if needed
python3 -m pip install esptool

# Find the XIAO USB port
ls /dev/cu.usbserial-* 
# Or on Linux: ls /dev/ttyUSB*

# Flash the firmware
python3 -m esptool --chip esp32s3 -p /dev/cu.usbserial-XXXXX \
  write_flash 0x1000 .pio/build/seeed_xiao_esp32s3/bootloader.bin \
                0x8000 .pio/build/seeed_xiao_esp32s3/partitions.bin \
               0x10000 .pio/build/seeed_xiao_esp32s3/firmware.bin
```

### Option B: Using Arduino IDE

1. Install Arduino IDE (v2.0+)
2. Add board: Arduino IDE > Settings > Additional Boards Manager URLs:
   ```
   https://files.seeedstudio.com/arduino/package_seeeduino_boards_index.json
   ```
3. Install "Seeed XIAO ESP32-S3" board via Boards Manager
4. Open the firmware:
   ```bash
   # Open in Arduino IDE
   open /Users/danielwise/Projects/wise2-core/packages/xiao-imps-firmware/src/main.cpp
   ```
5. Select:
   - Board: Seeed Studio XIAO ESP32-S3
   - Port: /dev/cu.usbserial-XXXXX
   - Upload Speed: 57600
6. Click "Upload"

### Option C: Using PlatformIO CLI

```bash
cd /Users/danielwise/Projects/wise2-core/packages/xiao-imps-firmware
python3 -m platformio run --target upload
```

---

## Step 3: Monitor Serial Output

After flashing, watch the serial monitor:

```bash
# Using Arduino IDE
Tools > Serial Monitor (115200 baud)

# Or using screen (macOS/Linux)
screen /dev/cu.usbserial-XXXXX 115200

# Or using miniterm (Python)
python3 -m serial.tools.miniterm /dev/cu.usbserial-XXXXX 115200
```

### Expected Startup Output

```
╔════════════════════════════════════════════════════════╗
║  WISE² IMPS - XIAO ESP32-S3 FIRMWARE ONLINE             ║
╚════════════════════════════════════════════════════════╝

BOOT: Starting system initialization...

INIT: Microphone Manager...
✓ Microphone Manager initialized
INIT: CN1 Protocol...
✓ CN1 Protocol initialized
INIT: Audio Pipeline...
✓ Audio Pipeline initialized

BOOT: All systems online. Ready for operation.

Starting FreeRTOS tasks...
✓ Audio processing task created
✓ CN1 communication task created

System running. Monitoring audio stream...
```

If you see all `✓` marks → **Firmware is running!** ✅

---

## Step 4: Test Microphone Audio Capture

### Test 1: Silence Baseline

**What to do:**
- Keep silence around the microphone for 10 seconds
- Watch serial output

**Expected output every 5 seconds:**
```
─── SYSTEM STATUS ───
Input Level:    -70 dBFS         (quiet background)
Gate Level:     -120 dBFS        (below gate threshold)
VAD Active:     NO               (no speech)
Pending Samples: 0               (no buffered audio)
Speech Frames:  0
Packets Sent:   0
Packets Recv:   0
TX Errors:      0
──────────────────────
```

✅ **Pass**: Input level drops below -60 dBFS in silence  
❌ **Fail**: Input level stays above -30 dBFS (mic not working or too loud)

---

### Test 2: Voice Activity Detection (VAD)

**What to do:**
1. Speak clearly at normal volume (1-2 feet from mic)
2. Watch for "VAD Active: YES" message
3. Stop speaking
4. Watch for "VAD Active: NO" after ~1 second

**Expected output:**
```
[VAD] Speech detected
─── SYSTEM STATUS ───
Input Level:    -20 dBFS         (speech detected)
Gate Level:     -20 dBFS         (above gate threshold)
VAD Active:     YES              (speech active)
Pending Samples: 512             (audio buffered)
Speech Frames:  1                (packets being sent)
Packets Sent:   3                (accumulating)
Packets Recv:   0
TX Errors:      0
──────────────────────

... (more packets while speaking) ...

[VAD] Silence detected, deactivated
Input Level:    -70 dBFS
Gate Level:     -120 dBFS
VAD Active:     NO
Pending Samples: 0
```

✅ **Pass**: VAD activates on speech, level > -30 dBFS  
❌ **Fail**: Input level doesn't change, or stays below -50 dBFS

---

### Test 3: Noise Gate Effectiveness

**What to do:**
1. Make quiet mumbling/rustling sounds (background noise)
2. Then speak normally
3. Watch gate level change

**Expected behavior:**
```
Quiet noise:
Input Level:    -60 dBFS         (some sound)
Gate Level:     -120 dBFS        (gated, suppressed)

Normal speech:
Input Level:    -20 dBFS
Gate Level:     -20 dBFS         (not gated, passes through)
```

✅ **Pass**: Gate suppresses noise (-120 dBFS) but lets speech through  
❌ **Fail**: Gate level stays high even in silence, or speech is suppressed

---

## Step 5: CN1 Protocol Testing (After CYD Firmware Ready)

### Test 4: Packet Transmission

**What to do:**
1. Connect CYD via CN1 (GPIO 20/21)
2. Speak near microphone
3. Watch "Packets Sent" counter

**Expected output:**
```
Packets Sent:   15 (every 50 packets logs)
[PIPELINE] Speech capture: 50 packets sent
[PIPELINE] Speech capture: 100 packets sent
```

**Calculate audio duration:**
```
Packets sent / 50 packets per log = audio duration in ~0.5s chunks
15 packets ≈ 1.5 seconds of speech captured
```

✅ **Pass**: Packets sent counter increments during speech  
❌ **Fail**: Packets sent stays at 0 (check CN1 connection)

---

### Test 5: Full Audio Pipeline

Once CYD firmware is ready:

**What to do:**
1. Speak: "Hello, this is a test"
2. Listen on CYD side for audio playback or recording
3. Compare with original voice

**Expected**: Audio should be intelligible, 16kHz mono, ~100ms latency

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| No startup messages | Serial cable or port wrong | Try different USB cable, verify baud rate 115200 |
| Microphone init fails | GPIO conflict or mic not connected | Check GPIO 2/3/4, verify 3.3V to mic |
| Input level always -120 dBFS | Microphone not working | Check I2S wiring, verify mic power |
| VAD never activates | Audio too quiet or gate threshold too high | Speak louder, reduce NOISE_GATE_THRESHOLD in config.h |
| CN1 errors | Wrong UART pins or CYD not connected | Verify GPIO 20/21, check CYD firmware |
| High TX Errors | Serial corruption or baud rate mismatch | Reduce upload speed, check cable quality |

---

## Performance Expectations

| Metric | Expected |
|--------|----------|
| Boot time | < 2 seconds |
| Audio latency | 10-50 ms |
| Memory usage | < 10% during normal operation |
| Packet loss | < 0.1% (good serial connection) |
| Battery drain | ~50-100 mA (XIAO only) |

---

## Debug Flags (in config.h)

To enable verbose logging:

```cpp
#define DEBUG_I2S          1  // Log I2S initialization
#define DEBUG_AUDIO        1  // Log audio samples (high volume!)
#define DEBUG_VAD          1  // Log VAD events
#define DEBUG_CN1          1  // Log protocol events
```

Recompile and re-flash to enable.

**Warning**: `DEBUG_AUDIO` outputs sample data every cycle — very high volume.

---

## Next Steps After Successful Test

1. ✅ Firmware boots
2. ✅ Microphone captures audio
3. ✅ VAD detects speech
4. → **Connect CYD side** and test audio transmission
5. → Optimize thresholds based on real environment
6. → Deploy to production

---

**Issues?** Check:
- [BUILD_VERIFICATION_REPORT.md](BUILD_VERIFICATION_REPORT.md) for compile issues
- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) for architecture details
- Serial monitor output for error codes
