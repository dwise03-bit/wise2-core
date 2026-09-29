import Foundation

@MainActor
final class CommandStore: ObservableObject {
  @Published private(set) var dashboard: BusinessDashboard?
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?
  @Published private(set) var lastCommandResult: CommandResult?
  @Published private(set) var lastOperation: BusinessOperation<CommandResult>?
  @Published private(set) var isSubmitting = false

  private let service: BusinessOSServing

  init(service: BusinessOSServing = BusinessOSClient()) {
    self.service = service
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      dashboard = try await service.dashboard()
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func submit(_ text: String) async {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return }
    isSubmitting = true
    errorMessage = nil
    defer { isSubmitting = false }
    do {
      let operation = try await service.submitCommand(trimmed)
      lastOperation = operation
      lastCommandResult = operation.result
      if operation.result == nil, !operation.message.isEmpty {
        errorMessage = nil
      }
    } catch {
      lastOperation = nil
      errorMessage = error.localizedDescription
    }
  }
}
