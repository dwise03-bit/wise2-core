# WISE² Field Tech - Google Play Store Submission Checklist

## Pre-Submission Asset Prep

### ✅ Graphics Assets
- [ ] **Icon (512×512)** — `icon_512x512.svg` ✓ Created
  - [ ] Export as PNG at 512×512 (8-bit, RGB)
  - [ ] Round corners at 80px radius in final build
  - [ ] Test at small sizes (96px, 48px) for clarity
  
- [ ] **Feature Graphic (1024×500)** — `feature_graphic_1024x500.svg` ✓ Created
  - [ ] Export as PNG at 1024×500 (8-bit, RGB)
  - [ ] No transparency (solid background only)
  - [ ] Test rendering on Google Play preview
  
- [ ] **Screenshots (1080×1920 x5)** — Create from `SCREENSHOT_MOCKUPS.md`
  - [ ] Screenshot 1: Dispatch home screen
  - [ ] Screenshot 2: Equipment scan
  - [ ] Screenshot 3: Live Fieldpiece data
  - [ ] Screenshot 4: AI diagnosis
  - [ ] Screenshot 5: Service report
  - [ ] All PNG format, RGB, 72dpi minimum
  - [ ] Phone bezel/status bar visible (typical for Android)

### ✅ Store Copy Assets
- [ ] **App Title** (50 chars max) — `WISE² Field Tech - HVAC AI Command Center`
  - [ ] Character count verified
  - [ ] No promotional language (no FREE, BEST, etc.)
  
- [ ] **Short Description** (80 chars max) — From `STORE_COPY.md`
  - [ ] Character count verified
  - [ ] Compelling summary, no emojis in Play Console field
  
- [ ] **Full Description** (4000 chars) — From `STORE_COPY.md`
  - [ ] Character count verified (typically ~2400 chars used)
  - [ ] No misleading claims or promises
  - [ ] Contact info present
  - [ ] Clear positioning vs. replacement language
  
- [ ] **Category** — Set to "Productivity" or "Tools"

### ✅ App Information
- [ ] **App Name** — Matches title (or shorter variant)
- [ ] **Developer Name** — WISE Defense LLC
- [ ] **Developer Email** — hello@wisedefensellc.com
- [ ] **Developer Website** — https://wisedefensellc.com
- [ ] **Privacy Policy URL** — (NEEDS TO BE PROVIDED)
- [ ] **Content Rating** — Questionnaire completed (likely "Everyone")
- [ ] **Target Audience** — Professionals / Field Service Technicians

---

## App Build & Release

### ✅ App Configuration
- [ ] **Package Name** — e.g., `com.wisedefense.fieldtech`
- [ ] **Version Code** — Sequential integer (e.g., 1)
- [ ] **Version Name** — Human readable (e.g., "1.0.0")
- [ ] **Min SDK** — Android 8.0 (API 26) minimum
- [ ] **Target SDK** — Latest stable (API 34+)
- [ ] **Languages** — English (US) primary, add others as available

### ✅ Permissions Declared in AndroidManifest.xml
```xml
<!-- From STORE_COPY.md permissions section -->
- android.permission.CAMERA
- android.permission.RECORD_AUDIO
- android.permission.ACCESS_FINE_LOCATION
- android.permission.READ_CONTACTS
- android.permission.WRITE_EXTERNAL_STORAGE
- android.permission.BLUETOOTH
- android.permission.INTERNET
```

### ✅ Build & Signing
- [ ] **APK/AAB Built** — Using release keystore
- [ ] **Keystore Secured** — Private key stored securely (NOT in Git)
- [ ] **SHA-1 Fingerprint** — Registered with Google Play
- [ ] **ProGuard/R8 Configured** — Code obfuscation enabled (if not open-source)
- [ ] **Test APK** — Installed on real Android 8.0+ device
- [ ] **All Features Tested** — See Testing Checklist below

---

## Testing Checklist (Before Upload)

### Functional Testing
- [ ] **Login/Auth** — Works correctly
- [ ] **Home Screen** — Jobs load and display properly
- [ ] **Job Dispatch** — Tap "Start Job" opens job details
- [ ] **Equipment Scan** — Camera opens, photo capture works
- [ ] **Fieldpiece Integration** — Bluetooth connection and data receive work (if available)
- [ ] **Live Data Display** — Readings show correctly, alerts trigger properly
- [ ] **AI Diagnosis** — Recommendations generate and display
- [ ] **Photo Documentation** — Can capture, save, attach to job
- [ ] **Service Notes** — Text entry and AI summarization work
- [ ] **Report Generation** — Final report generates PDF/document
- [ ] **Offline Mode** — Core features work without internet
- [ ] **Sync** — Data syncs when connectivity returns

### UI/UX Testing
- [ ] **Responsive Layout** — Adapts to different screen sizes (4.5" to 6.5"+)
- [ ] **Dark Theme** — Design system colors render correctly
- [ ] **Touch Targets** — Buttons/links ≥ 48dp for accessibility
- [ ] **Text Size** — Readable at 14sp minimum body text
- [ ] **Orientation** — Portrait mode works; landscape tested if applicable
- [ ] **Navigation** — Back button works throughout, no stuck states
- [ ] **Loading States** — Spinners/progress indicators shown during data fetch
- [ ] **Error Messages** — Clear, actionable error text if operations fail

### Performance Testing
- [ ] **Startup Time** — App launches in < 3 seconds on Android 8.0 device
- [ ] **Memory Usage** — Doesn't exceed 150MB (typical field device constraint)
- [ ] **Battery Impact** — Background processes don't drain excessively
- [ ] **Network Efficiency** — No excessive API calls or data usage
- [ ] **Offline Caching** — Essential data available without internet

### Security Testing
- [ ] **Data Encryption** — Sensitive data (customer info, readings) encrypted at rest
- [ ] **API Calls** — Use HTTPS only, no hardcoded credentials
- [ ] **Local Storage** — No plaintext passwords or tokens
- [ ] **Permissions** — Only request permissions actually needed at runtime
- [ ] **Deeplinking** — Validate all deep links don't bypass auth
- [ ] **Third-party Libraries** — All up-to-date, no known CVEs

### Accessibility Testing
- [ ] **Screen Reader** — TalkBack enabled, basic flows navigable
- [ ] **Color Contrast** — Text meets WCAG AA standards (4.5:1)
- [ ] **Font Scaling** — Readable at system font sizes up to 200%
- [ ] **Keyboard Navigation** — All interactive elements reachable via Tab/D-Pad
- [ ] **Focus Indicators** — Visible when navigating via hardware keyboard

---

## Google Play Store Submission

### Step 1: Create / Select App in Play Console
- [ ] Go to https://play.google.com/console
- [ ] Click "Create app"
- [ ] Choose app name: "WISE² Field Tech"
- [ ] Select category: "Productivity" or "Tools"
- [ ] Set default language: English (US)

### Step 2: Fill App Details
- [ ] **App title** (50 chars): "WISE² Field Tech - HVAC AI Command Center"
- [ ] **Short description** (80 chars): From `STORE_COPY.md`
- [ ] **Full description** (4000 chars): From `STORE_COPY.md`
- [ ] **Category**: Productivity
- [ ] **Content rating**: Complete questionnaire (likely "Everyone" rating)
- [ ] **Target audience**: Adults / Professionals

### Step 3: Upload Graphics
- [ ] **App icon** (512×512 PNG): Upload `icon_512x512.png`
- [ ] **Feature graphic** (1024×500 PNG): Upload `feature_graphic_1024x500.png`
- [ ] **Screenshots** (1080×1920 PNG, 2-8 images):
  - [ ] `screenshot_1_dispatch.png`
  - [ ] `screenshot_2_scan.png`
  - [ ] `screenshot_3_fieldpiece.png`
  - [ ] `screenshot_4_diagnosis.png`
  - [ ] `screenshot_5_report.png`

### Step 4: Set Up App Details
- [ ] **Developer contact info**
  - [ ] Name: WISE Defense LLC
  - [ ] Email: hello@wisedefensellc.com
  - [ ] Website: https://wisedefensellc.com
  - [ ] Support email: support@wisedefensellc.com
  
- [ ] **Privacy policy** (REQUIRED)
  - [ ] URL provided and tested (must be live)
  - [ ] Policy covers data collection and usage
  - [ ] Link functional from store listing
  
- [ ] **Permissions disclosure**
  - [ ] Camera — "Capture equipment documentation photos"
  - [ ] Microphone — "Voice notes and AI assistant interaction"
  - [ ] Location — "GPS dispatch and navigation"
  - [ ] Contacts — "Customer information management"
  - [ ] Storage — "Access manuals and saved documentation"
  - [ ] Bluetooth — "Fieldpiece tool integration"

### Step 5: Set Up Testing
- [ ] **Test accounts** (if app has login)
  - [ ] Create test account with realistic data
  - [ ] Document credentials for Google Play reviewer
  - [ ] Ensure test account has access to key features
  
- [ ] **Testing instructions** (if needed)
  - [ ] Explain key workflows reviewer should test
  - [ ] Highlight main features in testing path

### Step 6: Upload Build
- [ ] **Release type**: Internal testing → Beta → Production
  - [ ] [ ] For **Internal Testing**: Upload APK/AAB, test on device
  - [ ] [ ] For **Closed Beta**: Invite test users (optional)
  - [ ] [ ] For **Open Beta**: Public, limited download (optional)
  - [ ] [ ] For **Production**: Full release to all Android users

- [ ] **Build details**
  - [ ] Upload signed APK or AAB (Android App Bundle recommended)
  - [ ] Verify version code is higher than any previous build
  - [ ] Review build size (should be reasonable, typically 50-200MB)
  - [ ] Check all supported CPU architectures included (arm64-v8a, armeabi-v7a)

### Step 7: Review & Submit
- [ ] **Final checklist**
  - [ ] All required fields filled
  - [ ] Graphics uploaded and previewed
  - [ ] Copy proofread (no typos)
  - [ ] Build tested on real device (Android 8.0+)
  - [ ] Privacy policy URL live and accessible
  - [ ] No placeholder content or TODOs
  
- [ ] **Confirm & Submit**
  - [ ] Click "Review release"
  - [ ] Read warnings about data handling, permissions, etc.
  - [ ] Accept declarations
  - [ ] Click "Release to production"

---

## Post-Submission

### Monitoring
- [ ] **Review submission status** — Check Play Console in 24-48 hours
- [ ] **Monitor for review feedback** — Google may request changes
- [ ] **Prepare response to feedback** — Have team ready to address issues
- [ ] **Track approval** — Once approved, app appears in Play Store

### Launch & Promotion
- [ ] **Announcement** — Email customers/partners about app availability
- [ ] **Social media** — Post announcement with app store link
- [ ] **Documentation** — Update website/docs with app link
- [ ] **Feedback collection** — Set up channel for user bug reports
- [ ] **Analytics** — Set up Google Analytics or Firebase to track usage

### Ongoing Maintenance
- [ ] **Monitor crash reports** — Google Play Console shows stack traces
- [ ] **Track rating & reviews** — Respond to user feedback promptly
- [ ] **Plan updates** — Bug fixes and feature improvements on regular cadence
- [ ] **Target SDK updates** — Update for latest Android API requirements (annual)
- [ ] **Security patches** — Apply dependency updates regularly

---

## Important Compliance Notes

### Data Privacy
- **Privacy Policy Required** — Must have live URL before submission
- **Permissions Justified** — Each permission must be explained
- **No Selling Data** — Cannot sell customer HVAC service data to third parties
- **GDPR Compliance** (if EU users) — Ensure data handling complies
- **CCPA Compliance** (if CA users) — Customer data rights must be honored

### Intellectual Property
- **No Trademark Infringement** — "WISE²" is registered; "Fieldpiece" is third-party brand
- **Proper Attribution** — Credit Fieldpiece integration if required by their license
- **Icon Originality** — Verify icon design is original or properly licensed

### Content Policy
- **No Prohibited Content** — No hate speech, violence, illegal activity
- **Realistic Claims** — "AI-powered" descriptions must be accurate
- **No Misleading Ads** — Don't claim app is free if has in-app purchases
- **Support Commitment** — Be prepared to support app post-launch

---

## Files Reference

- ✅ `icon_512x512.svg` — App icon (all sizes exported)
- ✅ `feature_graphic_1024x500.svg` — Hero graphic for store listing
- ✅ `STORE_COPY.md` — All text copy (title, description, keywords)
- ✅ `SCREENSHOT_MOCKUPS.md` — Detailed mockup layouts (for design team)
- 📝 **MISSING**: Privacy policy (MUST CREATE BEFORE SUBMISSION)
- 📝 **MISSING**: End-user license agreement (recommended)
- 📝 **MISSING**: Support documentation / FAQ (recommended)

---

## Timeline Estimate

| Phase | Estimated Time | Owner |
|-------|-----------------|-------|
| Design finalization | 2-3 days | Design + Product |
| Screenshot creation | 2-3 days | Design + UI/QA |
| App build & signing | 1 day | Android Dev |
| Privacy policy creation | 1-2 days | Legal + Product |
| Testing & QA | 3-5 days | QA + Android Dev |
| Play Console setup | 1 day | Product |
| Submission & review | 2-5 days | Google Play (external) |
| **Total** | **10-18 days** | **Multi-team** |

---

## Contact & Support

**Questions about submission?**
- Product Owner: dwise (dwise03@gmail.com)
- Android Lead: (assign)
- Design Lead: (assign)

**Google Play Console Help:**
- https://support.google.com/googleplay/android-developer
- Email: support@google.com

**WISE² Support:**
- hello@wisedefensellc.com

---

**Last Updated**: August 23, 2026  
**Status**: Ready for Design & Development  
**Next Step**: Create screenshots from mockups, then submit to Play Console
