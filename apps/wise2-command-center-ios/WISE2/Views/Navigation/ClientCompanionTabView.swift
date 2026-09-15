import SwiftUI

/// SenCere Client Companion — shop, sales, and connect tabs for the business owner.
struct ClientCompanionTabView: View {
  var body: some View {
    TabView {
      CompanionHomeScreen()
        .tabItem { Label("Home", systemImage: "house.fill") }

      NavigationStack {
        CompanionShopScreen()
      }
      .tabItem { Label("Shop", systemImage: "bag.fill") }

      NavigationStack {
        SalesScreen()
      }
      .tabItem { Label("Sales", systemImage: "chart.line.uptrend.xyaxis") }

      CompanionConnectScreen()
        .tabItem { Label("Connect", systemImage: "link.circle.fill") }
    }
    .tint(.wise2Gold)
    .preferredColorScheme(.dark)
  }
}

#Preview {
  ClientCompanionTabView()
    .environmentObject(AuthManager())
}
