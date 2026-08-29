import Foundation

@MainActor
class MoreScreenViewModel: ObservableObject {
  @Published var user: UserProfile?
  @Published var billing: BillingProfile?
  @Published var isLoading = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared

  init() {
    Task { await load() }
  }

  func load() async {
    isLoading = true
    errorMessage = nil
    do {
      async let me = apiClient.verifySession()
      async let bill = apiClient.getBillingProfile()
      let userInfo = try await me
      billing = try? await bill
      user = UserProfile(
        name: userInfo.name ?? "Operator",
        email: userInfo.email,
        role: userInfo.role,
        plan: billing?.plan ?? "FREE",
        status: billing?.status ?? "ACTIVE",
        periodEnd: billing?.periodEnd,
        upgradeUrl: billing?.upgradeUrl
      )
    } catch {
      errorMessage = error.localizedDescription
    }
    isLoading = false
  }
}

struct UserProfile {
  let name: String
  let email: String
  let role: String
  let plan: String
  let status: String
  let periodEnd: String?
  let upgradeUrl: String?
}
