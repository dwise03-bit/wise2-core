import SwiftUI

struct SettingsScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @StateObject private var store = SettingsStore()

  var body: some View {
    List {
      Section("Account") {
        if let user = authManager.currentUser {
          SettingsRow(label: "Name", value: user.name ?? "—")
          SettingsRow(label: "Email", value: user.email)
          SettingsRow(label: "Role", value: user.role)
        }
      }
      Section("Connection") {
        SettingsRow(label: "API base", value: store.apiBaseURL)
        if store.isOperatorPreview {
          Text("Operator preview mode — local fixtures, no live JWT.")
            .font(.caption)
            .foregroundColor(.wise2Warning)
        }
      }
      Section("Integrations") {
        Text("TODO: Push notifications, biometric lock, workspace switcher.")
          .font(.caption)
          .foregroundColor(.wise2TextMuted)
      }
      Section {
        Button(role: .destructive) {
          Task { await authManager.logout() }
        } label: {
          Text("Sign out")
        }
      }
    }
    .listStyle(.insetGrouped)
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Settings")
    .task { await store.refreshEnvironment() }
  }
}

private struct SettingsRow: View {
  let label: String
  let value: String

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(label).font(.caption).foregroundColor(.wise2TextMuted)
      Text(value).foregroundColor(.wise2TextPrimary)
    }
    .listRowBackground(Color.wise2Surface)
  }
}
