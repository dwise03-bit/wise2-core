import SwiftUI

@main
struct WISE2App: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var appState = AppState()

    init() {
        print("🚀 WISE2App initializing...")
    }

    var body: some Scene {
        WindowGroup {
            ZStack {
                Color.black.ignoresSafeArea()

                if authManager.isAuthenticated {
                    MainTabView()
                        .environmentObject(authManager)
                        .environmentObject(appState)
                        .onAppear {
                            print("✅ MainTabView appeared")
                        }
                } else {
                    LoginView()
                        .environmentObject(authManager)
                        .onAppear {
                            print("✅ LoginView appeared")
                        }
                }
            }
        }
    }
}
