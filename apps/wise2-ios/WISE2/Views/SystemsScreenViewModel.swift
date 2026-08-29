import Foundation

@MainActor
class SystemsScreenViewModel: ObservableObject {
  @Published var services: [SystemService] = []
  @Published var metrics: SystemHealthResponse?
  @Published var operationRows: [String] = []
  @Published var isLoading = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared

  init() {
    Task {
      await loadData()
    }
  }

  func loadData() async {
    isLoading = true
    errorMessage = nil

    do {
      metrics = try await apiClient.getSystemHealth()
      services = metrics?.services ?? []

      let operations = try await apiClient.getOperations()
      operationRows = operations.map { $0.name }
    } catch {
      errorMessage = "Failed to load system data: \(error.localizedDescription)"
      print("⚠️ System load error: \(error)")
    }

    isLoading = false
  }

  func refreshData() async {
    await loadData()
  }
}
