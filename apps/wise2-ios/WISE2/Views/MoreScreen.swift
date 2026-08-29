import SwiftUI

struct MoreScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @StateObject private var viewModel = MoreScreenViewModel()
  let selectedBusiness: String

  var body: some View {
    CommandSurface(title: "More", subtitle: "Account, billing, and business controls", selectedBusiness: selectedBusiness) {
      CommandCard {
        HStack {
          VStack(alignment: .leading, spacing: 4) {
            Text(viewModel.user?.name ?? authManager.currentUser?.name ?? "Operator")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text("\(viewModel.user?.role ?? authManager.currentUser?.role ?? "USER") · \(viewModel.user?.email ?? authManager.currentUser?.email ?? "—")")
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
          }
          Spacer()
          Image(systemName: "checkmark.shield.fill")
            .foregroundColor(.wise2Success)
        }
      }

      if let error = viewModel.errorMessage {
        CommandCard {
          Text(error)
            .font(.caption)
            .foregroundColor(.wise2Warning)
        }
      }

      NavigationLink {
        DetailScreen(
          title: "Billing and Finance",
          rows: [
            "Plan: \(viewModel.user?.plan ?? "—")",
            "Status: \(viewModel.user?.status ?? "—")",
            viewModel.user?.periodEnd.map { "Period end: \($0)" } ?? "Period end: —",
            viewModel.user?.upgradeUrl.map { "Upgrade: \($0)" } ?? "Upgrade path unavailable",
            "Billing mutations stay on web checkout — mobile is read-only",
          ]
        )
      } label: {
        moreRow(icon: "creditcard.fill", title: "Billing and Finance", detail: viewModel.user?.plan ?? "Loading…")
      }
      .buttonStyle(.plain)

      NavigationLink {
        DetailScreen(
          title: "Account",
          rows: [
            viewModel.user?.name ?? authManager.currentUser?.name ?? "—",
            viewModel.user?.email ?? authManager.currentUser?.email ?? "—",
            viewModel.user?.role ?? authManager.currentUser?.role ?? "—",
            authManager.isOperatorPreview ? "Operator preview session" : "Session verified via GET /auth/me",
          ]
        )
      } label: {
        moreRow(
          icon: "person.crop.circle.fill",
          title: "Account",
          detail: authManager.isOperatorPreview ? "Preview profile" : "Live profile"
        )
      }
      .buttonStyle(.plain)

      NavigationLink {
        DetailScreen(
          title: "Security",
          rows: [
            "Face ID for critical Hermes approvals",
            "Keychain access + refresh tokens",
            "Server JWT enforcement",
          ]
        )
      } label: {
        moreRow(icon: "faceid", title: "Security", detail: "Biometrics + Keychain")
      }
      .buttonStyle(.plain)

      NavigationLink {
        DetailScreen(
          title: "Permissions",
          rows: [
            "Role: \(viewModel.user?.role ?? "—")",
            "Business memberships API not shipped yet",
            "Hermes actions remain tenant-user scoped",
          ]
        )
      } label: {
        moreRow(icon: "lock.shield.fill", title: "Permissions", detail: "Role-based")
      }
      .buttonStyle(.plain)

      NavigationLink {
        DetailScreen(
          title: "Support",
          rows: ["Help", "Status · wise2.net", "Contact WISE²"]
        )
      } label: {
        moreRow(icon: "questionmark.circle.fill", title: "Support", detail: "Help & status")
      }
      .buttonStyle(.plain)

      Button(role: .destructive) {
        authManager.logout()
      } label: {
        Label("Sign Out", systemImage: "arrow.right.square.fill")
          .frame(maxWidth: .infinity)
          .padding(.vertical, 12)
      }
      .buttonStyle(.bordered)
      .tint(.wise2Danger)
    }
    .refreshable { await viewModel.load() }
    .preferredColorScheme(.dark)
  }

  private func moreRow(icon: String, title: String, detail: String) -> some View {
    CommandCard {
      HStack(spacing: 12) {
        Image(systemName: icon)
          .foregroundColor(.wise2Primary)
          .frame(width: 28)
        VStack(alignment: .leading, spacing: 2) {
          Text(title)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text(detail)
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
        Spacer()
        Image(systemName: "chevron.right")
          .font(.caption)
          .foregroundColor(.wise2TextMuted)
      }
    }
  }
}

#Preview {
  MoreScreen(selectedBusiness: "ALL BUSINESSES")
    .environmentObject(AuthManager())
}
