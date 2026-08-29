# WISE² iOS Command Center — Architecture

## Project Structure

```
WISE2.xcodeproj/
├── WISE2/
│   ├── App/
│   │   ├── WISE2App.swift                  # @main entry point
│   │   ├── AppDelegate.swift               # Lifecycle, notifications
│   │   └── SceneDelegate.swift             # Scene management
│   │
│   ├── Core/
│   │   ├── Authentication/
│   │   │   ├── AuthManager.swift           # Auth state, JWT
│   │   │   ├── KeychainManager.swift       # Secure storage
│   │   │   └── LocalAuthenticationManager.swift # Face ID
│   │   │
│   │   ├── Networking/
│   │   │   ├── APIClient.swift             # URLSession wrapper
│   │   │   ├── NetworkMonitor.swift        # Reachability
│   │   │   └── APIModels.swift             # Request/response types
│   │   │
│   │   ├── Database/
│   │   │   ├── SyncManager.swift           # Offline sync queue
│   │   │   ├── CacheManager.swift          # SwiftData models
│   │   │   └── LocalModels.swift           # Codable caching
│   │   │
│   │   └── Security/
│   │       ├── SecurityManager.swift       # SSL pinning, etc.
│   │       └── AuditLogger.swift           # Audit trail
│   │
│   ├── Services/
│   │   ├── AuthService.swift               # Login, signup, refresh
│   │   ├── CRMService.swift                # Clients, leads, opportunities
│   │   ├── ProjectService.swift            # Projects, tasks
│   │   ├── SystemService.swift             # Health, deployments, logs
│   │   ├── AIService.swift                 # AI commands, actions
│   │   ├── AnalyticsService.swift          # Metrics, reports
│   │   ├── NotificationService.swift       # APNs, local notifications
│   │   └── SearchService.swift             # Universal search
│   │
│   ├── Models/
│   │   ├── User.swift                      # User, Role, permissions
│   │   ├── CRM.swift                       # Client, Lead, Opportunity
│   │   ├── Project.swift                   # Project, Task, Subtask
│   │   ├── System.swift                    # Service, Incident, Deployment
│   │   ├── AI.swift                        # Command, Action, Result
│   │   └── Common.swift                    # Pagination, Status enums
│   │
│   ├── Views/
│   │   ├── Navigation/
│   │   │   ├── MainTabView.swift           # 5-tab structure
│   │   │   ├── HomeTab.swift               # HOME tab coordinator
│   │   │   ├── AITab.swift                 # AI tab coordinator
│   │   │   ├── WorkTab.swift               # WORK tab coordinator
│   │   │   ├── SystemsTab.swift            # SYSTEMS tab coordinator
│   │   │   └── MoreTab.swift               # MORE tab coordinator
│   │   │
│   │   ├── Home/
│   │   │   ├── HomeScreen.swift            # Main home dashboard
│   │   │   ├── NotificationCenterView.swift
│   │   │   ├── ModuleLauncher.swift        # Grid of module shortcuts
│   │   │   └── Components/                 # Alert card, metric card, etc.
│   │   │
│   │   ├── AI/
│   │   │   ├── AIConversationView.swift    # Chat interface
│   │   │   ├── AIActionCard.swift          # Action confirmation cards
│   │   │   ├── VoiceInputView.swift        # Voice recording
│   │   │   ├── ActionHistoryView.swift     # Past AI actions
│   │   │   └── Components/                 # Message bubble, action card
│   │   │
│   │   ├── Work/
│   │   │   ├── WorkDashboard.swift         # Tab container
│   │   │   ├── CRM/
│   │   │   │   ├── ClientListView.swift
│   │   │   │   └── ClientDetailView.swift
│   │   │   ├── Projects/
│   │   │   │   ├── ProjectListView.swift
│   │   │   │   └── ProjectDetailView.swift
│   │   │   ├── Tasks/
│   │   │   │   ├── TaskListView.swift
│   │   │   │   └── TaskDetailView.swift
│   │   │   └── Pipeline/
│   │   │       └── PipelineView.swift      # Kanban
│   │   │
│   │   ├── Systems/
│   │   │   ├── SystemStatusView.swift
│   │   │   ├── ServiceDetailView.swift
│   │   │   ├── IncidentListView.swift
│   │   │   ├── DeploymentView.swift
│   │   │   └── LogsView.swift
│   │   │
│   │   ├── More/
│   │   │   ├── ModuleGridView.swift
│   │   │   ├── Billing/
│   │   │   ├── Analytics/
│   │   │   ├── Files/
│   │   │   ├── Settings/
│   │   │   ├── Account/
│   │   │   └── AuditLog/
│   │   │
│   │   ├── Auth/
│   │   │   ├── LoginView.swift
│   │   │   ├── SignupView.swift
│   │   │   └── AuthGate.swift              # Auth flow
│   │   │
│   │   ├── Shared/
│   │   │   ├── SearchOverlay.swift         # Spotlight-style search
│   │   │   ├── ActionConfirmation.swift    # Level 2/3 confirm modal
│   │   │   ├── LoadingView.swift
│   │   │   ├── ErrorView.swift
│   │   │   ├── EmptyStateView.swift
│   │   │   └── Components/                 # Reusable UI pieces
│   │   │       ├── HeaderView.swift
│   │   │       ├── CardView.swift
│   │   │       ├── MetricCard.swift
│   │   │       ├── AlertCard.swift
│   │   │       └── ActionButton.swift
│   │   │
│   │   └── DesignSystem/
│   │       ├── Colors.swift                # WISE² color palette
│   │       ├── Typography.swift            # Font styles
│   │       ├── Spacing.swift               # Layout constants
│   │       ├── Shadows.swift               # Shadow definitions
│   │       └── Animations.swift            # Animation curves
│   │
│   ├── ViewModels/
│   │   ├── HomeViewModel.swift
│   │   ├── AIViewModel.swift
│   │   ├── CRMViewModel.swift
│   │   ├── ProjectViewModel.swift
│   │   ├── SystemViewModel.swift
│   │   └── SearchViewModel.swift
│   │
│   ├── Utils/
│   │   ├── Extensions/                     # Swift + SwiftUI extensions
│   │   ├── Formatters/                     # Date, currency formatters
│   │   ├── Helpers/                        # Misc utilities
│   │   └── Constants.swift                 # App-wide constants
│   │
│   ├── Resources/
│   │   ├── Assets.xcassets/
│   │   ├── Fonts/
│   │   └── Localizable.strings             # i18n
│   │
│   └── Preview/
│       └── PreviewData.swift               # Mock data for SwiftUI Preview
│
├── Tests/
│   ├── Unit/
│   │   ├── AuthServiceTests.swift
│   │   ├── APIClientTests.swift
│   │   └── ... more unit tests
│   │
│   └── Integration/
│       └── ... integration tests
│
└── Info.plist
```

---

## Data Flow Architecture

### Authentication Flow
```
LoginView → AuthManager.login() 
  → APIClient.post(/auth/login)
  → JWT token received
  → Keychain.save(token)
  → @Published isAuthenticated = true
  → MainTabView rendered
```

### API Request Flow
```
ViewModel.fetchData()
  → Service.getData()
  → APIClient.request(endpoint)
  → NetworkMonitor.isOnline?
    YES → URLSession request
    NO → CacheManager.read()
  → Parse response → Model
  → @Published data updated
  → View re-renders
```

### Offline Sync Flow
```
User offline, creates task
  → SyncQueue.add(operation)
  → LocalModels.save(draft)
  → View shows "Syncing..."
  
Reconnect to network
  → NetworkMonitor.didBecomeReachable
  → SyncManager.processPending()
  → Each operation retried
  → Success → delete from queue
  → Failure → mark for manual retry
```

### AI Action Flow
```
User: "Create task"
  → AIService.executeCommand()
  → Determine action type (CREATE)
  → Show ActionConfirmation (Level 2)
  → User confirms + Face ID
  → AIService.execute()
  → Call relevant Service
  → Return result card
  → Log to audit trail
```

---

## Service Layer Contracts

### AuthService
```swift
protocol AuthServiceProtocol {
  func login(email: String, password: String) async throws -> AuthToken
  func signup(email: String, password: String, name: String) async throws -> User
  func logout() throws
  func refreshToken() async throws -> AuthToken
  func verifySession() async throws -> User
}
```

### CRMService
```swift
protocol CRMServiceProtocol {
  func listClients(page: Int) async throws -> [Client]
  func getClient(id: String) async throws -> ClientDetail
  func updateClient(id: String, data: ClientUpdate) async throws -> Client
  func listLeads() async throws -> [Lead]
  func updateLead(id: String, status: LeadStatus) async throws -> Lead
}
```

### ProjectService
```swift
protocol ProjectServiceProtocol {
  func listProjects() async throws -> [Project]
  func getProject(id: String) async throws -> ProjectDetail
  func createProject(data: ProjectCreate) async throws -> Project
  func listTasks(projectId: String) async throws -> [Task]
  func updateTask(id: String, data: TaskUpdate) async throws -> Task
}
```

### SystemService
```swift
protocol SystemServiceProtocol {
  func getSystemHealth() async throws -> SystemStatus
  func getServiceStatus(serviceId: String) async throws -> ServiceDetail
  func listIncidents() async throws -> [Incident]
  func getDeploymentHistory() async throws -> [Deployment]
  func getLogEntries(filter: LogFilter) async throws -> [LogEntry]
}
```

### AIService
```swift
protocol AIServiceProtocol {
  func executeCommand(text: String, context: AIContext) async throws -> AIResult
  func confirmAction(actionId: String) async throws -> ActionResult
  func getActionHistory() async throws -> [AIAction]
  func supportedCommands() -> [CommandTemplate]
}
```

---

## State Management Pattern

### Global AppState
```swift
@MainActor
class AppState: ObservableObject {
  @Published var currentUser: User?
  @Published var userRole: UserRole?
  @Published var isOnline: Bool = true
  @Published var syncStatus: SyncStatus = .idle
  @Published var activeAlert: AlertConfig?
  
  // Services
  let authService: AuthService
  let crmService: CRMService
  // ... other services
}
```

### ViewModel Pattern
```swift
@MainActor
class HomeViewModel: ObservableObject {
  @Published var dashboardData: DashboardData?
  @Published var isLoading: Bool = false
  @Published var error: Error?
  
  private let service: HomeService
  
  func loadDashboard() async {
    isLoading = true
    do {
      dashboardData = try await service.getDashboard()
    } catch {
      self.error = error
    }
    isLoading = false
  }
}
```

---

## Security Architecture

### Authentication
- JWT tokens (Bearer auth)
- Token refresh before expiry
- Keychain storage (secure enclave on newer devices)
- Automatic logout on 401/403

### Biometric
- Face ID integration for sensitive operations (Level 2/3 actions)
- LocalAuthentication framework
- Fallback to PIN if Face ID fails

### Network
- HTTPS only
- Certificate pinning (optional for extra security)
- Request signing where needed

### Audit Trail
- All mutations logged server-side
- User, action, timestamp, result
- Accessible in Audit Log view

### Role-Based Access
- Server-side RBAC (source of truth)
- Client-side UI hiding (for UX, not security)
- All sensitive actions require server verification

---

## Testing Strategy

### Unit Tests
- Service layer logic
- ViewModel calculations
- Model parsing
- Formatters

### Integration Tests
- Full request/response cycles (with mock API)
- Authentication flow
- Offline sync scenarios
- Error handling

### UI Tests
- Navigation between tabs
- Critical user flows
- Form validation
- Empty/error states

### Preview Tests
- SwiftUI previews for all views
- Dark/light mode compatibility
- Dynamic type (accessibility)
- iPhone/iPad layouts

---

## Deployment & Distribution

### Build Configuration
- Debug: Local API, mock data enabled
- Release: Production API, analytics enabled, debug info stripped

### Code Signing
- Automatic signing with development team
- Distribution signing for TestFlight/App Store

### Version Management
- Major.Minor.Patch in Info.plist
- Build number auto-incremented

### Monitoring
- Crash analytics (Sentry/Firebase)
- Performance monitoring
- User session tracking

---

## Performance Targets

- **Launch Time**: < 2 seconds cold, < 500ms warm
- **API Response**: < 500ms (p95)
- **List Scrolling**: 60 FPS (no jank)
- **Memory**: < 150MB typical usage
- **Battery**: < 5% drain per hour of normal use

---

## Accessibility Requirements

- VoiceOver support for all interactive elements
- Dynamic Type (text size adjustment)
- High contrast mode support
- Reduced motion accommodation
- Keyboard navigation support
- Proper label hierarchy

