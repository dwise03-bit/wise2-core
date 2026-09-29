import SwiftUI

struct SenCerePartnerScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @StateObject private var commandStore = CommandStore()
  @State private var showAuth = false

  var body: some View {
    NavigationStack {
      Group {
        if authManager.isAuthenticated {
          authenticatedView
        } else {
          guestView
        }
      }
      .sencereScreenBackground()
      .navigationTitle("Partner")
      .refreshable {
        guard authManager.isAuthenticated else { return }
        await commandStore.load()
      }
      .task(id: authManager.isAuthenticated) {
        guard authManager.isAuthenticated else { return }
        await commandStore.load()
      }
      .sheet(isPresented: $showAuth) {
        SenCerePartnerAuthView()
          .environmentObject(authManager)
      }
    }
  }

  private var guestView: some View {
    VStack(spacing: 24) {
      Spacer()
      SenCereEmblemView(size: 140)
      VStack(spacing: 10) {
        Text("Silent Partner Portal")
          .font(.title2.weight(.semibold))
          .foregroundColor(.sencereTextPrimary)
        Text("Revenue, pipeline, and brand performance — synced for SenCere stakeholders.")
          .font(.subheadline)
          .foregroundColor(.sencereTextSecondary)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 24)
      }
      SenCerePrimaryButton(title: "Partner sign-in", icon: "lock.fill") {
        showAuth = true
      }
      .padding(.horizontal, 24)
      Text(SenCereBrand.poweredByFooter)
        .font(.caption2)
        .foregroundColor(.sencereTextMuted)
      Spacer()
    }
  }

  @ViewBuilder
  private var authenticatedView: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        if let user = authManager.currentUser {
          HStack(spacing: 12) {
            SenCereEmblemView(size: 56, showGlow: false)
            VStack(alignment: .leading, spacing: 4) {
              Text(user.name ?? "Partner")
                .font(.headline)
                .foregroundColor(.sencereTextPrimary)
              Text(user.email)
                .font(.caption)
                .foregroundColor(.sencereTextMuted)
            }
            Spacer()
            Button("Sign out", role: .destructive) {
              authManager.logout()
            }
            .font(.caption.weight(.semibold))
          }
        }

        if commandStore.isLoading && commandStore.dashboard == nil {
          ProgressView("Syncing partner metrics…")
            .tint(.sencereGold)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 40)
        } else if let dashboard = commandStore.dashboard {
          Text("Performance")
            .font(.caption.weight(.semibold))
            .foregroundColor(.sencereTextMuted)
            .textCase(.uppercase)
          HStack(spacing: 12) {
            SenCereMetricCard(title: "Revenue today", value: formatCurrency(dashboard.revenueToday))
            SenCereMetricCard(title: "Hot leads", value: "\(dashboard.hotLeadCount)")
          }
          HStack(spacing: 12) {
            SenCereMetricCard(title: "Active jobs", value: "\(dashboard.activeJobCount)")
            SenCereMetricCard(title: "Open invoices", value: "\(dashboard.unpaidInvoiceCount)")
          }
        } else if let error = commandStore.errorMessage {
          Text(error)
            .font(.caption)
            .foregroundColor(.sencereDanger)
        }

        VStack(alignment: .leading, spacing: 12) {
          Text("Portfolio brands")
            .font(.caption.weight(.semibold))
            .foregroundColor(.sencereTextMuted)
            .textCase(.uppercase)
          SenCereBrandRow(name: "Blakk Hail", subtitle: "Fashion · blackhail.store")
          SenCereBrandRow(name: "Piff City", subtitle: "Flagship label")
          SenCereBrandRow(name: "SenCere Creative", subtitle: "Parent company")
        }

        Text(SenCereBrand.poweredByFooter)
          .font(.caption2)
          .foregroundColor(.sencereTextMuted)
          .frame(maxWidth: .infinity)
          .multilineTextAlignment(.center)
          .padding(.top, 8)
      }
      .padding(20)
    }
  }

  private func formatCurrency(_ value: Double) -> String {
    String(format: "$%.0f", value)
  }
}
