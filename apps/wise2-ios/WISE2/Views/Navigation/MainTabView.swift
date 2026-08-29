import SwiftUI

struct MainTabView: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @StateObject private var commandStore = CommandStore()
  @State private var selectedTab = 0
  @State private var showCommandSheet = false

  var body: some View {
    ZStack(alignment: .bottomTrailing) {
      TabView(selection: $selectedTab) {
        CommandScreen(store: commandStore)
          .tag(0)
          .tabItem { Label("Command", systemImage: "command.circle.fill") }

        CRMScreen()
          .tag(1)
          .tabItem { Label("CRM", systemImage: "person.2.fill") }

        WorkScreen()
          .tag(2)
          .tabItem { Label("Work", systemImage: "briefcase.fill") }

        AIWorkforceScreen()
          .tag(3)
          .tabItem { Label("AI", systemImage: "sparkles") }

        MoreScreen()
          .tag(4)
          .tabItem { Label("More", systemImage: "ellipsis.circle.fill") }
      }
      .preferredColorScheme(.dark)

      CommandOrb {
        selectedTab = 0
        showCommandSheet = true
      }
      .padding(.trailing, 20)
      .padding(.bottom, 28)
    }
    .sheet(isPresented: $showCommandSheet) {
      NavigationView {
        CommandScreen(store: commandStore, showsNavigationChrome: false)
          .navigationTitle("WISE² Command")
          .navigationBarTitleDisplayMode(.inline)
          .toolbar {
            ToolbarItem(placement: .cancellationAction) {
              Button("Close") { showCommandSheet = false }
            }
          }
      }
      .preferredColorScheme(.dark)
    }
  }
}

#Preview {
  MainTabView()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
