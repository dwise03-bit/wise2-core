# WISE² IMPS — Quick Reference Card

## Pin Assignment (One-Page)

```
╔════════════════════════════════════════════════════════════════╗
║            XIAO ESP32-S3 PIN CONFIGURATION                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  CN1 CONNECTOR (CYD Communication) — DO NOT MODIFY            ║
║  ┌──────────────┬──────────────┬──────────────┐               ║
║  │ Signal       │ GPIO         │ Status       │               ║
║  ├──────────────┼──────────────┼──────────────┤               ║
║  │ CYD RX (IN)  │ GPIO 22      │ RESERVED     │               ║
║  │ CYD TX (OUT) │ GPIO 27      │ RESERVED     │               ║
║  │ 3.3V Power   │ 3.3V         │ RESERVED     │               ║
║  │ Ground       │ GND          │ RESERVED     │               ║
║  └──────────────┴──────────────┴──────────────┘               ║
║                                                                ║
║  I2S MICROPHONE (AUDIO INPUT) — NEW                           ║
║  ┌──────────────┬──────────────┬──────────────┐               ║
║  │ Signal       │ GPIO         │ Mic Pin      │               ║
║  ├──────────────┼──────────────┼──────────────┤               ║
║  │ WS (Select)  │ GPIO 2 (D2)  │ WS           │               ║
║  │ SCK (Clock)  │ GPIO 3 (D3)  │ SCK          │               ║
║  │ SD (Data)    │ GPIO 4 (D4)  │ SD           │               ║
║  │ 3.3V Power   │ 3.3V         │ VDD          │               ║
║  │ Ground       │ GND          │ GND          │               ║
║  │ L/R Mono     │ GND          │ L/R          │               ║
║  └──────────────┴──────────────┴──────────────┘               ║
║                                                                ║
║  OTHER (For Future Use)                                       ║
║  GPIO 0, 1, 5-21, 23-26, 28-32 are available                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

## Build & Upload Commands

```bash
# Build firmware
platformio run -e seeeduino_xiao_esp32s3

# Upload to device
platformio run -e seeeduino_xiao_esp32s3 --target upload

# Monitor serial output (115200 baud)
platformio device monitor -b 115200

# One-liner: build + upload + monitor
platformio run -e seeeduino_xiao_esp32s3 --target upload && \
platformio device monitor -b 115200
```

## Configuration (config.h)

```cpp
// Audio Settings
#define AUDIO_SAMPLE_RATE           16000    // Hz
#define NOISE_GATE_THRESHOLD        -50.0f   // dBFS (lower = more sensitive)
#define VAD_LEVEL_THRESHOLD         -30.0f   // dBFS (lower = more sensitive)

// Timing
#define AUDIO_POLL_INTERVAL_MS      20       // Process every 20ms
#define CN1_POLL_INTERVAL_MS        10       // Check CN1 every 10ms

// Debug
#define DEBUG_I2S                   1        // 0 = off, 1 = on
#define DEBUG_AUDIO                 0        // 0 = off, 1 = on (spammy!)
#define DEBUG_VAD                   1        // 0 = off, 1 = on
```

## Audio Pipeline

```
Raw Audio (16 kHz, 16-bit mono)
    ↓
[Noise Gate] suppress < -50 dBFS
    ↓
[Voice Detection] threshold -30 dBFS
    ↓
[Wake Word] placeholder
    ↓
[Send to CYD] via CN1 MIC_AUDIO packet
```

## Serial Monitor Output (Every 5 Seconds)

```
─── SYSTEM STATUS ───
Input Level:    -25.4 dBFS      ← Microphone input level
Gate Level:     -45.6 dBFS      ← Signal after noise gate
VAD Active:     YES              ← Voice detected
Pending Samples: 1024            ← Samples waiting to send
Speech Frames:  342              ← Packets sent
Packets Sent:   286              ← Total CN1 packets
Packets Recv:   2                ← Packets from CYD
TX Errors:      0                ← Transmission errors
──────────────────────
```

## Protocol Packet Format

```
┌──────────┬──────┬──────────┬────────┬───────────────┬────────┐
│ Sync     │ Type │ Len High │ Len Lo │ Payload       │ CRC16  │
│ 0xAA     │ 0x04 │ 0x02     │ 0x00  │ [sample data] │ [CRC]  │
└──────────┴──────┴──────────┴────────┴───────────────┴────────┘
 1 byte     1 byte  1 byte     1 byte   0-256 bytes     2 bytes

Packet Types:
  0x01 = COMMAND (CYD → XIAO)
  0x02 = RESPONSE (XIAO → CYD)
  0x03 = STATUS (XIAO → CYD)
  0x04 = MIC_AUDIO (XIAO → CYD) ← NEW
```

## Troubleshooting

### Microphone Not Working

**Symptom**: `Pending Samples: 0` constantly

**Fix**:
1. Verify GPIO 2, 3, 4 connections to microphone WS, SCK, SD
2. Check microphone VDD = 3.3V and GND = 0V
3. Confirm L/R pin connected to GND (mono mode)
4. Test microphone with multimeter (continuity check)

### VAD Never Activates

**Symptom**: `VAD Active: NO` always

**Fix**:
1. Lower `NOISE_GATE_THRESHOLD` from -50 to -60 dBFs in config.h
2. Lower `VAD_LEVEL_THRESHOLD` from -30 to -40 dBFS
3. Test with loud voice input (normal speech may be too quiet)
4. Check microphone is powered and functional

### CN1 Communication Errors

**Symptom**: `TX Errors: 42` (increasing)

**Fix**:
1. Verify GPIO 22, 27 connections to CYD
2. Check both devices set to 115200 baud
3. Look for loose wires or shorts
4. Re-check wiring against pin assignment table

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Sample Rate | 16 kHz | Standard for voice |
| Latency | ~160 ms | E2E from mic to CYD |
| CPU Usage | 15-20% | Per core |
| Memory | ~41 KB | Of 8 MB available |
| Packet Rate | 50/sec | 512 samples @ 16kHz |

## Power-On Sequence

1. XIAO boots → Reads CN1 GPIOs
2. Serial initializes → Debug output
3. Microphone I2S starts → Audio capture begins
4. CN1 UART opens → Listening for CYD
5. Audio pipeline activates → Processing begins
6. FreeRTOS tasks start → Concurrent execution
7. "System running" message → Ready for audio

## Memory Quick Check

```bash
# Build and check memory usage:
platformio run -e seeeduino_xiao_esp32s3 --target upload

# Output should show:
# RAM:   [====      ]  41.2% (used 26960 / available 65536)
# Flash: [=         ]  3.9% (used 200K / available 8388608)

✓ If RAM < 50%, good headroom
✓ If Flash < 10%, plenty of space
```

## First-Time Setup Checklist

1. **Hardware**:
   - [ ] XIAO ESP32-S3 in hand
   - [ ] CYD 2.8 display connected via CN1
   - [ ] External I2S microphone connected to GPIO 2, 3, 4
   - [ ] USB-C cable for programming
   - [ ] Multimeter to verify connections

2. **Software**:
   - [ ] PlatformIO installed
   - [ ] Clone/download firmware repository
   - [ ] Edit config.h if needed
   - [ ] Connect XIAO via USB-C
   - [ ] Select board: seeeduino_xiao_esp32s3

3. **Build & Test**:
   - [ ] Run `platformio run`
   - [ ] Verify "Built successfully"
   - [ ] Run `platformio run --target upload`
   - [ ] Open Serial Monitor @ 115200
   - [ ] Verify startup messages appear

4. **Validation**:
   - [ ] `Pending Samples` > 0 (microphone working)
   - [ ] `VAD Active` changes based on voice
   - [ ] `Packets Sent` increases
   - [ ] `TX Errors` = 0
   - [ ] No repeated error messages

## Key Files

| File | Purpose |
|------|---------|
| `config.h` | Pin definitions & configuration |
| `main.cpp` | Firmware entry point, tasks |
| `MicrophoneManager.h/.cpp` | I2S audio input driver |
| `CN1Protocol.h/.cpp` | CYD communication |
| `AudioPipeline.h/.cpp` | Audio processing |
| `README.md` | Full documentation |
| `TECHNICAL_SPEC.md` | Detailed spec |

## Support Resources

- **XIAO ESP32-S3 Wiki**: https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/
- **ESP32-S3 Datasheet**: https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf
- **PlatformIO Docs**: https://docs.platformio.org/
- **WISE² Documentation**: See README.md in this repository

---

**Version**: 1.0.0  
**Updated**: 2026-08-06  
**Status**: Production Ready  
**Support**: See README.md for detailed troubleshooting
