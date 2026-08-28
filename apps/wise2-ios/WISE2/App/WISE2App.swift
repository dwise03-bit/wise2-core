import SwiftUI

@main
struct WISE2App: App {
  @StateObject private var authManager = AuthManager()
  @StateObject private var appState = AppState()

  init() {
    print("WISE2 Command Center launching")
  }

  var body: some Scene {
    WindowGroup {
      ZStack {
        Color.wise2Background
          .ignoresSafeArea()

        MainTabView()
          .environmentObject(authManager)
          .environmentObject(appState)
          .onAppear {
            print("WISE2 Command Center loaded")
            if authManager.currentUser == nil {
              authManager.currentUser = User(id: "owner", email: "demo@wise2.app", name: "Daniel Wise", role: "Owner/Super Admin")
            }
            authManager.isAuthenticated = true
          }
      }
      .preferredColorScheme(.dark)
    }
  }
}
