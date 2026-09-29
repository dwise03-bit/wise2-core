import SwiftUI

@main
struct WISE2RPApp: App {
    @StateObject var gameViewModel = GameViewModel()

    var body: some Scene {
        WindowGroup {
            if gameViewModel.currentPlayer == nil {
                OnboardingView()
                    .environmentObject(gameViewModel)
            } else {
                MainTabView()
                    .environmentObject(gameViewModel)
            }
        }
    }
}
