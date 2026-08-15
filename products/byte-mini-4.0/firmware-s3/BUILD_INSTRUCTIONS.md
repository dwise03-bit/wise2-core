# BYTE MINI 4.0 - ESP32-C6 Build Instructions

**Status**: ✅ Build system REPAIRED and ready for compilation  
**Target Hardware**: Seeed XIAO ESP32-C6  
**Framework**: ESP-IDF v5.3  
**Toolchain**: riscv32-esp-elf (RISC-V 32-bit)  

---

## Quick Start

### Option 1: Native Build (Recommended)

```bash
# 1. Make build script executable
chmod +x build.sh

# 2. Run build
./build.sh native
```

### Option 2: Docker Build (No Python setup needed)

```bash
# 1. Build in Docker
./build.sh docker

# Or use make directly:
make docker-build
```

### Option 3: Manual Build with Make

```bash
make build       # Full build
make clean       # Clean artifacts
make reconfigure # Reconfigure CMake
```

---

## What Was Fixed

The BYTE MINI 4.0 firmware had three critical build configuration errors:

### 1. ❌ CMakeLists.txt Include Order (FIXED ✅)

**Problem**: The ESP-IDF project initialization was in the wrong order.

```cmake
# WRONG (previous)
cmake_minimum_required(VERSION 3.16)
project(byte_mini_4.0 C CXX ASM)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)  # ← AFTER project()
```

```cmake
# CORRECT (now)
cmake_minimum_required(VERSION 3.16)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)  # ← BEFORE project()
project(byte_mini_4.0 C CXX ASM)
```

**Impact**: ESP-IDF's build system initialization now occurs at the correct time.

### 2. ❌ Duplicate Component Registration (FIXED ✅)

**Problem**: Both `main/` and `src/` directories existed with identical code, both registering as components.

```
main/CMakeLists.txt  ← Explicit source list (good)
src/CMakeLists.txt   ← Glob pattern (bad) → DISABLED
```

**Solution**: Disabled `src/CMakeLists.txt` (renamed to `.disabled`).

**Impact**: Single component registration, no conflicts.

### 3. ❌ Missing Arduino Component (FIXED ✅)

**Problem**: Code uses Arduino-style `setup()` and `loop()` but didn't declare Arduino dependency.

```cmake
# BEFORE
REQUIRES freertos esp_common esp_system esp_timer driver esp_adc hal

# AFTER
REQUIRES freertos esp_common esp_system esp_timer driver esp_adc hal arduino
```

**Impact**: Arduino component now provides the `app_main()` wrapper for ESP-IDF.

---

## Build System Architecture

```
CMakeLists.txt (root)
    ├── include($ENV{IDF_PATH}/tools/cmake/project.cmake)  ← ESP-IDF setup
    ├── project(byte_mini_4.0)                             ← Project init
    └── (ESP-IDF discovers components)
            │
            └── main/                                       ← Single active component
                ├── CMakeLists.txt (idf_component_register)
                ├── main.cpp
                ├── animations/
                ├── drivers/
                ├── services/
                ├── ui/
                ├── apps/
                └── config/
```

---

## Build Process

### Phase 1: Validation
- Verifies CMakeLists.txt order
- Confirms src/ is disabled
- Checks Arduino in REQUIRES
- Validates ESP32-C6 target in sdkconfig

### Phase 2: Environment Setup
- Sources ESP-IDF (if native build)
- Loads Python environment
- Initializes toolchain (riscv32-esp-elf)

### Phase 3: Configuration
- Runs CMake to generate build files
- Creates `build/CMakeCache.txt`
- Generates `build/compile_commands.json`
- Produces `build/project_description.json`

### Phase 4: Compilation
- Ninja builds all BYTE MINI application files:
  - `main.cpp`
  - `ui/ui_manager.cpp`
  - `drivers/display.cpp`
  - `drivers/touch.cpp`
  - `animations/byte_character.cpp`
- Links with Arduino, FreeRTOS, and ESP-IDF libraries
- Produces ELF binary

### Phase 5: Post-Processing
- Creates bootloader image
- Generates partition table
- Produces flashable .bin files

### Phase 6: Verification
- Checks all outputs exist
- Reports file sizes
- Confirms build success

---

## Build Outputs

After successful build, these files are generated:

```
build/
├── bootloader/
│   └── bootloader.bin               (ESP32-C6 bootloader)
├── partition_table/
│   └── partition-table.bin          (Partition table)
├── byte_mini_4.bin                  (Application firmware - flashable)
├── byte_mini_4.elf                  (Debug symbols)
├── project_description.json         (Build metadata)
├── compile_commands.json            (Compilation database)
├── flash_args                       (Flash command template)
└── flasher_args.json                (Flash configuration)
```

**Critical files for flashing**:
- `build/byte_mini_4.bin` - Application firmware
- `build/bootloader/bootloader.bin` - Bootloader
- `build/partition_table/partition-table.bin` - Partition table

---

## Flashing to Device

### Step 1: Connect Device

Connect ESP32-C6 via USB-C cable to Mac.

### Step 2: Identify Serial Port

```bash
ls /dev/cu.*
```

Look for something like:
- `/dev/cu.usbserial-1A20000`
- `/dev/cu.usb0`
- `/dev/cu.SLAB_USBtoUART`

### Step 3: Flash

Using the build script:
```bash
. /Users/danielwise/esp/esp-idf/export.sh
idf.py -p /dev/cu.<YOUR_PORT> flash monitor
```

Or use make:
```bash
make monitor PORT=/dev/cu.<YOUR_PORT>
```

### Step 4: Verify

Serial monitor output should show:
```
I (123) main: Starting BYTE MINI 4.0
I (234) display: Initializing display...
...
```

The BYTE character should appear on the display with animations.

---

## Troubleshooting

### "ESP-IDF not found"

```bash
# Check installation
ls -la /Users/danielwise/esp/esp-idf

# If not found, install from:
# https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/get-started/
```

### "idf.py: command not found"

```bash
# Source ESP-IDF environment
source /Users/danielwise/esp/esp-idf/export.sh

# Verify
idf.py --version
```

### Build hangs or times out

```bash
# Try Docker build instead (more reliable)
./build.sh docker

# Or manually:
make docker-build
```

### Port not found

```bash
# List all serial devices
ls -la /dev/cu.* /dev/tty.*

# If empty, check:
# 1. USB cable connected
# 2. Device has power
# 3. Check System Report → USB in macOS
```

### "Error: Python version mismatch"

```bash
# Reinstall ESP-IDF Python environment
cd /Users/danielwise/esp/esp-idf
bash install.sh

# Or use Docker (no Python issues)
make docker-build
```

---

## Development Workflow

### Make a Change

1. Edit source files in `main/` or `main/apps/`
2. Run build:
   ```bash
   make build
   ```
3. Flash and test:
   ```bash
   idf.py -p /dev/cu.<port> flash monitor
   ```

### Add a New Source File

1. Create file in `main/` or subdirectory
2. Add to `main/CMakeLists.txt` SRCS section:
   ```cmake
   SRCS
       main.cpp
       ui/ui_manager.cpp
       drivers/display.cpp
       drivers/touch.cpp
       animations/byte_character.cpp
       new_feature/my_file.cpp          # ← Add here
   ```
3. Rebuild:
   ```bash
   make reconfigure
   make build
   ```

### Debugging Build Issues

```bash
# See full build output
make build 2>&1 | tee build.log

# Check CMake configuration
cat build/CMakeCache.txt | grep -i byte

# Check compilation database
cat build/compile_commands.json | grep main.cpp
```

---

## Architecture Notes

- **Bootloader**: ESP32-C6 default (built from ESP-IDF)
- **Partition Table**: Single app (main firmware only)
- **Application**: Spans all BYTE MINI apps and services
- **Arduino Layer**: Provides setup()/loop() → app_main() glue
- **FreeRTOS**: Provides task scheduling (display, input, system tasks)
- **LovyanGFX**: Display driver (SPI TFT)
- **LVGL**: Optional (included in dependencies)

---

## File Manifest

### Build System Files (Fixed)
- ✅ `CMakeLists.txt` - Root build configuration
- ✅ `main/CMakeLists.txt` - Main component registration
- ✅ `sdkconfig` - Target configuration (esp32c6)
- ✅ `Makefile` - Build targets
- ✅ `build.sh` - Build script (native/docker selection)
- ✅ `Dockerfile.build` - Docker build image

### Application Files (Untouched)
- ✅ `main/main.cpp` - Application entry point
- ✅ `main/animations/` - BYTE character animation
- ✅ `main/drivers/` - Display, touch, power management
- ✅ `main/services/` - Audio, system, network services
- ✅ `main/ui/` - User interface manager
- ✅ `main/apps/` - 11 applications (Dashboard, Settings, WiFi, etc.)
- ✅ `main/config/` - Pin and color configuration

### Documentation (New)
- 📄 `BUILDFIX_REPORT.md` - Detailed fix documentation
- 📄 `BUILD_INSTRUCTIONS.md` - This file

---

## Support

For issues with ESP-IDF specifically:
- [ESP-IDF Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/)
- [ESP32-C6 Reference Manual](https://www.espressif.com/sites/default/files/documentation/esp32-c6_datasheet_en.pdf)

For BYTE MINI application issues:
- Check `main/apps/` directory
- Review `main/services/` for system functionality
- Examine `main/drivers/display.h` for display API

---

## Success Criteria

Build is successful when you see:

```
✓ Configuration successful
✓ Compilation reached compiler stage (riscv32-esp-elf-gcc)
✓ Bootloader binary generated
✓ Partition table generated
✓ Application .bin file generated
✓ Application .elf file generated

╔═══════════════════════════════════════════════════════════╗
║          BUILD SUCCESSFUL - READY TO FLASH                ║
╚═══════════════════════════════════════════════════════════╝
```

Device success when you see:

```
ESP-IDF v5.3
...
I (123) main: Starting BYTE MINI 4.0
I (234) display: Initialized
I (345) touch: Ready
...
[BYTE character visible on display with animation]
```
