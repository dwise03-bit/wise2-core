# WISE Field Tech — Continuation Handoff

Updated: 2026-08-24 08:22 America/New_York

## Current deliverables

- Field APK: `apps/wise-hvac-demo/public/downloads/WISE-FieldTech-latest.apk`
- APK SHA-256: `6c166ffcee1e291a731f4ad10fc08acf2cf146710b3281c7b965de8f1c030306`
- Play bundle: `apps/fieldtech-android/app/build/outputs/bundle/release/app-release.aab`
- AAB SHA-256: `a7ffd18ac3e14881f8a1b926e6a903bc64f984ec0e2aecd055c61c5974eb8783`
- App identity: `com.wise2.fieldtech`, version `1.0.2` (`versionCode 3`)
- Production web workspace: `https://wise2.net/wise-hvac-demo/field-tech`
- Production APK download: `https://wise2.net/wise-hvac-demo/download`
- Production release: `/home/dwise/wise2-core-hvac-releases/20260824081825`
- Previous deployment retained for rollback: `/home/dwise/wise2-core-hvac`

## Last successful gates

- `./gradlew testDebugUnitTest assembleRelease bundleRelease`
- APK signature verification (v2)
- Release APK install/launch on Motorola razr 2025
- No Android startup fatal exception
- Next.js type-check and production build
- Jobs, auth-session, diagnosis, and APK download HTTP checks
- Browser reload, CRM blank/example-only state, AI interaction, and zero recent console errors
- Public HTTPS, valid Let's Encrypt certificate, HTTP-to-HTTPS redirect, production APIs, and APK checksum
- Native demo login, automatic demo seeding, and demo settings control removed from v1.0.2
- UFW allows inbound TCP 80/443; nginx proxies `/wise-hvac-demo/` to the PM2 application on `127.0.0.1:3024`

## External actions still required

1. Replace the invalid OpenAI credential if live model responses are required. The verified diagnostic fallback is active.
2. Register the exact production Google callback `https://wise2.net/wise-hvac-demo/api/auth/callback/google` and Android package/certificate SHA values in Google Cloud.
3. Create a permanent Play signing identity. The current optimized field APK uses this workstation's Android debug certificate for sideload continuity.

## Production rollback

If the deployed release must be reverted, restart PM2 from `/home/dwise/wise2-core-hvac` using its production start wrapper, then run `pm2 save`. The release pointer is stored at `/home/dwise/.wise2-hvac-candidate` and the preserved rollback path at `/home/dwise/.wise2-hvac-rollback`.

## Continuation rule

Do not claim SC480 live readings or untested Fluke modes. Decode new fields only after correlating bytes with the owned hardware display. Unknown measurements must remain null.
