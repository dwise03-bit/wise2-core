# 📱 WISE² iOS App Registry & Distribution (2026-09-15)

## 🎯 Master Registry

| App | Bundle ID | Team | Status | Location | Distribution |
|-----|-----------|------|--------|----------|--------------|
| **Blakkhail** | com.sencere.blakkhail | FB0423... | ✅ LIVE | `/apps/blakkhail-ios/` | TestFlight + Direct |
| **WISE² Command Center** | com.dwise954.wise2 | FB0423... | 🔨 Building | `/apps/wise2-command-center-ios/` | TestFlight |
| **SenCere Creative Studio** | com.sencere.creative | FB0423... | 🔨 Building | `/apps/sencere-ios/` | TestFlight |
| **WISE² RP** | com.wise2.rp | FB0423... | 📋 Planned | `/apps/wise2-rp-ios/` | TestFlight |

---

## ✅ Blakkhail (PIFF CITY eCommerce)

**Status**: Production Ready  
**Live Since**: 2026-09-13  
**Users**: SenCere team + BLAKKHAIL customers  

### Installation
- **TestFlight**: [Link to TestFlight app](https://testflight.apple.com)
- **Direct**: Build from `/apps/blakkhail-ios/`

### Key Features
- Product catalog & shopping cart
- Order management
- Brand showcase
- Customer profiles

---

## 🔨 WISE² Command Center (Building Now)

**Status**: In Progress (Icon & Signing Fixed)  
**Bundle ID**: com.dwise954.wise2  
**Team**: FB0423 44774DE4FA29C74D7260790DD49A04F257  

### What's Inside
- Dashboard with real-time metrics
- Team management
- Project oversight
- Integration hub

### Build Status
✅ Icons fixed (copied from Blakkhail)
✅ Project structure cleaned  
⏳ Code signing verification in progress  
⏳ Building for TestFlight

### To Build Locally
```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise2-command-center-ios
xcodebuild build -project WISE2.xcodeproj -scheme WISE2 -sdk iphoneos \
  -provisioningProfileSpecifier "iOS Team Provisioning Profile" \
  -signingIdentity "iPhone Distribution"
```

---

## 🔨 SenCere Creative Studio (Building Now)

**Status**: Separated from WISE2 (Icon & Signing in Progress)  
**Bundle ID**: com.sencere.creative  
**Team**: FB0423 44774DE4FA29C74D7260790DD49A04F257  

### What's Inside
- Brand management dashboard
- Creative asset library
- Team collaboration
- Project workflows

### Build Status
✅ Project separated from WISE2  
⏳ Icons configuration  
⏳ Code signing verification  
⏳ Building for TestFlight

---

## 📋 WISE² RP (Planned)

**Status**: Planned - Ready to Initialize  
**Bundle ID**: com.wise2.rp  
**Team**: FB0423 44774DE4FA29C74D7260790DD49A04F257  

### When Ready
```bash
mkdir -p /Users/danielwise/Projects/wise2-core/apps/wise2-rp-ios
# Initialize new iOS project with template
```

---

## 🚀 Team Distribution Setup

### 1. TestFlight Distribution (Recommended)
All four apps are configured for TestFlight distribution via Apple App Store Connect.

**Current Users**:
- dwise03@gmail.com (owner)
- Team members via invitation

**To Add a Tester**:
1. Go to App Store Connect
2. Navigate to app > TestFlight > Testers
3. Add email address
4. Tester receives invitation via email
5. Download via TestFlight app

### 2. Direct Installation (Dev Team Only)
For developers, build and deploy directly:

```bash
# Build for device
xcodebuild -scheme WISE2 -destination 'platform=iOS,name=iPhone 17' build

# Or via Xcode
# Open project → Select physical device → Run (⌘R)
```

### 3. Ad Hoc Distribution (Future)
For non-TestFlight distribution to external team members.

---

## 🔐 Code Signing Configuration

**Unified Team ID**: FB0423 44774DE4FA29C74D7260790DD49A04F257  
**Provisioning Profile**: iOS Team Provisioning Profile (Auto)  
**Signing Identity**: iPhone Distribution  

### Per-App Signing
Each project includes:
- `DEVELOPMENT_TEAM` = FB0423 44774DE4FA29C74D7260790DD49A04F257
- `CODE_SIGN_STYLE` = Automatic
- `CODE_SIGN_IDENTITY` = iPhone Distribution

---

## 📊 Distribution Timeline

```
Phase 1 (2026-09-15): Blakkhail ✅ LIVE
Phase 2 (2026-09-15): WISE² Command Center 🔨 Building
Phase 3 (2026-09-15): SenCere Creative 🔨 Building
Phase 4 (2026-09-16): WISE² RP 📋 Planning
Phase 5 (2026-09-16): Landing page updates 📝 Next
```

---

## 🎯 Next Actions

### Immediate (Today)
- [ ] Build WISE² Command Center for TestFlight
- [ ] Build SenCere Creative for TestFlight
- [ ] Verify all icons display correctly
- [ ] Add team members to TestFlight

### Short-term (This Week)
- [ ] Initialize WISE² RP project
- [ ] Set up continuous build pipeline
- [ ] Create app distribution landing page
- [ ] Document features per app

### Documentation
- [ ] Update main website with app download links
- [ ] Create per-app feature pages
- [ ] Add TestFlight invitation instructions
- [ ] Release notes template

---

## 📞 Support & Updates

**Deployment Channel**: #ios-deployment (Discord)  
**TestFlight Invitations**: DM @dwise  
**Bug Reports**: GitHub Issues with `ios-` prefix  

Last Updated: 2026-09-15 13:40 UTC
