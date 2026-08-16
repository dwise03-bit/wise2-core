# BYTE MINI 4.0 - Quick Start Guide

## One-Minute Setup

```bash
# 1. Navigate to firmware
cd /Users/danielwise/Projects/wise2-core/products/byte-mini-4.0/firmware

# 2. Connect device via USB-C

# 3. Build & Flash in one command
pio run -e byte_mini_esp32c5 -t uploadandmonitor
```

**Expected Result**: Device boots with WISE² logo, shows BYTE character waking up, and displays home screen.

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `pio run -e byte_mini_esp32c5` | Build firmware |
| `pio run -e byte_mini_esp32c5 -t upload` | Flash to device |
| `pio run -e byte_mini_esp32c5 -t monitor` | Monitor serial output (115200 baud) |
| `pio run -e byte_mini_esp32c5 -t uploadandmonitor` | Build, flash, and monitor in one |
| `pio run -e dev -t uploadandmonitor` | Development build with debug output |
| `pio run -e release -t upload` | Optimized production build |

---

## First Boot Checklist

- [ ] WISE² splash screen appears (2 sec)
- [ ] BYTE character wakes up (1 sec)
- [ ] Loading bar animates (1 sec)
- [ ] Home screen displays
- [ ] Serial monitor shows: `[BOOT] System ready!`

---

## Touch Controls

| Gesture | Action |
|---------|--------|
| **Tap screen** | Interact with button/control |
| **Double tap** | Alternative interaction |
| **Swipe left** | Next page |
| **Swipe right** | Previous page |
| **Swipe up** | Scroll up (if supported) |
| **Swipe down** | Scroll down (if supported) |
| **Long press** | Open context menu (if supported) |

---

## Display Features

**Screen Pages** (swipe to navigate):
1. Home - Status dashboard
2. Dashboard - System metrics
3. Voice - Voice assistant
4. Settings - Preferences
5. WiFi - Network config
6. Bluetooth - Device pairing
7. Files - SD card browser
8. Terminal - Debug console
9. OTA - Firmware updates
10. System Info - Device info
11. About - About screen

---

## Power Management

| State | Brightness | Power Draw |
|-------|-----------|-----------|
| **Active** | 100% | 300-400 mA |
| **Dimmed** | 50% | 150-200 mA |
| **Sleep** | 0% | 5 mA |

**Auto-sleep after 5 minutes** of inactivity. **Tap to wake**.

---

## Battery Status

Battery percentage displayed at top-right of screen:

- 🟢 Green: > 50%
- 🟠 Orange: 20-50%
- 🔴 Red: < 20%
- **Low battery alert**: Auto-sleep at 5%

---

## BYTE Character Reactions

Tap the screen to see BYTE's reactions:

- **Happy** 😊 - Big smile
- **Thinking** 🤔 - Head tilt, eyes blinking
- **Listening** 👂 - Eyes tracking
- **Excited** 🎉 - Jumping animation
- **Charging** ❤️ - Heart pulse
- **Error** 😞 - Sad expression

---

## Serial Monitor Output

Normal boot:
```
[BOOT] Starting BYTE MINI 4.0...
[INIT] Display... OK
[INIT] Touch... OK
[INIT] Power... OK
[INIT] Creating tasks... OK
[BOOT] System ready!
```

FPS Counter (development build):
```
FPS: 58
FPS: 60
FPS: 59
```

---

## Settings to Configure

Navigate to **Settings** page to adjust:

- **Brightness**: 0-255 (current: 255)
- **Sleep Timer**: 1-30 minutes (current: 5 min)
- **Volume**: 0-100% (current: 80%)
- **Theme**: Dark/Light (current: Dark)
- **Animation Speed**: Slow/Normal/Fast (current: Normal)
- **Touch Calibration**: Recalibrate if needed

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Device won't flash | Check USB cable, try different port |
| No serial output | Verify baud rate is 115200 |
| Display shows garbage | Reflash firmware, check connections |
| Touch not responding | Recalibrate in Settings → Touch Cal |
| Battery % wrong | Battery ADC may need calibration |
| Won't wake from sleep | Tap screen, check battery level |

---

## File Locations

- **Source**: `/Users/danielwise/Projects/wise2-core/products/byte-mini-4.0/firmware/src/`
- **Config**: `/firmware/src/config/pins.h` and `colors.h`
- **Drivers**: `/firmware/src/drivers/`
- **UI**: `/firmware/src/ui/`
- **Animation**: `/firmware/src/animations/`
- **Main**: `/firmware/src/main.cpp`

---

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Boot Time | < 7s | ~5-6s ✅ |
| Display FPS | 60 | 55-60 ✅ |
| Touch Latency | < 50ms | ~30-40ms ✅ |
| Memory | < 2.5MB | 2.1MB ✅ |

---

## Next: Voice Assistant

When ready to add voice assistant:

1. Check `src/apps/voice.h / .cpp`
2. Integrate voice processing backend
3. Connect microphone input (GPIO11 A6)
4. Connect speaker output (GPIO12 A5)
5. Implement speech-to-text and text-to-speech

---

**Need help?** See `README.md` for comprehensive documentation.

**Ready to customize?** Edit `src/config/colors.h` for theme, `src/config/pins.h` for hardware.

**Have fun!** 🚀
