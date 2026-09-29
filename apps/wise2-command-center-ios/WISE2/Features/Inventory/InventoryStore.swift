import Foundation

@MainActor
final class InventoryStore: ObservableObject {
  @Published private(set) var cloudInventory: CloudInventory?
  @Published private(set) var snapshot: InventorySnapshot?
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
      cloudInventory = try await service.cloudInventory()
      // TODO: Wire GET /v1/cherry-count/inventory or print-shop products for retail SKUs
      snapshot = InventorySnapshot(
        skuCount: cloudInventory?.apps.count ?? 0,
        lowStockCount: 0,
        pendingOrders: 0,
        lastSyncedAt: ISO8601DateFormatter().string(from: Date())
      )
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
