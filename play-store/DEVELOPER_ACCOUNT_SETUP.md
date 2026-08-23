# Google Play Console - Developer Account Setup Guide

## 📋 Prerequisites

Before starting, gather these:

- **Google Account** — Use business Gmail (hello@wisedefensellc.com recommended)
- **Verified Business Info**
  - Company name: WISE Defense LLC
  - Business address: (needs to be provided)
  - Business email: hello@wisedefensellc.com
  - Business phone: (needs to be provided)
  - Business website: https://wisedefensellc.com
  
- **Payment Method** — Valid credit/debit card for $25 one-time registration fee

- **Identity Verification** — May be required (name, ID document)

---

## 🔐 Step 1: Create Google Account (if needed)

If not using an existing Google account:

1. Go to https://accounts.google.com/signup
2. Create account with business email: `hello@wisedefensellc.com`
3. Verify email address
4. Set up two-factor authentication (2FA) — **strongly recommended for business account**
5. Save recovery email and phone number

**Two-Factor Setup:**
- Go to https://myaccount.google.com/security
- Enable "2-Step Verification"
- Add authenticator app (Google Authenticator, Authy, Microsoft Authenticator)
- Save backup codes in secure location

---

## 💳 Step 2: Set Up Billing & Payment

1. Go to https://play.google.com/console
2. Click **"Create account"** if first time
3. Accept terms and conditions
4. Complete account creation form:
   - **Account type**: Individual or Organization
   - **Name**: Daniel Wise (account owner)
   - **Email**: hello@wisedefensellc.com
   - **Country/Region**: United States (or location of business)
   - **Phone**: (business phone number)

5. **Pay registration fee**:
   - One-time $25 fee (USD)
   - Credit/debit card required
   - Accept payment terms
   - Complete payment

6. **Wait for confirmation** — Email confirmation typically arrives within minutes

---

## 🏢 Step 3: Complete Merchant Account Setup

After registration, complete merchant profile:

### Basic Information
1. Go to Play Console → **Settings** → **Developer account**
2. Fill in **Account holder name**: Daniel Wise (or authorized signatory)
3. Set **Account type**: "Organization" (since WISE Defense LLC is a company)
4. Complete organization details:
   - **Organization/Business name**: WISE Defense LLC
   - **Business address**: (primary address)
   - **Country**: United States
   - **Phone**: (business phone)
   - **Website**: https://wisedefensellc.com

### Financial Information
5. Go to **Payments profile** (under Settings)
6. Add **Merchant account**:
   - Select country: United States
   - Accept Merchant Terms of Service
   - Complete business tax information (if applicable)
   - May require TIN/EIN for business account

### Identity Verification
7. Verify identity (Google may require):
   - Valid government ID (driver's license, passport)
   - Upload via Google Play Console interface
   - Wait for approval (24-48 hours typically)

**Status indicators:**
- ✅ Account verified
- 🟡 Verification pending
- ❌ Identity not verified (can't publish apps)

---

## 📱 Step 4: Create App Listing

Once account is verified, create the WISE² Field Tech app:

### 4.1 Create New App
1. Go to Play Console → **All apps** → **Create app**
2. Fill in basic info:
   - **App name**: WISE² Field Tech
   - **Default language**: English (United States)
   - **App or game**: Select "App"
   - **Category**: Productivity (or Tools)
   - **Email address**: hello@wisedefensellc.com

3. Accept declaration:
   - [ ] "This app complies with all Google Play policies"
   - Click **"Create app"**

### 4.2 Fill in App Details

Once created, navigate to **App dashboard**. You'll see sections to complete:

#### Store Presence
1. **Store listing** → Add main content:
   - **Short description** (80 chars): From `STORE_COPY.md`
   - **Full description** (4000 chars): From `STORE_COPY.md`
   - **App category**: Productivity
   - **Content rating**: Questionnaire
   - **Target audience**: Adults / Professionals

2. **Graphics**:
   - **App icon** (512×512 PNG): Upload `icon_512x512.png`
   - **Feature graphic** (1024×500 PNG): Upload `feature_graphic_1024x500.png`
   - **Screenshots** (1080×1920 PNG, 2-8 images): Upload all 5 screenshots
   - **Video preview** (optional): Promo video if available
   - **Preview type**: Phone/Tablet screenshots

#### Content Rating
3. **Content rating questionnaire**:
   - Complete Google Play content questionnaire
   - Answer questions about:
     - Violence, profanity, sexual content
     - Alcohol/tobacco/drugs
     - Location data collection
     - Personal data usage
   - Result: Typically "Everyone" for this app

#### Developer Details
4. **Developer details**:
   - **Developer name**: WISE Defense LLC
   - **Email**: hello@wisedefensellc.com
   - **Website**: https://wisedefensellc.com
   - **Privacy policy URL**: (REQUIRED — must be live)
     - Example: https://wisedefensellc.com/privacy
   - **Terms of Service URL** (optional)

#### Monetization & Pricing
5. **Pricing and distribution**:
   - **Free or paid**: Free
   - **Available in all countries**: Yes (unless restricting)
   - **Targeted countries**: (leave as default for global)
   - **In-app purchases**: None (for now)

---

## 🔑 Step 5: Set Up App Signing

Google Play requires signing all APKs with a certificate. Two options:

### Option A: Google Play App Signing (Recommended)
Google manages your signing key for you.

1. In Play Console → **Setup** → **App signing**
2. If first time: Google creates signing certificate automatically
   - You don't need to manage keys
   - Google stores the master key
   - You upload APK signed with upload certificate

**This is the recommended approach** — simpler, more secure.

### Option B: Self-Managed Signing
You manage the signing key yourself.

**DO NOT use this unless you have specific reasons.** Self-managed keys require extra security measures.

---

## 📦 Step 6: Prepare For Build Upload

### Generate Upload Certificate (for your dev team)

If using Google Play App Signing:

1. **Android Dev Team generates certificate:**
   ```bash
   # Generate keystore (run on secure dev machine)
   keytool -genkey -v -keystore wise2-fieldtech-upload.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias wise2-upload-key
   ```

2. **Keystore details:**
   - **Keystore file**: `wise2-fieldtech-upload.keystore`
   - **Key alias**: `wise2-upload-key`
   - **Validity**: 10000 days (~27 years)
   - **Store in secure location** (NOT in Git)
   - **Back up to secure storage** (encrypted USB, password manager, etc.)

3. **Gradle configuration** (in app `build.gradle.kts`):
   ```kotlin
   signingConfigs {
       release {
           storeFile = file("../wise2-fieldtech-upload.keystore")
           storePassword = "YOUR_KEYSTORE_PASSWORD"
           keyAlias = "wise2-upload-key"
           keyPassword = "YOUR_KEY_PASSWORD"
       }
   }

   buildTypes {
       release {
           signingConfig = signingConfigs.release
       }
   }
   ```

4. **Store passwords securely:**
   - Use environment variables (not in Git)
   - Or use Android Studio's built-in keystore management
   - Never commit passwords to repository

### Generate Build Files

1. **Build APK/AAB:**
   ```bash
   ./gradlew bundleRelease
   ```
   - Generates: `app/release/app-release.aab` (Android App Bundle)
   - This is what you upload to Play Console

2. **Verify signing:**
   ```bash
   # Check APK/AAB is properly signed
   jarsigner -verify -verbose -certs app-release.aab
   ```

---

## 🚀 Step 7: Upload First Build

Once app details are complete:

### 7.1 Create Release
1. In Play Console → **App releases** → **Production** → **Create release**
2. Click **Browse files** and upload:
   - Android App Bundle (`.aab` file)
   - Or APK (`.apk` file)

3. **Review release details:**
   - **Release name**: v1.0.0
   - **Release notes**: "Initial launch of WISE² Field Tech"
   - **Rollout percentage**: 100% (full rollout)

### 7.2 Verify Build
1. Check **Build info**:
   - Package name: `com.wisedefense.fieldtech` (or similar)
   - Version code: 1
   - Version name: 1.0.0
   - Min SDK: 26 (Android 8.0)
   - Target SDK: 34+ (latest)

2. Verify permissions:
   - CAMERA, MICROPHONE, LOCATION, CONTACTS, BLUETOOTH, INTERNET
   - All should match declared permissions in copy

### 7.3 Review & Submit
1. **Final checks**:
   - [ ] App name and description complete
   - [ ] Graphics uploaded (icon, feature graphic, screenshots)
   - [ ] Content rating completed
   - [ ] Privacy policy URL is live
   - [ ] Developer contact info filled in
   - [ ] Build uploaded and verified

2. **Click "Send to review"**
   - App enters review queue
   - Typically 24-48 hours
   - Check email for review status updates

---

## 📊 Step 8: Set Up Analytics & Monitoring

After account is active, enable monitoring tools:

### Google Analytics for Firebase
1. Go to **Firebase console** (https://console.firebase.google.com)
2. Create new Firebase project
3. Link to Play Console app
4. Add Firebase SDK to app code
5. Track:
   - App installs
   - Daily active users
   - Crash reports
   - Performance metrics

### Play Console Dashboard
1. Monitor **Ratings & reviews** — Respond to user feedback
2. Watch **Crashes & ANRs** (crashes and freezes)
3. Track **Install analytics**:
   - Total installs
   - Uninstalls
   - Active installs by country
   - Device breakdown
4. Monitor **Revenue** (if monetized later)

---

## 🔐 Step 9: Security Best Practices

Protect your developer account:

### Account Security
- [ ] **2FA enabled** on Google account
- [ ] **Recovery email** and phone added
- [ ] **Regular password changes** (quarterly)
- [ ] **No shared passwords** — each team member has own account

### Keystore Security
- [ ] **Upload keystore backed up** (encrypted, secure location)
- [ ] **Private key password** stored in password manager only
- [ ] **Keystore NOT in Git repository**
- [ ] **No screenshots of passwords** in Slack/email
- [ ] **Rotate team access** if someone leaves

### Play Console Access
1. **User management** in Play Console:
   - Add team members with limited roles
   - Admin: Full access (limit to 1-2 people)
   - Release Manager: Can upload builds only
   - Finance: Can view billing only
   - Marketing: Can edit store listing only

2. **Enable audit logging**:
   - Track all account changes
   - Review monthly for suspicious activity

---

## 📞 Step 10: Support & Resources

### Setup Support
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Android Developers**: https://developer.android.com
- **Play Console Support Team**: support@google.com

### Common Issues

| Issue | Solution |
|-------|----------|
| Account verification delayed | Check email for verification link; may take 24-48 hours |
| Payment declined | Use different payment method; verify address matches card |
| App rejected after upload | Check review feedback email; address policy violations |
| Can't upload build | Verify APK/AAB signed with upload certificate; check min SDK |
| Privacy policy blocked | Ensure URL is live and accessible; update if needed |

---

## ✅ Account Setup Checklist

Complete in order:

### Phase 1: Account Creation (1-2 hours)
- [ ] Create Google account (hello@wisedefensellc.com)
- [ ] Enable 2FA on Google account
- [ ] Go to https://play.google.com/console
- [ ] Pay $25 registration fee
- [ ] Receive confirmation email

### Phase 2: Identity Verification (24-48 hours)
- [ ] Complete merchant profile
- [ ] Add business information
- [ ] Upload identity verification (government ID)
- [ ] Wait for Google approval
- [ ] Confirm ✅ Account verified status

### Phase 3: App Creation (2-3 hours)
- [ ] Create new app: "WISE² Field Tech"
- [ ] Fill store listing (description, copy)
- [ ] Upload graphics (icon, feature graphic, screenshots)
- [ ] Complete content rating questionnaire
- [ ] Add privacy policy URL
- [ ] Add developer contact info

### Phase 4: Build Setup (2-3 hours)
- [ ] Android dev team generates upload certificate
- [ ] Secure keystore file (not in Git)
- [ ] Configure Gradle signing
- [ ] Build release APK/AAB
- [ ] Verify build uploads to Play Console

### Phase 5: Launch (1-2 hours)
- [ ] Create release in Play Console
- [ ] Upload APK/AAB
- [ ] Review all details
- [ ] Submit for review
- [ ] Wait for approval (24-48 hours)
- [ ] App goes live to Play Store

### Phase 6: Post-Launch (ongoing)
- [ ] Monitor ratings & reviews
- [ ] Track crash reports
- [ ] Set up Firebase Analytics
- [ ] Respond to user feedback
- [ ] Plan first update (bug fixes, features)

---

## 📅 Timeline

| Phase | Duration | Owner |
|-------|----------|-------|
| Account creation + verification | 1-2 days | Product Lead |
| App listing setup | 1-2 days | Product Lead + Design |
| Build preparation | 1 day | Android Dev |
| Play Console submission | 0.5 days | Product Lead |
| Google review | 1-3 days | Google (external) |
| **Total** | **4-8 days** | **Multi-team** |

---

## 🎯 Immediate Next Steps

1. **Product Lead** → Create Google account and start Play Console registration
2. **Android Dev** → Prepare upload certificate and signing configuration
3. **Design** → Prepare final graphics (PNG exports from SVG files)
4. **Legal** → Write privacy policy and host on website
5. **QA** → Run final testing checklist on release APK/AAB

Once all are ready, submit to Play Store and await approval!

---

**Account Owner**: hello@wisedefensellc.com  
**Business Name**: WISE Defense LLC  
**Website**: https://wisedefensellc.com  
**Support Email**: hello@wisedefensellc.com  

---

**Created**: August 23, 2026  
**Status**: 🟢 Ready for Execution  
**Next**: Assign ownership and begin Phase 1 (Account Creation)
