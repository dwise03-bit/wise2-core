import Foundation

@MainActor
final class AnalyticsStore: ObservableObject {
  @Published private(set) var dashboard: AnalyticsDashboard?
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
      dashboard = try await service.analyticsDashboard()
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
