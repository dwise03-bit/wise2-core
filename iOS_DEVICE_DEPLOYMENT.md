# iOS Device Deployment & Testing Plan

**Status**: Ready for Physical Device Deployment  
**Physical iPhones Detected**: 3 devices connected via USB  
**Target Devices**:
- iPhone (26.6.1) - UUID: 00008140-001A22500AD3401C
- iPhone (27.0) - UUID: 00008150-000C6CE83A38401C
- iPhone 15 Pro maxx (26.4.2) - UUID: 00008130-001455242861401C

---

## Phase 1: App Icon Fix

### Task 1.1: WISE² Command Center Icon
**Location**: `/apps/wise2-live-controller/WISE2LiveControllerTemp/`

```
Icon Sizes Needed:
├── 1024×1024 (App Store)
├── 180×180 (iPhone 6s Plus)
├── 120×120 (iPhone Notification)
├── 87×87 (iPhone Settings)
├── 58×58 (iPhone Spotlight)
└── 29×29 (iPhone Small)
```

**Action Items**:
1. [ ] Create WISE² branded app icon (cyan + navy color scheme)
2. [ ] Generate icon at all required sizes
3. [ ] Update Assets.xcassets with new icons
4. [ ] Verify icon in Xcode project settings
5. [ ] Test icon appears correctly on device

### Task 1.2: Blakkhail iOS Icon
**Location**: `/apps/blakkhail-ios/Assets.xcassets/AppIcon.appiconset/`

**Current Status**: Icon assets exist but may need updating

**Action Items**:
1. [ ] Review existing icons
2. [ ] Update if brand colors don't match latest spec
3. [ ] Verify all sizes are present

---

## Phase 2: Build for Physical Device

### Task 2.1: Code Signing & Provisioning
```bash
# Commands needed:
xcodebuild -project WISE2.xcodeproj \
  -scheme WISE2 \
  -configuration Release \
  -destination 'platform=iOS,id=00008140-001A22500AD3401C' \
  -allowProvisioningUpdates
```

**Action Items**:
1. [ ] Update code signing identity
2. [ ] Configure provisioning profiles
3. [ ] Set bundle identifier (com.dwise954.wise2)
4. [ ] Enable automatic signing in Xcode

### Task 2.2: Build for Device
```bash
# Build for physical device
xcodebuild build-for-testing \
  -project WISE2.xcodeproj \
  -scheme WISE2 \
  -destination 'platform=iOS,id=<DEVICE_UUID>' \
  -configuration Debug
```

**Action Items**:
1. [ ] Clean build folder
2. [ ] Build for Debug configuration
3. [ ] Verify build completes without errors
4. [ ] Generate .app bundle for device

### Task 2.3: Install on Device
```bash
# Deploy to device
xcrun xcode-select --install
xcrun devicectl device install app <APP_PATH> \
  --device 00008140-001A22500AD3401C
```

**Action Items**:
1. [ ] Install app on primary device
2. [ ] Verify app appears on home screen
3. [ ] Check app icon displays correctly
4. [ ] Test app launches successfully

---

## Phase 3: Comprehensive Button & Function Testing

### Tab 1: Home (Dashboard)
**Location**: HomeView component

**Buttons to Test**:
- [ ] Notification bell icon (top right)
- [ ] Profile icon (top right)
- [ ] "ALL BUSINESSES" dropdown
  - [ ] Tap to open selector
  - [ ] Select different business
  - [ ] Verify data updates
- [ ] Revenue card - tap for details
- [ ] Active Clients card - tap for details
- [ ] Open Tasks card - tap for task list
- [ ] AI Actions card - tap for actions
- [ ] "Revenue Over Time" chart - tap for full view
- [ ] "WISE² AI" section - tap for AI assistant

**Expected Actions**:
- Navigation to details view
- Sheet/modal presentation
- Data refresh
- Interactive charts

### Tab 2: AI (Assistant)
**Location**: AIView component

**Buttons to Test**:
- [ ] Message input field
- [ ] Send button
- [ ] Voice input button (if available)
- [ ] Clear history
- [ ] AI suggestions (if visible)
- [ ] Recent conversations list

**Expected Actions**:
- Text input
- Message sending
- Response display
- Conversation history

### Tab 3: Work (Tasks/Projects)
**Location**: WorkView component

**Buttons to Test**:
- [ ] Task list items - tap to open
- [ ] Add new task button (if present)
- [ ] Filter/sort options
- [ ] Mark complete checkbox
- [ ] Priority selector
- [ ] Due date picker
- [ ] Task details editor

**Expected Actions**:
- Task detail view
- Edit task properties
- Update status
- Date selection

### Tab 4: Systems (Settings/Config)
**Location**: SystemsView component

**Buttons to Test**:
- [ ] System settings toggle
- [ ] Configuration options
- [ ] API endpoint selector
- [ ] Theme toggle (if present)
- [ ] Notification settings
- [ ] Data sync controls
- [ ] Cache clear button
- [ ] Logging level selector

**Expected Actions**:
- Settings changes
- System updates
- Preferences save
- State refresh

### Tab 5: More (Additional)
**Location**: MoreView component

**Buttons to Test**:
- [ ] Account settings
- [ ] Help & Support
- [ ] About app
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Logout button
- [ ] App version
- [ ] Feedback button

**Expected Actions**:
- Navigation
- WebView open
- Share sheet
- Logout and return to login

---

## Phase 4: Function Wiring Checklist

### Navigation
- [ ] All tab switches work
- [ ] Back button/gesture works
- [ ] Modal presentation/dismissal works
- [ ] Deep links work (if implemented)

### Data Binding
- [ ] Dashboard metrics update in real-time
- [ ] Business selector updates all views
- [ ] Task list filters work
- [ ] Settings changes persist

### API Integration
- [ ] Login/authentication works
- [ ] Data fetching completes
- [ ] Error handling displays properly
- [ ] Network error recovery works

### User Interactions
- [ ] Text input works
- [ ] Date/time pickers work
- [ ] Toggle switches work
- [ ] Dropdown selectors work
- [ ] List scrolling smooth
- [ ] Gestures (swipe, long-press) work

### Performance
- [ ] App launches < 3 seconds
- [ ] Screen transitions smooth
- [ ] No memory leaks
- [ ] Background refresh works
- [ ] Push notifications work (if enabled)

---

## Phase 5: Deployment Verification

### On Physical Device
- [ ] App installs without errors
- [ ] Icon displays on home screen
- [ ] App launches successfully
- [ ] All tabs accessible
- [ ] All buttons respond
- [ ] Data loads correctly
- [ ] No crashes observed
- [ ] Performance acceptable

### Device Tests
```
Device UUID: 00008140-001A22500AD3401C
Device: iPhone (26.6.1)
iOS Version: 26.6.1
Test Date: [TO_BE_FILLED]
Tester: [TO_BE_FILLED]

Pass/Fail Results:
├── [ ] Installation: PASS / FAIL
├── [ ] Launch: PASS / FAIL
├── [ ] UI Rendering: PASS / FAIL
├── [ ] Navigation: PASS / FAIL
├── [ ] Data Display: PASS / FAIL
├── [ ] Button Responses: PASS / FAIL
├── [ ] API Calls: PASS / FAIL
├── [ ] Error Handling: PASS / FAIL
└── [ ] Overall: PASS / FAIL
```

---

## Phase 6: Bug Fixes & Optimizations

### Known Issues to Address
1. [ ] Button actions not wired in certain views
2. [ ] Modal presentations need completion
3. [ ] Data binding may be incomplete
4. [ ] Error handling UI needs implementation
5. [ ] Network state handling

### Icon Issues to Fix
1. [ ] App icon may not match brand spec
2. [ ] Icon sizes may be incorrect
3. [ ] Icon may not appear on device home screen

---

## Implementation Order

```
Priority 1 (Critical):
1. Fix app icon (all sizes)
2. Build for physical device
3. Install on device
4. Test app launches

Priority 2 (High):
5. Test all tab navigation
6. Test dashboard data display
7. Fix broken button actions
8. Test business selector

Priority 3 (Medium):
9. Test AI assistant functions
10. Test task management
11. Test settings/config
12. Performance optimization

Priority 4 (Low):
13. Polish animations
14. Add loading states
15. Improve error messages
16. Add user guidance
```

---

## Tools & Commands

### Build
```bash
cd /Users/danielwise/Projects/wise2-core/apps/wise2-ios/WISE2

# Clean build
xcodebuild clean -project WISE2.xcodeproj -scheme WISE2

# Build for device
xcodebuild build-for-testing \
  -project WISE2.xcodeproj \
  -scheme WISE2 \
  -destination 'generic/platform=iOS' \
  -configuration Release
```

### Deploy
```bash
# List connected devices
xcrun xctrace list devices

# Install app
xcrun xcode-select --install
xcrun devicectl device install app <APP_BUNDLE.app> \
  --device <DEVICE_UUID>
```

### Test
```bash
# Run UI tests on device
xcodebuild test \
  -project WISE2.xcodeproj \
  -scheme WISE2 \
  -destination 'platform=iOS,id=<UUID>'
```

---

## Success Criteria

✅ **Deployment Complete When**:
- [ ] App icon appears correctly on all devices
- [ ] App installs without code signing errors
- [ ] App launches and displays home screen
- [ ] All 5 tabs navigate correctly
- [ ] Dashboard displays real data
- [ ] All major buttons respond to taps
- [ ] No crashes in first 10 minutes of use
- [ ] App can be launched again after backgrounding

✅ **Testing Complete When**:
- [ ] 100+ button presses tested
- [ ] All 5 tabs fully explored
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Icon displays properly
- [ ] Ready for beta testing

---

## Notes

**Current Status**:
- App running on iPhone 17 simulator ✅
- 3 physical iPhones connected ✅
- Icon assets need review/update ⚠️
- Button wiring incomplete ⚠️
- Device build not started ⏳

**Next Steps**:
1. Create proper app icons
2. Build for physical device
3. Install on iPhone
4. Run comprehensive button tests
5. Fix any wiring issues
6. Deploy final version

**Estimated Time**: 2-3 hours for complete deployment and testing

---

**Last Updated**: 2026-09-15  
**Status**: Ready for Phase 1 (Icon Fix)
