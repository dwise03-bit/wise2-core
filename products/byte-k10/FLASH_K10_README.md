# WISE² K10 IMP — Defense Integration Flashing Guide

**Firmware Version**: 2.1 (Always-On Listening + Mouth Animation)  
**Status**: Production Ready ✅  
**Date**: 2026-08-21

---

## 🚀 Quick Start

On your **local machine** (where K10 is connected via USB):

```bash
# Navigate to project root
cd ~/Projects/wise2-core

# Run the flashing script
./products/byte-k10/flash-defense-imp.sh [K10_IP]

# Example with IP:
./products/byte-k10/flash-defense-imp.sh 192.168.1.100
```

**That's it!** The script handles everything automatically.

---

## 🎯 What the Script Does

### Automated Steps (in order):
1. ✅ **Auto-detect K10** — Finds K10 on `/dev/tty.usbmodem*` (macOS) or `/dev/ttyUSB*` (Linux)
2. ✅ **Install Arduino CLI** — If not already installed
3. ✅ **Install Board Package** — ESP32-S3 support
4. ✅ **Verify Firmware** — Checks `products/byte-k10/byte-k10.ino`
5. ✅ **Configure API** — Sets up Defense IMP endpoint
6. ✅ **Compile Firmware** — Builds `.ino` to binary (60-120 seconds on first run)
7. ✅ **Flash Device** — Writes binary to K10 via USB
8. ✅ **Monitor Boot** — Watches serial output for verification
9. ✅ **Post Test Incident** — Sends telemetry to dashboard
10. ✅ **Summary** — Displays completion status

---

## 📋 Prerequisites

### Required
- **K10 Device** — Connected via USB
- **Arduino CLI** — Installed (script installs if needed)
- **Node.js v18+** — For compilation
- **Python 3** — For esptool
- **curl** — For API tests (script works without it)

### Optional
- **Homebrew** (macOS) — For easier Arduino CLI install
- **screen** or **picocom** — For serial monitoring

### System Permissions
- **macOS**: May need to approve permissions for serial port access
- **Linux**: May need `sudo` for USB device access (check with `ls /dev/ttyUSB*`)

---

## ⚙️ Configuration

### K10 IP Address (Optional)
```bash
# Default: 192.168.1.100
./products/byte-k10/flash-defense-imp.sh 192.168.1.100

# Custom IP:
./products/byte-k10/flash-defense-imp.sh 10.0.0.50
```

The IP is used for:
- Posting test incidents to the dashboard API
- Verifying device connectivity after flashing
- Confirming Defense IMP integration

### API Endpoint
The device will POST state updates to:
```
http://{K10_IP}/api/wise-imp/k10/state
```

State payload includes:
- `device_id`: "k10_001"
- `state`: 1-12 (face state)
- `face_expression`: idle, happy, curious, etc.
- `wifi_connected`: true/false
- `asr_input`: voice capture text
- `timestamp`: milliseconds since epoch

---

## 🔍 Troubleshooting

### Issue: "K10 device not found on USB"

**Solution**:
1. Check K10 is actually connected: `ls /dev/tty*` (macOS) or `ls /dev/ttyUSB*` (Linux)
2. Install USB drivers (if on Windows, but this is macOS/Linux)
3. Try different USB port
4. Reset K10 (power cycle)

```bash
# Check available ports
# macOS
ls -la /dev/tty.*

# Linux
ls -la /dev/ttyUSB* /dev/ttyACM*
```

---

### Issue: "Arduino CLI installation failed"

**Solution**:
1. Install Homebrew (macOS): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Try manual install: https://arduino.github.io/arduino-cli/latest/installation/
3. Or install via pip: `pip install pyserial esptool`

```bash
# Manual Arduino CLI install on macOS
brew install arduino-cli

# Verify
arduino-cli version
```

---

### Issue: "Board package installation failed"

**Solution**:
1. Check internet connection
2. Arduino servers might be slow — retry after 1 minute
3. Manually install: `arduino-cli core install esp32:esp32`

```bash
# Retry board installation
arduino-cli core install esp32:esp32 --verbose
```

---

### Issue: "Compilation failed"

**Solution**:
1. First build is slow (downloads libraries) — this is normal
2. Check permissions: `chmod +x products/byte-k10/byte-k10.ino`
3. Check `.ino` file exists: `ls products/byte-k10/byte-k10.ino`
4. Try again — libraries may need time to download

```bash
# Check firmware file
file products/byte-k10/byte-k10.ino

# Try compilation again
./products/byte-k10/flash-defense-imp.sh 192.168.1.100
```

---

### Issue: "Flash failed"

**Solution**:
1. Device may have lost USB connection — reconnect and retry
2. Try hard reset on K10 (hold reset button 3 seconds)
3. Try different USB cable
4. Check permissions on `/dev/tty.usbmodem*`

```bash
# Reset K10 (if it has a reset button)
# Hold reset for 3-5 seconds

# Or use esptool to force erase
python3 -m esptool --chip esp32s3 --port /dev/tty.usbmodem3101 erase_flash
```

---

### Issue: "Could not reach API at http://192.168.1.100"

**This is normal** if:
- Device hasn't connected to WiFi yet
- Dashboard isn't running on that IP
- Network isn't configured

**Verify device is working**:
```bash
# Monitor serial output manually
screen /dev/tty.usbmodem3101 115200

# Should see boot messages like:
# [BOOT] Initializing hardware...
# [WIFI] Attempting connection...
# [AUDIO] K10 built-in audio ready
```

---

## 📊 What's Flashed

### Firmware v2.1 Includes
- ✅ 12 animated face states (eyes + expressions)
- ✅ 5 mouth expressions (closed, smile, open, surprised, speaking)
- ✅ **Always-on microphone** — no 10-second delay
- ✅ Real-time dashboard sync
- ✅ Error recovery & logging
- ✅ WiFi + offline modes
- ✅ ASR framework (voice capture ready)
- ✅ TTS framework (audio playback ready)

### Binary Details
- **Size**: ~675 KB
- **Board**: ESP32-S3
- **Baud Rate**: 115200
- **Flash Mode**: DIO
- **Flash Freq**: 80 MHz

---

## ✅ Verification

After flashing completes:

### 1. Check Serial Output
```bash
screen /dev/tty.usbmodem3101 115200
# or
picocom -b 115200 /dev/tty.usbmodem3101

# Expected output:
# [BOOT] Initializing hardware...
# [BOOT] Initializing display...
# [AUDIO] K10 built-in audio ready
# [WIFI] Attempting connection...

# Press Ctrl+A then D to exit (screen) or Ctrl+A Ctrl+X (picocom)
```

### 2. Test Voice Interaction
- Device should be continuously listening (mouth open in IDLE state)
- Speak to device
- Watch for mouth animation and face state changes
- Device should respond via API

### 3. Check Dashboard
```bash
# Test device state endpoint
curl -X POST http://192.168.1.100/api/wise-imp/k10/state \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "k10_001",
    "state": 3,
    "face_state": 1,
    "timestamp": '$(date +%s)000',
    "wifi_connected": true,
    "asr_input": "test",
    "face_expression": "idle"
  }'

# Expected response:
# {"status":"ok","device_id":"k10_001","response":"...","timestamp":"..."}
```

---

## 📚 Additional Resources

- **K10 Deployment Guide**: See `K10_DEPLOYMENT_GUIDE.md`
- **Firmware Changelog**: See `K10_FIRMWARE_UPDATE_v2.1.md`
- **Device Test Report**: See `K10_DEVICE_TEST_REPORT.md`

---

## 🆘 Still Having Issues?

1. **Check the log file**:
   ```bash
   tail -50 /tmp/k10_flashing_*.log
   ```

2. **Run with verbose output**:
   ```bash
   bash -x ./products/byte-k10/flash-defense-imp.sh 192.168.1.100
   ```

3. **Check prerequisites**:
   ```bash
   node --version        # Should be v18+
   arduino-cli version   # Should show version
   python3 --version     # Should show v3.x
   ```

4. **Review logs** in `/tmp/k10_*.log`

5. **Contact support** with:
   - Log file content
   - Output of `uname -a`
   - Output of `arduino-cli version`

---

## 🎉 Success!

Once flashing completes:
- ✅ Device is running firmware v2.1
- ✅ Always-on microphone is active
- ✅ Mouth animations working
- ✅ Ready for integration with Dashboard API
- ✅ Test incident posted to `/api/wise-imp/k10/state`

Next steps:
1. Configure WiFi on device (if needed)
2. Connect K10 to your network
3. Test voice interactions
4. Monitor telemetry in dashboard
5. Deploy to production

---

**Ready to flash!** 🚀

Run: `./products/byte-k10/flash-defense-imp.sh [K10_IP]`
