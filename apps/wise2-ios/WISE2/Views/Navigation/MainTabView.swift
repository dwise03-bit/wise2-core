import SwiftUI

struct MainTabView: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @State private var selectedTab = 0

  var body: some View {
    TabView(selection: $selectedTab) {
      CommandScreen()
        .tag(0)
        .tabItem { Label("Command", systemImage: "command.circle.fill") }

      BusinessModulePlaceholder(module: .crm, subtitle: "Leads, pipeline and revenue")
        .tag(1)
        .tabItem { Label("CRM", systemImage: "person.2.fill") }

      BusinessModulePlaceholder(module: .work, subtitle: "Projects, jobs and field operations")
        .tag(2)
        .tabItem { Label("Work", systemImage: "briefcase.fill") }

      BusinessModulePlaceholder(module: .ai, subtitle: "AI workforce and approvals")
        .tag(3)
        .tabItem { Label("AI", systemImage: "sparkles") }

      MoreScreen()
        .tag(4)
        .tabItem { Label("More", systemImage: "ellipsis.circle.fill") }
    }
    .preferredColorScheme(.dark)
  }
}

struct BusinessModulePlaceholder: View {
  let module: BusinessOSModule
  let subtitle: String

  var body: some View {
    VStack(spacing: 14) {
      Image(systemName: module.systemImage)
        .font(.system(size: 44, weight: .semibold))
        .foregroundColor(.wise2Primary)
      Text(module.title)
        .font(.largeTitle.bold())
        .foregroundColor(.wise2TextPrimary)
      Text(subtitle)
        .multilineTextAlignment(.center)
        .foregroundColor(.wise2TextSecondary)
    }
    .padding()
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background.ignoresSafeArea())
  }
}

struct MoreScreen: View {
  private let modules: [BusinessOSModule] = [.phone, .clients, .cloud, .studio, .money, .academy, .trading, .settings]

  var body: some View {
    NavigationView {
      List(modules) { module in
        HStack(spacing: 14) {
          Image(systemName: module.systemImage)
            .frame(width: 28)
            .foregroundColor(.wise2Primary)
          Text(module.title).foregroundColor(.wise2TextPrimary)
          Spacer()
          Image(systemName: "chevron.right").foregroundColor(.wise2TextMuted)
        }
        .listRowBackground(Color.wise2Surface)
      }
      .listStyle(.insetGrouped)
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("WISE² Business")
    }
  }
}

#Preview {
  MainTabView()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
