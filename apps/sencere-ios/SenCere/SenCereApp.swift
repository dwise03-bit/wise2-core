import SwiftUI

@main
struct SenCereApp: App {
  @StateObject private var authManager = AuthManager()

  var body: some Scene {
    WindowGroup {
      if authManager.isAuthenticated {
        SenCereTabView()
          .environmentObject(authManager)
      } else {
        Text("SenCere")
          .environmentObject(authManager)
      }
    }
  }
}
