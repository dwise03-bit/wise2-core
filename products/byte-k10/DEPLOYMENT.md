# WISE² K10 Production Demo Firmware - Deployment Guide

## Overview

This is a complete, production-ready demonstration firmware for the UNIHIKER K10 that showcases all integrated capabilities:

- **Voice System**: Dual MEMS microphones + 2W speaker with noise-adaptive metering
- **Camera System**: GC2145 live preview with 240x240 centre crop
- **WiFi/Network**: Scan, connect, auto-reconnect with stored credentials
- **WISE² AI Integration**: Preset prompts with device-state awareness
- **Professional UI**: Dashboard, app launcher, system diagnostics
- **Hardware Monitoring**: Temperature, humidity, light, acceleration sensors
- **Animation**: ByteFace character animations for engagement

## Hardware Requirements

- UNIHIKER K10 device
- USB cable for initial flashing (or WiFi OTA for updates)
- Optional: Arduino IDE or arduino-cli command-line tool

## Build Prerequisites

### macOS

```bash
# Install arduino-cli (if not already installed)
brew install arduino-cli

# Install UNIHIKER board support
arduino-cli core install UNIHIKER:esp32

# Verify installation
arduino-cli board list
```

### Linux/Windows

Follow [arduino-cli installation guide](https://arduino.cc/pro/tutorials/getting-started/getting-started-cli) for your platform.

## Building the Firmware

### Quick Start

```bash
# Navigate to project directory
cd /Users/danielwise/Projects/wise2-core/products/byte-k10

# Compile only
./build.sh

# Compile and flash via USB
./build.sh flash

# Compile, flash, and watch serial output
./build.sh monitor
```

### Build with AI Chat Integration

If you have a WISE² service running locally (Hermes, Second Brain, or any OpenAI-compatible endpoint):

```bash
# Using local Hermes on :3012
BYTE_AI_ENDPOINT="http://localhost:3012/api/chat" ./build.sh flash

# Using local API server with authentication
BYTE_AI_ENDPOINT="http://192.168.1.100:8000/v1/chat" \
BYTE_AI_KEY="sk-..." \
./build.sh monitor

# Using Anthropic Claude API (requires networking from K10)
BYTE_AI_ENDPOINT="https://api.anthropic.com/v1/messages" \
BYTE_AI_KEY="sk-ant-..." \
./build.sh flash
```

### Over-the-Air (OTA) Updates

For wireless updates without USB cable:

```bash
# Compile and upload to K10 via WiFi
./build.sh ota

# With custom hostname (if mDNS doesn't resolve)
K10_OTA_HOST="192.168.1.50" ./build.sh ota
```

## Configuration

### Environment Variables

Set these before calling `./build.sh`:

| Variable | Purpose | Example |
|----------|---------|---------|
| `BYTE_AI_ENDPOINT` | AI chat API endpoint | `http://localhost:3012/api/chat` |
| `BYTE_AI_KEY` | Optional API authentication key | `sk-...` |
| `K10_PORT` | USB device port | `/dev/cu.usbmodem101` |
| `K10_OTA_HOST` | OTA target hostname/IP | `byte-k10.local` or `192.168.1.50` |

### Default Serial Port

The build script defaults to `/dev/cu.usbmodem101` on macOS. If your K10 uses a different port:

```bash
K10_PORT="/dev/cu.usbmodem102" ./build.sh flash
```

Find your K10's port:

```bash
# macOS
ls /dev/cu.usb*

# Linux
ls /dev/ttyUSB* /dev/ttyACM*
```

## First-Time Setup

1. **Connect K10 via USB**
   - Use a quality USB cable (data + power)
   - Device should appear in Arduino IDE or as `/dev/cu.usb*`

2. **Initial Flash**
   ```bash
   ./build.sh monitor
   ```
   - Watch serial output for boot messages
   - Device will show "WISE² K10 DEMO READY" when complete

3. **Verify Hardware**
   - Touch the screen - should show Dashboard with sensor readings
   - Press Button A (tilt device up) - Launcher menu appears
   - Navigate with tilt, select with Button A, go back with Button B

4. **Connect to WiFi**
   - From Launcher, select "WiFi" app
   - Scan available networks (up/down to navigate)
   - Select network and enter password (tilt = character, left/right = cursor, A = confirm)
   - Once connected, device will auto-reconnect on future boots

## Applications

### Dashboard (Root)
Shows real-time sensor data: temperature, humidity, light level, acceleration, uptime.

### Voice
- Live microphone metering with waveform display
- Speaker test tones
- Recording and playback of audio samples

### Camera
Full-screen live video from GC2145 camera. Shows frame rate in corner.

### WiFi
Network scanning, password entry, connection management, auto-reconnect.

### AI Chat
Preset prompts with AI responses. Requires BYTE_AI_ENDPOINT to be configured.

### Launcher
Menu to access all applications. Displays health status for each.

### Diagnostics
Full hardware health check: display, sensors, I2S, camera, storage.

### Settings
Configure idle timeouts (doze, sleep), persistent configuration storage.

### System Info
Display memory, uptime, crash dumps, board information.

### Terminal
Serial REPL for debugging and command execution.

### OTA
Over-the-air firmware updates via WiFi (requires dual-slot partition layout).

### Files
File browser for SD card / flash storage.

### Bluetooth
Bluetooth connectivity and data transfer.

### QR Scanner
Camera-based QR code scanner and parser.

## WISE² Service Integration

The K10 can connect to any WISE² service that exposes an OpenAI-compatible chat endpoint:

### Option 1: Local Hermes/Second Brain

```bash
# If Hermes is running on localhost:3012 with /api/chat endpoint
BYTE_AI_ENDPOINT="http://localhost:3012/api/chat" ./build.sh flash
```

The device will use preset prompts and get responses from Hermes, which can:
- Access the knowledge base
- Run multi-turn conversations
- Include device state in responses (temperature, uptime, etc.)

### Option 2: Remote API

```bash
# Access a remote WISE² instance
BYTE_AI_ENDPOINT="https://api.wise2.io/v1/chat" \
BYTE_AI_KEY="sk-project-key" \
./build.sh flash
```

### Option 3: Development/Testing

Without BYTE_AI_ENDPOINT configured, the AI Chat app will gracefully report:
```
AI Chat: UNAVAILABLE
Configure BYTE_AI_ENDPOINT at build time
```

This is intentional - it never fabricates responses, ensuring transparency.

## Serial Monitor Output

The firmware logs to serial at 115200 baud. Key markers:

```
╔════════════════════════════════════════════════╗
║   WISE² K10 PRODUCTION DEMO FIRMWARE v1.0      ║
║   Industrial Mobile Processor                   ║
║   ESP32-S3 | Camera | Voice | WiFi | AI        ║
╚════════════════════════════════════════════════╝

[BOOT] Timestamp: 1234 ms
[BOOT] Initializing K10 hardware...
[BOOT] Hardware               K10 board initialized
[BOOT] Display                Display (ILI9341 240x320) initialized
[BOOT] Input                  Input system (buttons, tilt, expander) initialized
...
[BOOT] Registered 14 applications
════════════════════════════════════════════════
  BOOT COMPLETE - WISE² K10 DEMO READY
  Entering main application loop...
════════════════════════════════════════════════
```

## Troubleshooting

### Compilation Errors

**Error: "unihiker_k10.h not found"**
- Ensure UNIHIKER:esp32 core is installed: `arduino-cli core install UNIHIKER:esp32`
- Try: `arduino-cli core update-index`

**Error: "User_Setup_LOADED not defined"**
- This is expected; TFT_eSPI is configured via -D flags only
- Do not create User_Setup.h in libraries - it will break the build
- Delete any stray TFT_eSPI copies in ~/Documents/Arduino/libraries

### Upload Failures

**"Serial port /dev/cu.usbmodem101 not found"**
- Connect K10 via USB
- Check port: `ls /dev/cu.usb*`
- Set correct port: `K10_PORT="/dev/cu.usbmodem102" ./build.sh flash`

**"Device not detected during upload"**
- Verify USB cable (must support data transfer, not just charging)
- Try: Arduino IDE > Tools > Ports > (should show "UNIHIKER K10")
- If port doesn't appear, install CH340 driver (macOS/Windows)

### Runtime Issues

**Screen shows nothing / only black**
- Check LCD backlight: press Button A on Dashboard
- Device may be in sleep mode; press any button to wake
- Check serial output for boot errors

**No WiFi visible**
- From WiFi app, start network scan (Button A)
- Wait for scan to complete (may take 10+ seconds)
- Scan results appear in list

**AI Chat says "UNAVAILABLE"**
- This is expected if BYTE_AI_ENDPOINT wasn't set at build time
- Rebuild with: `BYTE_AI_ENDPOINT="http://..." ./build.sh flash`

**Camera feed frozen/flickering**
- Try restarting camera from Camera app menu
- Check I2C connections for camera
- Run Diagnostics to verify camera health

## Performance

- **Boot time**: ~3-5 seconds from USB power
- **Frame rate**: Target 28 FPS (UpdateManager-limited to minimize power)
- **Memory**: ~180KB heap available for apps
- **WiFi**: ~2-3 seconds to connect (cached credentials)
- **AI response**: Depends on endpoint latency (typically 1-5 seconds over local network)

## Logs and Debugging

Enable verbose debug output in serial monitor:

```cpp
// In byte-k10.ino, uncomment FPS logging:
Serial.printf("[PERF] FPS: %.1f\n", gFramesPerSecond);
```

View live logs:

```bash
./build.sh monitor
# Then use Ctrl+C to exit
```

Save logs to file:

```bash
# macOS/Linux
./build.sh monitor | tee k10_log_$(date +%s).txt
```

## Power Management

The K10 implements two-stage idle behavior:

1. **Doze** (60s idle): Cute "sleeping" animation plays, screen stays lit
2. **Sleep** (600s idle): Backlight turns off, minimal power draw

Configure timeouts in the Dashboard Settings app or by modifying:

```cpp
gKernel->setIdleTimeouts(60000, 600000);  // doze_ms, sleep_ms
```

Set to 0 to disable a stage:

```cpp
gKernel->setIdleTimeouts(0, 600000);  // skip doze, go straight to sleep
```

## Security Considerations

- **No hardcoded credentials**: WiFi passwords are entered interactively
- **API keys in code**: If you configure BYTE_AI_KEY, it's compiled into firmware
  - Consider using environment variables at build time only
  - Never commit API keys to version control (add to .gitignore)
- **Local network only**: Default deployment assumes K10 and services are on same LAN
  - For remote APIs, use HTTPS and consider VPN

## Next Steps

1. **Run the demo** and explore all applications
2. **Configure AI Chat** by connecting to a WISE² service
3. **Customize apps** by editing `src/apps/*.cpp`
4. **Deploy to production** by using OTA updates

## Support & Documentation

- Hardware pinmap: `docs/HARDWARE_PINMAP.md`
- Build system details: `build.sh` (inline documentation)
- App architecture: `src/apps/Application.h`
- Display API: `src/display/DisplayManager.h`
- Input system: `src/input/InputManager.h`

## Version

- **Firmware**: 1.0 (Production Ready)
- **Hardware**: UNIHIKER K10 (ESP32-S3)
- **SDK**: UNIHIKER:esp32 v0.0.5
- **Last Updated**: 2026-08-18
