# K10 Firmware Recovery Procedure

## Problem Summary

The K10 has a dual-partition OTA setup but firmware updates are not persisting. Despite successful flash reports from esptool, the device boots with old 2023 firmware.

**Root Cause:** The OTA selector (0xe000) points to ota_0, but `arduino-cli upload` writes to ota_1 (inactive slot) without updating the selector. Bootloader always loads ota_0.

**Status:**
- ota_0 (0x10000): OLD 2023 firmware (Feb 8 2023) — SELECTED
- ota_1 (0x290000): EMPTY (0xFF filled)
- OTA Selector (0xe000): 01 00 00 00 → ota_0 is active

---

## Quick Fix (2 minutes)

### Step 1: Erase ota_0

```bash
python3 -m esptool --port /dev/cu.usbmodem3101 erase_region 0x10000 0x280000
```

**Expected output:**
```
esptool.py v4.12.0
...
Erasing region from 0x10000 to 0x290000
...
Erase completed successfully
Hard resetting via RTS pin...
```

### Step 2: Flash New Firmware

Now build and flash normally. With ota_0 erased, Arduino will write there:

```bash
cd /Users/danielwise/Projects/wise2-core/products/byte-k10
./build.sh flash
```

**Why this works:**
1. esptool erases ota_0 (fills with 0xFF)
2. Arduino detects ota_0 is empty
3. Arduino uploads new firmware to ota_0
4. OTA selector still points to ota_0 ✓
5. Bootloader loads the NEW firmware

### Step 3: Verify

Device should boot with new firmware. Check serial monitor:

```bash
./build.sh monitor
```

---

## Why This Happened

The partitions.csv file creates two OTA slots for over-the-air updates. But the Arduino build system's CDC upload path doesn't implement OTA-aware partition switching.

When you flash with partitions.csv present:
- Arduino sees ota_0 is active
- Arduino assumes you want to update it OTA
- Arduino writes to ota_1 (the OTHER slot)
- Arduino assumes something ELSE will switch the selector
- **NOTHING SWITCHES THE SELECTOR**
- Bootloader keeps running ota_0

---

## Why Not Use OTA Normally?

The build.sh script DOES support OTA (`./build.sh ota`), which:
1. Compiles firmware
2. Runs espota.py over WiFi
3. Updates the inactive slot
4. Tells bootloader to switch slots

But OTA requires the device to be WiFi-connected and running an OTA listener, which is why the wired CDC upload doesn't work correctly.

---

## Permanent Fix (Recommended)

To prevent this in the future, modify the build.sh upload path to **always** erase the target partition before writing:

**File:** `/Users/danielwise/Projects/wise2-core/products/byte-k10/build.sh`

**Change:**
```bash
if [[ "${1:-}" == "flash" || "${1:-}" == "monitor" ]]; then
    echo "==> Uploading to $PORT"
    arduino-cli upload --fqbn "$FQBN" -p "$PORT" "$SKETCH_DIR"
fi
```

**To:**
```bash
if [[ "${1:-}" == "flash" || "${1:-}" == "monitor" ]]; then
    echo "==> Erasing active partition..."
    python3 -m esptool --port "$PORT" erase_region 0x10000 0x280000
    echo "==> Uploading to $PORT"
    arduino-cli upload --fqbn "$FQBN" -p "$PORT" "$SKETCH_DIR"
fi
```

This ensures the active partition is always empty before Arduino uploads, forcing Arduino to write to ota_0 directly.

---

## Alternative: Single-Partition Mode

If OTA updates are never needed, simplify to a single-partition layout. Replace partitions.csv with:

```csv
nvs,        data, nvs,    0x9000,    0x5000,
ota_0,      app,  ota_0,  0x10000,   0x400000,
model,      data, spiffs,  0x510000,  4563K,
voice_data, data, fat,    0x985000,  2542K,
fr,         data, ,       0xC01000,  100K,
coredump,   data, coredump, ,        64K,
```

This gives ota_0 the full 4 MB app space. No ota_1, no selector confusion.

---

## Technical Details

### Partition Table (Current)
| Partition | Offset | Size | Purpose |
|-----------|--------|------|---------|
| nvs | 0x9000 | 20 KB | Settings |
| otadata | 0xe000 | 8 KB | OTA selector (PROBLEM HERE) |
| ota_0 | 0x10000 | 2.5 MB | App slot 0 (ACTIVE, has old fw) |
| ota_1 | 0x290000 | 2.5 MB | App slot 1 (EMPTY, where new fw goes) |
| model | 0x510000 | 4.5 MB | AI model data |
| voice_data | 0x985000 | 2.5 MB | TTS voice data |

### OTA Selector Format (0xe000)
```
Byte 0: selected_slot (0x01 = ota_0, 0x00 = ota_1)
Bytes 1-3: CRC/validation
...rest: mirrored copies
```

Current value: `01 00 00 00` → ota_0 is selected
Bootloader respects this and never switches.

---

## Testing Checklist

After firmware update:

- [ ] Device boots with new firmware
- [ ] Serial monitor shows correct version/build timestamp
- [ ] All UI screens render correctly
- [ ] Buttons/sensors respond to input
- [ ] Device survives power cycle (holds new firmware)

---

## Questions?

If firmware still doesn't update after erasing ota_0:
1. Verify erase completed: `python3 -m esptool --port /dev/cu.usbmodem3101 read_flash 0x10000 0x10 /tmp/check.bin`
   - Should show all 0xFF bytes
2. Check build actually produced a binary: `find /Users/danielwise/Projects/wise2-core/products/byte-k10/build -name "*.bin"`
3. Verify device didn't enter safe boot mode (check serial output)

Contact: dwise03@gmail.com
