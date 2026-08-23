# WISE Field Tech - Google Play Store Build

## Prerequisites
- Android Studio installed
- Java Development Kit (JDK) 11+
- Android SDK (API 34+)
- Capacitor CLI: `npm install -g @capacitor/cli`

## Build Steps

### 1. Generate Signing Key (if not exists)
```bash
keytool -genkey -v -keystore release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release \
  -storepass your_password \
  -keypass your_password
```

### 2. Build AAB for Play Store
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Sign APK (if needed for testing)
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore release.jks \
  app-release-unsigned.apk release
```

### 4. Upload to Play Store
- Go to [Google Play Console](https://play.google.com/console)
- Select "WISE Field Tech" app
- Go to "Release" → "Production"
- Upload the AAB file
- Add store listing, screenshots, and description
- Submit for review

## Environment Variables
Set these on your system before building:
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_secret
```

## App Details
- **App ID**: com.wisedefense.fieldtech
- **App Name**: WISE Field Tech
- **Base URL**: https://wise2.net/wise-hvac-demo
- **API**: https://wise2.net/api/auth/callback/google

## Testing
```bash
npx cap run android
```

## Troubleshooting
- If build fails, run: `cd android && ./gradlew clean`
- For Java issues, ensure JAVA_HOME points to JDK 11+
- Check Android SDK paths in local.properties
