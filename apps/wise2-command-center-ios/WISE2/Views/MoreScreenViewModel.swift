import Foundation

@MainActor
class MoreScreenViewModel: ObservableObject {
  @Published var user: UserProfile?
  @Published var selectedTab: MoreTab = .billing
  @Published var isLoading: Bool = false
  @Published var errorMessage: String?

  private let apiClient = APIClient.shared

  enum MoreTab {
    case billing
    case analytics
    case files
    case settings
  }

  init() {
    loadUserProfile()
  }

  func loadUserProfile() {
    isLoading = true
    errorMessage = nil

    Task {
      do {
        let userInfo = try await apiClient.verifySession()
        user = UserProfile(
          name: userInfo.name ?? "User",
          email: userInfo.email,
          plan: "Pro",
          status: "Active",
          billingCycle: "Monthly",
          nextBillingDate: "2026-09-15",
          totalFiles: "2.4 GB",
          storageLimit: "5 GB"
        )
        isLoading = false
      } catch {
        errorMessage = error.localizedDescription
        isLoading = false
      }
    }
  }
}

struct UserProfile {
  let name: String
  let email: String
  let plan: String
  let status: String
  let billingCycle: String
  let nextBillingDate: String
  let totalFiles: String
  let storageLimit: String
}
