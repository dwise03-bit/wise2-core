# Quick Start: Flash K10 with Defense IMP

**TL;DR** - Get K10 running with Defense IMP in 5 minutes.

## Prerequisites (1 min)

```bash
# Install Arduino CLI (macOS)
brew install arduino-cli

# Install UNIHIKER board package
arduino-cli core install UNIHIKER:esp32@0.0.5

# Install TFT_eSPI library
arduino-cli lib install "TFT_eSPI"
```

## Connect K10 (1 min)

Plug K10 into your computer via USB-C cable.

Find your port:
```bash
# macOS/Linux
ls /dev/cu.* /dev/ttyUSB* /dev/ttyACM*
# Example: /dev/cu.usbmodem101

# Windows: Check Device Manager for COM ports
```

## Configure API (30 sec)

Edit `byte-k10.ino` line 27:
```cpp
// Change this to your edge device IP:
const char* WISE2_API = "http://192.168.1.100:3000/api/imp";
                              ^^^^^^^^^^^^^^
                        Your network IP here
```

## Flash (2 min)

**Using Arduino CLI** (recommended):
```bash
cd products/byte-k10

# Compile
arduino-cli compile --fqbn UNIHIKER:esp32:k10 byte-k10.ino

# Flash (replace /dev/cu.usbmodem101 with your port)
arduino-cli upload -p /dev/cu.usbmodem101 \
  --fqbn UNIHIKER:esp32:k10 byte-k10.ino

# Monitor (optional - see live output)
arduino-cli monitor -p /dev/cu.usbmodem101 -c baudrate=115200
```

**Using Arduino IDE**:
1. Open `byte-k10.ino`
2. Tools → Board → UNIHIKER → K10
3. Tools → Port → Your USB port
4. Click Upload (↑ button)

**Using build.sh** (if you have it):
```bash
K10_PORT=/dev/cu.usbmodem101 ./build.sh flash
```

## Verify (30 sec)

After upload completes, K10 will show:
1. ✅ Animated IMP face (center)
2. ✅ Incident counter (top bar) - ~5 sec delay
3. ✅ Health metrics (bottom bar)
4. ✅ Status indicators (right side)

Check serial output:
```
[BOOT] Defense IMP API: http://192.168.1.100:3000
[BOOT] Complete - Face engine + Audio + Defense IMP online
```

## Test It (1 min)

Post a test incident to see it appear on K10:

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
- Update incident counter (top bar)
- Show alert in red (critical)
- Display location and distance

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port not found | Reconnect USB, try different cable/port |
| Compile fails | `arduino-cli core install UNIHIKER:esp32@0.0.5` |
| Black screen | Check WiFi; verify API IP is correct |
| No incidents | Confirm edge device IP; test curl command above |
| Overlay blocks face | Might be on different K10 hardware; check serial output |

## Next Steps

1. Deploy to field location
2. Connect to local network WiFi
3. Monitor for incidents in real-time
4. Use USB fallback if WiFi unavailable

See `DEFENSE_IMP_FLASH_GUIDE.md` for full details.

---

**Done!** K10 is now running Defense IMP. 🎉
