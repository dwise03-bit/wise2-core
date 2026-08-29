import Foundation

protocol BusinessOSServing {
  func dashboard() async throws -> BusinessDashboard
  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult>
}

final class BusinessOSClient: BusinessOSServing {
  private let apiClient: APIClient

  init(apiClient: APIClient = .shared) {
    self.apiClient = apiClient
  }

  func dashboard() async throws -> BusinessDashboard {
    try await apiClient.authenticatedGet("/business-os/dashboard")
  }

  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult> {
    struct Request: Encodable { let text: String }
    return try await apiClient.authenticatedPost("/business-os/command", body: Request(text: text))
  }
}
