# WISE² K10 Hardware Audit
**Date**: 2026-08-18  
**Status**: ✅ VERIFIED & OPERATIONAL

---

## Device Identification

| Property | Value |
|----------|-------|
| **Board** | UNIHIKER K10 (DFRobot DFR0992) |
| **MCU** | ESP32-S3 (QFN56, revision v0.2) |
| **MAC Address** | 1c:db:d4:aa:68:50 |
| **USB Port** | /dev/cu.usbmodem3101 |

---

## MCU Specifications

| Component | Spec |
|-----------|------|
| **Processor** | Xtensa LX7 Dual-Core @ 240 MHz |
| **SRAM** | 512 KB |
| **PSRAM** | 8 MB (embedded AP_3v3) |
| **Flash** | 16 MB (QIO @ 80 MHz) |
| **USB** | USB-Serial/JTAG Bridge |
| **WiFi** | 802.11 b/g/n |
| **Bluetooth** | BLE 5.0 |
| **Crystal** | 40 MHz |

---

## Display System

| Component | Spec |
|-----------|------|
| **Driver** | ILI9341 |
| **Resolution** | 240 × 320 pixels (portrait) |
| **Interface** | SPI @ 80 MHz |
| **Backlight** | I2C GPIO expander (XL9535) |
| **Color Mode** | RGB565 (16-bit) |
| **LVGL Support** | Yes (v8.3.0) |
| **Canvas API** | DFRobot unihiker_k10 (canvasText, canvasClear, etc.) |

**Pin Assignment** (TFT_eSPI):
- MOSI: GPIO 21
- SCLK: GPIO 12
- CS: GPIO 14
- DC: GPIO 13
- RST: -1 (tied to board reset)
- MISO: -1 (not used)

**Status**: ✅ WORKING (displays text, colors, updates correctly)

---

## Audio System

| Component | Spec |
|-----------|------|
| **Microphones** | 2× MEMS (I2S input) |
| **Speaker** | 2W (I2S output) |
| **Audio Codec** | Built-in I2S |
| **Sample Rate** | Configurable |

**I2S Pin Assignment**:
- BCLK: GPIO 0
- LRCK: GPIO 38
- DSIN (mic): GPIO 39
- DOUT (speaker): GPIO 45
- MCLK: GPIO 3

**Status**: 🔧 NOT YET TESTED

---

## Camera System

| Component | Spec |
|-----------|------|
| **Sensor** | GC2145 (2 MP, 80° FOV) |
| **Interface** | DVP (parallel) |
| **Resolution** | Up to 1600 × 1200 |
| **Orientation** | **Rear of device** (back-facing) |
| **Initialization** | Via `register_camera()` (SDK handles pins) |

**Status**: 🔧 NOT YET TESTED

---

## Input System

| Component | Spec |
|-----------|------|
| **Buttons** | 2× (A/B) via I2C expander |
| **Accelerometer** | SC7A20H (12-bit, ±2g-±16g selectable) |
| **Touch Panel** | None (not included on K10) |

**I2C Address Assignment**:
- SC7A20H (accel): 0x19
- AHT20 (temp/humidity): Dedicated (DFRobot_AHT20 driver)
- LTR303ALS (ambient light): 0x29
- MSA311: 0x62
- XL9535 (GPIO expander): I2C bus

**I2C Bus**:
- SDA: GPIO 47
- SCL: GPIO 48

**Status**: ✅ BUTTONS & ACCEL AVAILABLE

---

## Sensors

| Sensor | I2C Address | Function | Status |
|--------|-------------|----------|--------|
| AHT20 | Dedicated | Temperature + Humidity | 🔧 Not yet tested |
| LTR303ALS | 0x29 | Ambient light (0–64k lux) | 🔧 Not yet tested |
| MSA311 | 0x62 | Acceleration (3-axis) | 🔧 Not yet tested |
| SC7A20H | 0x19 | Acceleration (12-bit) | 🔧 Not yet tested |

---

## RGB LED

| Component | Spec |
|-----------|------|
| **Type** | WS2812B (NeoPixel) |
| **Count** | 3 LEDs |
| **Control Pin** | GPIO 46 |
| **Color Depth** | 24-bit RGB |

**Status**: ✅ CONTROLLED VIA `k10.rgb->write()` API

---

## Power System

| Component | Spec |
|-----------|------|
| **USB** | USB-C (5V power + programming) |
| **Battery** | 2-pin PH2.0 connector (3.0–6.0 V DC) |
| **Battery Types** | LiPo 3.7V recommended, or 3× AA/AAA (4.5V) |

**Status**: 🔧 USB power only (no battery testing yet)

---

## SDK & Libraries

| Library | Version | Status |
|---------|---------|--------|
| **unihiker_k10** | 1.0.0 | ✅ Installed |
| **TFT_eSPI** | 2.5.34 | ✅ Installed (preconfigured) |
| **LVGL** | 8.3.0 | ✅ Installed |
| **AIRecognition** | Latest | ✅ Installed (face detect, object detect) |
| **DFRobot_ESPASR** | Latest | ✅ Installed (speech recognition) |
| **asr** | Latest | ✅ Installed (speech-to-text) |
| **Adafruit_NeoPixel** | Latest | ✅ Installed |
| **I2S** | Native | ✅ Available |
| **WiFi** | Native | ✅ Available |
| **BLE** | Native | ✅ Available |

---

## Toolchain

| Tool | Version | Status |
|------|---------|--------|
| **Arduino IDE** | 2.x | ✅ Installed |
| **Arduino CLI** | Latest | ✅ Used for builds |
| **UNIHIKER:esp32** | 0.0.5 | ✅ Board package installed |
| **Python esptool** | 4.12.0 | ✅ Available |

---

## Verified Working Features

- ✅ Device detection via esptool
- ✅ Flash read/write/erase operations
- ✅ Code compilation (Arduino CLI)
- ✅ Firmware deployment (successful flash)
- ✅ Display initialization (ILI9341 working)
- ✅ Canvas rendering (text, colors, updates)
- ✅ RGB LED control (colors, brightness)
- ✅ Button input (GPIO detection possible)
- ✅ I2C bus accessible
- ✅ WiFi/BLE hardware present

---

## To Be Tested

- 🔧 Microphone capture (I2S audio input)
- 🔧 Speaker output (I2S audio playback)
- 🔧 Camera preview (GC2145 initialization)
- 🔧 Speech recognition (ASR)
- 🔧 Text-to-speech (TTS)
- 🔧 Temperature/humidity sensor
- 🔧 Ambient light sensor
- 🔧 Accelerometer (pedometer, shake detection)
- 🔧 WiFi connectivity
- 🔧 BLE connectivity
- 🔧 OTA firmware updates
- 🔧 Battery power (if used)

---

## Critical Discovery: Correct Canvas API

**Previous Attempts Failed** because firmware used:
- ❌ TFT_eSPI direct methods (TFT_eSPI methods not on canvas)
- ❌ LVGL methods (LVGL API mismatch)

**Correct API** (verified working):
- ✅ `k10.canvas->canvasText()` for text
- ✅ `k10.canvas->canvasClear()` for clearing
- ✅ `k10.canvas->updateCanvas()` for display flush
- ✅ Official K10 SDK examples (Text.ino, LED.ino, FaceDetect.ino)

**Lesson**: Always use official board SDK examples as reference, not generic ESP32/LVGL APIs.

---

## Build & Flash

**Working Build Script**: `/Users/danielwise/Projects/wise2-core/products/byte-k10/build.sh`

**Working Flash**:
```bash
K10_PORT=/dev/cu.usbmodem3101 bash build.sh flash
```

**Backup**: Full 16MB flash backed up to `/tmp/k10-backup/full-flash.bin`

---

## Next Phase

Ready for:
1. ✅ Phase 1 Complete: Hardware audit
2. 🔄 Phase 2: Display foundation (color tests, animation)
3. 🔄 Phase 3: Input system (buttons, touch simulation)
4. 🔄 Phase 4: Audio (microphone, speaker, TTS)
5. 🔄 Phase 5: Camera (preview, capture)
6. 🔄 Phase 6: WiFi & WISE² backend integration
7. 🔄 Phase 7: WISE² IMP character face
8. 🔄 Phase 8: Full demo

**Device Status**: ✅ **BASELINE FIRMWARE WORKING - READY FOR FEATURE IMPLEMENTATION**
