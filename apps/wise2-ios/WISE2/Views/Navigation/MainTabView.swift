import SwiftUI

struct MainTabView: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState

  @State private var selectedTab: Int = 0

  var body: some View {
    ZStack {
      // Background
      Color.wise2Background
        .ignoresSafeArea()

      VStack(spacing: 0) {
        // Tab Content
        TabView(selection: $selectedTab) {
          // HOME Tab
          HomeScreen()
            .tag(0)
            .tabItem {
              Label("Home", systemImage: "house.fill")
            }

          // AI Tab
          AIScreen()
            .tag(1)
            .tabItem {
              Label("AI", systemImage: "sparkles")
            }

          // WORK Tab
          WorkScreen()
            .tag(2)
            .tabItem {
              Label("Work", systemImage: "briefcase.fill")
            }

          // SYSTEMS Tab
          SystemsScreen()
            .tag(3)
            .tabItem {
              Label("Systems", systemImage: "server.rack")
            }

          // MORE Tab
          MorePlaceholder()
            .tag(4)
            .tabItem {
              Label("More", systemImage: "ellipsis")
            }
        }
        .tabViewStyle(.automatic)
      }
    }
    .preferredColorScheme(.dark)
    .onAppear {
      print("📱 MainTabView appeared")
      Task {
        await appState.loadDashboard()
      }
    }
  }
}

// MARK: - Placeholder Views (for Phase 1 structure)

struct AIPlaceholder: View {
  var body: some View {
    VStack(spacing: 16) {
      Text("WISE² AI")
        .font(.largeTitle)
        .fontWeight(.bold)
        .foregroundColor(.wise2TextPrimary)

      Text("AI Operating Layer")
        .foregroundColor(.wise2TextSecondary)

      Spacer()

      Text("Coming in Phase 2")
        .foregroundColor(.wise2TextMuted)

      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background)
  }
}

struct WorkPlaceholder: View {
  var body: some View {
    VStack(spacing: 16) {
      Text("WORK")
        .font(.largeTitle)
        .fontWeight(.bold)
        .foregroundColor(.wise2TextPrimary)

      Text("CRM, Projects, Tasks")
        .foregroundColor(.wise2TextSecondary)

      Spacer()

      Text("Coming in Phase 3")
        .foregroundColor(.wise2TextMuted)

      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background)
  }
}

struct SystemsPlaceholder: View {
  var body: some View {
    VStack(spacing: 16) {
      Text("SYSTEMS")
        .font(.largeTitle)
        .fontWeight(.bold)
        .foregroundColor(.wise2TextPrimary)

      Text("Infrastructure Command Center")
        .foregroundColor(.wise2TextSecondary)

      Spacer()

      Text("Coming in Phase 4")
        .foregroundColor(.wise2TextMuted)

      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background)
  }
}

struct MorePlaceholder: View {
  var body: some View {
    VStack(spacing: 16) {
      Text("MORE")
        .font(.largeTitle)
        .fontWeight(.bold)
        .foregroundColor(.wise2TextPrimary)

      Text("Billing, Analytics, Files, Settings")
        .foregroundColor(.wise2TextSecondary)

      Spacer()

      Text("Coming in Phase 5")
        .foregroundColor(.wise2TextMuted)

      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background)
  }
}

#Preview {
  MainTabView()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
