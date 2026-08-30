import Foundation

actor APIClient {
  static let shared = APIClient()

  private let session: URLSession
  private let baseURL: URL
  private let keychainManager = KeychainManager()
  // Live Nest by default. Operator preview / MOCK_API flips fixtures on.
  private var mockMode = false

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 30
    config.timeoutIntervalForResource = 300
    config.waitsForConnectivity = true
    self.session = URLSession(configuration: config)

    let apiURL = ProcessInfo.processInfo.environment["API_URL"]
      ?? ProcessInfo.processInfo.environment["WISE2_API_URL"]
      ?? "https://wise2.net/api/v1"
    self.baseURL = URL(string: apiURL) ?? URL(string: "https://wise2.net/api/v1")!

    #if DEBUG
    if ProcessInfo.processInfo.environment["MOCK_API"] == "true" {
      mockMode = true
    }
    #endif

    print("API client initialized for \(self.baseURL.absoluteString)")
    print("API mode: \(mockMode ? "OPERATOR PREVIEW" : "LIVE")")
  }

  /// DEBUG / operator preview: serve local business-ops fixtures without a JWT.
  func setOperatorPreviewMode(_ enabled: Bool) {
    mockMode = enabled
    print("API mode: \(mockMode ? "OPERATOR PREVIEW" : "LIVE")")
  }

  var isOperatorPreviewMode: Bool { mockMode }

  // MARK: - Auth

  func login(email: String, password: String) async throws -> AuthResponse {
    if mockMode {
      return AuthResponse(
        token: "preview-token",
        refreshToken: "preview-refresh",
        user: User(
          id: "operator-preview",
          email: email,
          name: "Daniel Wise",
          role: "FOUNDER"
        )
      )
    }
    let request = LoginRequest(email: email, password: password)
    let raw: AuthAPIResponse = try await post("auth/login", body: request)
    return raw.toAuthResponse()
  }

  func signup(email: String, password: String, name: String) async throws -> AuthResponse {
    let parts = name.split(separator: " ", maxSplits: 1).map(String.init)
    let body = SignupAPIRequest(
      email: email,
      password: password,
      firstName: parts.first,
      lastName: parts.count > 1 ? parts[1] : nil
    )
    let raw: AuthAPIResponse = try await post("auth/signup", body: body)
    return raw.toAuthResponse()
  }

  func verifySession() async throws -> User {
    if mockMode {
      return User(
        id: "operator-preview",
        email: "dwise03@gmail.com",
        name: "Daniel Wise",
        role: "FOUNDER"
      )
    }
    let user: User = try await get("auth/me")
    return user
  }

  func refreshToken() async throws -> String {
    guard let refresh = try? keychainManager.getRefreshToken() else {
      throw APIError.unauthorized
    }
    let body = RefreshAPIRequest(refreshToken: refresh)
    let response: RefreshAPIResponse = try await post("auth/refresh", body: body)
    return response.accessToken
  }

  func logout() async throws {
    struct MessageResponse: Codable { let message: String? }
    let _: MessageResponse = try await post("auth/logout", body: EmptyBody())
  }

  // MARK: - Dashboard

  func getDashboardMetrics() async throws -> DashboardMetrics {
    if mockMode { return mockDashboard }
    do {
      let brief: HermesDailyBrief = try await get("hermes/brief/daily")
      return brief.toDashboardMetrics()
    } catch {
      // Compose from public-ish fallbacks when brief is unavailable.
      async let health = fetchPlatformHealth()
      async let stats = fetchCustomerStats()
      let (platformHealth, customerStats) = try await (health, stats)
      return DashboardMetrics(
        revenue: customerStats?.totalMrr ?? 0,
        activeClients: customerStats?.active ?? 0,
        activeProjects: 0,
        outstandingTasks: 0,
        systemHealth: platformHealth,
        alerts: [],
        activeWork: [],
        generatedAt: nil
      )
    }
  }

  func getSystemHealth() async throws -> SystemHealthResponse {
    if mockMode { return mockSystemHealth }

    async let platform = fetchRootHealth()
    async let hermes = fetchHermesHealth()
    async let integrations = fetchIntegrationHealth()

    let (root, hermesHealth, apiHealth) = try await (platform, hermes, integrations)

    var services: [SystemService] = [
      SystemService(
        id: "api",
        name: "WISE2 API",
        status: root.status.capitalizedHealthy,
        latency: "—",
        errorRate: "—",
        requests: "—",
        symbol: "network"
      ),
      SystemService(
        id: "hermes",
        name: "Hermes / Ollama",
        status: hermesHealth.status.capitalizedHealthy,
        latency: "—",
        errorRate: hermesHealth.ollama?.error ?? "0%",
        requests: hermesHealth.model ?? "—",
        symbol: "bolt.horizontal.fill"
      ),
    ]

    for (index, item) in apiHealth.services.enumerated() {
      services.append(
        SystemService(
          id: "svc-\(index)",
          name: item.name,
          status: item.status.capitalizedHealthy,
          latency: "—",
          errorRate: "—",
          requests: "\(item.credentialsConfigured)/\(item.credentialsRequired) creds",
          symbol: "gearshape.fill"
        )
      )
    }

    let degraded = services.filter { $0.status.lowercased() != "healthy" }.count
    return SystemHealthResponse(
      uptime: root.uptime.map { String(format: "%.0fs", $0) } ?? "—",
      networkLatency: 0,
      incidents: degraded,
      services: services
    )
  }

  // MARK: - Work

  func getCRMData() async throws -> [CRMItem] {
    if mockMode { return mockCRMItems }

    async let customersLoad: CustomersListResponse = get("customers")
    async let prospectsLoad: ProspectsListResponse? = try? get("prospects")

    let customersPayload = try await customersLoad
    let prospectsPayload = await prospectsLoad
    let customers = customersPayload.customers
    let prospects = prospectsPayload?.prospects ?? []
    let active = customers.filter { ($0.status ?? "").uppercased() == "ACTIVE" }
    let totalMrr = customers.reduce(0.0) { $0 + ($1.mrr ?? 0) }
    let openPipeline = prospects.filter { !["WON", "LOST"].contains(($0.status ?? "").uppercased()) }
    let opportunity = prospects.reduce(0.0) { $0 + ($1.estimatedOpportunity ?? 0) }

    var details: [String] = [
      "\(active.count) active customers",
      "\(customers.count) total accounts",
      String(format: "$%.0f MRR", totalMrr),
    ]
    details.append(contentsOf: customers.prefix(3).map {
      $0.businessName ?? $0.contactName ?? $0.email ?? "Account"
    })

    return [
      CRMItem(
        id: "active-clients",
        title: "Active Clients",
        subtitle: "Customer book",
        details: details,
        icon: "person.3.fill",
        badge: "\(active.count)"
      ),
      CRMItem(
        id: "pipeline",
        title: "Sales Pipeline",
        subtitle: "Prospects by stage",
        details: [
          "\(openPipeline.count) open prospects",
          "\(prospects.count) total prospects",
          String(format: "$%.0f opportunity", opportunity),
        ] + openPipeline.prefix(3).map { "\($0.businessName ?? $0.contactName ?? "Prospect") · \($0.status ?? "NEW")" },
        icon: "chart.bar.fill",
        badge: "\(openPipeline.count)"
      ),
      CRMItem(
        id: "follow-ups",
        title: "Recent Accounts",
        subtitle: "Latest customer rows",
        details: customers.prefix(5).map {
          "\($0.businessName ?? $0.contactName ?? "Account") · \($0.status ?? "—")"
        },
        icon: "phone.arrow.up.right",
        badge: "\(min(customers.count, 5))"
      ),
    ]
  }

  func getProjects() async throws -> [Project] {
    if mockMode { return mockProjects }
    if let brief: HermesDailyBrief = try? await get("hermes/brief/daily"),
       let rows = brief.recent?.projects, !rows.isEmpty {
      return rows.map {
        Project(
          id: $0.id,
          name: $0.title,
          status: $0.status,
          progress: Self.progress(for: $0.status),
          teamSize: 1,
          dueDate: $0.updatedAt ?? "—"
        )
      }
    }
    return []
  }

  func getTasks() async throws -> [WorkTask] {
    if mockMode {
      return mockHermesActions.map {
        WorkTask(
          id: $0.id,
          title: $0.title,
          project: $0.kind,
          assignee: "Hermes · \($0.mode)",
          priority: $0.risk.capitalized,
          dueDate: $0.createdAt ?? "—",
          status: $0.status
        )
      }
    }
    let actions = try await getHermesActions()
    return actions.map {
      WorkTask(
        id: $0.id,
        title: $0.title,
        project: $0.kind,
        assignee: "Hermes · \($0.mode)",
        priority: $0.risk.capitalized,
        dueDate: $0.status,
        status: $0.status
      )
    }
  }

  func updateTaskStatus(_ taskId: String, status: String) async throws {
    let approve = !(status.lowercased().contains("reject") || status.lowercased() == "rejected")
    try await decideHermesAction(
      id: taskId,
      approve: approve,
      note: "Updated from Command Center Work · \(status)"
    )
  }

  func getActivityFeed() async throws -> [String] {
    if mockMode {
      let fromActions = mockHermesActions.prefix(8).map {
        "\($0.title) · \($0.status) · \($0.risk)"
      }
      return Array(fromActions) + [
        "CRM sync · 18 customers · 6 prospects",
        "Billing · PRO plan active",
        "Systems health check · Healthy",
      ]
    }
    let actions = try await getHermesActions()
    return actions.prefix(20).map { action in
      let when = action.createdAt ?? "recent"
      return "\(action.title) · \(action.status) · \(action.risk) · \(when)"
    }
  }

  // MARK: - AI

  func chat(prompt: String, scope: String = "ALL BUSINESSES") async throws -> ChatResponse {
    if mockMode {
      try await Task.sleep(nanoseconds: 350_000_000)
      let mode = BusinessScope.hermesMode(for: scope)
      let lowered = prompt.lowercased()
      let content: String
      if lowered.contains("brief") || lowered.contains("today") {
        content = """
        Operator brief · \(scope) (\(mode))
        • MRR pulse: $42.5K · 18 active clients · 7 projects
        • Needs attention: API latency warning, 2 pending Hermes approvals
        • Next: approve lead follow-up, then review invoice draft queue
        """
      } else if lowered.contains("ops") || lowered.contains("operation") {
        content = "Systems look healthy overall. One warning on API latency (120ms). Hermes and Postgres are green. No open incidents requiring owner action."
      } else {
        content = "Understood for \(scope). I can brief you, queue CRM/finance drafts for approval, or review pending Hermes actions. Ask me to follow up leads, create an invoice draft, or prepare a deployment restart."
      }
      return ChatResponse(
        id: UUID().uuidString,
        content: content,
        role: .assistant,
        timestamp: Date(),
        source: "WISE² AI · Operator preview · \(mode)"
      )
    }

    struct ChatRequest: Codable {
      let message: String
      let mode: String
      let profile: String
    }
    struct HermesChatResponse: Codable {
      let response: String
      let model: String?
      let provider: String?
      let evidenceStatus: String?
      let mode: String?
    }

    let mode = BusinessScope.hermesMode(for: scope)
    let request = ChatRequest(
      message: "[\(scope)] \(prompt)",
      mode: mode,
      profile: "fast"
    )
    let payload: HermesChatResponse = try await post("hermes/chat", body: request)
    return ChatResponse(
      id: UUID().uuidString,
      content: payload.response,
      role: .assistant,
      timestamp: Date(),
      source: [payload.mode ?? mode, payload.provider, payload.model, payload.evidenceStatus]
        .compactMap { $0 }
        .joined(separator: " · ")
    )
  }

  func getPendingApprovals() async throws -> [HermesActionItem] {
    try await getHermesActions(status: "pending_approval")
  }

  func getHermesActions(status: String? = nil) async throws -> [HermesActionItem] {
    if mockMode {
      if let status {
        return mockHermesActions.filter { $0.status == status }
      }
      return mockHermesActions
    }
    var query: [String: String] = ["limit": "50"]
    if let status { query["status"] = status }
    let rows: [HermesActionDTO] = try await get("hermes/actions", query: query)
    return rows.map { $0.toItem() }
  }

  func createHermesAction(
    title: String,
    summary: String,
    kind: String,
    risk: String,
    mode: String,
    requiresApproval: Bool = true
  ) async throws -> HermesActionItem {
    if mockMode {
      let item = HermesActionItem(
        id: "preview-\(UUID().uuidString.prefix(8))",
        title: title,
        kind: kind,
        risk: risk,
        status: requiresApproval ? "pending_approval" : "approved",
        mode: mode,
        summary: summary,
        createdAt: ISO8601DateFormatter().string(from: Date())
      )
      mockHermesActions.insert(item, at: 0)
      return item
    }
    struct CreateBody: Codable {
      let mode: String
      let kind: String
      let risk: String
      let title: String
      let summary: String
      let requiresApproval: Bool
    }
    let body = CreateBody(
      mode: mode,
      kind: kind,
      risk: risk,
      title: title,
      summary: summary,
      requiresApproval: requiresApproval
    )
    let created: HermesActionDTO = try await post("hermes/actions", body: body)
    return created.toItem()
  }

  func decideHermesAction(id: String, approve: Bool, note: String?) async throws {
    if mockMode {
      guard let index = mockHermesActions.firstIndex(where: { $0.id == id }) else {
        throw APIError.notFound
      }
      let existing = mockHermesActions[index]
      mockHermesActions[index] = HermesActionItem(
        id: existing.id,
        title: existing.title,
        kind: existing.kind,
        risk: existing.risk,
        status: approve ? "approved" : "rejected",
        mode: existing.mode,
        summary: note.map { "\(existing.summary ?? "") · \($0)" } ?? existing.summary,
        createdAt: existing.createdAt
      )
      return
    }
    struct Decision: Codable { let note: String? }
    let body = Decision(note: note)
    let path = approve ? "hermes/actions/\(id)/approve" : "hermes/actions/\(id)/reject"
    let _: HermesActionDTO = try await post(path, body: body)
  }

  func getAIHistory() async throws -> [ChatResponse] {
    if mockMode { return [] }
    return []
  }

  // MARK: - Billing

  func getBillingProfile() async throws -> BillingProfile {
    if mockMode {
      return BillingProfile(
        plan: "PRO",
        status: "ACTIVE",
        upgradeUrl: "https://wise2.net/pricing",
        periodEnd: "2026-09-29"
      )
    }
    let raw: BillingAPIResponse = try await get("billing/me")
    return BillingProfile(
      plan: raw.subscription?.plan ?? "FREE",
      status: raw.subscription?.status ?? "ACTIVE",
      upgradeUrl: raw.upgradeUrl,
      periodEnd: raw.subscription?.currentPeriodEnd
    )
  }

  // MARK: - Systems

  func getServices() async throws -> [SystemService] {
    try await getSystemHealth().services
  }

  func getOperations() async throws -> [Operation] {
    if mockMode { return mockOperations }
    let hermes = try await fetchHermesHealth()
    return [
      Operation(
        id: "hermes",
        name: "Hermes runtime",
        status: hermes.status.capitalizedHealthy,
        description: "Provider \(hermes.provider ?? "—") · model \(hermes.model ?? "—")"
      ),
      Operation(
        id: "ollama",
        name: "Ollama endpoint",
        status: (hermes.ollama?.status ?? "unknown").capitalizedHealthy,
        description: hermes.ollama?.endpoint ?? "Not configured"
      ),
    ]
  }

  // MARK: - Business OS transport

  func authenticatedGet<T: Decodable>(_ endpoint: String) async throws -> T {
    try await get(endpoint.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
  }

  func authenticatedPost<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    try await authenticatedWrite("POST", endpoint: endpoint, body: body)
  }

  func authenticatedPatch<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    try await authenticatedWrite("PATCH", endpoint: endpoint, body: body)
  }

  private func authenticatedWrite<T: Encodable, R: Decodable>(
    _ method: String,
    endpoint: String,
    body: T
  ) async throws -> R {
    let normalized = endpoint.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    var request = URLRequest(url: endpointURL(normalized))
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)
    let (data, response) = try await session.data(for: request)
    try validateResponse(response)
    if R.self == EmptyBody.self, data.isEmpty {
      return EmptyBody() as! R
    }
    do {
      return try JSONDecoder.wise2.decode(R.self, from: data)
    } catch {
      throw APIError.decodingError(error)
    }
  }

  // MARK: - HTTP

  private func endpointURL(_ endpoint: String) -> URL {
    let trimmed = endpoint.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    return baseURL.appendingPathComponent(trimmed)
  }

  private func get<T: Decodable>(_ endpoint: String) async throws -> T {
    try await get(endpoint, query: [:])
  }

  private func get<T: Decodable>(_ endpoint: String, query: [String: String]) async throws -> T {
    var components = URLComponents(url: endpointURL(endpoint), resolvingAgainstBaseURL: false)!
    if !query.isEmpty {
      components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
    }
    guard let url = components.url else { throw APIError.invalidResponse }
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    try injectAuthHeader(&request)
    let (data, response) = try await session.data(for: request)
    try validateResponse(response)
    do {
      return try JSONDecoder.wise2.decode(T.self, from: data)
    } catch {
      throw APIError.decodingError(error)
    }
  }

  private func post<T: Codable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: endpointURL(endpoint))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)
    let (data, response) = try await session.data(for: request)
    try validateResponse(response)
    if R.self == EmptyBody.self, data.isEmpty {
      return EmptyBody() as! R
    }
    do {
      return try JSONDecoder.wise2.decode(R.self, from: data)
    } catch {
      throw APIError.decodingError(error)
    }
  }

  /// Absolute path outside `/api/v1` (e.g. `/api/health`).
  private func getAbsolute<T: Decodable>(_ absolutePath: String) async throws -> T {
    guard let host = baseURL.host else { throw APIError.invalidResponse }
    let scheme = baseURL.scheme ?? "https"
    let path = absolutePath.hasPrefix("/") ? absolutePath : "/" + absolutePath
    guard let hostURL = URL(string: "\(scheme)://\(host)\(path)") else {
      throw APIError.invalidResponse
    }

    var request = URLRequest(url: hostURL)
    request.httpMethod = "GET"
    try injectAuthHeader(&request)
    let (data, response) = try await session.data(for: request)
    try validateResponse(response)
    return try JSONDecoder.wise2.decode(T.self, from: data)
  }

  private func injectAuthHeader(_ request: inout URLRequest) throws {
    if let token = try? keychainManager.getToken() {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
  }

  private func validateResponse(_ response: URLResponse) throws {
    guard let httpResponse = response as? HTTPURLResponse else {
      throw APIError.invalidResponse
    }
    switch httpResponse.statusCode {
    case 200...299: break
    case 401: throw APIError.unauthorized
    case 403: throw APIError.forbidden
    case 404: throw APIError.notFound
    case 500...599: throw APIError.serverError(httpResponse.statusCode)
    default: throw APIError.unknownError(httpResponse.statusCode)
    }
  }

  // MARK: - Helpers

  private func fetchRootHealth() async throws -> PlatformHealth {
    try await getAbsolute("/api/health")
  }

  private func fetchPlatformHealth() async throws -> String {
    let health = try await fetchRootHealth()
    return health.status.capitalizedHealthy
  }

  private func fetchHermesHealth() async throws -> HermesHealth {
    try await get("hermes/health")
  }

  private func fetchIntegrationHealth() async throws -> IntegrationHealth {
    (try? await get("system/apis/health")) ?? IntegrationHealth(timestamp: nil, services: [])
  }

  private func fetchCustomerStats() async throws -> CustomerStats? {
    try? await get("customers/stats")
  }

  static func progress(for status: String) -> Int {
    switch status.uppercased() {
    case "DELIVERED", "COMPLETED": return 100
    case "IN_PROGRESS", "ACTIVE": return 60
    case "REVIEW", "IN_REVIEW": return 80
    case "REJECTED": return 0
    default: return 25
    }
  }

  // MARK: - Mock Data

  private var mockHermesActions: [HermesActionItem] = [
    HermesActionItem(
      id: "preview-followup-1",
      title: "Follow up Acme HVAC lead",
      kind: "crm.follow_up",
      risk: "medium",
      status: "pending_approval",
      mode: "crm",
      summary: "Send one owner-approved follow-up to Acme HVAC prospect.",
      createdAt: "Today 09:40"
    ),
    HermesActionItem(
      id: "preview-invoice-1",
      title: "Draft invoice · Coastal Comfort",
      kind: "finance.invoice_draft",
      risk: "medium",
      status: "pending_approval",
      mode: "finance",
      summary: "Create $4,850 service invoice draft. No charge until approved.",
      createdAt: "Today 08:15"
    ),
    HermesActionItem(
      id: "preview-ops-1",
      title: "Queue worker restart preview",
      kind: "systems.critical_preview",
      risk: "critical",
      status: "pending_approval",
      mode: "ops",
      summary: "Prepare worker restart plan. Execution blocked without Face ID + capability.",
      createdAt: "Yesterday"
    ),
  ]

  private let mockDashboard = DashboardMetrics(
    revenue: 42500,
    activeClients: 18,
    activeProjects: 7,
    outstandingTasks: 3,
    systemHealth: "Healthy",
    alerts: [
      .init(id: "1", severity: "warning", message: "API latency slightly elevated (120ms)"),
      .init(id: "2", severity: "info", message: "2 Hermes approvals waiting on owner"),
      .init(id: "3", severity: "info", message: "Lead follow-up due for Acme HVAC"),
    ],
    activeWork: [
      ActiveWorkItem(id: "1", title: "Command Center iOS", owner: "Daniel", due: "Today", status: "In Progress", progress: 0.82),
      ActiveWorkItem(id: "2", title: "Field Tech diagnostics", owner: "Field Ops", due: "Tomorrow", status: "In Progress", progress: 0.64),
      ActiveWorkItem(id: "3", title: "Hermes approval queue", owner: "Daniel", due: "Today", status: "Review", progress: 0.40),
    ],
    generatedAt: nil
  )

  private let mockSystemHealth = SystemHealthResponse(
    uptime: "99.98%",
    networkLatency: 23,
    incidents: 1,
    services: [
      SystemService(id: "1", name: "API", status: "Healthy", latency: "45ms", errorRate: "0.0%", requests: "1,200/min", symbol: "network"),
      SystemService(id: "2", name: "PostgreSQL", status: "Healthy", latency: "8ms", errorRate: "0.0%", requests: "500/min", symbol: "cylinder"),
      SystemService(id: "3", name: "Redis", status: "Healthy", latency: "2ms", errorRate: "0.0%", requests: "900/min", symbol: "bolt.fill"),
      SystemService(id: "4", name: "Hermes", status: "Healthy", latency: "180ms", errorRate: "0.1%", requests: "40/min", symbol: "sparkles"),
      SystemService(id: "5", name: "Workers", status: "Warning", latency: "—", errorRate: "0.0%", requests: "12 jobs", symbol: "gearshape.2.fill"),
    ]
  )

  private let mockCRMItems = [
    CRMItem(
      id: "1",
      title: "Active Clients",
      subtitle: "Customers with open relationships",
      details: ["Coastal Comfort · ACTIVE", "Palm Beach Air · ACTIVE", "Acme HVAC · ACTIVE", "18 total customers"],
      icon: "person.3.fill",
      badge: "18"
    ),
    CRMItem(
      id: "2",
      title: "Prospects",
      subtitle: "Pipeline requiring follow-up",
      details: ["Acme HVAC lead · warm", "Sunrise Mechanical · discovery", "6 open prospects"],
      icon: "person.badge.plus",
      badge: "6"
    ),
    CRMItem(
      id: "3",
      title: "Overdue follow-ups",
      subtitle: "Owner attention",
      details: ["2 leads past SLA", "Approve Hermes CRM follow-up from AI or Work"],
      icon: "exclamationmark.bubble.fill",
      badge: "2"
    ),
  ]

  private let mockProjects = [
    Project(id: "1", name: "Command Center iOS", status: "In Progress", progress: 82, teamSize: 2, dueDate: "2026-08-31"),
    Project(id: "2", name: "Field Tech diagnostics", status: "In Progress", progress: 64, teamSize: 3, dueDate: "2026-09-12"),
    Project(id: "3", name: "Hermes ops hardening", status: "Review", progress: 40, teamSize: 2, dueDate: "2026-09-05"),
  ]

  private let mockTasks = [
    WorkTask(id: "1", title: "Polish UI animations", project: "Command Center iOS", assignee: "Daniel", priority: "High", dueDate: "Today", status: "In Progress"),
  ]

  private let mockOperations = [
    Operation(id: "1", name: "Database Backups", status: "Healthy", description: "Last success · 02:00 UTC"),
    Operation(id: "2", name: "Hermes runtime", status: "Healthy", description: "Provider live · fast profile"),
    Operation(id: "3", name: "Edge heartbeats", status: "Healthy", description: "Pi fleet reporting"),
  ]
}

// MARK: - JSON helpers

private extension JSONDecoder {
  static let wise2: JSONDecoder = {
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    return decoder
  }()
}

private extension String {
  var capitalizedHealthy: String {
    let lower = lowercased()
    if lower == "ok" || lower == "online" || lower == "healthy" || lower == "active" {
      return "Healthy"
    }
    if lower == "degraded" || lower == "warning" {
      return "Warning"
    }
    if lower == "offline" || lower == "error" || lower == "down" {
      return "Critical"
    }
    return capitalized
  }
}

// MARK: - Wire models

private struct EmptyBody: Codable {}

private struct LoginRequest: Codable {
  let email: String
  let password: String
}

private struct SignupAPIRequest: Codable {
  let email: String
  let password: String
  let firstName: String?
  let lastName: String?
}

private struct RefreshAPIRequest: Codable {
  let refreshToken: String
}

private struct RefreshAPIResponse: Codable {
  let accessToken: String
  let expiresIn: Int?
}

private struct AuthAPIResponse: Codable {
  let accessToken: String?
  let refreshToken: String?
  let token: String?
  let user: User
  let expiresIn: Int?
  let message: String?

  func toAuthResponse() -> AuthResponse {
    AuthResponse(
      token: accessToken ?? token ?? "",
      refreshToken: refreshToken,
      user: user
    )
  }
}

private struct HermesDailyBrief: Codable {
  struct Headline: Codable {
    let pendingApprovals: Int?
    let activeCustomers: Int?
    let monthlyRecurringRevenue: Double?
    let activeProjects: Int?
  }

  struct RecentProject: Codable {
    let id: String
    let title: String
    let status: String
    let updatedAt: String?
  }

  struct RecentAction: Codable {
    let id: String?
    let title: String?
    let status: String?
    let risk: String?
    let kind: String?
    let mode: String?
  }

  struct RecentCustomer: Codable {
    let businessName: String?
    let status: String?
    let mrr: Double?
  }

  struct Recent: Codable {
    let projects: [RecentProject]?
    let hermesActions: [RecentAction]?
    let customers: [RecentCustomer]?
  }

  let generatedAt: String?
  let status: String?
  let headline: Headline?
  let recent: Recent?

  func toDashboardMetrics() -> DashboardMetrics {
    var alerts: [DashboardMetrics.Alert] = []
    if let pending = headline?.pendingApprovals, pending > 0 {
      alerts.append(.init(id: "approvals", severity: "warning", message: "\(pending) Hermes actions need approval"))
    }
    if status == "partial" {
      alerts.append(.init(id: "partial", severity: "info", message: "Daily brief is partial — some sources unavailable"))
    }
    for action in (recent?.hermesActions ?? []).prefix(3) {
      if let title = action.title {
        alerts.append(.init(
          id: action.id ?? title,
          severity: (action.risk ?? "info").lowercased() == "critical" ? "warning" : "info",
          message: "\(title) · \(action.status ?? "queued")"
        ))
      }
    }

    let activeWork = (recent?.projects ?? []).prefix(5).map {
      ActiveWorkItem(
        id: $0.id,
        title: $0.title,
        owner: "Portfolio",
        due: $0.updatedAt ?? "—",
        status: $0.status,
        progress: Double(APIClient.progress(for: $0.status)) / 100.0
      )
    }

    return DashboardMetrics(
      revenue: headline?.monthlyRecurringRevenue ?? 0,
      activeClients: headline?.activeCustomers ?? 0,
      activeProjects: headline?.activeProjects ?? 0,
      outstandingTasks: headline?.pendingApprovals ?? 0,
      systemHealth: status == "ready" ? "Healthy" : (status ?? "Unknown").capitalized,
      alerts: alerts,
      activeWork: Array(activeWork),
      generatedAt: generatedAt
    )
  }
}

private struct HermesHealth: Codable {
  struct Ollama: Codable {
    let status: String?
    let error: String?
    let endpoint: String?
  }

  let status: String
  let provider: String?
  let model: String?
  let ollama: Ollama?
}

private struct PlatformHealth: Codable {
  let status: String
  let timestamp: String?
  let uptime: Double?
}

private struct IntegrationHealth: Codable {
  struct Service: Codable {
    let name: String
    let status: String
    let credentialsConfigured: Int
    let credentialsRequired: Int
  }

  let timestamp: String?
  let services: [Service]
}

private struct CustomersListResponse: Codable {
  let customers: [CustomerDTO]
  let total: Int?
}

private struct CustomerDTO: Codable {
  let id: String?
  let businessName: String?
  let contactName: String?
  let email: String?
  let status: String?
  let mrr: Double?
}

private struct CustomerStats: Codable {
  let total: Int?
  let active: Int?
  let totalMrr: Double?
  let averageMrr: Double?
}

private struct ProspectsListResponse: Codable {
  let prospects: [ProspectDTO]
  let total: Int?
}

private struct ProspectDTO: Codable {
  let id: String?
  let businessName: String?
  let contactName: String?
  let status: String?
  let estimatedOpportunity: Double?
}

private struct HermesActionDTO: Codable {
  let id: String
  let title: String
  let kind: String
  let risk: String
  let status: String
  let mode: String?
  let summary: String?
  let createdAt: String?

  func toItem() -> HermesActionItem {
    HermesActionItem(
      id: id,
      title: title,
      kind: kind,
      risk: risk,
      status: status,
      mode: mode ?? "executive",
      summary: summary,
      createdAt: createdAt
    )
  }
}

private struct BillingAPIResponse: Codable {
  struct Subscription: Codable {
    let plan: String?
    let status: String?
    let currentPeriodEnd: String?
  }

  let subscription: Subscription?
  let upgradeUrl: String?
}

// MARK: - App models

enum BusinessScope {
  static let options = [
    "ALL BUSINESSES",
    "CRM & Pipeline",
    "Projects & Delivery",
    "Systems & Ops",
    "Support",
  ]

  static func hermesMode(for scope: String) -> String {
    switch scope {
    case "CRM & Pipeline": return "sales"
    case "Projects & Delivery": return "projects"
    case "Systems & Ops": return "systems"
    case "Support": return "support"
    default: return "executive"
    }
  }

  static var scopeCaption: String {
    "AI operating scope · live tenants arrive when memberships API ships"
  }
}

struct HermesActionItem: Identifiable, Codable {
  let id: String
  let title: String
  let kind: String
  let risk: String
  let status: String
  let mode: String
  let summary: String?
  let createdAt: String?
}

struct BillingProfile: Codable {
  let plan: String
  let status: String
  let upgradeUrl: String?
  let periodEnd: String?
}

struct ActiveWorkItem: Identifiable, Codable {
  let id: String
  let title: String
  let owner: String
  let due: String
  let status: String
  let progress: Double
}

struct AuthResponse: Codable {
  let token: String
  let refreshToken: String?
  let user: User
}

struct User: Codable, Identifiable {
  let id: String
  let email: String
  let name: String?
  let role: String

  enum CodingKeys: String, CodingKey {
    case id, email, name, role
  }

  init(id: String, email: String, name: String?, role: String) {
    self.id = id
    self.email = email
    self.name = name
    self.role = role
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    id = try container.decode(String.self, forKey: .id)
    email = try container.decode(String.self, forKey: .email)
    name = try container.decodeIfPresent(String.self, forKey: .name)
    role = try container.decodeIfPresent(String.self, forKey: .role) ?? "USER"
  }
}

struct DashboardMetrics: Codable {
  let revenue: Double
  let activeClients: Int
  let activeProjects: Int
  let outstandingTasks: Int
  let systemHealth: String
  let alerts: [Alert]
  let activeWork: [ActiveWorkItem]
  let generatedAt: String?

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

enum APIError: LocalizedError {
  case invalidResponse
  case unauthorized
  case forbidden
  case notFound
  case serverError(Int)
  case unknownError(Int)
  case decodingError(Error)
  case networkError(Error)
  case rateLimited
  case retryLimitExceeded

  var isRetryable: Bool {
    switch self {
    case .rateLimited, .serverError: return true
    default: return false
    }
  }

  var errorDescription: String? {
    switch self {
    case .invalidResponse: return "Invalid response from server"
    case .unauthorized: return "Authentication required"
    case .forbidden: return "Access denied"
    case .notFound: return "Resource not found"
    case .serverError(let code): return "Server error (\(code))"
    case .unknownError(let code): return "Unknown error (\(code))"
    case .decodingError: return "Failed to decode response"
    case .networkError: return "Network error"
    case .rateLimited: return "Too many requests, please try again"
    case .retryLimitExceeded: return "Connection failed after multiple attempts"
    }
  }
}
