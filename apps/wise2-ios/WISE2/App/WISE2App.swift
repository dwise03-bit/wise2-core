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
      ZStack {
        Color.wise2Background
          .ignoresSafeArea()

        if authManager.isAuthenticated {
          MainTabView()
            .environmentObject(authManager)
            .environmentObject(appState)
            .onAppear {
              print("✅ User authenticated, showing main interface")
            }
        } else {
          AuthGate()
            .environmentObject(authManager)
            .onAppear {
              print("🔐 No active session, showing authentication")
            }
        }

        // OTA Update overlay
        OTAUpdateView()
      }
      .preferredColorScheme(.dark)
      .id(authManager.isAuthenticated) // Force view refresh on auth state change
    }
  }
}
