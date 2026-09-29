import SwiftUI

struct SenCereHomeScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @StateObject private var commandStore = CommandStore()
  @State private var showShop = false
  @State private var showPartnerAuth = false

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: 28) {
          VStack(spacing: 16) {
            SenCereEmblemView(size: 168)
            VStack(spacing: 6) {
              Text(SenCereBrand.legalName)
                .font(.system(size: 26, weight: .semibold))
                .foregroundColor(.sencereTextPrimary)
              Text(SenCereBrand.tagline)
                .font(.subheadline)
                .foregroundColor(.sencereTextSecondary)
              Text(SenCereBrand.motto)
                .font(.headline)
                .foregroundColor(.sencereGold)
            }
            .multilineTextAlignment(.center)
          }

          if authManager.isAuthenticated, let dashboard = commandStore.dashboard {
            VStack(alignment: .leading, spacing: 12) {
              Text("Partner snapshot")
                .font(.caption.weight(.semibold))
                .foregroundColor(.sencereTextMuted)
                .textCase(.uppercase)
              HStack(spacing: 12) {
                SenCereMetricCard(title: "Revenue", value: String(format: "$%.0f", dashboard.revenueToday))
                SenCereMetricCard(title: "Leads", value: "\(dashboard.hotLeadCount)")
              }
            }
          } else {
            SenCereSecondaryButton(title: "Partner portal sign-in", icon: "chart.line.uptrend.xyaxis") {
              showPartnerAuth = true
            }
          }

          VStack(spacing: 12) {
            SenCerePrimaryButton(title: "Open Blakk Hail Shop", icon: "bag.fill") {
              showShop = true
            }
            SenCereSecondaryButton(title: "Get a Quote", icon: "doc.text.fill") {
              UIApplication.shared.open(SenCereBrand.quoteURL)
            }
          }

          VStack(alignment: .leading, spacing: 12) {
            Text("Portfolio")
              .font(.caption.weight(.semibold))
              .foregroundColor(.sencereTextMuted)
              .textCase(.uppercase)
            SenCereBrandRow(name: "Blakk Hail", subtitle: "Original fashion · Est. 1994") {
              showShop = true
            }
            SenCereBrandRow(name: "Piff City", subtitle: "Three-eyed rabbit · flagship label")
          }
        }
        .padding(20)
      }
      .sencereScreenBackground()
      .navigationTitle("SenCere")
      .navigationBarTitleDisplayMode(.inline)
      .refreshable {
        guard authManager.isAuthenticated else { return }
        await commandStore.load()
      }
      .task(id: authManager.isAuthenticated) {
        guard authManager.isAuthenticated else { return }
        await commandStore.load()
      }
      .fullScreenCover(isPresented: $showShop) {
        NavigationStack {
          SenCereShopScreen()
            .toolbar {
              ToolbarItem(placement: .cancellationAction) {
                Button("Done") { showShop = false }
              }
            }
        }
      }
      .sheet(isPresented: $showPartnerAuth) {
        SenCerePartnerAuthView()
          .environmentObject(authManager)
      }
    }
  }
}
