import Foundation

actor APIClient {
  static let shared = APIClient()

  private let session: URLSession
  private let baseURL: URL
  private let keychainManager = KeychainManager()

  private var mockMode = false // Set to true for development without backend

  var baseURLString: String { baseURL.absoluteString }
  var isOperatorPreviewMode: Bool { mockMode }

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 30
    config.timeoutIntervalForResource = 300
    config.waitsForConnectivity = true

    self.session = URLSession(configuration: config)
    // 🚀 Production: Connect to VPS API (or user-configured endpoint)
    let savedURL = UserDefaults.standard.string(forKey: "API_BASE_URL")
    let defaultURL = "https://wise2.net/api/v1"
    self.baseURL = URL(string: ProcessInfo.processInfo.environment["API_URL"] ?? (savedURL ?? defaultURL)) ?? URL(fileURLWithPath: "/")

    #if DEBUG
    // Live services are the default, including Debug builds. Opt into fixtures explicitly.
    mockMode = ProcessInfo.processInfo.environment["MOCK_API"] == "true"
    print("📡 API Client in \(mockMode ? "MOCK" : "LIVE") mode")
    #endif
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
    return try await get("/dashboard/metrics")
  }

  func getProjects() async throws -> [Project] { try await get("/projects") }
  func getTasks() async throws -> [WorkTask] { try await get("/tasks") }
  func updateTaskStatus(_ taskId: String, status: String) async throws { _ = try await authenticatedPatch("/tasks/\(taskId)", body: ["status": status] as [String: String]) as EmptyResponse }
  func getSystemHealth() async throws -> SystemHealthResponse { try await get("/health") }

  func authenticatedGet<T: Decodable>(_ endpoint: String) async throws -> T {
    try await get(endpoint)
  }

  func authenticatedPost<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    try await post(endpoint, body: body)
  }

  func authenticatedPatch<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    try await patch(endpoint, body: body)
  }

  // MARK: - AI Endpoints

  func chat(prompt: String) async throws -> String {
    if mockMode {
      try await Task.sleep(nanoseconds: 1_000_000_000)
      return "This is a mock response to: \"\(prompt)\". In production, this would connect to the WISE² AI backend."
    }

    struct ChatRequest: Codable {
      let message: String
      let mode: String
      let profile: String
      let messages: [[String: String]]
    }

    struct ChatResponse: Codable {
      let response: String
    }

    let request = ChatRequest(message: prompt, mode: "executive", profile: "auto", messages: [])
    let response: ChatResponse = try await post("/hermes/chat", body: request)
    return response.response
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

  private func post<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)

    let (data, response) = try await session.data(for: request)
    try validateResponse(response)

    return try JSONDecoder().decode(R.self, from: data)
  }

  private func patch<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "PATCH"
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
  var activeWork: [ActiveWork] = []

  struct ActiveWork: Codable, Identifiable {
    let id: String
    let title: String
    let status: String
    let owner: String
    let due: String
    let progress: Double
  }

  struct Alert: Codable, Identifiable {
    let id: String
    let severity: String
    let message: String
  }
}

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
  case retryLimitExceeded

  var isRetryable: Bool { if case .networkError = self { return true }; if case .serverError = self { return true }; return false }

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
    case .retryLimitExceeded:
      return "Retry limit exceeded"
    }
  }
}
