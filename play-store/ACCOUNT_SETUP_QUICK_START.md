# WISE² Field Tech - Google Play Account Setup Quick Start

## 🎯 5-Minute Overview

**Goal**: Launch WISE² Field Tech on Google Play Store

**Status**: Ready to start account creation  
**Owner**: You (dwise)  
**Timeline**: 4-8 days total

---

## 💰 What You Need Now

### Information to Gather

```
BUSINESS INFORMATION
├─ Company Name: WISE Defense LLC ✓
├─ Business Email: hello@wisedefensellc.com ✓
├─ Business Website: https://wisedefensellc.com ✓
├─ Business Phone: (NEEDS INFO)
├─ Business Address: (NEEDS INFO)
└─ TIN/EIN: (NEEDS INFO if applicable)

ACCOUNT OWNER
├─ Name: Daniel Wise ✓
├─ Email: hello@wisedefensellc.com or personal email? (CLARIFY)
├─ Phone: (NEEDS INFO)
└─ Government ID: (Required for verification)

PAYMENT
├─ Credit/Debit Card: (Required - $25 one-time fee)
└─ Cardholder Name & Address: (Must match card)
```

**Action**: Gather this info before starting Step 1.

---

## 🚀 Quick Start (6 Steps)

### STEP 1: Create Google Play Developer Account (1 hour)
**Owner**: You (dwise)

1. Go to https://play.google.com/console
2. Click **"Create account"**
3. Accept terms
4. Fill in:
   - Name: Daniel Wise
   - Email: hello@wisedefensellc.com (or personal Google account)
   - Country: United States
   - Phone: (business phone)
5. Pay $25 (credit/debit card)
6. Confirm email

**Result**: Account created, pending verification (24-48 hours)

---

### STEP 2: Complete Identity Verification (24-48 hours)
**Owner**: You (dwise)

1. Check email for verification link from Google
2. Go to Play Console → **Settings** → **Account verification**
3. Upload government-issued ID:
   - Driver's license, passport, or national ID
   - Photo or scan (clear, readable)
4. Submit
5. Wait for approval (typically 24-48 hours)

**Result**: Account verified ✅ (status shows in console)

---

### STEP 3: Create App Entry (30 minutes)
**Owner**: Product Lead (or you)

1. Log in to Play Console
2. Click **"Create app"**
3. Fill in:
   - **App name**: WISE² Field Tech
   - **Default language**: English (United States)
   - **Category**: Productivity
4. Click **"Create app"**

**Result**: App dashboard ready for content

---

### STEP 4: Upload Store Assets (1 hour)
**Owner**: Product Lead + Design

In Play Console, add:

1. **Graphics**:
   - App icon: `icon_512x512.png` (from `play-store/`)
   - Feature graphic: `feature_graphic_1024x500.png`
   - Screenshots: 5x PNG files at 1080×1920 (create from mockups)

2. **Store copy**:
   - Short description (80 chars) — Copy from `STORE_COPY.md`
   - Full description (4000 chars) — Copy from `STORE_COPY.md`

3. **Developer info**:
   - Name: WISE Defense LLC
   - Email: hello@wisedefensellc.com
   - Website: https://wisedefensellc.com
   - Privacy Policy URL: https://wisedefensellc.com/privacy (MUST BE LIVE)

4. **Content rating**: Answer questionnaire (should result in "Everyone")

**Result**: Store listing complete, app not yet available

---

### STEP 5: Upload App Build (1 hour)
**Owner**: Android Development Team

1. **Build release APK/AAB**:
   ```bash
   ./gradlew bundleRelease
   ```
   Produces: `app/release/app-release.aab`

2. **In Play Console** → **App releases** → **Production**:
   - Click **"Create release"**
   - Upload `.aab` file
   - Fill release notes: "Initial launch"
   - Review build details

3. **Verify**:
   - Package name correct
   - Version: 1.0.0
   - Min SDK: 26 (Android 8.0+)
   - All permissions match declared ones

**Result**: Build uploaded, ready for review

---

### STEP 6: Submit for Review (5 minutes)
**Owner**: Product Lead

1. **Final checklist**:
   - [ ] All graphics uploaded
   - [ ] Store copy complete
   - [ ] Privacy policy URL is LIVE
   - [ ] Build uploaded and verified
   - [ ] Content rating complete
   - [ ] No placeholder content

2. **Click "Send to review"**

3. **Wait** for Google approval (typically 24-48 hours)

4. **Check email** for review status
   - ✅ Approved → App goes live immediately
   - ❌ Rejected → Address feedback and resubmit

**Result**: App live on Google Play Store! 🎉

---

## ⚠️ Critical: Privacy Policy

**Google Play REQUIRES a live privacy policy URL before submission.**

**If you don't have one yet:**

1. Create privacy policy document covering:
   - Data collection (customer info, photos, equipment readings)
   - Data usage (how data is used, who it's shared with)
   - User rights (access, deletion, privacy controls)
   - Contact info for privacy questions

2. Host on website:
   - Example: https://wisedefensellc.com/privacy
   - Must be publicly accessible
   - Test the link works before submitting to Play

3. Add URL to Play Console before uploading build

**Don't skip this** — apps without valid privacy policy get rejected.

---

## 📱 Screenshots: Where to Get Them

You have detailed mockups in `play-store/SCREENSHOT_MOCKUPS.md` showing all 5 screenshots.

### Option A: Design Tool (Figma/Adobe XD)
1. Open Figma
2. Create artboard 1080×1920
3. Follow mockup layouts
4. Add realistic app UI
5. Export as PNG at 100% scale

### Option B: Screenshot Actual App
1. Run app on Android device at 1080×1920
2. Navigate through each step (Dispatch → Report)
3. Screenshot each stage
4. Export PNGs to `play-store/`

### Option C: Hybrid
1. Design key screens in Figma
2. Screenshot others from working app
3. Combine into 5-panel narrative

**Needed by**: Before STEP 4

---

## 🔑 Key Credentials to Protect

Once account is created, keep these secure:

```
Google Account Password
├─ Store in password manager (1Password, LastPass, Dashlane)
├─ Enable 2FA (authenticator app + backup codes)
└─ Never share via email/Slack

Upload Certificate Keystore
├─ File: wise2-fieldtech-upload.keystore
├─ Store securely (NOT in Git)
├─ Back up to encrypted USB or secure cloud storage
└─ Keystore password in password manager only

Play Console Access
├─ Use your Google account login
├─ Add team members with limited roles only
├─ Regular security review (monthly)
└─ Disable access if someone leaves
```

---

## 🎯 Assigned Owners

| Phase | Task | Owner | Duration |
|-------|------|-------|----------|
| 1 | Create Play Console account | You (dwise) | 1 hour |
| 2 | Identity verification | You (dwise) | 24-48 hours (Google) |
| 3 | Create app entry | Product Lead | 30 min |
| 4a | Final graphics (PNG exports) | Design | 2-3 hours |
| 4b | Privacy policy | Legal/You | 1-2 hours |
| 4c | Upload assets to console | Product Lead | 1 hour |
| 5 | Build APK/AAB | Android Dev | 1 hour |
| 6 | Submit to Google Play | Product Lead | 5 min |
| Review | Google Play review | Google | 1-3 days |

**Total**: 4-8 days (mostly waiting for Google verification)

---

## 🚨 Common Blockers (and how to avoid them)

| Blocker | Prevention |
|---------|-----------|
| Account verification stuck | Ensure valid government ID uploaded; check spam for verification emails |
| Build upload fails | Verify APK/AAB signed with upload certificate; check min SDK version |
| App rejected for policy | Review rejection email carefully; don't claim AI replaces technician judgment |
| Privacy policy rejected | Ensure URL is live and accessible; update if needed |
| Can't publish app | Verify account type is "Organization" (not "Individual" if you are company) |

---

## ✅ Before You Start

Confirm you have:

- [ ] WISE Defense LLC business registered
- [ ] hello@wisedefensellc.com email account active
- [ ] Business phone number (for account registration)
- [ ] Business address (for merchant account)
- [ ] Government-issued ID ready (for verification)
- [ ] Valid credit/debit card (for $25 registration fee)
- [ ] Privacy policy planned/drafted
- [ ] Android dev team ready to build APK/AAB
- [ ] Graphics files ready to export (icon, feature graphic)

**If any are missing, get them first before starting STEP 1.**

---

## 📞 Support

**During setup, if you get stuck:**

- **Google Play Help**: https://support.google.com/googleplay/android-developer
- **Email**: support@google.com
- **Community Forums**: https://support.google.com/googleplay/community

**WISE² Support**: dwise03@gmail.com

---

## 🎬 Ready to Go?

**Next action**: Gather the info from the "What You Need Now" section above, then start STEP 1.

**Estimated time to live**: 4-8 days from now

**Good luck! 🚀**
