import Foundation

@MainActor
final class CommsStore: ObservableObject {
  @Published private(set) var conversations: [BusinessConversation] = []
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
      conversations = try await service.conversations()
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
