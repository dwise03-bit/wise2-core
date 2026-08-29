import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0

    enum Tab: Int {
        case dashboard = 0
        case fieldtech = 1
        case automation = 2
        case analytics = 3
        case settings = 4
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            TabView(selection: $selectedTab) {
                DashboardView()
                    .tag(Tab.dashboard.rawValue)
                    .tabItem {
                        Label("Dashboard", systemImage: "chart.bar.fill")
                    }

                FieldTechView()
                    .tag(Tab.fieldtech.rawValue)
                    .tabItem {
                        Label("Jobs", systemImage: "list.clipboard.fill")
                    }

                AutomationView()
                    .tag(Tab.automation.rawValue)
                    .tabItem {
                        Label("Automation", systemImage: "gearshape.fill")
                    }

                AnalyticsView()
                    .tag(Tab.analytics.rawValue)
                    .tabItem {
                        Label("Analytics", systemImage: "chart.line.uptrend.xyaxis")
                    }

                SettingsView()
                    .tag(Tab.settings.rawValue)
                    .tabItem {
                        Label("Settings", systemImage: "gearshape.2.fill")
                    }
            }
            .onAppear {
                Task {
                    await appState.loadDashboardData()
                    await appState.loadJobs()
                    await appState.loadAutomations()
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthManager())
        .environmentObject(AppState())
}
