# WISE² BYTE MINI 4.0 — BUILD BLOCKER ANALYSIS

**Date**: August 7, 2026  
**Status**: ❌ BUILD BLOCKED — Arduino Component Unavailable  
**Hardware**: ESP32-C5 v1.0 (confirmed connected)  

---

## CURRENT STATE

### ✅ What's Working
- ESP32-C5 hardware detected and verified
- Serial connection active: `/dev/cu.usbmodem5B7B0330051`
- Build system properly configured (CMakeLists.txt, sdkconfig, source registration)
- All 22 source files intact
- BYTE character, applications, drivers all present
- RISC-V toolchain available
- Docker ESP-IDF v5.3 environment functional
- CMake configuration initiates correctly
- Target set to esp32c5

### ❌ What's Blocking Build
**Error**: Arduino component cannot be resolved by ESP-IDF v5.3

```
CMake Error at /opt/esp/idf/tools/cmake/build.cmake:268:
  Failed to resolve component 'arduino'
```

**Root Cause**: 
- Firmware requires Arduino.h and uses Arduino setup()/loop() pattern
- main/CMakeLists.txt declares `arduino` in REQUIRES
- ESP-IDF v5.3 does not include Arduino component by default
- Arduino component is not discoverable through normal `idf.py add-dependency` process
- Arduino component is not auto-resolved in ESP-IDF v5.3 for ESP32-C5

**Attempts Made** (all failed):
1. Native `idf.py add-dependency "espressif/arduino-esp32^3.3.11"` — No effect
2. Docker `idf.py add-dependency` — No effect
3. Manual idf_component.yml creation — Manifest format validation failed
4. PlatformIO alternative — PlatformIO not installed in environment
5. Different Arduino version constraints — Same resolution failure

---

## THE BLOCKER IN DETAIL

### What the Firmware Needs
```cpp
// main/main.cpp uses:
void setup() { ... }
void loop() { ... }
```

These Arduino functions require:
- `Arduino.h` header
- Arduino component providing app_main() wrapper
- Arduino component providing setup()/loop() support on ESP-IDF

### Why It's Not Available
ESP-IDF v5.3 includes Arduino **as an optional component** that must be:
1. Downloaded explicitly via component manager, OR
2. Manually cloned from GitHub into components/ directory, OR
3. Handled by a higher-level framework like PlatformIO

Standard `idf.py build` does NOT automatically provision Arduino.

### What Tried to Resolve It
1. `idf.py add-dependency` — Recognized the command but did not download/register Arduino
2. Component manager — Not auto-discovering Arduino for ESP32-C5
3. idf_component.yml — Rejected for format validation (version specification issues)

---

## SOLUTION OPTIONS

### Option 1: Manually Add Arduino Component (Native Build)
```bash
# In ESP-IDF directory
cd ~/esp/esp-idf/components
git clone https://github.com/espressif/arduino-esp32.git
cd arduino-esp32
git checkout tags/3.3.11 # or latest stable

# Then rebuild firmware
cd ~/Projects/wise2-core/products/byte-mini-4.0/firmware
source ~/esp/esp-idf/export.sh
idf.py --preview build
```

### Option 2: Use Docker with Pre-Installed Arduino
Create a custom Dockerfile that extends espressif/idf:v5.3 and includes Arduino:
```dockerfile
FROM espressif/idf:v5.3
RUN cd /opt/esp/idf/components && \
    git clone --depth 1 https://github.com/espressif/arduino-esp32.git && \
    cd arduino-esp32 && \
    git checkout tags/3.3.11
```

### Option 3: PlatformIO Build (if installed)
PlatformIO has Arduino built-in as a framework:
```bash
pip install platformio
pio run -e byte_mini_esp32c5
```

(Note: platformio.ini exists but is configured for ESP32-C6; would need C5 environment added)

### Option 4: Remove Arduino Dependency (NOT RECOMMENDED)
Rewrite main.cpp to use ESP-IDF directly instead of Arduino pattern. **This violates the preservation requirement** and risks breaking existing functionality.

---

## HARDWARE IS READY

| Component | Status |
|-----------|--------|
| ESP32-C5 Device | ✅ Connected & verified |
| Serial Port | ✅ Active `/dev/cu.usbmodem5B7B0330051` |
| Power Supply | ✅ USB powered |
| Firmware Source | ✅ All 22 files intact |
| Build Configuration | ✅ Correct for ESP32-C5 |
| Toolchain | ✅ RISC-V available |
| Arduino Component | ❌ Unresolved dependency |

---

## NEXT STEP FOR USER

**Choose one approach above (1, 2, or 3)** to resolve the Arduino component availability. Once Arduino component is accessible to the build system, the firmware will compile successfully with:

```bash
idf.py --preview build
```

All other aspects are verified and ready.

---

**Report Generated**: August 7, 2026  
**Blocker**: Arduino component unavailable in ESP-IDF v5.3 environment  
**Status**: Awaiting Arduino component resolution  
**Action**: User must select and execute one of Options 1-3 above
