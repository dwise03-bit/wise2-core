# Private APK Release & Update System

## Distribution model

No Google Play. A signed APK is built, published to `wise2.net`, and a `FieldTechRelease`
Prisma row describes the latest version. The app checks that row, downloads over HTTPS,
verifies SHA-256, and hands off to Android's own package installer — the app never calls
`PackageInstaller` APIs directly and never bypasses the install confirmation dialog.

```
scripts/build-android-release.sh   (signs, outputs releases/WISE2-FieldTech-v<version>.apk + SHA-256)
        ↓
Upload the APK to WISE² release infrastructure, get a public HTTPS URL
        ↓
Create/update a FieldTechRelease row (versionCode, versionName, apkUrl, sha256, required, releaseNotes)
        ↓
GET /api/v1/fieldtech/releases/latest   (packages/api/src/fieldtech — public, no auth)
        ↓
wise2.net/fieldtech                     (apps/website/app/fieldtech/page.tsx — technician download portal)
        ↓
Android app: Settings → Check for Updates (update/UpdateManager.kt)
        ↓
Download → SHA-256 verify → ACTION_VIEW install intent via FileProvider
```

## Signing

`apps/fieldtech-android/app/build.gradle.kts`'s `release` build type only configures a
`signingConfig` when `WISE2_RELEASE_KEYSTORE` (and the matching password/alias env vars) are
set. No keystore or password is ever committed to this repo — `scripts/build-android-release.sh`
refuses to run without all four `WISE2_RELEASE_*` variables set, so a real production keystore
must be supplied out-of-band (a CI secret store, or run locally with the env vars exported)
before a signed release APK can be produced.

## Scripts

- `scripts/build-android-release.sh` — builds, signs, copies the APK to `releases/`, prints
  its SHA-256, and reminds you to publish the `FieldTechRelease` record.
- `scripts/check-android-release.sh <path-to-apk>` — compares a local APK's SHA-256 against
  what `/api/v1/fieldtech/releases/latest` currently publishes, so you can catch a
  publish/upload mismatch before telling technicians to update.

## Update-check response contract

Matches the build spec exactly:

```json
{
  "versionCode": 12,
  "versionName": "1.2.0",
  "apkUrl": "https://wise2.net/releases/WISE2-FieldTech-v1.2.0.apk",
  "sha256": "...",
  "required": false,
  "releaseNotes": "Improved Bluetooth diagnostics."
}
```

Served by `GET /api/v1/fieldtech/releases/latest` (`packages/api/src/fieldtech/`), backed by
the `FieldTechRelease` Prisma model, always returning the highest `versionCode` row.

## What's not done yet

- **No `FieldTechRelease` row exists** — there has never been a release published, so
  `/releases/latest` will 404 until one is created (directly via Prisma Studio/SQL, or a small
  admin script — none exists yet since no release has shipped).
- **No CI wiring.** `scripts/build-android-release.sh` is meant to run in GitHub Actions (this
  repo already uses Actions for other apps' auto-deploy) but no workflow file was added — doing
  so needs a decision on where the signing keystore secret lives in GitHub's secret store.
- **No actual APK hosting bucket/path was created** on `wise2.net`'s infrastructure; `apkUrl`
  is whatever URL you point it at once you have a real hosting location.
