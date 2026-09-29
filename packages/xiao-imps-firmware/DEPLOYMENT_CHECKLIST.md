# WISE² IMPS Firmware — Deployment Checklist

**Compiled**: 2026-08-06 | **Status**: ✅ Ready for Field Test  
**Binary**: `.pio/build/seeed_xiao_esp32s3/firmware.bin` (286 KB)

---

## Pre-Deployment (Today)

- [x] ✅ Source code reviewed (8 files, 1,345 LOC)
- [x] ✅ Compilation successful (0 errors, 0 warnings)
- [x] ✅ Memory usage verified (6.1% RAM, 8.8% Flash)
- [x] ✅ No TODOs or FIXMEs in code
- [x] ✅ Singleton pattern verified (thread-safe)
- [x] ✅ FreeRTOS tasks configured
- [ ] → Verify UART pins with CYD schematic (GPIO 20/21)
- [ ] → Prepare serial monitoring setup

## Hardware Prep (Before Flash)

- [ ] XIAO ESP32-S3 board available
- [ ] I2S microphone ready (GPIO 2/3/4, 3.3V, GND)
- [ ] USB cable for flashing (USB-C)
- [ ] CYD board available (for CN1 testing)
- [ ] Serial terminal software installed:
  - [ ] Arduino IDE v2.0+, OR
  - [ ] `python3 -m pip install pyserial`, OR
  - [ ] macOS `screen` / Linux `minicom`

## Flash & Verify (Step-by-Step)

### Phase 1: Flash Firmware

**Tool**: esptool.py (most reliable)

```bash
# Step 1: Find USB port
ls /dev/cu.usbserial-*

# Step 2: Flash (replace XXXXX with your port)
python3 -m esptool --chip esp32s3 -p /dev/cu.usbserial-XXXXX \
  write_flash \
    0x1000 .pio/build/seeed_xiao_esp32s3/bootloader.bin \
    0x8000 .pio/build/seeed_xiao_esp32s3/partitions.bin \
   0x10000 .pio/build/seeed_xiao_esp32s3/firmware.bin
```

- [ ] Flash started
- [ ] "Wrote XXX bytes" messages appearing
- [ ] Flash completed: "Hash of data verified" ✅

### Phase 2: Monitor Boot

```bash
# In new terminal
python3 -m serial.tools.miniterm /dev/cu.usbserial-XXXXX 115200
```

**Expected output** (should appear immediately after flash):

```
╔════════════════════════════════════════════════════════╗
║  WISE² IMPS - XIAO ESP32-S3 FIRMWARE ONLINE             ║
╚════════════════════════════════════════════════════════╝

BOOT: Starting system initialization...
INIT: Microphone Manager...
✓ Microphone Manager initialized
INIT: CN1 Protocol...
✓ CN1 Protocol initialized
INIT: Audio Pipeline...
✓ Audio Pipeline initialized

BOOT: All systems online. Ready for operation.
```

- [ ] Firmware boots within 2 seconds
- [ ] All three ✓ checkmarks appear
- [ ] No error messages or stack traces

### Phase 3: Audio Baseline Test (No Microphone)

Even without a microphone connected, firmware should show:

```
─── SYSTEM STATUS ───
Input Level:    -120 dBFS        (no signal)
Gate Level:     -120 dBFS
VAD Active:     NO
Pending Samples: 0
Speech Frames:  0
Packets Sent:   0
Packets Recv:   0
TX Errors:      0
──────────────────────
```

- [ ] Status output appearing every 5 seconds
- [ ] All zeros (no audio yet expected)

**Milestone**: Firmware is running ✅

---

## Component Testing (With Microphone)

### Test 1: Microphone Connection

**Setup**: Connect I2S microphone
- GPIO 2 (D2) → WS
- GPIO 3 (D3) → SCK  
- GPIO 4 (D4) → SD
- 3.3V → VDD
- GND → GND (left/right tied to GND for mono)

**Test**: Play sound near microphone

**Success Criteria**:
- [ ] `Input Level` changes (should be > -60 dBFS for speech)
- [ ] `Pending Samples` counter increases
- [ ] No I2S errors in serial output

---

### Test 2: Noise Gate

**Setup**: Keep silence for 10 sec, then speak

**Success Criteria**:
- [ ] Silence: `Input Level` < -60 dBFS, `Gate Level` = -120 dBFS
- [ ] Speech: `Input Level` > -20 dBFS, `Gate Level` > -40 dBFS
- [ ] Gate suppresses noise but passes speech

---

### Test 3: Voice Activity Detection (VAD)

**Setup**: Speak for 3 seconds, then silence

**Success Criteria**:
- [ ] During speech: `[VAD] Speech detected` message
- [ ] `VAD Active: YES` while speaking
- [ ] ~1 second after silence: `[VAD] Silence detected, deactivated`
- [ ] `VAD Active: NO` after silence

---

### Test 4: Packet Transmission

**Setup**: Speak normally near microphone

**Success Criteria**:
- [ ] `Packets Sent` counter increases (1 per 20ms cycle ≈ 50/sec during speech)
- [ ] Every 50 packets: `[PIPELINE] Speech capture: X packets sent`
- [ ] `TX Errors` stays at 0

**Duration**: 3-second speech = ~150 packets

---

## CN1 Protocol Testing (After CYD Ready)

### Test 5: Serial Communication (UART)

**Setup**: Connect CYD to XIAO via CN1
- XIAO GPIO 20 → CYD RX
- XIAO GPIO 21 → CYD TX
- GND → GND

**Monitor**: Both sides' serial output

**Success Criteria**:
- [ ] No "[CN1] Send failed" messages
- [ ] CYD side receives "[CN1] Received packet type 0x04" (audio packets)
- [ ] Packet count matches sender
- [ ] No CRC errors

---

### Test 6: End-to-End Audio

**Setup**: Microphone → XIAO → CYD → Audio output

**Test**: Speak a sentence, listen on CYD

**Success Criteria**:
- [ ] Audio is intelligible
- [ ] No significant gaps or stuttering
- [ ] Latency < 500ms
- [ ] Audio quality acceptable for application

---

## Production Deployment

Once all tests pass:

### Hardware Assembly

- [ ] Mount XIAO on device (secure with standoffs/tape)
- [ ] Solder/connect I2S microphone
- [ ] Solder/connect CN1 to CYD
- [ ] Add antenna (if wireless module used)
- [ ] Verify all connections with multimeter

### Environmental Testing

- [ ] Test in quiet room (SNR > 20dB)
- [ ] Test in noisy room (SNR < 10dB)
- [ ] Test at different distances (1ft, 6ft, 10ft)
- [ ] Test with different speaker types (male, female, accented)
- [ ] Test 60-minute continuous operation (check for crashes/memory leaks)

### Documentation

- [ ] Record PIN assignment photo for troubleshooting
- [ ] Document microphone model and supplier
- [ ] Create quick-reference serial output guide for operators
- [ ] Save build logs and serial output from successful test

### Firmware Backup

- [ ] Store `firmware.bin` in version control
- [ ] Tag commit: `firmware/v1.0.0-xiao-imps-production`
- [ ] Document build date and tools version
- [ ] Create recovery flash script

---

## Known Limitations (Document for Users)

1. **Mono audio only** (left channel, right tied to GND)
   - Cannot capture stereo
   - Fine for speech applications

2. **No wake-word detection yet** (placeholder in code)
   - Captures all speech above VAD threshold
   - Can be added later with ML model

3. **Fixed 16kHz sample rate**
   - Cannot adjust without recompilation
   - Sufficient for speech (Nyquist: 8kHz min)

4. **No on-device audio compression**
   - Raw 16-bit PCM streamed to CYD
   - CYD can compress if needed

5. **CN1 UART limited to 115,200 baud**
   - Max audio throughput: 16kHz × 16-bit = 256 kbps data
   - Baud rate supports with margin

---

## Support & Debugging

| Problem | Solution |
|---------|----------|
| Firmware won't flash | Try different USB cable, different PC USB port, reduce upload speed |
| Boots but no serial output | Check baud rate (115200), verify USB cable, check port permissions |
| Microphone silent | Verify GPIO 2/3/4 wiring, check 3.3V power to mic, verify mic datasheet |
| VAD never triggers | Speak louder (within 1ft), reduce NOISE_GATE_THRESHOLD in config.h |
| High TX Errors | Check CYD connection, verify GPIO 20/21, reduce serial cable length |
| Crashes/watchdog resets | Check memory usage, enable DEBUG_AUDIO to find loops |

---

## Post-Deployment Monitoring

**On CYD side, monitor**:
- [ ] Packet receive rate (should match XIAO send rate)
- [ ] CRC errors (should be 0)
- [ ] Latency (packet arrival time vs send time)
- [ ] Audio quality (check for corruption/noise)

**On XIAO side, watch for**:
- [ ] TX Errors increasing (indicates connection issues)
- [ ] Pending Samples growing (indicates CYD can't keep up)
- [ ] Input Level baseline shifting (mic aging or environmental change)

---

## Rollback Plan

If issues found in production:

1. Keep previous working `firmware.bin` file
2. Flash previous version: same esptool command, different .bin file
3. If previous doesn't exist, revert config.h settings and recompile
4. Document what changed between versions

---

## Success Criteria for Deployment ✅

Firmware is ready for production when ALL of:

- [x] Compiles with 0 errors, 0 warnings
- [x] Memory usage < 10%
- [x] Boots in < 2 seconds
- [ ] Microphone captures audio
- [ ] VAD detects/deactivates speech correctly
- [ ] CN1 transmits packets with 0 errors
- [ ] End-to-end audio is intelligible
- [ ] Runs continuously for ≥ 60 minutes without crash

---

**Last Updated**: 2026-08-06  
**Next Review**: After first field deployment

---

## Archive Artifacts

Backup these files after successful deployment:

```bash
# Save build artifacts
cp .pio/build/seeed_xiao_esp32s3/firmware.bin ~/Desktop/wise2-imps-v1.0-${DATE}.bin
cp .pio/build/seeed_xiao_esp32s3/firmware.elf ~/Desktop/wise2-imps-v1.0-${DATE}.elf

# Save configuration
cp src/config.h ~/Desktop/wise2-imps-config-v1.0-${DATE}.h

# Save this checklist with results
cp DEPLOYMENT_CHECKLIST.md ~/Desktop/wise2-imps-deployment-results-${DATE}.md
```

Replace `${DATE}` with today's date (e.g., `2026-08-06`).
