import Foundation

actor APIClient {
  static let shared = APIClient()

  private let session: URLSession
  private let baseURL: URL
  private let keychainManager = KeychainManager()

  private var mockMode = false

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 30
    config.timeoutIntervalForResource = 300
    config.waitsForConnectivity = true

    self.session = URLSession(configuration: config)
    self.baseURL = URL(string: ProcessInfo.processInfo.environment["API_URL"] ?? "http://localhost:3000/v1") ?? URL(fileURLWithPath: "/")

    #if DEBUG
    mockMode = ProcessInfo.processInfo.environment["MOCK_API"] == "true"
    if mockMode { print("📡 API Client in MOCK mode (development)") }
    #endif
  }

  func login(email: String, password: String) async throws -> AuthResponse {
    try await post("/auth/login", body: LoginRequest(email: email, password: password))
  }

  func signup(email: String, password: String, name: String) async throws -> AuthResponse {
    try await post("/auth/signup", body: SignupRequest(email: email, password: password, name: name))
  }

  func verifySession() async throws -> User { try await get("/auth/me") }

  func refreshToken() async throws -> String {
    struct RefreshResponse: Codable { let token: String }
    let response: RefreshResponse = try await post("/auth/refresh", body: ["dummy": ""])
    return response.token
  }

  func getDashboardMetrics() async throws -> DashboardMetrics { try await get("/dashboard/metrics") }

  func authenticatedGet<T: Decodable>(_ endpoint: String) async throws -> T {
    try await get(endpoint)
  }

  func authenticatedPost<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    try await post(endpoint, body: body)
  }

  private func get<T: Decodable>(_ endpoint: String) async throws -> T {
    var request = URLRequest(url: endpointURL(endpoint))
    request.httpMethod = "GET"
    try injectAuthHeader(&request)
    let (data, response) = try await session.data(for: request)
    try validateResponse(response)
    return try JSONDecoder().decode(T.self, from: data)
  }

  private func post<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R {
    var request = URLRequest(url: endpointURL(endpoint))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(body)
    try injectAuthHeader(&request)
    let (data, response) = try await session.data(for: request)
    try validateResponse(response)
    return try JSONDecoder().decode(R.self, from: data)
  }

  private func endpointURL(_ endpoint: String) -> URL {
    let normalized = endpoint.hasPrefix("/") ? String(endpoint.dropFirst()) : endpoint
    return baseURL.appendingPathComponent(normalized)
  }

  private func injectAuthHeader(_ request: inout URLRequest) throws {
    if let token = try? keychainManager.getToken() {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
  }

  private func validateResponse(_ response: URLResponse) throws {
    guard let httpResponse = response as? HTTPURLResponse else { throw APIError.invalidResponse }
    switch httpResponse.statusCode {
    case 200...299: break
    case 401: throw APIError.unauthorized
    case 403: throw APIError.forbidden
    case 404: throw APIError.notFound
    case 500...599: throw APIError.serverError(httpResponse.statusCode)
    default: throw APIError.unknownError(httpResponse.statusCode)
    }
  }
}

struct AuthResponse: Codable { let token: String; let user: User }
struct LoginRequest: Codable { let email: String; let password: String }
struct SignupRequest: Codable { let email: String; let password: String; let name: String }
struct User: Codable, Identifiable { let id: String; let email: String; let name: String?; let role: String }

struct DashboardMetrics: Codable {
  let revenue: Double
  let activeClients: Int
  let activeProjects: Int
  let outstandingTasks: Int
  let systemHealth: String
  let alerts: [Alert]
  struct Alert: Codable, Identifiable { let id: String; let severity: String; let message: String }
}

enum APIError: LocalizedError {
  case invalidResponse, unauthorized, forbidden, notFound
  case serverError(Int), unknownError(Int), decodingError(Error), networkError(Error)

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
    }
  }
}
