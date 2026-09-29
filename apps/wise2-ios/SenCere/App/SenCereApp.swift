import SwiftUI

@main
struct SenCereApp: App {
  @StateObject private var authManager = AuthManager()

  var body: some Scene {
    WindowGroup {
      SenCereTabView()
        .environmentObject(authManager)
        .preferredColorScheme(.dark)
    }
  }
}
