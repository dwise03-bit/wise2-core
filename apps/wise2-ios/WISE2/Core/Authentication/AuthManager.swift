import Foundation
import Combine

@MainActor
class AuthManager: ObservableObject {
  @Published var isAuthenticated = false
  @Published var currentUser: User?
  @Published var isLoading = false
  @Published var errorMessage: String?

  private let keychainManager = KeychainManager()
  private let apiClient = APIClient.shared

  init() {
    print("🔐 AuthManager initializing...")
    Task {
      await verifySession()
    }
  }

  // MARK: - Authentication Methods

  func login(email: String, password: String) async {
    isLoading = true
    errorMessage = nil

    do {
      print("📝 Attempting login: \(email)")
      let response = try await apiClient.login(email: email, password: password)

      // Save token securely
      try keychainManager.saveToken(response.token)

      // Set authenticated state
      currentUser = response.user
      isAuthenticated = true

      print("✅ Login successful for \(email)")
    } catch {
      errorMessage = error.localizedDescription
      print("❌ Login failed: \(error)")
    }

    isLoading = false
  }

  func signup(email: String, password: String, name: String) async {
    isLoading = true
    errorMessage = nil

    do {
      print("📝 Attempting signup: \(email)")
      let response = try await apiClient.signup(email: email, password: password, name: name)

      try keychainManager.saveToken(response.token)
      currentUser = response.user
      isAuthenticated = true

      print("✅ Signup successful for \(email)")
    } catch {
      errorMessage = error.localizedDescription
      print("❌ Signup failed: \(error)")
    }

    isLoading = false
  }

  func logout() {
    print("🚪 Logging out...")
    do {
      try keychainManager.deleteToken()
      currentUser = nil
      isAuthenticated = false
      print("✅ Logout complete")
    } catch {
      errorMessage = "Failed to logout: \(error.localizedDescription)"
      print("❌ Logout failed: \(error)")
    }
  }

  // MARK: - Session Management

  func verifySession() async {
    print("🔍 Verifying session...")

    guard let token = try? keychainManager.getToken() else {
      print("⚠️ No token in keychain")
      isAuthenticated = false
      return
    }

    do {
      let user = try await apiClient.verifySession()
      currentUser = user
      isAuthenticated = true
      print("✅ Session verified for \(user.email)")
    } catch {
      print("❌ Session verification failed: \(error)")
      try? keychainManager.deleteToken()
      isAuthenticated = false
    }
  }

  func refreshToken() async {
    print("🔄 Refreshing authentication token...")

    do {
      let newToken = try await apiClient.refreshToken()
      try keychainManager.saveToken(newToken)
      print("✅ Token refreshed")
    } catch {
      print("❌ Token refresh failed: \(error)")
      await logout()
    }
  }
}
