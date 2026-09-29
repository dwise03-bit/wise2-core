# WISE² FieldTech v1.1.0-quest Release Notes

## Build Info
- **Version**: 1.1.0-quest
- **Version Code**: 5
- **APK Size**: 4.62 MB (minified + shrunk)
- **Min SDK**: 29 (Android 10+)
- **Target SDK**: 36 (Android 13+)

## New in This Release
### Design
- ✅ Command Center UI sync: Black background + Neon Green accents
- ✅ Unified design across dashboard and mobile
- ✅ OLED-optimized dark theme
- ✅ Glassmorphic cards with glow effects

### Stability
- ✅ Fixed: VIBRATE permission crash (haptic feedback)
- ✅ Verified: 20+ interaction stress test without crashes
- ✅ Verified: Navigation and back button stability

### Features
- Home screen with job list & quick actions
- Login with Google/Discord SSO
- Navigation to Diagnose, Live Readings, Equipment, IMP Chat
- Offline-first architecture with sync queue
- Bluetooth, Camera, Audio integration ready

## Testing Completed
- ✅ Rapid interaction stress test (20+ taps)
- ✅ Navigation transitions
- ✅ Back button handling
- ✅ Permission verification
- ✅ Device compatibility (API 29-36)

## Known Limitations
- Debug data only (live API integration needed)
- Settings screen structure complete, logic pending
- IMP Chat UI ready, AI backend pending

## Installation
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

## Play Store Submission
- Ready for internal testing track
- Signed with wise2-fieldtech release key
- Minification enabled (R8)
- Resource shrinking enabled

## Next Steps
1. Upload to Play Store Internal Testing
2. Beta test with field technicians
3. Integrate live API endpoints
4. Deploy to Google Play

---
Built: 2026-09-15 | Commit: 281dcbdc | Build Time: 1m 13s
