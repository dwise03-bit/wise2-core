# K10 Defense IMP Firmware - Flashing Guide

Complete step-by-step guide to flash the integrated Defense IMP firmware to your K10 device.

## What's New

The firmware now includes:
- ✅ Real-time incident counter on top bar
- ✅ Latest critical alert display
- ✅ System health metrics (CPU, RAM, signal)
- ✅ Connectivity status indicators (WiFi, Mesh, SDR, USB)
- ✅ WiFi + USB fallback connectivity
- ✅ No interference with animated IMP face

## Prerequisites

### Software
1. **Arduino IDE Pro** (recommended) or **Arduino CLI**
   - Download: https://arduino.cc/pro/software
   - Or: `brew install arduino-cli` (macOS)

2. **UNIHIKER Board Package**
   ```bash
   arduino-cli core install UNIHIKER:esp32@0.0.5
   ```

3. **Python 3** (for esptool)
   ```bash
   python3 -m pip install esptool
   ```

### Hardware
- **K10 Device** (UNIHIKER ESP32-S3)
- **USB Cable** (USB-C preferred)
- **Computer** with USB access

## Setup Instructions

### 1. Install Arduino IDE

**macOS (brew)**:
```bash
brew install arduino
```

**Windows/Linux**:
- Download from https://arduino.cc/en/software
- Or use `arduino-cli` via package manager

### 2. Install UNIHIKER Board Package

**Via Arduino IDE**:
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add to "Additional Board Manager URLs":
   ```
   https://files.dfrobot.com/Arduino/package_dfrobot_index.json
   ```
4. Go to **Tools → Board → Board Manager**
5. Search for "UNIHIKER"
6. Click **Install**

**Via Arduino CLI**:
```bash
arduino-cli core install UNIHIKER:esp32@0.0.5
```

### 3. Install TFT_eSPI Library

**Via Arduino IDE**:
1. Go to **Sketch → Include Library → Manage Libraries**
2. Search for "TFT_eSPI"
3. Install by Bodmer

**Via Arduino CLI**:
```bash
arduino-cli lib install "TFT_eSPI"
```

### 4. Connect K10 via USB

1. Plug K10 into your computer with USB-C cable
2. Verify it appears as a device:

   **macOS**:
   ```bash
   ls /dev/cu.*
   # Should see: /dev/cu.usbmodem* or similar
   ```

   **Linux**:
   ```bash
   ls /dev/ttyUSB* /dev/ttyACM*
   # Should see: /dev/ttyUSB0 or similar
   ```

   **Windows**:
   ```cmd
   wmic logicaldisk get name
   # Or check Device Manager for COM ports
   ```

## Flashing Process

### Method 1: Using Arduino IDE (Easiest)

1. **Open `byte-k10.ino`** in Arduino IDE
2. Select Board:
   - **Tools → Board → UNIHIKER → K10**
3. Select Port:
   - **Tools → Port → /dev/cu.usbmodem...** (or your port)
4. Select Programmer:
   - **Tools → Programmer → Esptool**
5. Click **Upload** (⇧ button)

Wait for:
```
Connecting...
Uploading...
Done!
```

### Method 2: Using Build Script (Advanced)

From the `byte-k10/` directory:

**macOS/Linux**:
```bash
# Option 1: Compile only
./build.sh

# Option 2: Compile and flash
K10_PORT=/dev/cu.usbmodem101 ./build.sh flash

# Option 3: Compile, flash, and monitor
K10_PORT=/dev/cu.usbmodem101 ./build.sh monitor
```

**Windows**:
```cmd
set K10_PORT=COM3
./build.sh flash
```

### Method 3: Using Arduino CLI

```bash
# Compile
arduino-cli compile --fqbn UNIHIKER:esp32:k10 byte-k10.ino

# Flash
arduino-cli upload -p /dev/cu.usbmodem101 \
  --fqbn UNIHIKER:esp32:k10 byte-k10.ino

# Monitor serial output
arduino-cli monitor -p /dev/cu.usbmodem101 -c baudrate=115200
```

## Configuration

### Edge Device IP

The firmware connects to the Defense IMP API. Update the IP address in `byte-k10.ino`:

```cpp
const char* WISE2_API = "http://192.168.1.100:3000/api/imp";
                              ^^^^^^^^^^^^^^
                        Change to your edge device IP
```

Then recompile and flash.

### WiFi Credentials

Update if needed:
```cpp
const char* WIFI_SSID = "WISE2_DEMO";
const char* WIFI_PASS = "demo123456";
```

Then recompile and flash.

## Verification

After flashing:

### 1. Check Serial Output

Open serial monitor at **115200 baud**:

```bash
# Using Arduino IDE: Tools → Serial Monitor
# Or from CLI:
screen /dev/cu.usbmodem101 115200
```

Expected output:
```
╔════════════════════════════════════════╗
║   WISE² K10 IMPS - FACE ENGINE v2.0  ║
║   Professional Animated Face           ║
╚════════════════════════════════════════╝

[BOOT] Initializing hardware...
[BOOT] Initializing display...
[BOOT] Initializing audio...
[BOOT] Initializing Defense IMP...
[BOOT] Defense IMP API: http://192.168.1.100:3000
[BOOT] Complete - Face engine + Audio + Defense IMP online
```

### 2. Check Display

K10 should show:
1. ✅ Animated IMP face in center
2. ✅ Top bar with incident counter (after ~5s)
3. ✅ Bottom bar with health metrics
4. ✅ Right side connectivity indicators

### 3. Test API Connection

In another terminal, post a test incident:

```bash
curl -X POST http://192.168.1.100:3000/defense-imp/incident \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fire",
    "distance": 0.8,
    "location": "Main St & 5th Ave",
    "severity": "critical"
  }'
```

K10 should:
1. Update incident count in top bar
2. Show the new incident details
3. Change alert color to red (critical)

## Troubleshooting

### Upload Fails / Port Not Found

**Cause**: Device not detected or wrong port

**Solution**:
1. Reconnect USB cable
2. Try different USB port
3. Check Device Manager (Windows) for unknown devices
4. Update USB drivers

```bash
# Find the actual port
ls /dev/cu.* /dev/ttyUSB* /dev/ttyACM*

# Then use in build.sh
K10_PORT=/dev/cu.YOUR_DEVICE ./build.sh flash
```

### Compilation Errors

**Cause**: Missing libraries

**Solution**:
```bash
# Reinstall libraries
arduino-cli lib install TFT_eSPI
arduino-cli core install UNIHIKER:esp32@0.0.5

# Clean and retry
rm -rf build/
./build.sh
```

### Display Shows Nothing

**Cause**: Display not initialized or wrong pins

**Solution**:
1. Check serial output for errors
2. Verify build.sh TFT flags match hardware:
   ```bash
   grep "DTFT_" build.sh | head -10
   ```
3. Recompile with correct flags

### No Defense IMP Data Appearing

**Cause**: Network or API issue

**Solution**:
1. Verify WiFi is connected (check serial output)
2. Confirm edge device IP is correct
3. Test API endpoint from K10 device:
   ```bash
   # On K10, via serial console or USB:
   curl http://192.168.1.100:3000/defense-imp/data
   ```
4. Check firewall allows port 3000

### Defense IMP Overlay Blocks Face

**Cause**: Overlay rendering issue

**Solution**:
1. Check `defense_imp.render_overlay()` is called after `updateDisplay()`
2. Verify overlay coordinates don't overlap face center
3. Review overlay coordinates in `defense-imp-integration.h`

## USB Serial Fallback

If WiFi is unavailable, K10 automatically falls back to USB serial communication.

### Testing USB Fallback

1. Disconnect WiFi or power off edge device
2. Start serial bridge (if available):
   ```bash
   npm install serialport dotenv axios
   node usb-serial-bridge.js
   ```
3. K10 will show cached data and attempt USB communication

## Performance Notes

- **Display Updates**: 60 FPS (IMP face)
- **Defense IMP Updates**: Every 5 seconds
- **Data Size**: ~2-4 KB per poll
- **Memory Usage**: ~8 KB for cached data
- **CPU Usage**: <5% average

## Next Steps

1. ✅ Verify firmware boots successfully
2. ✅ Connect to WiFi and confirm incidents appear
3. ✅ Test USB fallback (optional)
4. ✅ Deploy to production location
5. ✅ Monitor serial output for errors

## Support

See `K10_DEFENSE_IMP_INTEGRATION.md` for full documentation and API reference.

---

**Firmware Version**: 2.1 (with Defense IMP integration)  
**Last Updated**: 2026-08-20  
**K10 Device**: UNIHIKER ESP32-S3  
**Display**: ILI9341 240x320 @ 80 MHz
