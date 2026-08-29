# WISE Field Tech — Field Readiness

Last verified: 2026-08-24

## Ready for field pilot

- Native Kotlin/Compose application builds and installs on the Motorola razr 2025.
- Room-backed jobs, notes, reports, and pending-sync records remain available offline.
- CRM/customer records are blank until a real work order is assigned; demo records are explicitly labeled.
- Fieldpiece SM480V pressure/line-temperature advertisement decoding is physically verified.
- Fieldpiece JL3PC pipe clamps 8792 (high/liquid) and 8791 (low/suction) are physically verified.
- Diagnose and IMP consume saved or live Fieldpiece readings from the Android tool path; missing values stay `—` / Not available.
- Fluke 902 FC discovery, GATT connection, battery read, and the physically verified capacitance channel are implemented.
- Unknown or unverified measurement modes remain null; the app never fabricates readings.
- The web field workspace is deployed at `https://wise2.net/wise-hvac-demo/field-tech`.
- The signed sideload APK is downloadable at `https://wise2.net/wise-hvac-demo/download` and its production checksum matches this release.
- APK v1.0.2 starts without simulated jobs or a demo-mode entry point.
- Public HTTPS, HTTP redirect, field jobs API, diagnostic API, session endpoint, and nginx/PM2 service path were verified on 2026-08-24.

## External deployment gates

1. The configured OpenAI key returned `401 invalid_api_key`. Replace it to enable live model responses; the web copilot uses a safety-checked fallback meanwhile.
2. Google Cloud must include `https://wise2.net/wise-hvac-demo/api/auth/callback/google`. Android additionally needs a web client ID and the release certificate SHA fingerprint.
3. The current field-sideload APK is optimized and signed with this workstation's Android debug identity. Create and securely back up a permanent Play App Signing identity before store submission.

## Verified hardware scope

- SM480V: low/high pressure and suction/liquid line temperatures verified from owned hardware.
- JL3PC clamps: signed little-endian tenths-of-a-degree Fahrenheit verified.
- SC480: device identity captured, but live measurements are not shipped because its observed Fieldpiece advertisement did not expose verified readings and standard GATT was rejected.
- Fluke 902 FC: capacitance (`uF`) verified. Other modes remain intentionally unsupported until correlated with physical display values.

## Release command

Load the locally stored signing environment, then run:

```bash
cd apps/fieldtech-android
set -a; source .field-release.env; set +a
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
  ./gradlew testDebugUnitTest assembleRelease bundleRelease
```
