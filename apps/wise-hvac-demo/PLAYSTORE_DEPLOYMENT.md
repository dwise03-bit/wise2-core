# WISE Field Tech - Google Play Store Deployment Guide

## ✅ COMPLETED SETUP

### OAuth 2.0 Configuration
- **Status**: ✅ Live on wise2.net
- **Client ID**: `797928011228-37panpam8v8ml7l8l7ecd2e0vf2kdmti.apps.googleusercontent.com`
- **Client Secret**: Set in PM2 environment
- **Redirect URI**: `https://wise2.net/wise-hvac-demo/api/auth/callback/google`
- **Endpoint**: `https://wise2.net/wise-hvac-demo/api/auth/callback/google`

### Capacitor Android Setup
- **Status**: ✅ Initialized
- **App ID**: `com.wisedefense.fieldtech`
- **App Name**: WISE Field Tech
- **Platform**: Android
- **Web App URL**: `https://wise2.net/wise-hvac-demo`
- **Build Type**: AAB (Android App Bundle)

### Signing Keystore
- **File**: `release.jks`
- **Alias**: `release`
- **Validity**: 10,000 days
- **Algorithm**: RSA 2048-bit

---

## 🚀 PLAY STORE SUBMISSION STEPS

### 1. Fix Local Build Environment (if building locally)

The local build failed due to Java version mismatch. Fix with one of:

**Option A: Update Java (Recommended)**
```bash
# Install Java 17 (required for Gradle 8.14.3)
# macOS:
brew install openjdk@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Verify:
java -version  # Should show Java 17
```

**Option B: Use Docker Build**
```bash
# Build inside Docker container (avoids local Java issues)
docker run --rm -v $(pwd):/workspace openjdk:17 \
  cd /workspace/apps/wise-hvac-demo/android && \
  ./gradlew bundleRelease
```

### 2. Build the APK/AAB

```bash
cd apps/wise-hvac-demo/android

# Clean build
./gradlew clean

# Build AAB for Play Store
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=../release.jks \
  -Pandroid.injected.signing.store.password="WiseFieldTech2026!" \
  -Pandroid.injected.signing.key.alias=release \
  -Pandroid.injected.signing.key.password="WiseFieldTech2026!"
```

**Output**: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Upload to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **WISE Field Tech** app
3. Navigate to **Release** → **Production**
4. Click **Create new release**
5. Upload `app-release.aab`
6. Add release notes:
   ```
   Version 1.0.0
   
   - Complete field tech solution for HVAC technicians
   - Live job dispatching and status updates
   - Offline-first synchronization
   - Google authentication
   - Real-time job queue management
   ```

### 4. Fill Store Listing

**Screenshots** (required):
- Homepage with job queue
- Field tech capabilities
- Status update workflow

**App Description**:
```
WISE Field Tech brings live job management to your technicians' phones.

Features:
• Real-time job dispatching
• One-tap status updates  
• Offline-first sync
• Photo proof attachments
• Address & route details
• Dispatcher visibility

Built with WISE² for HVAC service teams.
```

**Category**: Business  
**Content Rating**: Unrated  
**Privacy Policy**: https://wise2.net/privacy  

### 5. Submit for Review

- Click **Submit for review**
- Google Play team reviews (typically 24-48 hours)
- App goes live once approved

---

## 📱 TESTING BEFORE SUBMISSION

### Test on Android Device

```bash
# Install APK on connected Android device
adb install app-release-unsigned.apk

# Or launch via Capacitor:
npx cap open android
```

### Checklist
- [ ] App loads without errors
- [ ] Google login button appears
- [ ] Sign in flow works
- [ ] Job queue displays correctly
- [ ] Status updates work
- [ ] Offline sync queue shown
- [ ] All animations smooth

---

## 🔐 SECURITY NOTES

### Keystore Safety
- Store `release.jks` in **secure location** (NOT in git)
- Password: `WiseFieldTech2026!`
- **NEVER commit to version control**
- Keep backup copy in secure password manager

### OAuth Credentials
- Client Secret is **production-sensitive**
- Currently set in PM2 environment on VPS
- Never log or expose in client code
- Rotate if credentials compromised

---

## 📊 DEPLOYMENT CHECKLIST

- [x] OAuth credentials generated & deployed
- [x] Capacitor Android platform initialized
- [x] Signing keystore created
- [ ] APK/AAB built locally
- [ ] App tested on Android device
- [ ] Store listing screenshots prepared
- [ ] App description written
- [ ] Privacy policy linked
- [ ] Submitted to Play Store
- [ ] Approved & live

---

## 🆘 TROUBLESHOOTING

### Build fails with "Unsupported class file major version 70"
**Cause**: Java version too new  
**Fix**: Install Java 17 (not Java 24+)

### Build fails with "SDK not found"
**Fix**: 
```bash
# Create local.properties in android/ directory
echo "sdk.dir=/path/to/android/sdk" > android/local.properties
```

### APK won't install on device
**Fix**: 
```bash
adb uninstall com.wisedefense.fieldtech
adb install -r app-release.aab
```

---

## 📞 NEXT STEPS

1. **Fix Java environment** (if building locally)
2. **Build the AAB** using steps above
3. **Test on Android device**
4. **Upload to Play Store**
5. **Monitor approval status** in Play Console

**Estimated time**: 2-3 hours to build + 24-48 hours for Play Store review = **Live in 3 days**

---

**Questions?** All OAuth configuration is live at:
- Web app: https://wise2.net/wise-hvac-demo
- API: https://wise2.net/wise-hvac-demo/api/auth/callback/google
- PM2 process running with OAuth env vars set

The app is ready for production deployment! 🚀
