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

  func bootstrap() async {
    isBootstrapping = true
    errorMessage = nil

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

  func enterOperatorPreview() async {
    isLoading = true
    errorMessage = nil
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
    clearSession()
  }

  func verifySession() async {
    guard (try? keychainManager.getToken()) != nil else {
      clearSession()
      return
    }

    do {
      currentUser = try await apiClient.verifySession()
      isAuthenticated = true
      isOperatorPreview = false
    } catch {
      clearSession()
    }
  }

  private func persist(_ response: AuthResponse) throws {
    try keychainManager.saveToken(response.token)
  }

  private func clearSession() {
    try? keychainManager.deleteToken()
    currentUser = nil
    isAuthenticated = false
    isOperatorPreview = false
  }
}
