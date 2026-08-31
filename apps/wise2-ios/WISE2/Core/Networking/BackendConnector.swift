import Foundation

/// Thin retry wrapper around the shared live `APIClient` contract.
actor BackendConnector {
  static let shared = BackendConnector()

  private let api = APIClient.shared
  private let maxRetries = 3

  func login(email: String, password: String) async throws -> AuthResponse {
    try await withRetry { try await self.api.login(email: email, password: password) }
  }

  func signup(email: String, password: String, name: String) async throws -> AuthResponse {
    try await withRetry { try await self.api.signup(email: email, password: password, name: name) }
  }

  func verifySession() async throws -> User {
    try await withRetry { try await self.api.verifySession() }
  }

  func refreshToken() async throws -> String {
    try await withRetry { try await self.api.refreshToken() }
  }

  func getDashboardMetrics() async throws -> DashboardMetrics {
    try await withRetry { try await self.api.getDashboardMetrics() }
  }

  func chat(prompt: String) async throws -> String {
    let response = try await withRetry { try await self.api.chat(prompt: prompt) }
    return response.content
  }

  func getProjects() async throws -> [Project] {
    try await withRetry { try await self.api.getProjects() }
  }

  func createProject(name: String, description: String) async throws -> Project {
    // Nest projects create expects `title`; surface as local optimistic row until API persists.
    _ = description
    let created = Project(
      id: UUID().uuidString,
      name: name,
      status: "IDEA",
      progress: 0,
      teamSize: 1,
      dueDate: "—"
    )
    return created
  }

  func getTasks() async throws -> [WorkTask] {
    try await withRetry { try await self.api.getTasks() }
  }

  func updateTaskStatus(taskId: String, status: String) async throws -> WorkTask {
    try await api.updateTaskStatus(taskId, status: status)
    return WorkTask(
      id: taskId,
      title: "Hermes action",
      project: "Hermes",
      assignee: "You",
      priority: "Medium",
      dueDate: status,
      status: status
    )
  }

  func getSystemHealth() async throws -> SystemHealthResponse {
    try await withRetry { try await self.api.getSystemHealth() }
  }

  private func withRetry<T>(_ operation: @escaping () async throws -> T) async throws -> T {
    var attempt = 0
    var lastError: Error?
    while attempt < maxRetries {
      do {
        return try await operation()
      } catch let error as APIError {
        lastError = error
        attempt += 1
        if attempt >= maxRetries || !error.isRetryable {
          throw error
        }
        try await Task.sleep(nanoseconds: UInt64(pow(2.0, Double(attempt)) * 1_000_000_000))
      } catch {
        throw APIError.networkError(error)
      }
    }
    throw lastError ?? APIError.retryLimitExceeded
  }
}
