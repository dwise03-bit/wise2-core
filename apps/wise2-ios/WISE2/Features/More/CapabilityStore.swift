import Foundation

@MainActor
final class CapabilityStore: ObservableObject {
  @Published private(set) var capabilities: BusinessCapabilities?
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?

  private let service: BusinessOSServing

  init(service: BusinessOSServing = BusinessOSClient()) {
    self.service = service
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      capabilities = try await service.capabilities()
    } catch {
      errorMessage = error.localizedDescription
      capabilities = BusinessCapabilities(trading: false, cloud: false, hvac: true)
    }
  }

  var canAccessTrading: Bool {
    capabilities?.trading == true
  }
}
