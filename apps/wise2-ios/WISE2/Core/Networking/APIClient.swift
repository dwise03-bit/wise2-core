import Foundation

actor APIClient {
  static let shared = APIClient()

  private let session: URLSession
  private let baseURL: URL
  private let keychainManager = KeychainManager()

  private var mockMode = false // Set to true for development without backend

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 30
    config.timeoutIntervalForResource = 300
    config.waitsForConnectivity = true

    self.session = URLSession(configuration: config)

    // Production backend
    let apiURL = ProcessInfo.processInfo.environment["API_URL"] ??
                 ProcessInfo.processInfo.environment["WISE2_API_URL"] ??
                 "https://wise2.net/api/v1"

    self.baseURL = URL(string: apiURL) ?? URL(fileURLWithPath: "/")

    #if DEBUG
    mockMode = ProcessInfo.processInfo.environment["MOCK_API"] != "false"
    #else
    mockMode = false
    #endif

    print("API client initialized for \(self.baseURL.host ?? "unknown host")")
    print("API mode: \(mockMode ? "MOCK" : "LIVE")")
  }

  // MARK: - Authentication Endpoints

  func login(email: String, password: String) async throws -> AuthResponse {
    let request = LoginRequest(email: email, password: password)
    return try await post("/auth/login", body: request)
  }

  func signup(email: String, password: String, name: String) async throws -> AuthResponse {
    let request = SignupRequest(email: email, password: password, name: name)
    return try await post("/auth/signup", body: request)
  }

  func verifySession() async throws -> User {
    return try await get("/auth/me")
  }

  func refreshToken() async throws -> String {
    struct RefreshResponse: Codable {
      let token: String
    }
    let response: RefreshResponse = try await post("/auth/refresh", body: ["dummy": ""])
    return response.token
  }

  // MARK: - Dashboard Endpoints

  func getDashboardMetrics() async throws -> DashboardMetrics {
    if mockMode { return mockDashboard }
    return try await get("/dashboard/metrics")
  }

  func getSystemHealth() async throws -> SystemHealthResponse {
    if mockMode { return mockSystemHealth }
    return try await get("/systems/health")
  }

  // MARK: - Work Endpoints

  func getCRMData() async throws -> [CRMItem] {
    if mockMode { return mockCRMItems }
    return try await get("/work/crm")
  }

  func getProjects() async throws -> [Project] {
    if mockMode { return mockProjects }
    return try await get("/work/projects")
  }

  func getTasks() async throws -> [WorkTask] {
    if mockMode { return mockTasks }
    return try await get("/work/tasks")
  }

  func updateTaskStatus(_ taskId: String, status: String) async throws {
    if mockMode { return }
    struct UpdateRequest: Codable { let status: String }
    let request = UpdateRequest(status: status)
    try await post("/work/tasks/\(taskId)", body: request) as EmptyResponse
  }

  // MARK: - AI Endpoints

  func chat(prompt: String, scope: String = "ALL BUSINESSES") async throws -> ChatResponse {
    if mockMode {
      try await Task.sleep(nanoseconds: 1_000_000_000)
      return ChatResponse(
        id: UUID().uuidString,
        content: "This is WISE² AI responding to: \"\(prompt)\". In production mode, this connects to the live AI backend.",
        role: .assistant,
        timestamp: Date(),
        source: "WISE² AI (Mock Mode)"
      )
    }

    struct ChatRequest: Codable {
      let message: String
      let scope: String
    }

    let request = ChatRequest(message: prompt, scope: scope)
    return try await post("/ai/chat", body: request)
  }

  func getAIHistory() async throws -> [ChatResponse] {
    if mockMode { return [] }
    return try await get("/ai/history")
  }

  // MARK: - Systems Endpoints

  func getServices() async throws -> [SystemService] {
    if mockMode { return mockServices }
    return try await get("/systems/services")
  }

  func getOperations() async throws -> [Operation] {
    if mockMode { return mockOperations }
    return try await get("/systems/operations")
  }

  // MARK: - HTTP Methods

  private func get<T: Decodable>(_ endpoint: String) async throws -> T {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "GET"
    try injectAuthHeader(&request)

    let (data, response) = try await session.data(for: request)
    try validateResponse(response)

    return try JSONDecoder().decode(T.self, from: data)
  }

  private func post<T: Codable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)

    let (data, response) = try await session.data(for: request)
    try validateResponse(response)

    return try JSONDecoder().decode(R.self, from: data)
  }

  // MARK: - Helpers

  private func injectAuthHeader(_ request: inout URLRequest) throws {
    do {
      let token = try keychainManager.getToken()
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    } catch {
      // No token available, allow for public endpoints
    }
  }

  private func validateResponse(_ response: URLResponse) throws {
    guard let httpResponse = response as? HTTPURLResponse else {
      throw APIError.invalidResponse
    }

    switch httpResponse.statusCode {
    case 200...299:
      break
    case 401:
      throw APIError.unauthorized
    case 403:
      throw APIError.forbidden
    case 404:
      throw APIError.notFound
    case 500...599:
      throw APIError.serverError(httpResponse.statusCode)
    default:
      throw APIError.unknownError(httpResponse.statusCode)
    }
  }

  // MARK: - Mock Data

  private let mockDashboard = DashboardMetrics(
    revenue: 42500.00,
    activeClients: 18,
    activeProjects: 7,
    outstandingTasks: 23,
    systemHealth: "Healthy",
    alerts: [
      DashboardMetrics.Alert(id: "1", severity: "warning", message: "API latency slightly elevated (120ms)"),
      DashboardMetrics.Alert(id: "2", severity: "info", message: "3 tasks due today")
    ]
  )

  private let mockSystemHealth = SystemHealthResponse(
    uptime: "99.98%",
    networkLatency: 23,
    incidents: 1,
    services: [
      SystemService(id: "1", name: "API", status: "Healthy", latency: "45ms", errorRate: "0.0%", requests: "1,200/min", symbol: "network"),
      SystemService(id: "2", name: "PostgreSQL", status: "Healthy", latency: "8ms", errorRate: "0.0%", requests: "500/min", symbol: "cylinder"),
      SystemService(id: "3", name: "Redis", status: "Healthy", latency: "2ms", errorRate: "0.0%", requests: "2,500/min", symbol: "bolt"),
      SystemService(id: "4", name: "Workers", status: "Warning", latency: "120ms", errorRate: "2.3%", requests: "150/min", symbol: "exclamationmark.triangle")
    ]
  )

  private let mockCRMItems = [
    CRMItem(id: "1", title: "Active Clients", subtitle: "All contacts and relationships", details: ["18 clients", "4 prospects", "2 pending"], icon: "person.3.fill", badge: "18"),
    CRMItem(id: "2", title: "Recent Leads", subtitle: "Fresh opportunities", details: ["6 new leads", "2 qualified", "3 interested"], icon: "sparkles", badge: "6"),
    CRMItem(id: "3", title: "Follow-ups", subtitle: "Scheduled touchpoints", details: ["12 pending", "4 due today", "8 this week"], icon: "phone.arrow.up.right", badge: "12")
  ]

  private let mockProjects = [
    Project(id: "1", name: "Command Center iOS", status: "In Progress", progress: 82, teamSize: 2, dueDate: "2026-08-31"),
    Project(id: "2", name: "Website Redesign", status: "In Review", progress: 64, teamSize: 3, dueDate: "2026-09-15"),
    Project(id: "3", name: "API Enhancement", status: "Not Started", progress: 0, teamSize: 1, dueDate: "2026-09-30")
  ]

  private let mockTasks = [
    WorkTask(id: "1", title: "Polish UI animations", project: "Command Center iOS", assignee: "Daniel", priority: "High", dueDate: "Today", status: "In Progress"),
    WorkTask(id: "2", title: "Review design mockups", project: "Website Redesign", assignee: "Creative Team", priority: "High", dueDate: "Tomorrow", status: "To Do"),
    WorkTask(id: "3", title: "Update API docs", project: "API Enhancement", assignee: "Tech Lead", priority: "Medium", dueDate: "2026-09-05", status: "To Do"),
    WorkTask(id: "4", title: "Customer feedback analysis", project: "Command Center iOS", assignee: "Daniel", priority: "Medium", dueDate: "2026-09-01", status: "To Do")
  ]

  private let mockServices = [
    SystemService(id: "1", name: "API", status: "Healthy", latency: "45ms", errorRate: "0.0%", requests: "1,200/min", symbol: "network"),
    SystemService(id: "2", name: "PostgreSQL", status: "Healthy", latency: "8ms", errorRate: "0.0%", requests: "500/min", symbol: "cylinder.fill"),
    SystemService(id: "3", name: "Redis", status: "Healthy", latency: "2ms", errorRate: "0.0%", requests: "2,500/min", symbol: "bolt.fill"),
    SystemService(id: "4", name: "Workers", status: "Warning", latency: "120ms", errorRate: "2.3%", requests: "150/min", symbol: "exclamationmark.triangle.fill"),
    SystemService(id: "5", name: "GPU/Ollama", status: "Healthy", latency: "350ms", errorRate: "0.1%", requests: "80/min", symbol: "bolt.horizontal.fill"),
    SystemService(id: "6", name: "Websites", status: "Healthy", latency: "200ms", errorRate: "0.0%", requests: "5,000/min", symbol: "globe"),
    SystemService(id: "7", name: "Automations", status: "Healthy", latency: "30ms", errorRate: "0.0%", requests: "600/min", symbol: "gearshape.fill")
  ]

  private let mockOperations = [
    Operation(id: "1", name: "Database Backups", status: "Healthy", description: "Last backup: 2 hours ago · 45 GB"),
    Operation(id: "2", name: "Log Aggregation", status: "Healthy", description: "Processing: 2.3 GB/hour"),
    Operation(id: "3", name: "SSL Certificates", status: "Healthy", description: "Next renewal: 45 days"),
    Operation(id: "4", name: "Security Scans", status: "Healthy", description: "Last scan: 6 hours ago"),
    Operation(id: "5", name: "Performance Tuning", status: "Healthy", description: "Cache hit rate: 94.2%")
  ]
}

// MARK: - Models

struct AuthResponse: Codable {
  let token: String
  let user: User
}

struct LoginRequest: Codable {
  let email: String
  let password: String
}

struct SignupRequest: Codable {
  let email: String
  let password: String
  let name: String
}

struct User: Codable, Identifiable {
  let id: String
  let email: String
  let name: String?
  let role: String
}

struct DashboardMetrics: Codable {
  let revenue: Double
  let activeClients: Int
  let activeProjects: Int
  let outstandingTasks: Int
  let systemHealth: String
  let alerts: [Alert]

  struct Alert: Codable, Identifiable {
    let id: String
    let severity: String
    let message: String
  }
}

enum ChatRole: String, Codable {
  case user, assistant
}

struct ChatResponse: Codable, Identifiable {
  let id: String
  let content: String
  let role: ChatRole
  let timestamp: Date
  let source: String?

  enum CodingKeys: String, CodingKey {
    case id, content, role, timestamp, source
  }
}

struct ChatMessage: Identifiable, Codable {
  let id: String
  let content: String
  let role: ChatRole
  let timestamp: Date
  let source: String?

  init(id: String = UUID().uuidString, content: String, role: ChatRole, timestamp: Date = Date(), source: String? = nil) {
    self.id = id
    self.content = content
    self.role = role
    self.timestamp = timestamp
    self.source = source
  }
}

struct AIProposedAction: Codable, Identifiable {
  let id: String
  let title: String
  let exactMutation: String
  let level: String
  let isCritical: Bool
  let auditRows: [String]
}

struct CRMItem: Codable, Identifiable {
  let id: String
  let title: String
  let subtitle: String
  let details: [String]
  let icon: String
  let badge: String
}

struct Project: Codable, Identifiable {
  let id: String
  let name: String
  let status: String
  let progress: Int
  let teamSize: Int
  let dueDate: String
}

struct WorkTask: Codable, Identifiable {
  let id: String
  let title: String
  let project: String
  let assignee: String
  let priority: String
  let dueDate: String
  var status: String
}

struct SystemService: Codable, Identifiable {
  let id: String
  let name: String
  let status: String
  let latency: String
  let errorRate: String
  let requests: String
  let symbol: String
}

struct SystemHealthResponse: Codable {
  let uptime: String
  let networkLatency: Int
  let incidents: Int
  let services: [SystemService]
}

struct Operation: Codable, Identifiable {
  let id: String
  let name: String
  let status: String
  let description: String
}

struct EmptyResponse: Codable {}

// MARK: - Errors

enum APIError: LocalizedError {
  case invalidResponse
  case unauthorized
  case forbidden
  case notFound
  case serverError(Int)
  case unknownError(Int)
  case decodingError(Error)
  case networkError(Error)

  var errorDescription: String? {
    switch self {
    case .invalidResponse:
      return "Invalid response from server"
    case .unauthorized:
      return "Authentication required"
    case .forbidden:
      return "Access denied"
    case .notFound:
      return "Resource not found"
    case .serverError(let code):
      return "Server error (\(code))"
    case .unknownError(let code):
      return "Unknown error (\(code))"
    case .decodingError:
      return "Failed to decode response"
    case .networkError:
      return "Network error"
    }
  }
}
