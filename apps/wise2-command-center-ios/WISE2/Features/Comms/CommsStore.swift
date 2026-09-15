import Foundation

@MainActor
final class CommsStore: ObservableObject {
  @Published private(set) var dashboard: AiPhoneDashboard?
  @Published private(set) var conversations: [BusinessConversation] = []
  @Published var greeting: String = ""
  @Published private(set) var isSaving = false
  @Published private(set) var isLoading = false
  @Published private(set) var errorMessage: String?
  @Published private(set) var savedMessage: String?

  private let service: BusinessOSServing

  init(service: BusinessOSServing = BusinessOSClient()) {
    self.service = service
  }

  var isLive: Bool { dashboard?.config.enabled ?? false }

  func load() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }
    do {
      async let phone = service.phoneDashboard()
      async let threads = service.conversations()
      let dashboard = try await phone
      self.dashboard = dashboard
      greeting = dashboard.config.greeting
      conversations = try await threads
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func toggleEnabled() async {
    guard let current = dashboard else { return }
    isSaving = true
    defer { isSaving = false }
    do {
      let config = try await service.updatePhoneConfig(AiPhoneConfigUpdate(enabled: !current.config.enabled))
      dashboard?.config = config
      dashboard?.stats.aiActive = config.enabled
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func saveGreeting() async {
    isSaving = true
    defer { isSaving = false }
    do {
      let config = try await service.updatePhoneConfig(AiPhoneConfigUpdate(greeting: greeting))
      dashboard?.config = config
      savedMessage = "Greeting saved"
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
