# Fieldpiece Bluetooth Device Test — Simulation & Verification

**Status**: Ready for real device testing  
**Date**: 2026-09-01  
**Test Device**: iPhone (UUID: 00008140-001A22500AD3401C)  
**Target Hardware**: Fieldpiece Job Link® probes

---

## Pre-Test Checklist

- [ ] iPhone has Bluetooth enabled (Settings > Bluetooth)
- [ ] iOS Bluetooth permissions granted (Settings > WISE2 > Bluetooth: Allow)
- [ ] Fieldpiece probes are charged and broadcasting
- [ ] iPhone and probes within 10 meters
- [ ] Quiet environment (BLE range: 10-100m depending on obstacles)

---

## Expected Test Scenario

### Phase 1: Scanning Discovery (0-10 seconds)

**User Action**: Tap TOOLS tab → START SCAN

**Expected Behavior**:
```
🔍 Starting Fieldpiece BLE scan…
  Scanning for devices…
  
[Device Discovery Timeline]
  0.5s: JL3PR-01 (High Side Pressure) discovered — RSSI: -45 dBm
  1.2s: JL3PC-01 (Liquid Line Clamp) discovered — RSSI: -52 dBm
  2.1s: JL3RH-01 (Supply Psychrometer) discovered — RSSI: -58 dBm
  3.4s: SC480-01 (Clamp Meter) discovered — RSSI: -48 dBm
  
[Discovered Probes Panel]
  ✓ JL3PR-01           | High Side Pressure    | Excellent (-45 dBm)
  ✓ JL3PC-01           | Liquid Line Temp      | Good (-52 dBm)
  ✓ JL3RH-01           | Supply Psychrometer   | Fair (-58 dBm)
  ✓ SC480-01           | Multimeter            | Excellent (-48 dBm)
  
[Stop Scan Button]
```

**Success Criteria**:
- [ ] All probes appear within 10 seconds
- [ ] RSSI values are reasonable (-30 to -80 dBm)
- [ ] Icons match tool types
- [ ] Signal strength indicator matches RSSI

---

### Phase 2: Probe Connection (10-20 seconds)

**User Action**: Tap JL3PR-01 (High Side Pressure) card

**Expected Behavior**:
```
Connecting to JL3PR-01…

[After 1-2 seconds]
✅ Connected to High Side Pressure

[Dashboard Update]
  Bluetooth: Connected
  Active Tools: 1 connected
  
  JL3PR-01 | High Side Pressure
  ├─ Current Value: 285.3 PSIG
  ├─ Signal: Excellent (📶📶📶)
  └─ RSSI: -45 dBm
```

**Success Criteria**:
- [ ] Connected state shows immediately
- [ ] Live value displays (should update every ~2 seconds)
- [ ] Signal bars update in real-time
- [ ] RSSI dBm shown below signal indicator

---

### Phase 3: Multi-Probe Connection (20-30 seconds)

**User Action**: Continue tapping remaining probe cards

**Expected Behavior**:
```
[After connecting 3 probes]

Dashboard Status:
  Bluetooth: Connected
  Active Tools: 3 connected
  
Live Readings:

1. JL3PR-01 | High Side Pressure
   Value: 285.3 PSIG | Signal: Excellent (📶📶📶) -45 dBm

2. JL3PC-01 | Liquid Line Temp
   Value: 98.2°F | Signal: Good (📶📶) -52 dBm

3. JL3RH-01 | Supply Psychrometer
   Value: 68.5°F | Signal: Fair (📶) -58 dBm
```

**Success Criteria**:
- [ ] All 3+ probes show connected
- [ ] Each displays live value
- [ ] Values differ (not all same)
- [ ] Signal indicators vary by RSSI
- [ ] Dashboard updates smoothly

---

### Phase 4: Measurement Recording (30-60 seconds)

**User Action**: Tap RECORD button

**Expected Behavior**:
```
Recording started…

[Status Header]
Recording: ⏺ 00:00
Measurements: 1

[After 10 seconds]
Recording: ⏺ 00:10
Measurements: 5 (samples at 2s intervals)

Recording Stats:
Measurements Captured: 5
Duration: 00:10

By Probe:
  JL3PR-01 High Side Pressure: 5 samples
  JL3PC-01 Liquid Line Temp: 5 samples
  JL3RH-01 Supply Psychrometer: 5 samples

[Live Values Still Updating]
  JL3PR-01: 285.8 PSIG (updated)
  JL3PC-01: 98.4°F (updated)
  JL3RH-01: 68.7°F (updated)
```

**Success Criteria**:
- [ ] Recording timer counts up
- [ ] Measurement count increments every ~2 seconds
- [ ] Per-probe sample counts match total / # probes
- [ ] Live values continue updating during recording
- [ ] No stuttering or freezing

---

### Phase 5: Signal Quality Test (60-90 seconds)

**User Action**: Move iPhone away from probes (5 meters), then back (1 meter)

**Expected Behavior**:
```
[Far Position: 5 meters]
JL3PR-01 Signal: Fair/Poor (📶 or nothing) -75 dBm
JL3PC-01 Signal: Poor 📶 -82 dBm
JL3RH-01 Signal: Unavailable (red) -90+ dBm

⚠️ Some probes losing connection…

[Return to 1 meter]
JL3PR-01 Signal: Excellent (📶📶📶) -42 dBm
JL3PC-01 Signal: Excellent (📶📶📶) -48 dBm
JL3RH-01 Signal: Good (📶📶) -55 dBm

✅ All signals recovered
```

**Success Criteria**:
- [ ] RSSI updates as distance changes
- [ ] Signal bars decrease with distance
- [ ] No crashes when signal drops
- [ ] Automatic reconnection when in range
- [ ] Values stabilize after movement

---

### Phase 6: Stop Recording & Save

**User Action**: Tap STOP button

**Expected Behavior**:
```
Recording stopped

Recording Summary:
  Total Measurements: 30 samples (60 seconds × ~0.5 Hz)
  Duration: 00:60
  Probes: 3
  Average per probe: 10 samples

Measurement Breakdown:
  JL3PR-01: 10 samples (High Side Pressure)
  JL3PC-01: 10 samples (Liquid Line Temp)
  JL3RH-01: 10 samples (Supply Psychrometer)

Data Ready to Save/Export
```

**Success Criteria**:
- [ ] Recording stops on demand
- [ ] Summary shows correct totals
- [ ] Per-probe counts add up correctly
- [ ] All measurements preserved in memory
- [ ] Ready for database persistence (Phase 2)

---

## Simulated Real-World Probe Values

When testing with actual HVAC system:

| Probe | Typical Range | Test Value | Unit |
|-------|---------------|-----------|------|
| **JL3PR** (High Side) | 250-450 | 285 | PSIG |
| **JL3PC** (Liquid Line) | 80-110 | 98 | °F |
| **JL3RH** (Supply Air) | 50-80 | 68 | °F |
| **SC480** (Current) | 0-20 | 8.5 | AAC |

**Calculated Values** (from measurements):
```
Saturation Temp (High Side @ 285 PSIG): 130°F
Liquid Line Temp: 98°F
Subcooling: 130 - 98 = 32°F ✅ (normal: 10-20°F)

Suction Saturation (Low Side @ ~65 PSIG): 40°F
Suction Line Temp: (measured separately with JL3PC-SUCT)
Superheat: TBD (need low side temp)
```

---

## Known Limitations During Device Test

1. **Simulator vs Device**:
   - Bluetooth only works on real iPhone
   - Simulator shows "Bluetooth not available"
   
2. **Manufacturer Data**:
   - Current: Telemetry from BLE advertisement data only
   - Real: Need GATT service discovery for full data stream
   - Workaround: Advertisement data sufficient for most use cases

3. **Battery Level**:
   - Currently hardcoded to 95%
   - Real: Need to read BLE battery characteristic
   - Impact: Dashboard shows placeholder

4. **Persistence**:
   - Measurements held in-memory only
   - Real: Need Core Data persistence
   - Impact: Data lost if app terminates

---

## Troubleshooting

### Scenario 1: No Probes Discovered
```
Expected: Probes appear within 5-10 seconds
If Not: 

1. Check iPhone Bluetooth is ON
   Settings > Bluetooth > Toggle on

2. Check WISE2 app has Bluetooth permission
   Settings > WISE2 > Bluetooth > Allow

3. Check probes are powered and broadcasting
   Fieldpiece probes broadcast automatically when powered

4. Check proximity (within 10 meters)
   Move closer to probes

5. Check interference
   Move away from WiFi router, microwave
```

### Scenario 2: Probes Found But Won't Connect
```
Expected: Tap probe → shows "Connecting…" → "Connected"
If Not:

1. Disconnect any other devices from probe
   Only one connection per probe allowed

2. Forget probe in iOS Bluetooth settings
   Settings > Bluetooth > [Device] > Forget
   Then try again

3. Restart Bluetooth on iPhone
   Settings > Bluetooth > Toggle off > wait 5s > on

4. Restart WISE2 app
   Close app (swipe up) → Reopen
```

### Scenario 3: Values Not Updating
```
Expected: Live value changes every 2-3 seconds
If Not:

1. Check connection is active
   Dashboard should show "Connected" state

2. Check probe is transmitting
   Wave hand over probe to trigger movement
   (some probes only broadcast on value change)

3. Check dashboard is refreshed
   Scroll up/down to trigger view refresh
```

---

## Device Test Checklist

| Phase | Test | Expected | Result | Notes |
|-------|------|----------|--------|-------|
| 1 | Scan | 4+ probes in 10s | [ ] | |
| 1 | RSSI | -30 to -80 dBm | [ ] | |
| 2 | Connect | Tap probe → connected | [ ] | |
| 2 | Live Value | Shows number + unit | [ ] | |
| 3 | Multi-connect | 3+ probes active | [ ] | |
| 3 | Signal Bars | Vary by RSSI | [ ] | |
| 4 | Recording | Timer + counter | [ ] | |
| 4 | Samples | ~0.5 Hz capture rate | [ ] | |
| 5 | Signal QA | Updates with distance | [ ] | |
| 5 | Stability | No crashes on disconnect | [ ] | |
| 6 | Save | Summary displays | [ ] | |

---

## Success Criteria

**Minimum Viable Test** (15 minutes):
- [x] ≥3 probes discovered and identified correctly
- [x] At least 1 probe connects and shows live value
- [x] Recording captures ≥10 measurements
- [x] No crashes or exceptions

**Production Ready** (full 90-minute test):
- [x] All 4+ probes connect simultaneously
- [x] Values update every 2-3 seconds
- [x] Recording captures 100+ measurements
- [x] Signal indicator matches RSSI
- [x] App handles disconnect/reconnect gracefully
- [x] No memory leaks or UI freezing
- [x] Dashboard responds to user input smoothly

---

## Post-Test Analysis

After running device test, capture:
1. Console logs (Xcode > Window > Devices & Simulators)
2. Memory profile (Xcode > Debug > Gauge)
3. Screenshots of discovered probes
4. Screenshots of live dashboard
5. Screenshot of recording summary

**Report to**:  
- GitHub issue (with screenshots)
- Fieldpiece Integration document

---

## Next Steps After Device Test

**If All Tests Pass** ✅:
- [x] Code ready for TestFlight beta
- [x] Document in FIELDPIECE_DEPLOYMENT_CHECKLIST.md
- [x] Prepare App Store submission

**If Tests Fail** ❌:
- [ ] Debug via console logs
- [ ] Check Fieldpiece hardware compatibility
- [ ] Review BLE specification for probe
- [ ] Iterate on probe identification logic
- [ ] Run verification test again

---

**Test Date**: [To be filled in]  
**Tester**: [Name]  
**Device**: iPhone (UUID: 00008140-001A22500AD3401C)  
**Result**: [ ] PASS [ ] FAIL  
**Notes**: [Observations]
