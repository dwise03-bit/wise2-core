# BYTE MINI 4.0 — Firmware Flash Guide

## Quick Start

### 1. Get Pre-Built Firmware

**Option A: From GitHub Actions (Automated)**
1. Go to: https://github.com/yourusername/wise2-core/actions
2. Select "Build BYTE MINI 4.0 Firmware" workflow
3. Click latest successful run
4. Download "byte-mini-4.0-firmware" artifact
5. Unzip to get binary files

**Option B: From Release (Tagged Versions)**
1. Go to: https://github.com/yourusername/wise2-core/releases
2. Download the latest release
3. Extract binary files

---

## Flash to ESP32-C6 Device

### Method 1: Using `esptool.py` (Recommended)

**Install esptool:**
```bash
pip install esptool
```

**Flash firmware:**
```bash
esptool.py -p /dev/ttyUSB0 -b 460800 write_flash \
  0x0 bootloader.bin \
  0x8000 partition-table.bin \
  0x10000 byte_mini_4.0.bin
```

**Monitor serial output:**
```bash
esptool.py -p /dev/ttyUSB0 monitor
```

---

### Method 2: Using ESP-IDF `idf.py`

**Prerequisites:**
```bash
# Install ESP-IDF v5.3
cd ~/esp
git clone --branch v5.3 https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh esp32c6
source export.sh
```

**Flash:**
```bash
cd /path/to/byte-mini-4.0/firmware
idf.py -p /dev/ttyUSB0 flash monitor
```

---

## Troubleshooting

### "Permission denied" on /dev/ttyUSB0

**Linux/Mac:**
```bash
sudo chmod 666 /dev/ttyUSB0
# Or add user to dialout group:
sudo usermod -a -G dialout $USER
```

### Device not detected

1. Check USB cable (must support data transfer)
2. Try different USB port
3. Reset device: Connect EN pin to GND for 1 second
4. Verify with: `ls -la /dev/tty*`

### Flash verification failed

```bash
# Try with different baud rate
esptool.py -p /dev/ttyUSB0 -b 115200 write_flash ...
```

### Monitor shows garbled text

Device may be outputting at different baud rate. Try:
```bash
esptool.py -p /dev/ttyUSB0 monitor --baud 115200
```

---

## What's Flashed

| File | Address | Purpose |
|------|---------|---------|
| `bootloader.bin` | 0x0 | Bootloader |
| `partition-table.bin` | 0x8000 | Partition table |
| `byte_mini_4.0.bin` | 0x10000 | BYTE MINI firmware (2,500+ LOC) |

---

## Post-Flash

1. Device should boot automatically
2. Serial monitor shows startup sequence
3. Display initializes with splash screen
4. BYTE character animates wake-up
5. Home screen becomes active

---

## Rebuilding Locally

If you need to rebuild the firmware:

```bash
cd products/byte-mini-4.0/firmware
idf.py set-target esp32c6
idf.py build
idf.py flash monitor
```

Or use Docker (no local ESP-IDF needed):

```bash
cd products/byte-mini-4.0
docker build -t byte-mini-firmware .
docker run --rm --device=/dev/ttyUSB0 byte-mini-firmware
```

---

## Files in This Directory

- `FLASH_GUIDE.md` - This file
- `firmware/` - Source code (2,500+ LOC)
- `Dockerfile` - Docker build configuration
- `README.md` - Complete documentation
- `QUICK_START.md` - 5-minute setup guide
- `DELIVERY_SUMMARY.md` - Features & architecture

---

**Status**: ✅ **Production Ready** | Firmware compiled without errors | Ready to deploy
