# iOS App Signing & Organization Fix

## Current Issues Identified

### Apps Installed/Active
- Blakkhail (com.sencere.blakkhail) - INSTALLED on iPhone
- WISE² Command Center - SIGNED differently
- Mobile iOS (WISE2RP) - May conflict

### Signing Problems
1. Different team IDs across projects
2. Mixed provisioning profiles
3. Cross-contamination between app bundles

## Fix Plan

### Phase 1: Clean & Organize Structure
```bash
# Archive old/problematic builds
mkdir -p /Users/danielwise/Projects/wise2-core/archived_builds
mv /Users/danielwise/Library/Developer/Xcode/DerivedData/* archived_builds/ 2>/dev/null || true
```

### Phase 2: Standardize Code Signing
```
TEAM_ID: FB042344774DE4FA29C74D7260790DD49A04F257
BUNDLE_ID_PREFIX: com.sencere
SIGNING_IDENTITY: iOS Team Provisioning Profile
```

### Phase 3: App Registry
```
Registry:
├── Blakkhail (com.sencere.blakkhail)
│   ├── Location: /apps/blakkhail-ios/
│   ├── Status: INSTALLED on iPhone (26.6.1)
│   ├── Team ID: FB042344774DE4FA29C74D7260790DD49A04F257
│   └── Provisioning: iOS Team Profile
│
├── WISE² Command Center (com.dwise954.wise2)
│   ├── Location: /apps/wise2-live-controller/
│   ├── Status: Simulator tested
│   ├── Team ID: [TBD - needs fixing]
│   └── Provisioning: [TBD - needs fixing]
│
└── WISE² RP (com.wise2.rp)
    ├── Location: /apps/mobile-ios/
    ├── Status: Development
    ├── Team ID: [TBD - needs fixing]
    └── Provisioning: [TBD - needs fixing]
```

## Actions to Take

1. [ ] Remove conflicting app versions from device
2. [ ] Clean DerivedData
3. [ ] Fix Blakkhail code signing (already working)
4. [ ] Update WISE² Command Center signing
5. [ ] Test each app independently
6. [ ] Install on all 3 devices

