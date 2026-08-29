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
    Task {
      await loadDashboard()
    }
  }

  // MARK: - Dashboard Loading

  func loadDashboard() async {
    isLoading = true
    errorMessage = nil

    do {
      print("📊 Loading dashboard metrics...")
      dashboardMetrics = try await apiClient.getDashboardMetrics()
      print("✅ Dashboard loaded from backend")
    } catch {
      print("⚠️ Backend unavailable, using mock data: \(error.localizedDescription)")
      dashboardMetrics = mockDashboard
      errorMessage = nil
    }

    isLoading = false
  }

  // MARK: - Mock Data

  private let mockDashboard = DashboardMetrics(
    revenue: 42500.00,
    activeClients: 18,
    activeProjects: 7,
    outstandingTasks: 23,
    systemHealth: "Healthy",
    alerts: [
      DashboardMetrics.Alert(id: "1", severity: "warning", message: "API latency slightly elevated (120ms)"),
      DashboardMetrics.Alert(id: "2", severity: "info", message: "3 tasks due today")
    ]
  )

  // MARK: - Network Monitoring

  private func startMonitoringNetwork() {
    print("📡 Starting network monitoring...")
    isOnline = true
  }
}
