import SwiftUI

enum CommandTab: Int, CaseIterable {
  case home
  case ai
  case work
  case systems
  case more

  var title: String {
    switch self {
    case .home: return "Home"
    case .ai: return "AI"
    case .work: return "Work"
    case .systems: return "Systems"
    case .more: return "More"
    }
  }

  var symbol: String {
    switch self {
    case .home: return "house.fill"
    case .ai: return "sparkles"
    case .work: return "briefcase.fill"
    case .systems: return "server.rack"
    case .more: return "ellipsis.circle.fill"
    }
  }
}

struct MainTabView: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @State private var selectedTab: CommandTab = .home
  @State private var selectedBusiness = "ALL BUSINESSES"

  var body: some View {
    TabView(selection: $selectedTab) {
      NavigationStack {
        HomeScreen(selectedBusiness: $selectedBusiness, selectedTab: $selectedTab)
      }
      .tabItem { Label(CommandTab.home.title, systemImage: CommandTab.home.symbol) }
      .tag(CommandTab.home)

      NavigationStack {
        AIScreen(selectedBusiness: selectedBusiness)
      }
      .tabItem { Label(CommandTab.ai.title, systemImage: CommandTab.ai.symbol) }
      .tag(CommandTab.ai)

      NavigationStack {
        WorkScreen(selectedBusiness: selectedBusiness)
      }
      .tabItem { Label(CommandTab.work.title, systemImage: CommandTab.work.symbol) }
      .tag(CommandTab.work)

      NavigationStack {
        SystemsScreen(selectedBusiness: selectedBusiness)
      }
      .tabItem { Label(CommandTab.systems.title, systemImage: CommandTab.systems.symbol) }
      .tag(CommandTab.systems)

      NavigationStack {
        MoreScreen(selectedBusiness: selectedBusiness)
      }
      .tabItem { Label(CommandTab.more.title, systemImage: CommandTab.more.symbol) }
      .tag(CommandTab.more)
    }
    .tint(.wise2Primary)
    .preferredColorScheme(.dark)
    .onAppear {
      UITabBar.appearance().backgroundColor = UIColor(Color.wise2Surface)
      UITabBar.appearance().unselectedItemTintColor = UIColor(Color.wise2TextMuted)
      Task { await appState.loadDashboard() }
    }
  }
}

struct CommandSurface<Content: View>: View {
  let title: String
  let subtitle: String
  let selectedBusiness: String
  @ViewBuilder var content: Content

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 18) {
          HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 5) {
              Text(title)
                .font(.system(.largeTitle, design: .rounded, weight: .bold))
                .foregroundColor(.wise2TextPrimary)
                .accessibilityAddTraits(.isHeader)
              Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.wise2TextSecondary)
              Text(selectedBusiness)
                .font(.caption.weight(.semibold))
                .foregroundColor(.wise2Primary)
                .padding(.top, 2)
            }
            Spacer()
          }

          content
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 120)
      }
    }
    .safeAreaInset(edge: .bottom) {
      Color.clear.frame(height: 82)
    }
    .toolbar(.hidden, for: .navigationBar)
  }
}

struct CommandCard<Content: View>: View {
  @ViewBuilder var content: Content

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      content
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(14)
    .background(
      RoundedRectangle(cornerRadius: 8, style: .continuous)
        .fill(Color.wise2Surface)
        .overlay(
          RoundedRectangle(cornerRadius: 8, style: .continuous)
            .stroke(Color.wise2BorderMedium, lineWidth: 1)
        )
    )
  }
}

struct SectionLabel: View {
  let title: String

  var body: some View {
    Text(title.uppercased())
      .font(.caption.weight(.bold))
      .foregroundColor(.wise2TextSecondary)
      .accessibilityAddTraits(.isHeader)
  }
}

#Preview {
  MainTabView()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
