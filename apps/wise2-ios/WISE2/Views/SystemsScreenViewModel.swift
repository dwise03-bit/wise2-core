import Foundation

@MainActor
class SystemsScreenViewModel: ObservableObject {
  @Published var services: [SystemService] = []
  @Published var metrics: SystemMetrics?
  @Published var isLoading: Bool = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared

  init() {
    loadData()
  }

  func loadData() {
    isLoading = true
    errorMessage = nil

    Task {
      do {
        _ = try await apiClient.getDashboardMetrics()

        metrics = SystemMetrics(
          cpuUsage: 42,
          memoryUsage: 68,
          diskUsage: 55,
          networkLatency: 23,
          uptime: "99.98%"
        )

        services = [
          SystemService(
            id: "api",
            name: "API Server",
            status: "Healthy",
            latency: "12ms",
            errorRate: "0.02%",
            requests: "4.2K/s"
          ),
          SystemService(
            id: "db",
            name: "Database",
            status: "Healthy",
            latency: "8ms",
            errorRate: "0.0%",
            requests: "1.8K/s"
          ),
          SystemService(
            id: "cache",
            name: "Cache Layer",
            status: "Healthy",
            latency: "2ms",
            errorRate: "0.0%",
            requests: "9.4K/s"
          ),
          SystemService(
            id: "auth",
            name: "Auth Service",
            status: "Healthy",
            latency: "18ms",
            errorRate: "0.01%",
            requests: "245/s"
          ),
          SystemService(
            id: "ai",
            name: "AI Engine",
            status: "Warning",
            latency: "342ms",
            errorRate: "0.1%",
            requests: "28/s"
          ),
        ]

        isLoading = false
      } catch {
        errorMessage = error.localizedDescription
        isLoading = false
      }
    }
  }

  func refreshData() {
    loadData()
  }
}

struct SystemMetrics {
  let cpuUsage: Int
  let memoryUsage: Int
  let diskUsage: Int
  let networkLatency: Int
  let uptime: String
}

struct SystemService: Identifiable {
  let id: String
  let name: String
  let status: String
  let latency: String
  let errorRate: String
  let requests: String
}
