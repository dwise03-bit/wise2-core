import Foundation

protocol BusinessOSAPITransport {
  func authenticatedGet<T: Decodable>(_ endpoint: String) async throws -> T
  func authenticatedPost<T: Encodable, R: Decodable>(_ endpoint: String, body: T) async throws -> R
}

extension APIClient: BusinessOSAPITransport {}

protocol BusinessOSServing {
  func dashboard() async throws -> BusinessDashboard
  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult>
}

final class BusinessOSClient: BusinessOSServing {
  static let dashboardPath = "/business-os/dashboard"
  static let commandPath = "/business-os/command"

  private let transport: BusinessOSAPITransport

  init(transport: BusinessOSAPITransport = APIClient.shared) {
    self.transport = transport
  }

  func dashboard() async throws -> BusinessDashboard {
    try await transport.authenticatedGet(Self.dashboardPath)
  }

  func submitCommand(_ text: String) async throws -> BusinessOperation<CommandResult> {
    struct Request: Encodable { let text: String }
    return try await transport.authenticatedPost(Self.commandPath, body: Request(text: text))
  }
}
