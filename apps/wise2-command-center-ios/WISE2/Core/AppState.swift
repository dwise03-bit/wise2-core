import Foundation
import Combine

@MainActor
class AppState: ObservableObject {
  @Published var dashboardMetrics: DashboardMetrics?
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var isOnline = true

  private let apiClient = APIClient.shared

  init() {
    startMonitoringNetwork()
  }

  func reset() {
    dashboardMetrics = nil
    errorMessage = nil
    isLoading = false
  }

  func loadDashboard() async {
    isLoading = true
    errorMessage = nil

    do {
      let metrics = try await apiClient.getDashboardMetrics()
      dashboardMetrics = metrics
      errorMessage = nil
      isOnline = true
    } catch {
      if dashboardMetrics == nil {
        errorMessage = error.localizedDescription
      }
      if case APIError.networkError = error {
        isOnline = false
      }
    }

    isLoading = false
  }

  private func startMonitoringNetwork() {
    isOnline = true
  }
}
