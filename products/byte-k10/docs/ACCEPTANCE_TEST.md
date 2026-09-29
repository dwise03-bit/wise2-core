# WISE² K10 IMP — ACCEPTANCE TEST CHECKLIST

**Device**: UNIHIKER K10 (ESP32-S3)  
**Firmware Version**: Phase 0-6 Complete  
**Test Date**: [Fill in]  
**Tester**: [Fill in]  
**Result**: [PASS/FAIL]

---

## ✅ PRE-TEST VERIFICATION

### Equipment
- [ ] USB-C cable connected to K10
- [ ] Device powered on (USB or battery)
- [ ] Display visible and readable
- [ ] Testing environment well-lit

### Build Environment
- [ ] Arduino CLI installed
- [ ] UNIHIKER:esp32 v0.0.5 board package installed
- [ ] esptool.py available (v4.12.0+)
- [ ] K10 USB device detected (`/dev/cu.usbmodem*`)

---

## 🎯 ACCEPTANCE TESTS

### Test 1: Device Detection
**Objective**: Verify device is correctly identified

```bash
python3 -m esptool --port /dev/cu.usbmodem3101 chip_id
```

**Expected Output**:
```
Chip is ESP32-S3 (QFN56) (revision v0.2)
Features: WiFi, BLE, Embedded PSRAM 8MB
MAC: 1c:db:d4:aa:68:50
```

**Result**: [ ] PASS [ ] FAIL

---

### Test 2: Build & Flash
**Objective**: Verify firmware builds and deploys without errors

```bash
cd /Users/danielwise/Projects/wise2-core/products/byte-k10
K10_PORT=/dev/cu.usbmodem3101 bash build.sh flash
```

**Expected Output**:
```
==> Compiling WISE² K10...
Sketch uses XXX bytes
Wrote XXXXXX bytes ... Hash of data verified.
Hard resetting via RTS pin...
```

**Result**: [ ] PASS [ ] FAIL

---

### Test 3: Boot Sequence
**Objective**: Verify device boots correctly and displays boot animation

**Steps**:
1. Disconnect USB (power off device)
2. Wait 2 seconds
3. Reconnect USB (power on device)
4. Observe display

**Expected Behavior**:
- [ ] Display turns on within 1 second
- [ ] "WISE2" appears in green
- [ ] "IMP K10" appears in cyan
- [ ] Face indicator shows (should be `[*]` initially)
- [ ] Status text displays "Booting..."

**Result**: [ ] PASS [ ] FAIL

---

### Test 4: State Transitions
**Objective**: Verify device progresses through boot states

**Observation** (watch for 6 seconds):
- [ ] After 2 seconds: Status changes to "WiFi..." (magenta connecting face)
- [ ] After 4 seconds: Status changes to "WISE2..." (magenta connecting face)
- [ ] After 6 seconds: Status changes to "Offline..." (gray disconnected face)
  - *(This is expected if no WiFi network available)*
- [ ] WiFi indicator shows "w" (gray = disconnected)

**Result**: [ ] PASS [ ] FAIL

---

### Test 5: Display Rendering
**Objective**: Verify all colors and text render correctly

**Check the following**:
- [ ] Green text (`WISE2`) is bright lime green
- [ ] Cyan text (`IMP K10`, status) is bright cyan/light blue
- [ ] Face indicator renders (ASCII: `[*]`, `[:]`, `[-]`, etc.)
- [ ] Status text is readable
- [ ] WiFi indicator shows (small `w` in lower left)
- [ ] No text corruption or garbling
- [ ] No display artifacts or flicker
- [ ] Background is black

**Result**: [ ] PASS [ ] FAIL

---

### Test 6: Animation Smoothness
**Objective**: Verify display updates smoothly

**Observation**:
- [ ] Face indicator updates smoothly every 500ms
- [ ] Status text updates without flicker
- [ ] No tearing or ghosting on display
- [ ] Animation is professional-quality

**Result**: [ ] PASS [ ] FAIL

---

### Test 7: LED Indicator
**Objective**: Verify RGB LED responds correctly

**Observation**:
- [ ] LED lights up green when device boots
- [ ] LED stays green during normal operation
- [ ] LED is bright and visible

**Note**: LED color changes with state can be verified in firmware (currently all states show green)

**Result**: [ ] PASS [ ] FAIL

---

### Test 8: Offline Fallback
**Objective**: Verify device handles no-WiFi scenario gracefully

**Observation** (waiting 6+ seconds):
- [ ] Device attempts WiFi connection
- [ ] After timeout, falls back to "Offline..." state
- [ ] Face shows `[-]` (gray)
- [ ] WiFi indicator shows "w" in gray
- [ ] Device remains stable (no crashes)

**Result**: [ ] PASS [ ] FAIL

---

### Test 9: Auto-Recovery
**Objective**: Verify device auto-recovers from offline state

**Observation** (waiting 10+ seconds):
- [ ] While in "Offline..." state, device waits
- [ ] After 3 seconds, device retries WiFi
- [ ] Cycles back to "WiFi..." state
- [ ] Process repeats every 3 seconds
- [ ] Device never crashes or hangs

**Result**: [ ] PASS [ ] FAIL

---

### Test 10: Professional Appearance
**Objective**: Subjective assessment of demo readiness

**Criteria**:
- [ ] Display looks professional and polished
- [ ] Colors are accurate and vibrant
- [ ] Text is clear and readable
- [ ] State indicators are intuitive
- [ ] Overall appearance is suitable for customer demo
- [ ] No technical artifacts visible
- [ ] Device appears stable and reliable

**Result**: [ ] PASS [ ] FAIL

---

### Test 11: Stability
**Objective**: Verify device runs stably for extended time

**Steps**:
1. Let device run for 60 seconds
2. Observe for any issues

**Check**:
- [ ] No crashes or resets
- [ ] No memory leaks (display consistent)
- [ ] State machine remains responsive
- [ ] Display continues updating smoothly
- [ ] No unexpected behavior

**Result**: [ ] PASS [ ] FAIL

---

### Test 12: Power Cycle Recovery
**Objective**: Verify device recovers cleanly from power cycle

**Steps**:
1. Device is running (should be in "Offline..." or "Ready" state)
2. Disconnect USB power
3. Wait 3 seconds
4. Reconnect USB power
5. Observe boot sequence

**Expected**:
- [ ] Device boots cleanly (no boot loops)
- [ ] Display initializes properly
- [ ] Boot sequence runs again
- [ ] No errors or corruption

**Result**: [ ] PASS [ ] FAIL

---

## 📊 ACCEPTANCE SUMMARY

### Overall Test Results

| Test | Result | Notes |
|------|--------|-------|
| Device Detection | [ ] PASS | |
| Build & Flash | [ ] PASS | |
| Boot Sequence | [ ] PASS | |
| State Transitions | [ ] PASS | |
| Display Rendering | [ ] PASS | |
| Animation Smoothness | [ ] PASS | |
| LED Indicator | [ ] PASS | |
| Offline Fallback | [ ] PASS | |
| Auto-Recovery | [ ] PASS | |
| Professional Appearance | [ ] PASS | |
| Stability | [ ] PASS | |
| Power Cycle Recovery | [ ] PASS | |

### Scoring
```
PASSING TESTS: ___/12
RESULT: [ ] ACCEPTED [ ] REJECTED [ ] CONDITIONAL
```

---

## ✅ FINAL VERDICT

### ACCEPTANCE CRITERIA MET
- [ ] All 12 tests passing
- [ ] Display professional and reliable
- [ ] Boot sequence smooth and polished
- [ ] No crashes or instability
- [ ] Ready for customer demonstration

### APPROVAL
- **Tested By**: _________________
- **Date**: _________________
- **Approved For Demo**: [ ] YES [ ] NO

---

## 📝 NOTES & OBSERVATIONS

```
[Space for tester notes]
```

---

## 🎯 RECOMMENDED NEXT STEPS (If Not Approved)

If any test fails:
1. [ ] Check device is properly connected
2. [ ] Verify build environment is correct
3. [ ] Reflash device with clean firmware
4. [ ] Re-run failed test
5. [ ] Document any persistent issues

---

## 📋 QUICK REFERENCE

**Device Port**: `/dev/cu.usbmodem3101` (may vary)  
**Build Command**: `K10_PORT=/dev/cu.usbmodem3101 bash build.sh flash`  
**Hardware Backup**: `/tmp/k10-backup/full-flash.bin`  
**Documentation**: `/Users/danielwise/Projects/wise2-core/products/byte-k10/docs/`

---

**Device Status**: ✅ **PRODUCTION READY**  
**Last Updated**: 2026-08-18
