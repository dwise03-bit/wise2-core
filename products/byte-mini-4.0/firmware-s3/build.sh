#!/bin/bash
# BYTE MINI 4.0 - ESP32-C6 Build Script
# Supports both native ESP-IDF and Docker builds

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_METHOD="${1:-auto}"  # auto, native, or docker

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        BYTE MINI 4.0 - ESP32-C6 Build Script             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo

# ============================================================================
# PHASE: Verify Build Configuration
# ============================================================================

echo "=== PHASE 1: Verifying Build Configuration ==="
echo

# Check CMakeLists.txt order
echo -n "✓ Checking root CMakeLists.txt... "
if grep -q "include(\$ENV{IDF_PATH}" "$SCRIPT_DIR/CMakeLists.txt" && \
   ! grep -q "project(" "$SCRIPT_DIR/CMakeLists.txt" | head -1 | grep -q "project"; then
  echo "OK (include before project)"
else
  echo "ERROR: include() must come before project()"
  exit 1
fi

# Check src/ is disabled
echo -n "✓ Checking src/ component status... "
if [ ! -f "$SCRIPT_DIR/src/CMakeLists.txt" ]; then
  echo "OK (disabled)"
else
  echo "ERROR: src/CMakeLists.txt must be disabled"
  exit 1
fi

# Check main/ has Arduino
echo -n "✓ Checking main component... "
if grep -q "arduino" "$SCRIPT_DIR/main/CMakeLists.txt"; then
  echo "OK (Arduino component included)"
else
  echo "ERROR: Arduino component missing from main/CMakeLists.txt"
  exit 1
fi

# Check sdkconfig
echo -n "✓ Checking ESP32-C6 target config... "
if grep -q "CONFIG_IDF_TARGET=\"esp32c6\"" "$SCRIPT_DIR/sdkconfig"; then
  echo "OK (esp32c6 target configured)"
else
  echo "ERROR: ESP32-C6 target not configured in sdkconfig"
  exit 1
fi

echo

# ============================================================================
# METHOD SELECTION
# ============================================================================

if [ "$BUILD_METHOD" = "auto" ]; then
  # Try native first, fall back to docker
  if command -v idf.py &> /dev/null; then
    BUILD_METHOD="native"
    echo "→ Detected native ESP-IDF installation"
  elif command -v docker &> /dev/null; then
    BUILD_METHOD="docker"
    echo "→ Detected Docker, will use container build"
  else
    echo "ERROR: Neither native ESP-IDF nor Docker found"
    echo "Install one of:"
    echo "  1. ESP-IDF: /Users/danielwise/esp/esp-idf/export.sh"
    echo "  2. Docker: brew install docker"
    exit 1
  fi
fi

echo

# ============================================================================
# NATIVE BUILD
# ============================================================================

if [ "$BUILD_METHOD" = "native" ]; then
  echo "=== PHASE 2: Native Build (ESP-IDF v5.3) ==="
  echo

  # Source ESP-IDF environment
  IDF_PATH="${IDF_PATH:-/Users/danielwise/esp/esp-idf}"
  if [ ! -d "$IDF_PATH" ]; then
    echo "ERROR: IDF_PATH not found at $IDF_PATH"
    exit 1
  fi

  echo "Sourcing ESP-IDF environment ($IDF_PATH)..."
  source "$IDF_PATH/export.sh" >/dev/null 2>&1 || true

  # Verify idf.py works
  echo -n "Verifying idf.py... "
  if ! idf.py --version >/dev/null 2>&1; then
    echo "FAILED"
    echo "ERROR: idf.py not working. Try: source $IDF_PATH/export.sh"
    exit 1
  fi
  echo "OK"
  echo

  cd "$SCRIPT_DIR"

  # Step 1: Clean
  echo "Step 1: Cleaning previous build..."
  idf.py fullclean 2>&1 | tail -3 || rm -rf build
  echo

  # Step 2: Set target
  echo "Step 2: Setting target to esp32c6..."
  idf.py set-target esp32c6 2>&1 | tail -3
  echo

  # Step 3: Reconfigure
  echo "Step 3: Configuring CMake..."
  idf.py reconfigure -v 2>&1 | tail -20
  echo

  # Step 4: Verify configuration
  echo "Step 4: Verifying configuration..."
  if [ ! -f "build/project_description.json" ]; then
    echo "ERROR: project_description.json not generated"
    exit 1
  fi
  echo "✓ Configuration successful"
  echo

  # Step 5: Build
  echo "Step 5: Building firmware..."
  echo "(This will take 1-2 minutes on first build)"
  echo
  idf.py build -v 2>&1 | tee build.log | tail -50
  echo

  # Step 6: Verify outputs
  echo "Step 6: Verifying build outputs..."

  EXPECTED_FILES=(
    "build/bootloader/bootloader.bin"
    "build/partition_table/partition-table.bin"
    "build/byte_mini_4.bin"
    "build/byte_mini_4.elf"
  )

  all_found=true
  for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
      size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
      printf "  ✓ %-50s %8d bytes\n" "$(basename $file)" "$size"
    else
      printf "  ✗ %-50s NOT FOUND\n" "$(basename $file)"
      all_found=false
    fi
  done
  echo

  if [ "$all_found" = true ]; then
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║          BUILD SUCCESSFUL - READY TO FLASH                ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo
    echo "Next step: Flash to ESP32-C6"
    echo
    echo "1. Connect ESP32-C6 via USB-C"
    echo "2. Find the serial port:"
    echo "   ls /dev/cu.*"
    echo "3. Flash the device:"
    echo "   idf.py -p /dev/cu.<port> flash monitor"
    echo
  else
    echo "ERROR: Some build outputs are missing"
    exit 1
  fi

# ============================================================================
# DOCKER BUILD
# ============================================================================

elif [ "$BUILD_METHOD" = "docker" ]; then
  echo "=== PHASE 2: Docker Build (espressif/idf:v5.3) ==="
  echo

  # Verify docker
  echo -n "Verifying Docker... "
  if ! docker --version >/dev/null 2>&1; then
    echo "FAILED"
    echo "ERROR: Docker not found. Install with: brew install docker"
    exit 1
  fi
  echo "OK"
  echo

  cd "$SCRIPT_DIR"

  # Build docker image
  echo "Step 1: Building Docker image..."
  docker build -f Dockerfile.build -t byte-mini-build:v5.3 . 2>&1 | tail -20
  echo

  # Run build
  echo "Step 2: Running build in Docker container..."
  docker run --rm -v "$SCRIPT_DIR":/workspace byte-mini-build:v5.3 <<'EOF'
set -e
cd /workspace
idf.py fullclean || rm -rf build
idf.py set-target esp32c6
idf.py reconfigure
idf.py build -v
EOF

  echo
  echo "Step 3: Verifying build outputs..."

  EXPECTED_FILES=(
    "build/bootloader/bootloader.bin"
    "build/partition_table/partition-table.bin"
    "build/byte_mini_4.bin"
    "build/byte_mini_4.elf"
  )

  all_found=true
  for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
      size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
      printf "  ✓ %-50s %8d bytes\n" "$(basename $file)" "$size"
    else
      printf "  ✗ %-50s NOT FOUND\n" "$(basename $file)"
      all_found=false
    fi
  done
  echo

  if [ "$all_found" = true ]; then
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║          BUILD SUCCESSFUL - READY TO FLASH                ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo
    echo "Next step: Flash to ESP32-C6 (from native environment)"
    echo
    echo "1. Connect ESP32-C6 via USB-C"
    echo "2. On macOS, source ESP-IDF first:"
    echo "   source /Users/danielwise/esp/esp-idf/export.sh"
    echo "3. Find the serial port:"
    echo "   ls /dev/cu.*"
    echo "4. Flash the device:"
    echo "   idf.py -p /dev/cu.<port> flash monitor"
    echo
  else
    echo "ERROR: Some build outputs are missing"
    exit 1
  fi

else
  echo "ERROR: Unknown build method: $BUILD_METHOD"
  echo "Usage: $0 [auto|native|docker]"
  exit 1
fi
