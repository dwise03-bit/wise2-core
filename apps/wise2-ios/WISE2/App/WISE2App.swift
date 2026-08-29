import SwiftUI

@main
struct WISE2App: App {
  @StateObject private var authManager = AuthManager()
  @StateObject private var appState = AppState()

  init() {
    print("🚀 WISE² Command Center launching...")
  }

  var body: some Scene {
    WindowGroup {
      Group {
        if authManager.isAuthenticated {
          MainTabView()
        } else {
          AuthGate()
        }
      }
      .environmentObject(authManager)
      .environmentObject(appState)
      .preferredColorScheme(.dark)
      .task(id: authManager.isAuthenticated) {
        guard authManager.isAuthenticated else {
          appState.reset()
          return
        }
        await appState.loadDashboard()
      }
    }
  }
}

#if DEBUG
#Preview("Authenticated") {
  MainTabView()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}

#Preview("Auth gate") {
  AuthGate()
    .environmentObject(AuthManager())
}
#endif
