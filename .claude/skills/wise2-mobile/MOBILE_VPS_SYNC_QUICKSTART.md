# WISE² Mobile-to-VPS Sync: Quick Start

**Time to integrate**: ~30 minutes per platform  
**Platforms**: Android (Kotlin), iOS (Swift)  
**Result**: Mobile app syncs jobs, equipment, readings with VPS backend

---

## Prerequisites

- ✅ Android: FieldTech-Android already has sync implemented (`SyncWorker.kt`)
- ✅ iOS: Need to add sync manager (5-file implementation)
- ✅ VPS: API backend running at `https://api.wise2.net` or `http://173.208.147.165:3000`
- ✅ Networking: Mobile app has internet connectivity

---

## Android (FieldTech) — Already Implemented ✅

### Current Status

- **ApiService**: Retrofit2 client with all endpoints
- **SyncWorker**: WorkManager-based offline queue drain
- **Local DB**: Room database for pending sync items
- **Sync Interval**: 15 minutes (configurable)

### Integration Steps

**1. Configure API endpoint** (`build.gradle.kts`):

```gradle
buildTypes {
    debug {
        buildConfigField("String", "API_BASE_URL", "\"http://localhost:3000\"")
    }
    release {
        buildConfigField("String", "API_BASE_URL", "\"https://api.wise2.net\"")
    }
}
```

**2. Initialize sync on app launch** (`MainActivity.kt`):

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Schedule periodic sync
    SyncWorker.schedulePeriodic(this)
    
    // Trigger immediate sync if app is fresh-opened
    if (isFreshAppLaunch) {
        SyncWorker.runNow(this)
    }
    
    // ... rest of setup
}
```

**3. Test sync** (debug menu or automated):

```kotlin
// Manual sync trigger
SyncWorker.runNow(context)

// Monitor sync status
val workManager = WorkManager.getInstance(context)
workManager.getWorkInfoByIdLiveData(workRequestId).observe(this) { workInfo ->
    when (workInfo?.state) {
        WorkInfo.State.SUCCEEDED -> showSuccess("Sync complete")
        WorkInfo.State.FAILED -> showError("Sync failed")
        WorkInfo.State.RUNNING -> showProgress("Syncing...")
        else -> {}
    }
}
```

**4. Verify endpoints**:

```bash
# From mobile device (or desktop via adb tunnel)
adb shell
curl http://173.208.147.165:3000/v1/fieldtech/jobs

# Expected: JSON array of job objects
```

---

## iOS (FieldTech, Command Center) — Implement Now

### Step 1: Create API Client

**File**: `Shared/Network/APIClient.swift`

```swift
import Foundation

class APIClient {
    static let shared = APIClient()
    
    private let session: URLSession
    private var baseURL: URL
    
    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        config.waitsForConnectivity = true
        self.session = URLSession(configuration: config)
        
        #if DEBUG
        self.baseURL = URL(string: "http://localhost:3000")!
        #else
        self.baseURL = URL(string: "https://api.wise2.net")!
        #endif
    }
    
    // MARK: - Generic Request
    
    func request<T: Decodable>(
        method: String = "GET",
        endpoint: String,
        body: Encodable? = nil,
        headers: [String: String]? = nil
    ) async throws -> T {
        let url = baseURL.appendingPathComponent(endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth header
        if let token = TokenManager.shared.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add custom headers
        if let headers = headers {
            headers.forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        }
        
        // Encode body if present
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        
        let (data, response) = try await session.data(for: request)
        
        // Handle auth errors
        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 401 {
            try await TokenManager.shared.refreshToken()
            return try await request(method: method, endpoint: endpoint, body: body, headers: headers)
        }
        
        // Decode response
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    // MARK: - Fieldtech Endpoints
    
    func getJobs() async throws -> [Job] {
        try await request(endpoint: "v1/fieldtech/jobs")
    }
    
    func getTodaysJobs() async throws -> [Job] {
        try await request(endpoint: "v1/fieldtech/jobs/today")
    }
    
    func getJob(id: String) async throws -> Job {
        try await request(endpoint: "v1/fieldtech/jobs/\(id)")
    }
    
    func createJob(_ job: CreateJobRequest) async throws -> Job {
        try await request(method: "POST", endpoint: "v1/fieldtech/jobs", body: job)
    }
    
    func updateJob(id: String, _ updates: UpdateJobRequest) async throws -> Job {
        try await request(method: "PATCH", endpoint: "v1/fieldtech/jobs/\(id)", body: updates)
    }
}
```

### Step 2: Create Offline Sync Manager

**File**: `Shared/Sync/OfflineSyncManager.swift`

```swift
import Foundation
import CoreData

@MainActor
class OfflineSyncManager: NSObject, ObservableObject {
    static let shared = OfflineSyncManager()
    
    @Published var isSyncing = false
    @Published var lastSyncTime: Date?
    @Published var syncError: String?
    @Published var pendingQueueCount = 0
    
    private let coreDataStack: CoreDataStack
    private var syncTimer: Timer?
    private let syncInterval: TimeInterval = 15 * 60  // 15 minutes
    
    override init() {
        self.coreDataStack = CoreDataStack.shared
        super.init()
        setupPeriodicSync()
    }
    
    // MARK: - Sync Scheduling
    
    private func setupPeriodicSync() {
        syncTimer = Timer.scheduledTimer(withTimeInterval: syncInterval, repeats: true) { [weak self] _ in
            Task { await self?.syncNow() }
        }
    }
    
    // MARK: - Manual Sync Trigger
    
    func syncNow() async {
        guard !isSyncing else { return }
        
        isSyncing = true
        syncError = nil
        
        do {
            await drainPendingQueue()
            lastSyncTime = Date()
        } catch {
            syncError = error.localizedDescription
            print("Sync failed: \(error)")
        }
        
        isSyncing = false
    }
    
    // MARK: - Offline Queue Management
    
    func queueJobUpdate(jobId: String, changes: UpdateJobRequest) async throws {
        let context = coreDataStack.backgroundContext
        await context.perform {
            let entity = NSEntityDescription.entity(forEntityName: "PendingSync", in: context)!
            let pendingItem = NSManagedObject(entity: entity, insertInto: context)
            
            pendingItem.setValue(jobId, forKey: "entityId")
            pendingItem.setValue("job", forKey: "entityType")
            pendingItem.setValue("UPDATE", forKey: "operation")
            pendingItem.setValue(Date(), forKey: "createdAt")
            pendingItem.setValue(false, forKey: "synced")
            
            let encoder = JSONEncoder()
            if let jsonData = try? encoder.encode(changes),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                pendingItem.setValue(jsonString, forKey: "payloadJson")
            }
            
            try? context.save()
        }
        
        updatePendingCount()
    }
    
    func queueJobCreate(job: CreateJobRequest) async throws {
        // Similar to queueJobUpdate, but with "CREATE" operation
        let context = coreDataStack.backgroundContext
        await context.perform {
            // ... implementation
        }
        
        updatePendingCount()
    }
    
    // MARK: - Sync Implementation
    
    private func drainPendingQueue() async {
        let context = coreDataStack.backgroundContext
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "PendingSync")
        fetchRequest.predicate = NSPredicate(format: "synced == false")
        
        guard let pending = try? context.fetch(fetchRequest) as? [NSManagedObject] else { return }
        
        for item in pending {
            await syncItem(item)
        }
    }
    
    private func syncItem(_ item: NSManagedObject) async {
        guard let entityId = item.value(forKey: "entityId") as? String,
              let operation = item.value(forKey: "operation") as? String else { return }
        
        do {
            switch operation {
            case "UPDATE":
                let payloadJson = item.value(forKey: "payloadJson") as? String ?? "{}"
                let data = payloadJson.data(using: .utf8)!
                let updates = try JSONDecoder().decode(UpdateJobRequest.self, from: data)
                _ = try await APIClient.shared.updateJob(id: entityId, updates)
                
            case "CREATE":
                let payloadJson = item.value(forKey: "payloadJson") as? String ?? "{}"
                let data = payloadJson.data(using: .utf8)!
                let createReq = try JSONDecoder().decode(CreateJobRequest.self, from: data)
                _ = try await APIClient.shared.createJob(createReq)
                
            default:
                break
            }
            
            // Mark as synced
            let context = coreDataStack.backgroundContext
            await context.perform {
                item.setValue(true, forKey: "synced")
                try? context.save()
            }
        } catch {
            print("Failed to sync item \(entityId): \(error)")
            // Retry on next sync cycle
        }
    }
    
    private func updatePendingCount() {
        let context = coreDataStack.backgroundContext
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "PendingSync")
        fetchRequest.predicate = NSPredicate(format: "synced == false")
        pendingQueueCount = (try? context.count(for: fetchRequest)) ?? 0
    }
}
```

### Step 3: Add Core Data Schema

**File**: `Shared/Persistence/PendingSync+CoreDataClass.swift`

```swift
import Foundation
import CoreData

@objc(PendingSync)
public class PendingSync: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID
    @NSManaged public var entityId: String
    @NSManaged public var entityType: String  // "job", "reading", "report"
    @NSManaged public var operation: String   // "CREATE", "UPDATE"
    @NSManaged public var payloadJson: String
    @NSManaged public var synced: Bool
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var attemptCount: Int32
}
```

### Step 4: Use in ViewModels

**File**: `Shared/ViewModels/JobListViewModel.swift`

```swift
@MainActor
class JobListViewModel: ObservableObject {
    @Published var jobs: [Job] = []
    @Published var isLoading = false
    @Published var error: String?
    
    @EnvironmentObject var syncManager: OfflineSyncManager
    
    func loadJobs() async {
        isLoading = true
        do {
            jobs = try await APIClient.shared.getTodaysJobs()
            error = nil
        } catch {
            error = error.localizedDescription
            // Show cached jobs if available
        }
        isLoading = false
    }
    
    func updateJob(_ job: Job) async {
        let updates = UpdateJobRequest(
            status: job.status,
            notes: job.notes
        )
        
        do {
            let updated = try await APIClient.shared.updateJob(id: job.id, updates)
            if let index = jobs.firstIndex(where: { $0.id == job.id }) {
                jobs[index] = updated
            }
        } catch {
            // Queue for offline sync
            await syncManager.queueJobUpdate(jobId: job.id, changes: updates)
        }
    }
}
```

### Step 5: Show Sync Status in UI

```swift
struct JobListView: View {
    @StateObject private var viewModel = JobListViewModel()
    @EnvironmentObject var syncManager: OfflineSyncManager
    
    var body: some View {
        VStack {
            // Sync status indicator
            HStack {
                if syncManager.isSyncing {
                    ProgressView()
                        .progressViewStyle(.circular)
                } else if syncManager.pendingQueueCount > 0 {
                    Image(systemName: "arrow.up.circle.fill")
                        .foregroundColor(.orange)
                    Text("\(syncManager.pendingQueueCount) pending")
                } else if let lastSync = syncManager.lastSyncTime {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Synced \(lastSync.timeAgoDisplay)")
                }
            }
            .font(.caption)
            .padding(.horizontal)
            
            // Jobs list
            List {
                ForEach(viewModel.jobs) { job in
                    JobRow(job: job)
                }
            }
        }
        .onAppear {
            Task { await viewModel.loadJobs() }
        }
    }
}
```

---

## VPS Verification

### Check API is accessible

```bash
# From mobile device (or via tunneling)
curl -X GET https://api.wise2.net/v1/fieldtech/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response
{
  "data": [
    {
      "id": "job-123",
      "title": "HVAC Service",
      "status": "open",
      "createdAt": "2026-09-16T10:00:00Z"
    }
  ]
}
```

### Check health endpoint

```bash
# No auth required
curl https://api.wise2.net/health

# Expected response
{
  "status": "ok",
  "timestamp": "2026-09-16T10:15:00Z",
  "database": "connected",
  "redis": "connected"
}
```

---

## Testing Checklist

### Android (FieldTech)

- [ ] App launches, ApiService initializes
- [ ] User can log in with email/Google/Discord
- [ ] Job list loads from `/v1/fieldtech/jobs`
- [ ] Create/update job while online → syncs immediately
- [ ] Turn off network, create/update job → queued
- [ ] Turn on network → SyncWorker runs, job syncs
- [ ] Check WorkManager status in Developer Options

### iOS (FieldTech, Command Center)

- [ ] App launches, APIClient initializes
- [ ] User can log in
- [ ] Job list loads
- [ ] Create/update offline → queued in Core Data
- [ ] Network reconnects → OfflineSyncManager drains queue
- [ ] Verify pending sync items in Core Data inspector

### Both Platforms

- [ ] No console errors during sync
- [ ] Auth token refresh works (intercept 401, refresh, retry)
- [ ] CORS headers present in response
- [ ] Sync completes within 30 seconds
- [ ] Database remains consistent (no data loss)

---

## Environment Configuration

Load configuration from `services/mobile-config/.env.{environment}`:

### Android (build.gradle)

```gradle
android {
    buildTypes {
        debug {
            buildConfigField "String", "API_BASE_URL", 
                "\"${project.properties['api.base.url.debug'] ?: 'http://localhost:3000'}\""
        }
        release {
            buildConfigField "String", "API_BASE_URL",
                "\"${project.properties['api.base.url.release'] ?: 'https://api.wise2.net'}\""
        }
    }
}
```

### iOS (Build Settings)

```
WISE2_API_BASE_URL = $(WISE2_API_BASE_URL_$(CONFIGURATION))
WISE2_API_BASE_URL_Debug = http://localhost:3000
WISE2_API_BASE_URL_Release = https://api.wise2.net
```

---

## Troubleshooting

### "API connection refused"

- [ ] Verify VPS is running: `docker-compose ps`
- [ ] Check firewall allows port 3000/3001
- [ ] Verify DNS: `nslookup api.wise2.net`
- [ ] Try direct IP: `http://173.208.147.165:3000/health`

### "401 Unauthorized after login"

- [ ] Check JWT token in Authorization header
- [ ] Verify token isn't expired (24-hour TTL)
- [ ] Call `/v1/auth/refresh` with refresh token
- [ ] Check `JWT_SECRET` in .env matches between API and token generation

### "Sync worker never runs"

**Android**:
- [ ] Check WorkManager is initialized in Application class
- [ ] Verify network constraint (device must have internet)
- [ ] Check battery optimization settings don't kill the worker

**iOS**:
- [ ] Verify URLSession background tasks enabled in capabilities
- [ ] Check network reachability detection
- [ ] Manually call `syncManager.syncNow()` to test

### "Database locked / sync hangs"

- [ ] Check for long-running queries: `SELECT pid, state_change FROM pg_stat_activity;`
- [ ] Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE idle_in_transaction;`
- [ ] Verify connection pool not exhausted: `SELECT count(*) FROM pg_stat_activity;`

---

## Next Steps

1. **Deploy**: Push configuration files to remote branch
2. **Test**: Run sync integration tests
3. **Monitor**: Set up logging/telemetry for sync metrics
4. **Optimize**: Load test with 100 concurrent mobile clients
5. **Release**: Submit to App Store / Play Store with VPS endpoints

---

**Questions?** See `MOBILE_VPS_SYNC_SETUP.md` for full architecture.
