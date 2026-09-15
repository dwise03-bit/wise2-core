import Foundation

@MainActor
final class SalesStore: ObservableObject {
  @Published private(set) var opportunities: [BusinessOpportunity] = []
  @Published private(set) var snapshot: SalesPipelineSnapshot?
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
      opportunities = try await service.opportunities()
      // TODO: Wire GET /revenue-os/dashboard/pipeline for executive KPIs
      snapshot = SalesPipelineSnapshot(
        openOpportunities: opportunities.count,
        pipelineValue: opportunities.reduce(0) { $0 + $1.amount },
        wonThisMonth: opportunities.filter { $0.stage == .won }.count,
        averageDealSize: opportunities.isEmpty
          ? 0
          : opportunities.reduce(0) { $0 + $1.amount } / Double(opportunities.count)
      )
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
