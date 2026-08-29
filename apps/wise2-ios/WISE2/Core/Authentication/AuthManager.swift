import Foundation
import Combine

@MainActor
class AuthManager: ObservableObject {
  @Published var isAuthenticated = false
  @Published var currentUser: User?
  @Published var isLoading = false
  @Published var errorMessage: String?
  @Published var isOperatorPreview = false
  @Published var isBootstrapping = true

  private let keychainManager = KeychainManager()
  private let apiClient = APIClient.shared

  init() {
    Task { await bootstrap() }
  }

  /// Restore a live JWT session from Keychain when possible; otherwise stay on AuthGate.
  func bootstrap() async {
    isBootstrapping = true
    errorMessage = nil
    await apiClient.setOperatorPreviewMode(false)

    guard (try? keychainManager.getToken()) != nil else {
      clearSession()
      isBootstrapping = false
      return
    }

    await verifySession()
    isBootstrapping = false
  }

  func login(email: String, password: String) async {
    isLoading = true
    errorMessage = nil
    do {
      await apiClient.setOperatorPreviewMode(false)
      let response = try await apiClient.login(email: email, password: password)
      try persist(response)
      currentUser = response.user
      isAuthenticated = true
      isOperatorPreview = false
    } catch {
      errorMessage = error.localizedDescription
    }
    isLoading = false
  }

  func signup(email: String, password: String, name: String) async {
    isLoading = true
    errorMessage = nil
    do {
      await apiClient.setOperatorPreviewMode(false)
      let response = try await apiClient.signup(email: email, password: password, name: name)
      try persist(response)
      currentUser = response.user
      isAuthenticated = true
      isOperatorPreview = false
    } catch {
      errorMessage = error.localizedDescription
    }
    isLoading = false
  }

  /// DEBUG escape hatch: local business-ops fixtures without a production JWT.
  func enterOperatorPreview() async {
    isLoading = true
    errorMessage = nil
    await apiClient.setOperatorPreviewMode(true)
    currentUser = User(
      id: "operator-preview",
      email: "dwise03@gmail.com",
      name: "Daniel Wise",
      role: "FOUNDER"
    )
    isOperatorPreview = true
    isAuthenticated = true
    isLoading = false
  }

  func logout() {
    Task {
      if !isOperatorPreview {
        try? await apiClient.logout()
      }
      await apiClient.setOperatorPreviewMode(false)
      clearSession()
    }
  }

  func verifySession() async {
    guard (try? keychainManager.getToken()) != nil else {
      clearSession()
      return
    }

    await apiClient.setOperatorPreviewMode(false)

    do {
      currentUser = try await apiClient.verifySession()
      isAuthenticated = true
      isOperatorPreview = false
    } catch APIError.unauthorized {
      if await attemptRefresh() {
        do {
          currentUser = try await apiClient.verifySession()
          isAuthenticated = true
          isOperatorPreview = false
          return
        } catch {
          clearSession()
        }
      } else {
        clearSession()
      }
    } catch {
      clearSession()
    }
  }

  func refreshToken() async {
    _ = await attemptRefresh()
  }

  private func attemptRefresh() async -> Bool {
    do {
      let newToken = try await apiClient.refreshToken()
      try keychainManager.saveToken(newToken)
      return true
    } catch {
      clearSession()
      return false
    }
  }

  private func persist(_ response: AuthResponse) throws {
    try keychainManager.saveToken(response.token)
    if let refresh = response.refreshToken {
      try keychainManager.saveRefreshToken(refresh)
    }
  }

  private func clearSession() {
    try? keychainManager.deleteToken()
    currentUser = nil
    isAuthenticated = false
    isOperatorPreview = false
  }
}
