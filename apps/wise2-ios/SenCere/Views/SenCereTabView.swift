import SwiftUI

struct SenCereTabView: View {
  @EnvironmentObject var authManager: AuthManager

  var body: some View {
    TabView {
      // Home Tab
      SenCereDashboardScreen()
        .tabItem {
          Label("Home", systemImage: "house.fill")
        }

      // Projects Tab
      SenCereProjectsScreen()
        .tabItem {
          Label("Projects", systemImage: "folder.fill")
        }

      // AI Assistant Tab
      SenCereAIAssistantScreen()
        .tabItem {
          Label("Assistant", systemImage: "sparkles")
        }

      // Messages Tab
      SenCereMessagesScreen()
        .tabItem {
          Label("Messages", systemImage: "message.fill")
        }

      // Account Tab
      SenCereProfileScreen()
        .tabItem {
          Label("Account", systemImage: "person.fill")
        }
    }
    .tint(.sencereGold)
  }
}
