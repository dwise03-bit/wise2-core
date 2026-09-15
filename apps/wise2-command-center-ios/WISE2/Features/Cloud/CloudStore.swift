import Foundation

@MainActor
final class CloudStore: ObservableObject {
  @Published private(set) var inventory: CloudInventory?
  @Published private(set) var health: CloudHealth?
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?
  @Published private(set) var lastOperation: BusinessOperation<CloudOperationResult>?
  @Published var pendingOperation: String?
  @Published var pendingTarget: String?
  @Published var awaitingConfirmation = false

  private let service: BusinessOSServing
  private let authorizer: SensitiveActionAuthorizing

  init(
    service: BusinessOSServing = BusinessOSClient(),
    authorizer: SensitiveActionAuthorizing = SensitiveActionAuthorizer()
  ) {
    self.service = service
    self.authorizer = authorizer
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      async let inventoryTask = service.cloudInventory()
      async let healthTask = service.cloudHealth()
      inventory = try await inventoryTask
      health = try await healthTask
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func requestOperation(_ operation: String, target: String? = nil) {
    pendingOperation = operation
    pendingTarget = target
    awaitingConfirmation = true
  }

  func confirmPendingOperation() async {
    guard let operation = pendingOperation else { return }
    awaitingConfirmation = false
    let authorized = await authorizer.authorize(reason: "Confirm \(operation) on WISE² Cloud")
    guard authorized else {
      errorMessage = "Biometric confirmation required"
      pendingOperation = nil
      return
    }
    do {
      lastOperation = try await service.cloudOperation(operation, target: pendingTarget)
      pendingOperation = nil
      pendingTarget = nil
      await load()
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func cancelPendingOperation() {
    awaitingConfirmation = false
    pendingOperation = nil
    pendingTarget = nil
  }
}
