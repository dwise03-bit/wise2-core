import Foundation

@MainActor
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var errorMessage: String?
    @Published var isLoading = false

    private let keychain = KeychainManager()
    private let apiClient = APIClient.shared

    init() {
        verifyToken()
    }

    func login(email: String, password: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await apiClient.login(email: email, password: password)
            keychain.saveToken(response.token)
            currentUser = response.user
            isAuthenticated = true
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }
    }

    func logout() {
        keychain.deleteToken()
        currentUser = nil
        isAuthenticated = false
        errorMessage = nil
    }

    private func verifyToken() {
        guard let token = keychain.getToken() else {
            isAuthenticated = false
            return
        }

        Task {
            do {
                let user = try await apiClient.getCurrentUser()
                currentUser = user
                isAuthenticated = true
            } catch {
                keychain.deleteToken()
                isAuthenticated = false
            }
        }
    }
}
