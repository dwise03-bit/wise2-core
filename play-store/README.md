# WISE² Field Tech - Google Play Store Assets

## 📦 What's Inside

Complete production-ready assets for submitting **WISE² Field Tech** to Google Play Store.

```
play-store/
├── icon_512x512.svg              ← App icon (technical HUD style)
├── feature_graphic_1024x500.svg  ← Hero graphic for store listing
├── STORE_COPY.md                 ← All text copy (title, description, keywords)
├── SCREENSHOT_MOCKUPS.md         ← Detailed layouts for 5-panel story
├── SUBMISSION_CHECKLIST.md       ← Complete submission workflow
└── README.md                     ← This file
```

---

## 🎯 Brand Identity

All assets follow the **WISE² Field Tech premium aesthetic**:

- **Color Palette**: Black (#0a0e1a), Charcoal (#1a1f2e), Electric Blue (#00d4ff), Red (#d63031)
- **Typography**: System fonts (no custom fonts needed)
- **Style**: Technical HUD, professional field-focused, premium not generic
- **Positioning**: AI Copilot (not replacement) for HVAC technicians

---

## 📱 Graphics Assets

### App Icon
- **File**: `icon_512x512.svg`
- **Size**: 512×512px (master, scales down automatically)
- **Export as**: PNG at 512×512 (and auto-scale to 96, 144, 192 for app install)
- **Design**: Technical crosshairs + W² branding + gunmetal frame
- **Use**: Primary launcher icon in Google Play Store

### Feature Graphic
- **File**: `feature_graphic_1024x500.svg`
- **Size**: 1024×500px exactly (no scaling)
- **Export as**: PNG (solid background, no transparency)
- **Design**: Hero message "DIAGNOSE FASTER" + workflow icons + live data display
- **Use**: Featured banner at top of app store listing

---

## 📝 Text Copy

All copy stored in **`STORE_COPY.md`** with these sections:

| Section | Limit | Purpose |
|---------|-------|---------|
| **App Title** | 50 chars | Primary name in Play Store |
| **Short Description** | 80 chars | One-liner tagline |
| **Full Description** | 4000 chars | Complete feature list + positioning |
| **Permissions Justification** | — | Explain why each permission is needed |
| **Promotional Copy** | — | Social media + email templates |
| **Keywords** | — | ASO optimization keywords |

**Key Message**: "DIAGNOSE FASTER. DOCUMENT BETTER. GET THE JOB DONE." + "Your AI Copilot, Not Your Replacement"

---

## 📸 Screenshots

5-panel workflow narrative showing complete technician journey:

1. **DISPATCH** — See upcoming jobs, priority, addresses
2. **EQUIPMENT SCAN** — Point phone at nameplate → instant data extraction
3. **LIVE FIELDPIECE DATA** — Real-time readings in technical HUD style
4. **AI DIAGNOSIS** — WISE² IMP recommends likely causes
5. **SERVICE REPORT** — Professional report ready to email

**Detailed layouts with ASCII mockups** in `SCREENSHOT_MOCKUPS.md`. Each screenshot is **1080×1920px** (9:16 aspect ratio, standard Android).

**How to Create:**
- Option 1: Use Figma/Adobe XD mockups with provided layouts
- Option 2: Screenshot the actual React Native app at 1080×1920
- Export as PNG (RGB, 72dpi minimum)

---

## ✅ Submission Workflow

See **`SUBMISSION_CHECKLIST.md`** for:

- **Pre-submission prep** — Asset finalization, version numbering
- **Build & signing** — APK/AAB creation, code signing
- **Testing checklist** — Functional, UI, performance, security, accessibility tests
- **Play Console setup** — App details, graphics upload, privacy policy
- **Submission steps** — Step-by-step for uploading to Google Play
- **Post-launch** — Monitoring, updates, compliance

**Timeline**: 10-18 days end-to-end (including Google review time)

---

## 🚀 Next Steps

### 1. Finalize Screenshots (Design Team)
- [ ] Create screenshot mockups from layouts in `SCREENSHOT_MOCKUPS.md`
- [ ] Use Figma or screenshot the app at 1080×1920
- [ ] Export as PNG files: `screenshot_1_dispatch.png`, etc.
- [ ] Save to this directory

### 2. Create Privacy Policy (Legal/Product)
- [ ] Write privacy policy covering:
  - Data collection (customer info, equipment readings, photos)
  - GDPR/CCPA compliance (if applicable)
  - Third-party integrations (Fieldpiece, Google, Firebase, etc.)
  - Data deletion/retention
  - Contact info for privacy inquiries
- [ ] Host on WISE Defense website (static page)
- [ ] Get live URL

### 3. Set Up Google Play Account (Product)
- [ ] Create developer account at https://play.google.com/console
- [ ] Register business name and billing info
- [ ] Create new app entry
- [ ] Prepare test accounts (if app has login)

### 4. Build & Test (Android Dev)
- [ ] Build APK/AAB from repository
- [ ] Sign with release keystore
- [ ] Test on real Android 8.0+ device (at least one)
- [ ] Run full testing checklist from `SUBMISSION_CHECKLIST.md`
- [ ] Verify all permissions match declared ones

### 5. Submit (Product)
- [ ] Upload graphics (icon, feature graphic, screenshots)
- [ ] Enter store copy (title, description, keywords)
- [ ] Set category, target audience, content rating
- [ ] Add privacy policy URL and support contact
- [ ] Upload build (APK/AAB)
- [ ] Review and submit to Play Store

### 6. Monitor & Launch (Product)
- [ ] Wait for Google Play review (typically 24-48 hours)
- [ ] Address any feedback from reviewers
- [ ] Once approved, promote via email/social
- [ ] Monitor crash reports and ratings
- [ ] Respond to user reviews promptly

---

## 📋 File Size Checklist

Before uploading, verify file sizes:

| File | Recommended Size | Notes |
|------|------------------|-------|
| icon_512x512.png | < 100 KB | Optimized PNG, 8-bit |
| feature_graphic_1024x500.png | < 200 KB | High resolution, no transparency |
| Each screenshot PNG | 200-500 KB | 1080×1920, 72dpi, RGB |
| APK/AAB | 50-200 MB | Typical for feature-rich app |

Use PNG optimization tools (ImageOptim, PNGCrush) to reduce file sizes if needed.

---

## 🎨 Design System

All visuals use this consistent system:

### Colors
```
--black:     #0a0e1a  (primary background)
--charcoal:  #1a1f2e  (section/card background)
--gunmetal:  #2d3142  (borders, inactive elements)
--blue:      #00d4ff  (primary action/accent)
--red:       #d63031  (alerts, priorities)
--text:      #e8eef5  (primary text)
--text-dim:  #8b95a8  (secondary text)
```

### Typography
- Headline: Bold, 18-24px, electric blue
- Body: Regular, 14-16px, light gray
- Label: Uppercase, 12-14px, medium gray
- Font stack: System fonts (no custom fonts)

### Components
- **Cards**: Charcoal bg + left electric blue border
- **Buttons**: Electric blue text on transparent bg (not filled)
- **Icons**: Emoji or thin-line SVG (1-2px stroke)
- **Alerts**: Red icon/text on charcoal bg

---

## 🔐 Compliance & Legal

Before submission, ensure:

- [ ] **Privacy Policy** — Live URL, covers all data collection
- [ ] **Permissions** — Justified in copy, match app capabilities
- [ ] **Terms of Service** — Available (recommended)
- [ ] **Support Contact** — Email or web form provided
- [ ] **Content Rating** — Questionnaire completed (likely "Everyone")
- [ ] **No Misleading Claims** — App description is accurate
- [ ] **Third-party Attribution** — Fieldpiece and other brands credited

---

## 📞 Support

**Questions about these assets?**
- Product Owner: dwise (dwise03@gmail.com)
- Design: (assign)
- Android Dev: (assign)

**Google Play Help:**
- https://support.google.com/googleplay/android-developer

**WISE Defense Contact:**
- hello@wisedefensellc.com

---

## 📅 Version History

| Date | Version | Status | Notes |
|------|---------|--------|-------|
| Aug 23, 2026 | 1.0 | ✅ Complete | Icon, feature graphic, copy, mockups, checklist |
| — | — | 🔄 Pending | Screenshots (awaiting design), privacy policy (awaiting legal) |

---

## ✨ Summary

**Status**: 🟢 **Ready for Production Submission**

**What's Done:**
- ✅ Premium app icon (technical HUD style)
- ✅ Hero feature graphic (workflow narrative)
- ✅ Complete store copy (title, description, keywords)
- ✅ Detailed screenshot layouts (5-panel story arc)
- ✅ Submission checklist (complete workflow)

**What's Needed:**
- 🟡 Screenshot PNG files (create from mockups)
- 🟡 Privacy policy (write, host on website)
- 🟡 App build/APK (from Android dev)
- 🟡 Google Play account setup (product team)

**Timeline**: 10-18 days to full production launch (including Google review)

---

**Built with ❤️ for field professionals by WISE Defense**  
*Diagnose faster. Document better. Get the job done.*
