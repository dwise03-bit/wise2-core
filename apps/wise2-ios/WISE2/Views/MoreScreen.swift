import SwiftUI

struct MoreScreen: View {
  @EnvironmentObject var authManager: AuthManager
  let selectedBusiness: String

  private let entries: [MoreEntry] = [
    MoreEntry(title: "Billing and Finance", icon: "creditcard.fill", rows: ["Invoices", "Payments", "Revenue", "Owner approval required for billing mutations"]),
    MoreEntry(title: "Analytics", icon: "chart.xyaxis.line", rows: ["Portfolio metrics", "Traffic", "Conversion", "Operations"]),
    MoreEntry(title: "Files", icon: "folder.fill", rows: ["Documents", "Approvals", "Proposals", "Scoped storage"]),
    MoreEntry(title: "Communications", icon: "bubble.left.and.bubble.right.fill", rows: ["Email", "Messages", "Follow-ups", "External bulk communication requires approval"]),
    MoreEntry(title: "AI Phone", icon: "phone.fill", rows: ["Voice workflows", "Call history", "Provider unavailable state"]),
    MoreEntry(title: "Team", icon: "person.3.fill", rows: ["Owner/Super Admin", "Admin", "Manager", "Tech/Operator", "Client", "Read-Only"]),
    MoreEntry(title: "Permissions", icon: "lock.shield.fill", rows: ["Roles", "Capabilities", "Business membership", "Server enforcement required"]),
    MoreEntry(title: "Integrations", icon: "puzzlepiece.extension.fill", rows: ["CRM", "Finance", "Phone", "Websites", "Automation providers"]),
    MoreEntry(title: "Audit Log", icon: "list.bullet.clipboard.fill", rows: ["Privileged actions", "AI approvals", "Session activity", "Security events"]),
    MoreEntry(title: "Account", icon: "person.crop.circle.fill", rows: ["Daniel Wise", "demo@wise2.app", "Owner/Super Admin"]),
    MoreEntry(title: "Security", icon: "faceid", rows: ["Face ID", "Keychain tokens", "Session expiry", "Redacted diagnostics"]),
    MoreEntry(title: "Settings", icon: "gearshape.fill", rows: ["Notifications", "Appearance locked dark", "Offline cache state", "Developer diagnostics"]),
    MoreEntry(title: "Support", icon: "questionmark.circle.fill", rows: ["Help", "Status", "Contact WISE²"])
  ]

  var body: some View {
    CommandSurface(title: "More", subtitle: "Finance, files, team, integrations, account", selectedBusiness: selectedBusiness) {
      CommandCard {
        HStack {
          VStack(alignment: .leading, spacing: 4) {
            Text(authManager.currentUser?.name ?? "Daniel Wise")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text("Owner/Super Admin · \(authManager.currentUser?.email ?? "demo@wise2.app")")
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
          }
          Spacer()
          Image(systemName: "checkmark.shield.fill")
            .foregroundColor(.wise2Success)
        }
      }

      ForEach(entries) { entry in
        NavigationLink {
          DetailScreen(title: entry.title, rows: entry.rows)
        } label: {
          CommandCard {
            HStack(spacing: 12) {
              Image(systemName: entry.icon)
                .foregroundColor(.wise2Primary)
                .frame(width: 28)
              Text(entry.title)
                .font(.headline)
                .foregroundColor(.wise2TextPrimary)
              Spacer()
              Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.wise2TextMuted)
            }
          }
        }
        .buttonStyle(.plain)
      }

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
    .preferredColorScheme(.dark)
  }
}

struct MoreEntry: Identifiable {
  let id = UUID().uuidString
  let title: String
  let icon: String
  let rows: [String]
}

#Preview {
  MoreScreen(selectedBusiness: "ALL BUSINESSES")
    .environmentObject(AuthManager())
}
