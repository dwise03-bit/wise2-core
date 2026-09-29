import Foundation

@MainActor
final class ClientsStore: ObservableObject {
  @Published private(set) var customers: [BusinessCustomer] = []
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
      customers = try await service.customers()
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
