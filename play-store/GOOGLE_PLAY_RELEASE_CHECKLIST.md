# WISE² HVAC Field Agent — Google Play Release Checklist

**Release Version**: 1.0.0  
**Target**: Production Launch  
**Prepared**: August 23, 2026  

---

## Pre-Submission Checklist (Automatable)

### Code & Build

- [x] Source code complete and tested
- [x] Unit tests passing (3/3)
- [x] Lint clean
- [x] No hardcoded secrets or localhost URLs
- [x] SDK targets updated to 36
- [x] Android manifest reviewed for security
- [x] Permissions minimized and justified
- [x] No exported unnecessary components
- [x] Network security configured (HTTPS only)
- [x] ProGuard/R8 configured for release
- [x] Release signing infrastructure in place

### Build Artifacts

- [ ] `app-release.aab` builds successfully
- [ ] `app-debug.apk` builds successfully
- [ ] APK verifies with jarsigner
- [ ] Manifest verified with aapt
- [ ] SHA-256 checksums recorded

### Assets

- [ ] App icon designed (1080×1080 px foreground + background)
- [ ] Splash screen artwork prepared
- [ ] Feature graphic prepared (1024×500 px)
- [ ] 6–8 screenshots captured
- [ ] All assets optimized and compressed

---

## Pre-Submission Checklist (Manual Review Required)

### Account & Organization

- [ ] **Developer Account**: Google Play Developer account created
  - Location: https://play.google.com/console
  - Account type: Organization or Individual
  - Payment method added
  
- [ ] **Company Verification**: If organization account:
  - D-U-N-S number obtained (if required)
  - Business address verified
  - Support contact established

- [ ] **App Registration**: App created in Play Console
  - Name: WISE² HVAC Field Agent
  - Package ID: com.wise2.fieldtech
  - App category: Business or Productivity
  - Target audience: Adults (business app)

### Store Listing

- [ ] **Short Description**: Written (80 chars max)
  - ✅ "AI-powered HVAC diagnostics and field service intelligence."

- [ ] **Full Description**: Written (4,000 chars max)
  - ✅ See `play-store/STORE_LISTING.md`

- [ ] **App Icon**: Uploaded (512×512 px PNG)
  - [ ] Design completed and optimized

- [ ] **Feature Graphic**: Uploaded (1024×500 px PNG)
  - [ ] Design completed

- [ ] **Screenshots**: 6–8 images uploaded
  - [ ] Capture high-quality device screenshots
  - [ ] Optional: Add text overlays with explanations

- [ ] **Category**: Selected
  - [ ] Business or Productivity (choose one in Play Console)

- [ ] **Rating**: Content rating form completed
  - [ ] No adult content, violence, or inappropriate material
  - [ ] Target audience: Professional/Business

- [ ] **Contact Details**: Entered
  - [ ] Support email: support@wise2.net
  - [ ] Support website: https://wise2.net/support
  - [ ] Privacy policy URL: https://wise2.net/privacy
  - [ ] Terms of service URL: https://wise2.net/terms

---

## Privacy & Data Safety (Manual Form Submission)

### Google Play Data Safety Form

- [ ] **Privacy Policy**: Published
  - [ ] Hosted at https://wise2.net/privacy
  - [ ] Covers all data categories from `PRIVACY_DATA_MAP.md`
  - [ ] Meets GDPR/CCPA requirements
  - [ ] Last updated date included

- [ ] **Data Safety Form**: Completed in Play Console
  - [ ] All data categories declared
  - [ ] Encryption status specified
  - [ ] Sharing practices disclosed
  - [ ] Deletion policies stated
  - [ ] Security practices described

- [ ] **Data Safety Answers**: Verified
  - ✅ See `play-store/DATA_SAFETY_WORKSHEET.md`

- [ ] **No Misleading Claims**:
  - [ ] No false privacy promises
  - [ ] No unsubstantiated security claims

### Target Audience & Declarations

- [ ] **Target Age**: 13+ (adult, not children)
- [ ] **Financial Features**: Declared (none for v1.0)
- [ ] **Ads**: Declared (none for v1.0)
- [ ] **Health-Related**: Declared (none — HVAC, not medical)
- [ ] **Government App**: Declared (no)

---

## APK/AAB Submission (Manual Upload)

### Before Upload

- [ ] **Final Build**: Release AAB built and verified
  - [ ] `app-release.aab` exists
  - [ ] File size reasonable (~12 MB)
  - [ ] Signed with release key
  - [ ] Manifest verified

- [ ] **Version Code**: Incremented
  - [ ] Current: 1
  - [ ] Not previously released

- [ ] **Rollout Strategy**: Decided
  - [ ] Immediate: 100% rollout
  - [ ] Staged: Start with 5%, monitor for crashes, increase gradually
  - [ ] Recommendation: Staged (safer for first release)

### Upload in Play Console

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload AAB file: `app-release.aab`
4. Enter release notes (see template below)
5. Review app compliance
6. Submit for review

---

## Release Notes Template

```
WISE² HVAC Field Agent 1.0

Initial release featuring:

✅ AI-powered HVAC field assistance
✅ Complete job and customer management
✅ Equipment profiles with service history
✅ 15+ diagnostic workflows
✅ Professional HVAC calculators
✅ Live measurement capture
✅ Service report generation
✅ Offline-first field support with cloud sync
✅ Connected instrument architecture
✅ Private data protection

Download now and transform your HVAC field operations.
```

---

## Review Preparation (Manual Actions)

### Provide Reviewer Access

- [ ] **Test Account Created** (if login required)
  - Email: qa@wise2.net (or Google Play-provided test account)
  - Password: [Provided in play-store/REVIEWER_ACCESS.md]
  - Permissions: Full access to demo data

- [ ] **Instructions Document**: Created
  - [ ] See template below

### Reviewer Instructions

Save as `play-store/REVIEWER_ACCESS.md`:

```markdown
# Access Instructions for Google Play Reviewers

## Login

**Email**: qa@wise2.net  
**Password**: [PROVIDED IN SECURE MESSAGE]

## Demo Scenario

Upon first launch, you have two options:

1. **Demo Mode** (Recommended for review):
   - Tap "DEMO MODE" on login screen
   - Provides pre-populated test jobs and equipment
   - No actual customer data
   - All features are functional

2. **Test Account**:
   - Login with email above
   - Access to sandbox environment
   - Pre-created jobs and equipment

## Key Workflows to Test

1. **Login**: Use email/password above OR tap "DEMO MODE"
2. **Home Screen**: View today's jobs
3. **Job Detail**: Tap any job to see full context
4. **Diagnostics**: Tap "Diagnose" button, select "No Cooling"
5. **Measurements**: Enter test pressure/temp values
6. **IMP Chat**: Ask "What should I test next?"
7. **Report**: Complete diagnostic, generate report
8. **Settings**: Toggle demo mode, check app version

## Expected Behaviors

- All screens load within 2 seconds
- Tap feedback is responsive
- Camera permissions are optional
- Bluetooth optional
- Offline mode works (disable network in settings)
- Dark mode is primary UI

## Contact

For access issues: support@wise2.net

## Duration

Test account access active through [EXPIRY DATE]
```

---

## Post-Submission Monitoring (Manual, Ongoing)

### During Review (24-48 hours typical)

- [ ] Monitor Play Console for review status
- [ ] Check for rejection reasons (if applicable)
- [ ] Prepare response to feedback within 48 hours

### After Approval (Release Week)

- [ ] **Crash Monitoring**:
  - [ ] Set up alerts for crash rate > 1%
  - [ ] Monitor ANRs (Application Not Responding)
  - [ ] Watch logcat for errors

- [ ] **User Feedback**:
  - [ ] Monitor ratings
  - [ ] Read first reviews for common issues
  - [ ] Respond to issues within 24 hours

- [ ] **Performance**:
  - [ ] Check average session duration
  - [ ] Monitor uninstall rate
  - [ ] Validate offline sync is working

### Post-Launch Rollout

- [ ] **Staged Rollout** (if chosen):
  - [ ] Start: 5% on day 1
  - [ ] Increase to 25% on day 3 (if crash rate < 0.5%)
  - [ ] Increase to 50% on day 7
  - [ ] Full rollout (100%) by day 14
  
- [ ] **Track Metrics**:
  - [ ] Downloads per day
  - [ ] Active users
  - [ ] Crash rate
  - [ ] ANR rate
  - [ ] Average rating

---

## Immediate Follow-Up (Post v1.0 Launch)

- [ ] Plan v1.0.1 (bug fixes)
- [ ] Monitor user feedback for v1.1 features
- [ ] Schedule Fieldpiece SDK integration
- [ ] Plan enhanced AI model
- [ ] Document known limitations

---

## Success Criteria

✅ App launches without crashes  
✅ Demo mode works  
✅ All 9 screens render correctly  
✅ Offline mode functional  
✅ Sync works when online  
✅ HVAC calculations produce correct results  
✅ Diagnostic workflows complete  
✅ IMP chat responds  
✅ Ratings > 4.0 stars within 30 days  
✅ Uninstall rate < 15% within 30 days  

---

## Timeline

| Date | Milestone | Owner |
|------|-----------|-------|
| 2026-08-23 | Audit complete, docs prepared | Claude |
| 2026-08-24 | Assets submitted to designer | dwise |
| 2026-08-28 | Assets completed | Designer |
| 2026-08-29 | Final build verification | dwise |
| 2026-08-30 | Submit to Play Console | dwise |
| 2026-09-01 | Review period (24-48h) | Google |
| 2026-09-02 | Approved & Live (or iterate on feedback) | dwise |

---

## Final Verification Checklist

Before clicking "Submit":

```
Code:
  ☐ Builds without errors
  ☐ Tests passing
  ☐ No hardcoded secrets
  ☐ API points to production

Assets:
  ☐ Icon 512×512 ready
  ☐ Feature graphic ready
  ☐ Screenshots captioned
  ☐ All images optimized

Metadata:
  ☐ App name correct
  ☐ Short description ≤ 80 chars
  ☐ Full description ≤ 4000 chars
  ☐ Release notes filled
  ☐ Contact email valid

Security:
  ☐ Privacy policy published
  ☐ Data safety form complete
  ☐ No malware/violations
  ☐ Permissions justified

Compliance:
  ☐ Not targeting children
  ☐ No misleading claims
  ☐ No policy violations
  ☐ Rating form complete

Launch:
  ☐ Rollout strategy chosen
  ☐ Reviewer access ready
  ☐ Monitoring configured
  ☐ Post-launch plan ready
```

**READY TO SUBMIT** ✅

