import Foundation

@MainActor
final class StudioStore: ObservableObject {
  @Published private(set) var summary: StudioSummary?
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
      summary = try await service.studioSummary()
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
