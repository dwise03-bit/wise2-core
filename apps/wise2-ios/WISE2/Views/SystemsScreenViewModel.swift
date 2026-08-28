import Foundation

@MainActor
class SystemsScreenViewModel: ObservableObject {
  @Published var services: [SystemService] = []
  @Published var metrics: SystemMetrics?
  @Published var isLoading = false
  @Published var errorMessage: String?

  let operationRows = [
    "Containers and services",
    "Incidents",
    "Logs",
    "Deployments",
    "Uptime",
    "Automations"
  ]

  init() {
    loadData()
  }

  func loadData() {
    metrics = SystemMetrics(cpuUsage: 42, memoryUsage: 68, diskUsage: 55, networkLatency: 23, uptime: "99.98%")
    services = [
      SystemService(id: "api", name: "WISE² API", status: "Healthy", latency: "23ms", errorRate: "0.02%", requests: "4.2K req/hr", symbol: "network"),
      SystemService(id: "postgres", name: "PostgreSQL", status: "Healthy", latency: "8ms", errorRate: "0.0%", requests: "1.8K queries/hr", symbol: "cylinder.split.1x2.fill"),
      SystemService(id: "redis", name: "Redis", status: "Healthy", latency: "2ms", errorRate: "0.0%", requests: "9.4K ops/hr", symbol: "bolt.horizontal.fill"),
      SystemService(id: "workers", name: "Workers", status: "Warning", latency: "118ms", errorRate: "0.4%", requests: "312 jobs/hr", symbol: "gearshape.2.fill"),
      SystemService(id: "ollama", name: "GPU/Ollama", status: "Healthy", latency: "342ms", errorRate: "0.1%", requests: "28 prompts/hr", symbol: "cpu.fill"),
      SystemService(id: "websites", name: "Websites", status: "Healthy", latency: "42ms", errorRate: "0.0%", requests: "16.1K hits/day", symbol: "globe"),
      SystemService(id: "automations", name: "Automations", status: "Healthy", latency: "64ms", errorRate: "0.0%", requests: "87 runs/day", symbol: "arrow.triangle.2.circlepath")
    ]
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
  let symbol: String
}
