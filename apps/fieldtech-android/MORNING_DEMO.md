# WISE² Field Tech Morning Demo

## Install

Use `apps/wise-hvac-demo/public/downloads/WISE-FieldTech-latest.apk`.

```bash
adb install -r apps/wise-hvac-demo/public/downloads/WISE-FieldTech-latest.apk
```

SHA-256: `d99c554eb185c86feec5d6da505a455724f271541d3f5e0eca6f3f6db2266890`

The APK is a debug-signed field-demo build for Android 8.0 or newer. Android may ask for permission to install unknown apps when sideloading.

## Demo Flow

1. Open **WISE² Field Tech**.
2. Tap **DEMO MODE**. Google sign-in is intentionally disabled until a production Android OAuth client ID is configured.
3. Open **Oak Avenue Residence** from Today's Jobs.
4. Show the customer complaint, status, phone, address, notes, and offline demo badge.
5. Open **Take Photo**, **Diagnose**, **Connect Tools**, **Equipment**, **Ask IMP**, and **Job Report**.
6. Use **Advance Status** or **Complete Job** to demonstrate offline-first job updates.

## Web Preview

Local preview:

```bash
pnpm --filter @wise2/wise-hvac-demo build
pnpm --filter @wise2/wise-hvac-demo start
```

Open `http://localhost:3024/wise-hvac-demo/field-tech`.

The web preview, sample jobs endpoint, and APK download are public while `WISE_HVAC_DEMO_MODE` is not set to `false`.

## Verified

- Android unit tests pass.
- Debug APK builds with Room/KSP persistence enabled.
- APK installs and launches on a physical Android device.
- Demo Mode loads three seeded jobs without network access.
- Job detail and camera open without a runtime exception.
- Standalone web page, jobs API, and APK download return HTTP 200.
