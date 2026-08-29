import SwiftUI

struct MainTabView: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @EnvironmentObject var toolHub: ToolHubStore
  @State private var selectedTab: Int = 0

  var body: some View {
    TabView(selection: $selectedTab) {
      HomeScreen()
        .tag(0)
        .tabItem { Label("Home", systemImage: "house.fill") }

      AIPlaceholder()
        .tag(1)
        .tabItem { Label("AI", systemImage: "sparkles") }

      NavigationView {
        HVACWorkView()
      }
      .tag(2)
      .tabItem { Label("Work", systemImage: "wrench.and.screwdriver.fill") }

      SystemsPlaceholder()
        .tag(3)
        .tabItem { Label("Systems", systemImage: "server.rack") }

      MorePlaceholder()
        .tag(4)
        .tabItem { Label("More", systemImage: "ellipsis") }
    }
    .accentColor(.wise2ElectricGreen)
    .preferredColorScheme(.dark)
    .onAppear {
      Task { await appState.loadDashboard() }
    }
  }
}

struct HVACWorkView: View {
  @EnvironmentObject var toolHub: ToolHubStore

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()
      ScrollView {
        VStack(alignment: .leading, spacing: 18) {
          VStack(alignment: .leading, spacing: 5) {
            Text("WISE² FIELD TECH")
              .font(.caption.weight(.black)).tracking(2).foregroundColor(.wise2ElectricGreen)
            Text("HVAC Command")
              .font(.system(size: 32, weight: .black, design: .rounded)).foregroundColor(.white)
            Text("Tools, diagnostics and job intelligence in one field surface.")
              .font(.subheadline).foregroundColor(.wise2TextSecondary)
          }

          NavigationLink(destination: ToolHubView()) {
            HStack(spacing: 15) {
              ZStack {
                RoundedRectangle(cornerRadius: 15).fill(Color.wise2ElectricGreen.opacity(0.12)).frame(width: 58, height: 58)
                Image(systemName: "antenna.radiowaves.left.and.right")
                  .font(.system(size: 25, weight: .bold)).foregroundColor(.wise2ElectricGreen)
              }
              VStack(alignment: .leading, spacing: 4) {
                Text("FIELDPIECE TOOL HUB").font(.headline.weight(.black)).foregroundColor(.white)
                Text("\(toolHub.connectedCount) connected • \(toolHub.devices.count) discovered")
                  .font(.caption).foregroundColor(.wise2TextMuted)
              }
              Spacer()
              Image(systemName: "chevron.right").foregroundColor(.wise2ElectricGreen)
            }
            .padding(16)
            .background(Color.wise2Card)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.wise2ElectricGreen.opacity(0.25)))
            .clipShape(RoundedRectangle(cornerRadius: 18))
          }

          HStack(spacing: 10) {
            FieldCommandTile(title: "DIAGNOSTICS", subtitle: "Live readings", icon: "waveform.path.ecg")
            FieldCommandTile(title: "SNAPSHOT", subtitle: "Capture job", icon: "camera.metering.matrix")
          }

          HStack(spacing: 10) {
            FieldCommandTile(title: "AI ASSIST", subtitle: "Analyze system", icon: "sparkles")
            FieldCommandTile(title: "REPORT", subtitle: "Build summary", icon: "doc.text.fill")
          }
        }
        .padding(18)
      }
    }
    .navigationTitle("Work")
    .navigationBarTitleDisplayMode(.inline)
  }
}

private struct FieldCommandTile: View {
  let title: String
  let subtitle: String
  let icon: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Image(systemName: icon).font(.system(size: 22, weight: .bold)).foregroundColor(.wise2ElectricGreen)
      Spacer(minLength: 8)
      Text(title).font(.caption.weight(.black)).tracking(1).foregroundColor(.white)
      Text(subtitle).font(.caption2).foregroundColor(.wise2TextMuted)
    }
    .frame(maxWidth: .infinity, minHeight: 110, alignment: .leading)
    .padding(14)
    .background(Color.wise2Surface)
    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.wise2BorderSubtle))
    .clipShape(RoundedRectangle(cornerRadius: 16))
  }
}

struct AIPlaceholder: View {
  var body: some View { placeholder(title: "WISE² AI", subtitle: "AI Operating Layer") }
}

struct SystemsPlaceholder: View {
  var body: some View { placeholder(title: "SYSTEMS", subtitle: "Infrastructure Command Center") }
}

struct MorePlaceholder: View {
  var body: some View { placeholder(title: "MORE", subtitle: "Billing, Analytics, Files, Settings") }
}

private func placeholder(title: String, subtitle: String) -> some View {
  VStack(spacing: 12) {
    Spacer()
    Text(title).font(.largeTitle.weight(.bold)).foregroundColor(.wise2TextPrimary)
    Text(subtitle).foregroundColor(.wise2TextSecondary)
    Spacer()
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity)
  .background(Color.wise2Background)
}

#Preview {
  MainTabView()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
    .environmentObject(ToolHubStore())
}
