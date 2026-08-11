# WISE² BYTE Mini 4.0 - Firmware Structure

## Overview

Two firmware branches for different microcontrollers:

### `firmware-s3/` — **PRODUCTION** ✅
- **Target:** ESP32-S3
- **Framework:** Arduino (with TFT_eSPI library)
- **Display:** Hosyond ILI9488 (320×480)
- **Status:** Ready to build and deploy
- **Notes:** TFT_eSPI has mature ESP32-S3 support

**Build:**
```bash
cd firmware-s3
platformio run -e dev --target upload
```

### `firmware-c5/` — **EXPERIMENTAL** 🔬
- **Target:** ESP32-C5
- **Framework:** ESP-IDF
- **Display:** Hosyond ILI9488 (320×480)
- **Status:** Waiting for TFT_eSPI C5 support to mature
- **Notes:** C5 is capable, but TFT_eSPI C5 support is incomplete. Preserved for future work when TFT_eSPI C5 matures.

**Build (if attempting):**
```bash
cd firmware-c5
platformio run -e dev --target upload
```

---

## Display Pinout (Both Branches)

| Signal | GPIO |
|--------|------|
| CS     | 9    |
| DC     | 3    |
| RST    | 5    |
| SCK    | 6    |
| MOSI   | 7    |
| BL     | 10   |

---

## TFT_eSPI Configuration (S3)

Custom setup file: **`User_Setup_BYTE_MINI_S3.h`**

Key settings:
- Driver: ILI9488
- SPI freq: 80MHz
- Rotation: Landscape (1)
- Backlight: GPIO 10

To modify colors, fonts, or behavior, edit:
- `User_Setup_BYTE_MINI_S3.h` — display config
- `src/main.cpp` — test program

---

## Next Steps

1. **Get S3 board** (any ESP32-S3 dev board, or Seeed XIAO ESP32-S3)
2. **Wire up display** per pinout above
3. **Build & upload** firmware-s3
4. Should see **color cycle test** on display

---

## Future: C5 Support

When TFT_eSPI C5 support improves:
1. Update `firmware-c5/platformio.ini` to Arduino framework
2. Copy TFT_eSPI config from `firmware-s3/`
3. Update GPIO pins if needed for C5 board
4. Test and merge back to main

See TFT_eSPI GitHub issues for C5 progress.
