# WISE HVAC Demo — Deployment Ready ✅

**Status**: Production APK & AAB ready. Code pushed. Web deployment paused (VPS permissions).  
**Built**: 2026-08-24 00:34 UTC  
**APK**: 3.0 MB (signed, release-ready)  
**AAB**: 2.9 MB (Play Store ready)

---

## **DELIVERABLES**

### ✅ Android APK (Ready Now)
- **Location**: `apps/wise-hvac-demo/android/app/build/outputs/apk/release/app-release.apk`
- **Size**: 3.0 MB
- **Status**: Signed with production keystore
- **Use Case**: Direct install on field devices (adb or sideload)

### ✅ Android AAB (Ready Now)
- **Location**: `apps/wise-hvac-demo/android/app/build/outputs/bundle/release/app-release.aab`
- **Size**: 2.9 MB
- **Status**: Signed with production keystore
- **Use Case**: Upload to Google Play Console

### ⏳ Web App (Manual VPS Fix Required)
- **Current Status**: Code pushed, build ready
- **Blocker**: VPS directory permissions (owned by root)
- **Fix Required**: `sudo chown -R dwise:dwise /opt/wise2-core` (manual)

---

## **OPTION 1: Direct APK Installation** (Fastest - 2 min)

For field technician testing without Play Store:

```bash
# Test on emulator
adb install -r apps/wise-hvac-demo/android/app/build/outputs/apk/release/app-release.apk

# Or sideload on physical device
# 1. Enable "Install from Unknown Sources" in Android Settings
# 2. Transfer APK to device
# 3. Tap to install
```

**Field teams can use immediately.**

---

## **OPTION 2: Google Play Console Upload** (5 min + review)

**Prerequisite**: Google Play Developer account with "WISE Field Tech" app created

### Step 1: Upload AAB
1. Go to [Google Play Console](https://play.google.com/console)
2. Select **WISE Field Tech** app
3. Navigate to **Release > Production**
4. Click **Create new release**
5. Upload AAB: `apps/wise-hvac-demo/android/app/build/outputs/bundle/release/app-release.aab`

### Step 2: Set Release Notes
```
Version: 1.0.0
Release notes: WISE Field Tech MVP - Real-time job dispatch, technician scheduling, demo requests
```

### Step 3: Review & Submit
1. Review app content rating (select "Business" category)
2. Click **Review release**
3. Click **Start rollout to Production**
4. Select rollout percentage (recommend 25% → 50% → 100% over 1-3 days)

**Timeline**: 
- Submitted: Now
- Initial review: 2-4 hours (Google automated scan)
- Full review: Up to 24 hours (human review)
- Live: Same day if approved

### Alternative: Use Internal Testing Track (No Review)
```
1. In Play Console, go to Testing > Internal testing
2. Upload AAB
3. Add field team emails
4. They get instant access for testing (no public release)
```

---

## **OPTION 3: Web App Deployment** (VPS - Manual Fix)

Web version: `https://wise2.net/wise-hvac-demo`

### Prerequisites:
- SSH access to VPS (dwise@173.208.147.165)
- sudo password for directory ownership change

### Deployment Steps:

```bash
# SSH to VPS
ssh dwise@173.208.147.165

# Fix directory ownership (requires sudo password)
sudo chown -R dwise:dwise /opt/wise2-core
sudo chown -R dwise:dwise /opt/wise2-core/apps/wise-hvac-demo

# Clean up repository
cd /opt/wise2-core
git stash --include-untracked
git clean -fd

# Pull latest code
git pull origin main

# Install and build
cd apps/wise-hvac-demo
rm -rf node_modules .next
pnpm install --no-frozen-lockfile
pnpm build

# Start application with PM2
pm2 stop wise-hvac-demo || true
pm2 start "node .next/standalone/server.js" \
  --name wise-hvac-demo \
  --env-file .env.production \
  -- -p 3024

# Verify
pm2 logs wise-hvac-demo
```

**Then verify**: `curl https://wise2.net/wise-hvac-demo`

---

## **ENVIRONMENT VARIABLES (Production VPS)**

Create `.env.production` in `apps/wise-hvac-demo/`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/wise2"

# Google OAuth (set via secrets manager)
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"

# NextAuth
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://wise2.net"

# Server
NODE_ENV="production"
```

---

## **VERIFICATION CHECKLIST**

### APK/App Functionality
- [ ] User can sign in with Google OAuth
- [ ] Job list loads from API
- [ ] Can view job details
- [ ] Can submit demo request form
- [ ] Can navigate between pages
- [ ] Works on mobile (portrait & landscape)

### Play Store Submission
- [ ] AAB uploaded to Play Console
- [ ] Release notes added
- [ ] App content rating complete
- [ ] Privacy policy linked
- [ ] Contact email set
- [ ] Rollout configured

### Web Version (if deployed)
- [ ] `https://wise2.net/wise-hvac-demo` loads
- [ ] OAuth flow works
- [ ] Jobs display correctly
- [ ] Form submissions work
- [ ] Mobile responsive

---

## **FALLBACK PLANS**

**If Play Store review is slow (>24hrs)**:
1. Use Internal Testing Track (instant, no public release)
2. Email field team the web URL: `https://wise2.net/wise-hvac-demo`
3. Send APK via file sharing for direct install

**If Web deployment blocks**:
1. Field team uses APK (recommended anyway - faster load)
2. Web becomes optional later

---

## **NEXT 48 HOURS**

| Time | Task | Owner | Status |
|------|------|-------|--------|
| Now | Upload AAB to Play Store | You | Blocked on Play Console access |
| Now | Test APK on device | You | Ready to test |
| +2h | Initial Play Store scan | Google | Automated |
| +24h | Full Play Store review | Google | Human review |
| Tomorrow AM | Field team receives APK | You | Ready to distribute |
| Tomorrow PM | APK in Play Store (if approved) | Google | Pending review |

---

## **FILES READY FOR DISTRIBUTION**

```
apps/wise-hvac-demo/
├── android/app/build/outputs/
│   ├── apk/release/app-release.apk (3.0 MB) ← Direct install
│   └── bundle/release/app-release.aab (2.9 MB) ← Play Store
├── release.jks (signed keystore)
├── PRODUCTION_DEPLOYMENT.md
└── .next/ (built web app)
```

---

## **CONTACT & SUPPORT**

- **APK Issues**: Check `logcat` on device
- **Play Store Upload**: Gmail support or Play Console help
- **Web Version**: Check nginx logs: `/var/log/nginx/error.log`
- **Auth Issues**: Verify Google OAuth credentials in env

---

**READY FOR FIELD TEAM** ✅

Next step: Choose deployment option above and execute.
