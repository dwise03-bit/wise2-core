# Sound Labs & Android APK Production Deployment Guide

**Status**: In Progress - 2026-09-14  
**Owner**: Claude Haiku 4.5  
**Goal**: Deploy Sound Labs web app and release FieldTech Android APK

---

## Phase 1: Sound Labs Web Deployment (VPS)

### Current Status
- ✅ Sound Labs code integrated into studio app
- ✅ Dockerfile.studio improved for monorepo workspace support  
- ❌ **Blocker**: pnpm workspace resolution of `@wise2/audio` in Alpine Linux Docker build

### Root Cause
The studio app imports `@wise2/audio` from the workspace:
```typescript
import { Track } from '@wise2/audio';
```

During Docker build, the workspace package resolution fails because:
1. Alpine Linux doesn't have full Node.js build tools
2. pnpm workspace symlinks aren't being created in builder stage
3. TypeScript/Next.js can't find the workspace package

### Solution Path (Next Steps)

**Option A: Fix Workspace Resolution (Recommended)**
1. In `Dockerfile.studio`, ensure workspace packages are properly linked:
   ```dockerfile
   RUN pnpm install --frozen-lockfile --recursive
   RUN pnpm link --recursive
   ```
2. Configure pnpm's peer dependency resolution
3. Rebuild and test

**Option B: Skip Docker Build, Deploy Pre-Built**
1. Build studio app locally with full dependencies
2. Export `.next` build directory  
3. Copy to VPS and run with pre-built artifacts

### Deployment Command (Once Fixed)
```bash
ssh dwise@173.208.147.165 "cd /home/dwise/wise2-core && \
  docker-compose -f docker-compose.prod.yml up -d studio && \
  sleep 5 && \
  curl -f https://wise2.net/studio || echo 'Deployment failed'"
```

---

## Phase 2: Android APK Production Build

### Prerequisites
- ✅ FieldTech Android codebase ready (v1.1.0-quest)
- ✅ Release keystore found: `/Users/danielwise/.wise2/fieldtech-release.jks`
- ❌ **Required**: Release keystore password and key alias credentials

### Build Steps

1. **Set Signing Credentials**
   ```bash
   export WISE2_RELEASE_KEYSTORE="/Users/danielwise/.wise2/fieldtech-release.jks"
   export WISE2_RELEASE_STORE_PASSWORD="[PASSWORD_NEEDED]"
   export WISE2_RELEASE_KEY_ALIAS="[KEY_ALIAS_NEEDED]"
   export WISE2_RELEASE_KEY_PASSWORD="[KEY_PASSWORD_NEEDED]"
   ```

2. **Build Signed Release APK**
   ```bash
   cd /Users/danielwise/Projects/wise2-core
   bash scripts/build-android-release.sh
   ```

3. **Expected Output**
   - APK path: `releases/WISE2-FieldTech-v1.1.0-quest.apk`
   - SHA-256: [printed to console]
   - Size: ~50-80MB

4. **Distribution**
   - Copy APK to VPS: `scp releases/WISE2-*.apk dwise@173.208.147.165:/home/dwise/wise2-core/releases/`
   - Make available via: `https://wise2.net/releases/WISE2-FieldTech-v1.1.0-quest.apk`
   - Update release metadata in API

### Post-Build Steps
1. Verify APK signature:
   ```bash
   jarsigner -verify -verbose -certs releases/WISE2-FieldTech-v1.1.0-quest.apk
   ```

2. Test installation on device:
   ```bash
   adb install -r releases/WISE2-FieldTech-v1.1.0-quest.apk
   ```

3. Update FieldTechRelease record in API:
   ```sql
   UPDATE FieldTechRelease SET
     versionCode = 5,
     versionName = '1.1.0-quest',
     apkUrl = 'https://wise2.net/releases/WISE2-FieldTech-v1.1.0-quest.apk',
     sha256 = '[SHA256_FROM_BUILD]',
     releaseDate = NOW()
   WHERE id = 'latest';
   ```

---

## Current App Versions

### Sound Labs (Studio)
- **Path**: `/apps/studio`
- **Package**: `@wise2/studio@1.0.0`
- **Port**: 3005 (internal)
- **URL**: `https://wise2.net/studio`

### FieldTech Android (FieldTech)
- **Path**: `/apps/fieldtech-android`
- **Package**: `com.wise2.fieldtech`
- **Version**: 1.1.0-quest (versionCode: 5)
- **Target API**: Android 14 (API 36)
- **Min SDK**: 29 (Meta Quest compatible)

---

## Rollback Plan

### Sound Labs Rollback
1. Stop studio container: `docker-compose -f docker-compose.prod.yml stop studio`
2. Restart from known-good image if needed

### Android Rollback
1. Update FieldTechRelease record to previous versionCode
2. Distribute previous APK via release endpoint

---

## Monitoring & Verification

### Sound Labs
```bash
# Check container health
docker ps | grep studio

# Check routing
curl -I https://wise2.net/studio

# View logs
docker logs wise2-studio -f
```

### Android
```bash
# Check latest release metadata
curl https://api.wise2.net/api/v1/fieldtech/releases/latest

# Verify APK installation
adb shell pm list packages | grep wise2.fieldtech
adb shell am start -n com.wise2.fieldtech/.MainActivity
```

---

## Next Steps (Prioritized)

1. **IMMEDIATE** - Get Android signing credentials
   - Retrieve passwords for `fieldtech-release.jks`
   - Build and publish APK v1.1.0-quest

2. **SHORT TERM** - Fix Sound Labs Docker build
   - Test workspace resolution fix locally
   - Rebuild studio container
   - Deploy to VPS

3. **VERIFICATION** - End-to-end testing
   - Test Sound Labs at https://wise2.net/studio
   - Install FieldTech APK on physical device
   - Verify API health endpoints

---

## File Changes This Session

- `Dockerfile.studio` - Improved monorepo workspace support (WIP)
- `apps/studio/.eslintrc.json` - Fixed Next.js ESLint config
- Scripts analyzed but not modified (pending credentials)

## Commands Ready to Execute

Once credentials are provided:
```bash
# Android APK build
export WISE2_RELEASE_KEYSTORE="/Users/danielwise/.wise2/fieldtech-release.jks"
export WISE2_RELEASE_STORE_PASSWORD="[PASSWORD]"
export WISE2_RELEASE_KEY_ALIAS="[ALIAS]"
export WISE2_RELEASE_KEY_PASSWORD="[KEY_PASSWORD]"

cd /Users/danielwise/Projects/wise2-core
bash scripts/build-android-release.sh
ls -lh releases/WISE2-*.apk
```

