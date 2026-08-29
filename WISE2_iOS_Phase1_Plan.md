# WISE² iOS Command Center — Phase 1 Implementation Plan

## Phase 1: Foundation & Home Dashboard

**Duration**: 2 weeks (aggressive) → 3 weeks (comfortable)  
**Success Criteria**: Polished app launches with functional home dashboard, auth, and navigation ready for subsequent phases.

---

## Deliverables Overview

```
┌─ Xcode Project Setup
├─ Design System (iOS)
├─ Authentication
├─ Navigation Shell (5 tabs)
├─ Home Dashboard
├─ API Integration
├─ Error/Loading States
├─ Offline Support (basic)
└─ SwiftUI Previews + Tests
```

---

## Week 1: Foundation

### 1.1 Xcode Project Setup (Day 1)
**Deliverable**: Clean, properly structured Xcode project

- [ ] Create WISE2.xcodeproj with standard folder structure
- [ ] Set up build configurations (Debug, Release)
- [ ] Configure Info.plist with required keys
- [ ] Set up CocoaPods/SPM for dependencies (if needed)
- [ ] Create project.pbxproj with proper code signing
- [ ] Add .gitignore and initial git commit

**Dependencies**:
```swift
// Minimal - use standard library + system frameworks
- SwiftUI (system)
- URLSession (system)
- Keychain (Security framework)
- LocalAuthentication (system)
- os.log (system)
```

---

### 1.2 Design System Adaptation (Days 1-2)
**Deliverable**: iOS-native design system matching WISE² brand

- [ ] Create `DesignSystem/Colors.swift` with WISE² palette
  - Background: #050505 (carbon black)
  - Surface: #0D1117 (graphite)
  - Primary: #0094FF (electric blue)
  - Semantic colors (success, warning, danger, info)
  
- [ ] Create `DesignSystem/Typography.swift`
  - `.system()` fonts with fallback to SF Pro
  - Display, headline, body, caption scales
  - Font weights matching WISE² identity
  
- [ ] Create `DesignSystem/Spacing.swift`
  - Constants: 4, 8, 12, 16, 20, 24, 32 pt
  - Padding helpers
  
- [ ] Create `DesignSystem/Shadows.swift`
  - Subtle, medium, large shadow definitions
  
- [ ] Create reusable components
  - `CardView` - Consistent card styling
  - `HeaderView` - Consistent header with logo/user
  - `MetricCard` - KPI display
  - `ActionButton` - Primary/secondary button styles

**File**: `Views/DesignSystem/`

---

### 1.3 Authentication Infrastructure (Days 2-3)
**Deliverable**: Working login/signup flow with JWT + Keychain storage

- [ ] `KeychainManager.swift`
  - Store/retrieve JWT tokens securely
  - Store/retrieve user credentials (optional)
  
- [ ] `AuthManager.swift`
  - State management (@Published properties)
  - login(email, password) async throws
  - signup(email, password, name) async throws
  - logout()
  - refreshToken() automatic before expiry
  - verifySession() on app launch
  
- [ ] `LocalAuthenticationManager.swift`
  - Face ID availability check
  - Face ID prompt + authentication
  - Fallback handling
  
- [ ] `LoginView.swift`
  - Email + password fields
  - Signup/Login toggle
  - Error display
  - Loading state
  - "Remember me" toggle
  
- [ ] `AuthGate.swift` (in App/)
  - Route: unauthorized → LoginView : MainTabView

**Security**:
- Tokens stored in Keychain (secure enclave)
- No passwords stored locally
- Automatic session refresh
- Automatic logout on 401

---

### 1.4 API Client & Networking (Days 3-4)
**Deliverable**: Reusable API client with mock mode for development

- [ ] `NetworkModels.swift`
  - Request/response envelopes
  - Error handling
  - Pagination
  
- [ ] `APIClient.swift`
  - URLSession wrapper
  - Bearer token injection
  - Retry logic (exponential backoff)
  - Error mapping
  - Mock mode flag for development
  
- [ ] `NetworkMonitor.swift`
  - Detect online/offline
  - NWPathMonitor for reachability
  
- [ ] Create mock data for preview/testing
  - Mock API responses
  - Sample users, projects, clients

**Endpoints to integrate**:
```
POST   /v1/auth/login
POST   /v1/auth/signup
POST   /v1/auth/refresh
GET    /v1/auth/me
GET    /v1/config/health
GET    /v1/dashboard/metrics
```

---

### 1.5 Data Models (Day 4)
**Deliverable**: Codable models for API responses

- [ ] `User.swift` - User, UserRole, permissions
- [ ] `Auth.swift` - AuthToken, LoginRequest, SignupRequest
- [ ] `Dashboard.swift` - DashboardMetrics, KPI, Alert
- [ ] `Common.swift` - PagedResponse, Status enums, timestamps

All models: `Codable`, date handling with ISO8601 decoder

---

## Week 2: Navigation & Home Dashboard

### 2.1 Navigation Shell (Days 5-6)
**Deliverable**: Five-tab navigation structure with placeholder screens

- [ ] `MainTabView.swift`
  - TabView with 5 tabs: HOME | AI | WORK | SYSTEMS | MORE
  - Tab icons using SF Symbols
  - Persistent bottom tab bar
  - Environment injection of AppState
  
- [ ] Tab coordinators (minimal stub implementations):
  - `HomeTab.swift` → HomeScreen placeholder
  - `AITab.swift` → AI input screen placeholder
  - `WorkTab.swift` → Work list placeholder
  - `SystemsTab.swift` → Systems status placeholder
  - `MoreTab.swift` → Module grid placeholder

**Navigation style**:
- Tab switching via TabView selection
- Each tab has independent navigation stack (NavigationStack)
- Deep linking support via deep links in app delegate

---

### 2.2 Home Dashboard - Main Screen (Days 6-7)
**Deliverable**: Functional, data-driven home dashboard

```
┌─ WISE² Header + User Menu
├─ Ask WISE² Command Bar (placeholder)
├─ Critical Alerts Section
├─ Business Pulse (KPIs)
├─ Active Work (tasks)
├─ System Health
├─ Recent AI Actions (empty for Phase 1)
└─ Module Launcher Grid
```

Components to build:
- [ ] `HomeScreen.swift` - Main dashboard scroll view
- [ ] `AlertCardView.swift` - Alert display
- [ ] `MetricCardView.swift` - KPI metric cards
- [ ] `SystemHealthCardView.swift` - Service status
- [ ] `ModuleLauncherView.swift` - Grid of shortcuts

**Data flow**:
- HomeViewModel loads dashboardMetrics on appear
- API endpoint: `GET /v1/dashboard/metrics`
- Display loading skeleton while fetching
- Handle offline gracefully (show cached data)

---

### 2.3 Shared Components & Navigation (Day 7)
**Deliverable**: Reusable components used across tabs

- [ ] `SearchOverlay.swift` - Spotlight-style search (shell)
- [ ] `ProfileMenuView.swift` - User profile dropdown
- [ ] `LoadingView.swift` - Skeleton screens
- [ ] `ErrorStateView.swift` - Error display with retry
- [ ] `EmptyStateView.swift` - Contextual empty messages
- [ ] `PullToRefresh.swift` - Refresh control

---

## Week 3: Integration, Testing, Polish

### 3.1 Offline Support & Sync (Days 8-9)
**Deliverable**: Basic caching and offline handling

- [ ] `CacheManager.swift`
  - SwiftData models for offline storage
  - Cache user, dashboard metrics
  - Expiry handling
  
- [ ] `SyncManager.swift` (basic)
  - Queue for operations
  - Process queue on reconnect
  - Display sync status in UI
  
- [ ] Update API client
  - Check NetworkMonitor.isOnline
  - Fall back to cache if offline
  - Show "Offline mode" badge when needed

---

### 3.2 SwiftUI Previews & Testing (Days 9-10)
**Deliverable**: Comprehensive preview support and unit tests

- [ ] Add SwiftUI previews to every view
  - Different states (loading, empty, error)
  - Light/dark mode
  - Different text sizes (Dynamic Type)
  - iPhone/iPad layouts
  
- [ ] Create `PreviewData.swift`
  - Mock objects for preview
  - Sample user, metrics, etc.
  
- [ ] Unit tests:
  - `AuthManagerTests.swift`
  - `APIClientTests.swift` (with mock URLSession)
  - `KeychainManagerTests.swift`
  - `SyncManagerTests.swift`
  
- [ ] Integration tests:
  - Full auth flow
  - Dashboard data loading
  - Offline → online sync

---

### 3.3 Error Handling & States (Day 10)
**Deliverable**: Graceful error handling throughout app

- [ ] Update all services to throw clear errors
- [ ] Add error handlers to all ViewModels
- [ ] Display errors with user-friendly messages
- [ ] Add retry buttons to error states
- [ ] Log errors for debugging

Common scenarios:
- Network timeout
- 401 Unauthorized (auto-logout)
- 403 Forbidden (show permission error)
- 500 Server Error (show retry)
- No internet (show offline mode)

---

### 3.4 Polish & Accessibility (Days 10-12)
**Deliverable**: Professional, accessible app

**Design polish**:
- [ ] Review all padding/spacing against WISE² tokens
- [ ] Ensure consistent text sizing
- [ ] Smooth transitions between screens
- [ ] Haptic feedback on button taps
- [ ] Load animations (skeleton → content)

**Accessibility**:
- [ ] Add VoiceOver labels to all interactive elements
- [ ] Test with VoiceOver enabled
- [ ] Support Dynamic Type (text size)
- [ ] Sufficient color contrast
- [ ] Keyboard navigation support
- [ ] Reduce motion support

**Performance**:
- [ ] Profile with Xcode Instruments
- [ ] Ensure 60 FPS list scrolling
- [ ] Lazy loading for large lists
- [ ] Image optimization
- [ ] Memory leak checks

---

### 3.5 Final Integration & Testing (Day 12)
**Deliverable**: Production-ready Phase 1

- [ ] Test on physical device
- [ ] Test on iPad (responsive layout)
- [ ] Test offline scenarios
- [ ] Test Face ID flow
- [ ] Test app launch performance
- [ ] Final build optimization

---

## Testing Checklist

### Functional Testing
- [ ] Login/signup flow works
- [ ] JWT refresh automatic
- [ ] Logout clears session
- [ ] Home dashboard loads data
- [ ] Pull-to-refresh works
- [ ] Navigation between tabs works
- [ ] Offline mode shows cached data
- [ ] Reconnect syncs pending operations

### UI Testing
- [ ] All text readable
- [ ] Buttons accessible
- [ ] No layout issues on iPhone/iPad
- [ ] Dark mode works
- [ ] Dynamic type scaling works
- [ ] Animations smooth

### Error Scenarios
- [ ] Network timeout handled
- [ ] 401 logout flow
- [ ] 403 permission error
- [ ] 500 server error
- [ ] No internet connection
- [ ] Session expired mid-request

### Performance
- [ ] Launch time < 2 seconds (cold)
- [ ] Dashboard loads < 1 second (warm)
- [ ] Scroll 60 FPS
- [ ] Memory < 150MB typical
- [ ] No memory leaks

---

## Success Criteria Checklist

Phase 1 is complete when:

- [ ] ✅ App launches and runs without crashes
- [ ] ✅ Authentication (login/signup/logout) works
- [ ] ✅ Home dashboard displays live data from API
- [ ] ✅ Five-tab navigation fully functional
- [ ] ✅ Design system applied throughout
- [ ] ✅ Offline mode (basic) works
- [ ] ✅ Error states gracefully handled
- [ ] ✅ Loading states shown appropriately
- [ ] ✅ All views have SwiftUI previews
- [ ] ✅ Unit tests pass
- [ ] ✅ Accessibility (VoiceOver, Dynamic Type)
- [ ] ✅ Works on physical device
- [ ] ✅ Responsive on iPad
- [ ] ✅ Code well-organized per architecture
- [ ] ✅ No console warnings/errors

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Xcode config issues | Recreate from scratch day 1; test build before going further |
| API endpoint mismatch | Confirm all endpoint paths with API team early |
| SwiftUI performance | Use `.onAppear` and async/await carefully; profile early |
| Code signing | Set up provisioning profile day 1; test on device early |
| Time overrun | Focus on MVP features only; defer polish to Phase 2 |

---

## Next Phases (Summary)

- **Phase 2**: WISE² AI module (conversation, voice, action cards)
- **Phase 3**: WORK module (CRM, projects, tasks)
- **Phase 4**: SYSTEMS module (infrastructure, logs)
- **Phase 5**: BUSINESS module (billing, analytics)
- **Phase 6**: Additional modules and polishing

