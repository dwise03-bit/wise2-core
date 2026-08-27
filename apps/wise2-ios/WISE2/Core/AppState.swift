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
    print("🎯 AppState initializing...")
    startMonitoringNetwork()
  }

  // MARK: - Dashboard Loading

  func loadDashboard() async {
    isLoading = true
    errorMessage = nil

    do {
      print("📊 Loading dashboard metrics...")
      dashboardMetrics = try await apiClient.getDashboardMetrics()
      print("✅ Dashboard loaded")
    } catch {
      errorMessage = error.localizedDescription
      print("❌ Failed to load dashboard: \(error)")
    }

    isLoading = false
  }

  // MARK: - Network Monitoring

  private func startMonitoringNetwork() {
    print("📡 Starting network monitoring...")
    // In Phase 2, integrate NetworkMonitor for real reachability detection
    // For now, assume online
    isOnline = true
  }
}
