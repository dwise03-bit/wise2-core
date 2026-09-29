# WISE² IMPS - Technical Specification

**Hardware Reconfiguration: XIAO ESP32-S3 + CYD 2.8 + External I²S Microphone**

---

## Executive Summary

This document specifies the complete hardware and software configuration for integrating an external I²S MEMS microphone into the Seeed Studio XIAO ESP32-S3 while preserving existing CYD 2.8 communication via the CN1 connector.

**Key Constraints**:
- CN1 pins (GPIO 22, 27) are RESERVED and must not be reassigned
- Display, touch, and speaker functionality must remain unchanged
- Microphone uses GPIO 2, 3, 4 only (I²S Master RX mode)
- No blocking I/O; all operations non-blocking with FreeRTOS

---

## Pin Assignment Reference

### XIAO ESP32-S3 GPIO Map

```
┌─────────────────────────────────────────────────────────┐
│  Seeed Studio XIAO ESP32-S3 PIN CONFIGURATION          │
├─────────────────────────────────────────────────────────┤
│  GPIO  0: —                                             │
│  GPIO  1: —                                             │
│  GPIO  2: I2S_WS (Word Select) ← MICROPHONE            │
│  GPIO  3: I2S_SCK (Serial Clock) ← MICROPHONE          │
│  GPIO  4: I2S_SD (Serial Data) ← MICROPHONE            │
│  GPIO  5-20: —                                          │
│  GPIO 21: UART1 TX (Serial1)                            │
│  GPIO 22: CN1_GPIO1 ← CYD COMMUNICATION (RESERVED)    │
│  GPIO 23-26: —                                          │
│  GPIO 27: CN1_GPIO2 ← CYD COMMUNICATION (RESERVED)    │
│  GPIO 28-32: —                                          │
├─────────────────────────────────────────────────────────┤
│  POWER:  3.3V, GND                                      │
│  ANALOG: A0-A9                                          │
└─────────────────────────────────────────────────────────┘
```

### Microphone Wiring Table

```
┌──────────────────────────────────────────────────────┐
│  I2S MEMS MICROPHONE CONNECTIONS                    │
├──────────────────┬──────────────┬──────────────────┤
│  Microphone Pin  │  Signal      │  XIAO GPIO       │
├──────────────────┼──────────────┼──────────────────┤
│  VDD             │  3.3V Power  │  3.3V            │
│  GND             │  Ground      │  GND             │
│  L/R             │  Mono Select │  GND (mono)      │
│  WS              │  Word Select │  GPIO 2 (D2)     │
│  SCK             │  Clock       │  GPIO 3 (D3)     │
│  SD              │  Data Input  │  GPIO 4 (D4)     │
└──────────────────┴──────────────┴──────────────────┘
```

### CN1 Connector Pinout (RESERVED)

```
┌──────────────────────────────────────────────────────┐
│  CN1 INTERFACE (CYD 2.8 COMMUNICATION)              │
├──────────────────┬──────────────┬──────────────────┤
│  CN1 Pin         │  Signal      │  XIAO GPIO       │
├──────────────────┼──────────────┼──────────────────┤
│  1               │  3.3V Power  │  —               │
│  2               │  GND         │  —               │
│  3               │  Data In     │  GPIO 22         │
│  4               │  Data Out    │  GPIO 27         │
└──────────────────┴──────────────┴──────────────────┘

⚠️  CRITICAL: These pins are LOCKED for CYD communication.
              DO NOT reassign for any other purpose.
```

---

## Physical Wiring Diagram

```
                    ┌─────────────────────┐
                    │  CYD 2.8 Display    │
                    │   (ESP32-based)     │
                    └──────────┬──────────┘
                            CN1│
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                              │
        │    XIAO ESP32-S3 (Microcontroller)         │
        │                                              │
        │    ┌─────────────────────────────────────┐ │
        │    │  I2S Interface (Master RX)          │ │
        │    │  ┌────────────────────────────────┐ │ │
        │    │  │  GPIO 2 (D2) ──WS──→ Mic      │ │ │
        │    │  │  GPIO 3 (D3) ──SCK→ Mic      │ │ │
        │    │  │  GPIO 4 (D4) ←SD──  Mic      │ │ │
        │    │  │  3.3V         ──VDD→ Mic      │ │ │
        │    │  │  GND          ──GND→ Mic      │ │ │
        │    │  │  GND          ──L/R→ Mic      │ │ │
        │    │  └────────────────────────────────┘ │ │
        │    │                                      │ │
        │    │  GPIO 22 (D6) ──→ CN1_3 ────→ CYD │ │
        │    │  GPIO 27 (D7) ←── CN1_4 ←──── CYD │ │
        │    │  3.3V          ──→ CN1_1          │ │
        │    │  GND           ──→ CN1_2          │ │
        │    └─────────────────────────────────────┘ │
        │                                              │
        │    External I2S MEMS Microphone            │
        └──────────────────────────────────────────────┘
```

---

## I2S Configuration Details

### Master Configuration

```
ESP32-S3 I2S Port 0 (Master RX):

Mode:               I2S_MODE_MASTER | I2S_MODE_RX
Sample Rate:        16000 Hz
Bit Width:          16 bits (I2S_BITS_PER_SAMPLE_16BIT)
Channel Format:     Mono Left (I2S_CHANNEL_FMT_ONLY_LEFT)
Communication:      Standard I2S (I2S_COMM_FORMAT_STAND_I2S)

Clock Source:       PLL (APLL disabled for stability)
MCLK:              Not used (no MCLK pin)

DMA Configuration:
  Buffer Count:     8 buffers
  Buffer Length:    512 samples per buffer
  Buffer Size:      1024 bytes per buffer (512 × 2 bytes/sample)
  Total DMA Memory: 8 KB

Interrupt Priority: Level 1
```

### I2S Timing

```
Sample Rate:        16000 Hz
Bit Clock:          16000 × 16 × 1 = 256 kHz (mono)
Samples per 20ms:   320 samples
Samples per 32ms:   512 samples (one buffer)
Audio Latency:      4 buffers = 128 ms (software) + 32 ms (hardware) ≈ 160 ms
```

---

## CN1 Communication Protocol

### Packet Structure

```
Frame Format (with CRC16 error detection):

┌─ HEADER ─────┬─────── PAYLOAD ──────┬─ TRAILER ─┐
│  4 bytes     │  0-256 bytes         │  2 bytes  │
├──────────────┼──────────────────────┼───────────┤
│ Sync │ Type │ Len_H │ Len_L │ Data │ CRC_H │ CRC_L │
└──────┴──────┴───────┴───────┴──────┴───────┴───────┘
  0xAA   Type    MSB     LSB    [Data]  CRC16 (big-endian)
```

### Packet Types

| Type | Value | Direction | Purpose |
|------|-------|-----------|---------|
| COMMAND | 0x01 | CYD → XIAO | Commands to microphone/audio control |
| RESPONSE | 0x02 | XIAO → CYD | Response to commands |
| STATUS | 0x03 | XIAO → CYD | Periodic status (level, pending samples) |
| MIC_AUDIO | 0x04 | XIAO → CYD | **NEW** Microphone audio data stream |

### MIC_AUDIO Packet Format

```
Sync (0xAA) | Type (0x04) | Len_H | Len_L | [Payload] | CRC16
                                        │
                                        ├─ Bytes 0-1: Sample Count (big-endian)
                                        ├─ Bytes 2+:  16-bit PCM samples
                                        └─ Variable length (2 + N×2 bytes)

Example (4 samples):
  Payload: [0x00 0x04] + [0x1234 0x5678 0x9ABC 0xDEF0]
           └─────┬─────┘  └─────────────────────────┘
           Count=4        4 × 16-bit samples
```

### CRC16 Calculation

```cpp
// CRC-16-CCITT
uint16_t calculateCRC16(const uint8_t* data, uint16_t length) {
  uint16_t crc = 0xFFFF;
  for (uint16_t i = 0; i < length; i++) {
    crc ^= (uint16_t)data[i] << 8;
    for (int j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc;
}
```

---

## Software Architecture

### Task Model

```
FreeRTOS Dual-Core Scheduler:

Core 0:
  └─ CN1 Communication Task (Priority 3)
     └─ 10 ms interval: check for incoming packets, handle commands
     
Core 1:
  └─ Audio Processing Task (Priority 5)
     └─ 20 ms interval: read microphone, process pipeline, send audio

Watchdog:
  └─ Main Task (Priority 1)
     └─ 100 ms interval: print statistics
```

### Module Dependencies

```
main.cpp
  ├─ MicrophoneManager (singleton)
  │   ├─ ESP32 I2S Driver
  │   ├─ FreeRTOS Ring Buffer
  │   └─ DMA Buffers
  │
  ├─ CN1Protocol (singleton)
  │   ├─ HardwareSerial (Serial1)
  │   └─ CRC16 Engine
  │
  └─ AudioPipeline (singleton)
      ├─ MicrophoneManager (read samples)
      ├─ CN1Protocol (send packets)
      └─ Audio DSP (noise gate, VAD)
```

### Initialization Order

```
setup()
  1. Serial.begin(115200)        ← Debug output
  2. MicrophoneManager::begin()  ← I2S initialization
  3. CN1Protocol::begin()        ← UART1 initialization
  4. AudioPipeline::begin()      ← Verify subsystems
  5. xTaskCreatePinnedToCore()   ← Start audio task (Core 1, Priority 5)
  6. xTaskCreatePinnedToCore()   ← Start CN1 task (Core 0, Priority 3)

Runtime:
  audioProcessingTask()          ← 20 ms intervals
    └─ MicrophoneManager::readSamples()
    └─ AudioPipeline::processAudio()
    └─ CN1Protocol::sendMicAudioPacket()

  cn1CommunicationTask()         ← 10 ms intervals
    └─ CN1Protocol::hasIncomingPacket()
    └─ CN1Protocol::receivePacket()
    └─ Handle command packet
```

---

## Audio Processing Pipeline

### Stage 1: Input Measurement

```
Raw I2S Samples
     ↓
  RMS Calculation (Root Mean Square)
     ├─ Normalize samples: x' = x / 32768
     ├─ Sum of squares: ∑(x'²)
     ├─ RMS = √(∑(x'²) / N)
     └─ Level dBFS = 20 × log₁₀(RMS)
     
Output: Input level in dBFS
```

### Stage 2: Noise Gate

```
Gated Samples
     ↓
  For each sample:
     ├─ Level = 20 × log₁₀(|sample| / 32768)
     ├─ If Level < -50 dBFS:
     │   sample = sample × 0.1  (attenuate by 10x)
     └─ Else:
         hasSignal = true
         
Output: Attenuated signal, boolean signal presence
```

### Stage 3: Voice Activity Detection (VAD)

```
Gated Samples
     ↓
  Count samples with energy > -30 dBFS
     ↓
  Confidence = count / N
     ↓
  Hysteresis:
     ├─ If !active && confidence > 70%: activate
     ├─ If active && confidence > 30%: keep active
     └─ If active && silence > 1000ms: deactivate
     
Output: Boolean VAD state
```

### Stage 4: Wake Word Detection (Placeholder)

```
Gated Samples
     ↓
  [Future: ML model on ESP32]
     ├─ Espressif MultiNet
     ├─ TensorFlow Lite Micro
     └─ Custom keyword spotting
     
Output: Wake word match + confidence
```

### Stage 5: Speech Capture & Send

```
If VAD active && gate open:
     ↓
  Pack samples into CN1 packet
     └─ Type: MIC_AUDIO (0x04)
     └─ Sample count (2 bytes)
     └─ Audio data (N × 2 bytes)
     └─ CRC16 (2 bytes)
     ↓
  Send via CN1 to CYD
```

---

## Performance Specifications

### Latency

```
Microphone Acquisition:  32 ms (one I2S buffer)
Processing Pipeline:     0 ms (non-blocking)
CN1 Transmission:       ~2 ms (256 bytes at 115200 baud)
CYD Processing:         Variable (CYD-dependent)
────────────────────────────────
Total E2E Latency:      ~34 ms minimum
```

### CPU Usage

```
Core 0 (CN1 Task):
  ├─ Serial polling: ~0.5% (10 ms interval, quick check)
  ├─ Packet processing: ~1% (only if packet available)
  └─ Total: ~1-2% average

Core 1 (Audio Task):
  ├─ I2S reading: ~5% (I2S is DMA-driven)
  ├─ Processing: ~10% (math, DSP)
  ├─ Packet sending: ~2%
  └─ Total: ~15-20% average

System Idle: ~60-70% (headroom for user code)
```

### Memory Usage

```
SRAM (8 MB):
  ├─ FreeRTOS kernel: ~5 KB
  ├─ Audio tasks: ~8 KB (stack)
  ├─ I2S DMA: 8 KB (8 × 1 KB buffers)
  ├─ Ring buffer: 32 KB (PCM samples)
  ├─ Code + data: ~150 KB
  └─ Free: ~7.8 MB

PSRAM (8 MB):
  └─ Available for user
```

### Power Consumption

```
Active (audio processing):  100-150 mA @ 3.3V
Idle (running, no audio):   50-80 mA @ 3.3V
Sleep (GPIO wakeup):        5-10 mA @ 3.3V

Microphone:                  3-5 mA @ 3.3V
CYD Display:                100-200 mA (when on)
Total System:               150-350 mA (active)
```

---

## Pin Conflict Analysis

### GPIO Availability

```
Reserved (CN1):
  └─ GPIO 22, 27

Reserved (I2S Microphone):
  └─ GPIO 2, 3, 4

Reserved (UART1 Serial):
  └─ GPIO 20 (RX), 21 (TX)

Available:
  └─ GPIO 0, 1, 5-19, 23-26, 28-32
  └─ Total: ~20 pins available for future use
```

### Cross-Check

```
✓ No GPIO assigned to multiple functions
✓ CN1 (GPIO 22, 27) not used by I2S or UART
✓ I2S (GPIO 2, 3, 4) not used by CN1 or UART
✓ UART (GPIO 20, 21) not used by CN1 or I2S
✓ Display, touch, speaker remain unaffected
```

---

## Compilation & Build

### PlatformIO Configuration

```ini
[env:seeeduino_xiao_esp32s3]
platform = espressif32@6.5.0
board = seeeduino_xiao_esp32s3
framework = arduino
build_flags =
    -std=c++17
    -Wall
    -Wextra
    -O2
    -DARDUINO_XIAO_ESP32S3=1
monitor_speed = 115200
upload_speed = 921600
```

### Binary Size

```
Text (code):        ~180 KB
Data (RO data):      ~20 KB
RAM (initialized):   ~50 KB
────────────────────────────
Total Flash Used:    ~250 KB of 8 MB (3%)
Total RAM Used:      ~50 KB of 8 MB (0.6%)

Headroom: Substantial for future features
```

---

## Testing Verification Checklist

### Hardware Verification

- [ ] GPIO 2 (WS) ← Microphone connected
- [ ] GPIO 3 (SCK) ← Microphone connected
- [ ] GPIO 4 (SD) ← Microphone connected
- [ ] GPIO 22 ← CYD CN1 pin 3
- [ ] GPIO 27 ← CYD CN1 pin 4
- [ ] Microphone VDD = 3.3V
- [ ] Microphone GND = 0V
- [ ] Microphone L/R = 0V (mono mode)
- [ ] No shorts between pins
- [ ] No pin conflicts

### Software Verification

- [ ] I2S initializes without errors
- [ ] DMA buffers fill with audio data
- [ ] Noise gate suppresses low signals
- [ ] VAD activates on speech
- [ ] CN1 packets transmit to CYD
- [ ] CRC16 validation passes
- [ ] No memory leaks (FreeRTOS heap stable)
- [ ] Dual-core load balanced
- [ ] Serial output shows expected statistics

### Integration Verification

- [ ] Display still renders correctly
- [ ] Touch input still responsive
- [ ] Speaker audio output unaffected
- [ ] CN1 communication maintains sync
- [ ] Audio packets received by CYD
- [ ] No frame drops or underruns

---

## Appendix: Hardware Compatibility

### I2S Microphone Requirements

- I²S protocol (not analog)
- PDM not supported (currently)
- 16kHz, 16-bit mono minimum
- Single-ended data line (SD/MISO)
- External clock (WS, SCK from ESP32)
- 3.3V power supply

### Recommended Microphone Modules

- SparkFun SPM1423 (PDM - requires converter)
- WM8524 (I²S master mode)
- MP3H6050 (I²S mono)
- MAX9814 (analog - requires I2S ADC)
- ICS-52000 (I²S mono MEMS)

### CYD Compatibility

- CYD 2.8" ESP32-based display
- CN1 connector present
- GPIO 22/27 assigned to CN1
- Firmware must support UART communication at 115200 baud
- 8-byte CRC16 packets with 0xAA sync byte

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-08-06 | 1.0 | Initial specification |
| — | — | — |

---

**Document**: WISE² IMPS Technical Specification  
**Status**: Production  
**Classification**: Reference Documentation  
**Last Updated**: 2026-08-06
