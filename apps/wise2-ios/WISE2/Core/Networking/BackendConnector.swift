import Foundation

actor BackendConnector {
  static let shared = BackendConnector()

  private let session: URLSession
  private let baseURL: URL
  private let keychainManager = KeychainManager()

  private var retryCount = 0
  private let maxRetries = 3

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 30
    config.timeoutIntervalForResource = 300
    config.waitsForConnectivity = true

    self.session = URLSession(configuration: config)

    let urlString = ProcessInfo.processInfo.environment["API_URL"] ??
                    ProcessInfo.processInfo.environment["WISE2_API_URL"] ??
                    "http://173.208.147.165:3010/v1"

    self.baseURL = URL(string: urlString) ?? URL(fileURLWithPath: "/")

    print("🌐 Backend Connector initialized: \(urlString)")
  }

  // MARK: - Live API Methods

  func login(email: String, password: String) async throws -> AuthResponse {
    let endpoint = "/auth/login"
    let request = LoginRequest(email: email, password: password)
    return try await post(endpoint, body: request)
  }

  func signup(email: String, password: String, name: String) async throws -> AuthResponse {
    let endpoint = "/auth/signup"
    let request = SignupRequest(email: email, password: password, name: name)
    return try await post(endpoint, body: request)
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

  func getDashboardMetrics() async throws -> DashboardMetrics {
    return try await get("/dashboard/metrics")
  }

  func chat(prompt: String) async throws -> String {
    struct ChatRequest: Codable {
      let message: String
    }
    struct ChatResponse: Codable {
      let response: String
    }

    let request = ChatRequest(message: prompt)
    let response: ChatResponse = try await post("/ai/chat", body: request)
    return response.response
  }

  func getProjects() async throws -> [Project] {
    return try await get("/projects")
  }

  func createProject(name: String, description: String) async throws -> Project {
    struct ProjectRequest: Codable {
      let name: String
      let description: String
    }
    return try await post("/projects", body: ProjectRequest(name: name, description: description))
  }

  func getTasks() async throws -> [WorkTask] {
    return try await get("/tasks")
  }

  func updateTaskStatus(taskId: String, status: String) async throws -> WorkTask {
    struct UpdateRequest: Codable {
      let status: String
    }
    return try await put("/tasks/\(taskId)", body: UpdateRequest(status: status))
  }

  func getSystemHealth() async throws -> SystemHealth {
    return try await get("/system/health")
  }

  // MARK: - HTTP Methods with Retry

  private func get<T: Decodable>(_ endpoint: String) async throws -> T {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "GET"
    try injectAuthHeader(&request)

    return try await performRequest(request)
  }

  private func post<T: Codable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)

    return try await performRequest(request)
  }

  private func put<T: Codable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
    request.httpMethod = "PUT"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)

    return try await performRequest(request)
  }

  private func performRequest<T: Decodable>(_ request: URLRequest) async throws -> T {
    var currentAttempt = 0

    while currentAttempt < maxRetries {
      do {
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        return try JSONDecoder().decode(T.self, from: data)
      } catch let error as APIError {
        currentAttempt += 1
        if currentAttempt >= maxRetries || !error.isRetryable {
          throw error
        }
        try await Task.sleep(nanoseconds: UInt64(pow(2.0, Double(currentAttempt)) * 1_000_000_000))
      } catch {
        throw APIError.networkError(error)
      }
    }

    throw APIError.retryLimitExceeded
  }

  private func injectAuthHeader(_ request: inout URLRequest) throws {
    do {
      let token = try keychainManager.getToken()
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    } catch {
      // No token, allow for public endpoints
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
    case 429:
      throw APIError.rateLimited
    case 500...599:
      throw APIError.serverError(httpResponse.statusCode)
    default:
      throw APIError.unknownError(httpResponse.statusCode)
    }
  }
}

// MARK: - Extended Models

struct Project: Codable, Identifiable {
  let id: String
  let name: String
  let description: String
  let status: String
  let progress: Int
  let createdAt: Date
}

struct WorkTask: Codable, Identifiable {
  let id: String
  let title: String
  let status: String
  let priority: String
  let dueDate: Date?
  let assignee: String?
}

struct SystemHealth: Codable {
  let status: String
  let timestamp: Date
  let services: [ServiceStatus]

  struct ServiceStatus: Codable {
    let name: String
    let status: String
    let latency: Int
  }
}

// MARK: - Enhanced Error Handling

enum APIError: LocalizedError {
  case invalidResponse
  case unauthorized
  case forbidden
  case notFound
  case rateLimited
  case serverError(Int)
  case unknownError(Int)
  case networkError(Error)
  case retryLimitExceeded

  var isRetryable: Bool {
    switch self {
    case .rateLimited, .serverError:
      return true
    default:
      return false
    }
  }

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
    case .rateLimited:
      return "Too many requests, please try again"
    case .serverError(let code):
      return "Server error (\(code))"
    case .unknownError(let code):
      return "Unknown error (\(code))"
    case .networkError(let error):
      return "Network error: \(error.localizedDescription)"
    case .retryLimitExceeded:
      return "Connection failed after multiple attempts"
    }
  }
}
