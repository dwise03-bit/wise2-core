# BYTE MINI 4.0 Build System — Validation Checklist

**Purpose**: Verify all repairs are in place and system is ready for build

**Estimated Time**: 2-3 minutes

---

## Pre-Build Validation

Run this before attempting to build to ensure all fixes are applied.

### Step 1: Verify CMakeLists.txt Order ✓

```bash
cd /Users/danielwise/Projects/wise2-core/products/byte-mini-4.0/firmware
head -5 CMakeLists.txt
```

**Expected output**:
```
cmake_minimum_required(VERSION 3.16)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)

project(byte_mini_4.0 C CXX ASM)
```

**Check**: Line 3 has `include()`, Line 5 has `project()`  
✅ PASS / ❌ FAIL

---

### Step 2: Verify src/ Component Disabled ✓

```bash
ls -la src/CMakeLists.txt*
```

**Expected output**:
```
-rw-r--r--@ 1 danielwise staff 199 Aug 7 10:00 src/CMakeLists.txt.disabled
```

**Check**: `CMakeLists.txt` renamed to `.disabled`  
✅ PASS / ❌ FAIL

---

### Step 3: Verify Arduino in REQUIRES ✓

```bash
grep "REQUIRES" main/CMakeLists.txt
```

**Expected output**:
```
REQUIRES freertos esp_common esp_system esp_timer driver esp_adc hal arduino
```

**Check**: `arduino` is at the end of REQUIRES  
✅ PASS / ❌ FAIL

---

### Step 4: Verify ESP32-C6 Target ✓

```bash
grep "CONFIG_IDF_TARGET" sdkconfig
```

**Expected output**:
```
CONFIG_IDF_TARGET="esp32c6"
```

**Check**: Target is exactly `esp32c6`  
✅ PASS / ❌ FAIL

---

### Step 5: Verify Build Files Exist ✓

```bash
ls -1 build.sh Makefile Dockerfile.build BUILDFIX_REPORT.md BUILD_INSTRUCTIONS.md
```

**Expected output** (one file per line):
```
build.sh
Makefile
Dockerfile.build
BUILDFIX_REPORT.md
BUILD_INSTRUCTIONS.md
```

**Check**: All 5 files present  
✅ PASS / ❌ FAIL

---

### Step 6: Verify Scripts are Executable ✓

```bash
ls -la build.sh | grep "^-rwx"
```

**Expected output**:
```
-rwx------ ... build.sh
```

**Check**: Executable bit set (x permission)  
✅ PASS / ❌ FAIL

---

## Environment Validation

### Step 7: Verify ESP-IDF Installation ✓

```bash
ls -la /Users/danielwise/esp/esp-idf/tools/cmake/project.cmake
```

**Expected output**:
```
-rw-r--r-- ... project.cmake
```

**Check**: File exists  
✅ PASS / ❌ FAIL

---

### Step 8: Verify Build Tools ✓

```bash
cmake --version && echo "---" && ninja --version
```

**Expected output**:
```
cmake version X.X.X
---
X.X.X
```

**Check**: Both cmake and ninja versions shown  
✅ PASS / ❌ FAIL

---

## Application Code Validation

### Step 9: Verify Source Files Intact ✓

```bash
wc -l main/*.cpp main/*/*.cpp | tail -1
```

**Expected output**:
```
total NNNN
```

(Actual number should be > 5000 lines)

**Check**: All source files present and contain code  
✅ PASS / ❌ FAIL

---

### Step 10: Verify No Accidental Changes ✓

```bash
git status --porcelain | head -20
```

**Expected output** (should show ONLY):
```
?? src/CMakeLists.txt.disabled
?? sdkconfig
?? build.sh
?? Makefile
?? Dockerfile.build
?? BUILDFIX_REPORT.md
?? BUILD_INSTRUCTIONS.md
?? firmware/CHANGES_SUMMARY.txt
?? ../BYTE_MINI_BUILD_SYSTEM_REPAIR.md
?? VALIDATION_CHECKLIST.md
```

(Plus other repo files outside firmware/)

**Check**: Only build files are new, no source code modified  
✅ PASS / ❌ FAIL

---

## Summary

### Validation Results

- [ ] Step 1: CMakeLists.txt order
- [ ] Step 2: src/ disabled
- [ ] Step 3: Arduino in REQUIRES
- [ ] Step 4: ESP32-C6 target
- [ ] Step 5: Build files exist
- [ ] Step 6: Scripts executable
- [ ] Step 7: ESP-IDF installed
- [ ] Step 8: Build tools available
- [ ] Step 9: Source files intact
- [ ] Step 10: No accidental changes

**Result**: All steps passed ✅ SYSTEM READY FOR BUILD

---

## Troubleshooting Validation Failures

### "CMakeLists.txt order FAIL"

**Fix**:
```bash
cd /Users/danielwise/Projects/wise2-core/products/byte-mini-4.0/firmware
# Re-run the CMakeLists.txt fix manually
```

See: `BUILDFIX_REPORT.md` → Phase 2, Issue #1

---

### "src/ not disabled FAIL"

**Fix**:
```bash
mv src/CMakeLists.txt src/CMakeLists.txt.disabled
```

See: `BUILDFIX_REPORT.md` → Phase 2, Issue #2

---

### "Arduino not in REQUIRES FAIL"

**Fix**:
Edit `main/CMakeLists.txt` line 9, add `arduino` at the end:
```cmake
REQUIRES freertos esp_common esp_system esp_timer driver esp_adc hal arduino
```

See: `BUILDFIX_REPORT.md` → Phase 2, Issue #3

---

### "ESP32-C6 target FAIL"

**Fix**:
```bash
# Create sdkconfig file manually:
# See: BUILD_INSTRUCTIONS.md → Step 1-2
```

---

### "Build files missing FAIL"

**Fix**:
These are created by the repair script. Re-run or manually create:
```bash
cp Dockerfile.build.example Dockerfile.build  # or create from BUILDFIX_REPORT.md
```

---

### "Scripts not executable FAIL"

**Fix**:
```bash
chmod +x build.sh
```

---

### "ESP-IDF not installed FAIL"

**Fix**:
```bash
# Install ESP-IDF v5.3
git clone --branch v5.3 https://github.com/espressif/esp-idf.git ~/esp/esp-idf
cd ~/esp/esp-idf
bash install.sh
```

---

### "cmake/ninja missing FAIL"

**Fix**:
```bash
# Install via Homebrew
brew install cmake ninja
```

---

### "Source files missing FAIL"

**CRITICAL**: Do not proceed. Source files must be present.

Check Git:
```bash
git status main/
git log --oneline main/main.cpp | head -5
```

---

## Next Steps

✅ All validation checks passing?

**Proceed to build**:
```bash
cd /Users/danielwise/Projects/wise2-core/products/byte-mini-4.0/firmware
make build          # or ./build.sh or make docker-build
```

See: `BUILD_INSTRUCTIONS.md` → Quick Start

---

## Additional Resources

- `BUILDFIX_REPORT.md` - Technical details of fixes
- `BUILD_INSTRUCTIONS.md` - Build and flash guide
- `CHANGES_SUMMARY.txt` - All changes made
- `Dockerfile.build` - Docker build system
- `build.sh` - Build script source
- `Makefile` - Make targets source

---

**Validation Checklist Version**: 1.0  
**Last Updated**: August 7, 2026  
**Status**: Ready for use
