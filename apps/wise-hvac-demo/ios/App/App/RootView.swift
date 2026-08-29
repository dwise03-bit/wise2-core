import SwiftUI

struct RootView: View {
    @StateObject private var viewModel = FieldTechViewModel()
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            TabView(selection: $selectedTab) {
                // Dashboard
                DashboardView()
                    .environmentObject(viewModel)
                    .tag(0)

                // Jobs
                FieldTechRootView()
                    .environmentObject(viewModel)
                    .tag(1)

                // Tools
                ToolsView()
                    .environmentObject(viewModel)
                    .tag(2)

                // IMP Tech
                IMPTechView()
                    .environmentObject(viewModel)
                    .tag(3)

                // Equipment (Live Diagnostic)
                LiveDiagnosticView()
                    .environmentObject(viewModel)
                    .tag(4)

                // More
                MoreView()
                    .environmentObject(viewModel)
                    .tag(5)
            }
            .accentColor(WISEColor.wiseGreen)
            .onAppear {
                Task {
                    await viewModel.loadJobs()
                }
            }
        }
    }
}

// Placeholder views for other tabs
struct ToolsView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            VStack {
                Text("TOOLS")
                    .font(WISETypography.screenTitle)
                    .foregroundColor(WISEColor.textPrimary)
                Spacer()
            }
            .padding(WISESpacing.lg)
        }
    }
}

struct IMPTechView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            VStack {
                Text("IMP TECH DIAGNOSTICS")
                    .font(WISETypography.screenTitle)
                    .foregroundColor(WISEColor.textPrimary)
                Spacer()
            }
            .padding(WISESpacing.lg)
        }
    }
}

struct EquipmentView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            VStack {
                Text("EQUIPMENT")
                    .font(WISETypography.screenTitle)
                    .foregroundColor(WISEColor.textPrimary)
                Spacer()
            }
            .padding(WISESpacing.lg)
        }
    }
}

struct MoreView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            VStack {
                Text("MORE")
                    .font(WISETypography.screenTitle)
                    .foregroundColor(WISEColor.textPrimary)
                Spacer()
            }
            .padding(WISESpacing.lg)
        }
    }
}

#Preview {
    RootView()
        .environmentObject(AuthManager.shared)
}
