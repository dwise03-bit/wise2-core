import SwiftUI

struct CompanionConnectScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @State private var showAuthSheet = false

  var body: some View {
    NavigationStack {
      List {
        Section("Account") {
          if authManager.isAuthenticated, let user = authManager.currentUser {
            VStack(alignment: .leading, spacing: 4) {
              Text(user.name ?? user.email)
                .foregroundColor(.wise2TextPrimary)
              Text(user.email)
                .font(.caption)
                .foregroundColor(.wise2TextMuted)
            }
            if authManager.isOperatorPreview {
              Text("Demo mode — local fixtures only.")
                .font(.caption)
                .foregroundColor(.wise2Warning)
            }
            Button("Sign out", role: .destructive) {
              authManager.logout()
            }
          } else {
            Text("Shop and connect work without signing in.")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
            Button("Sign in for Sales dashboard") {
              showAuthSheet = true
            }
            .foregroundColor(.wise2Gold)
          }
        }

        Section("Work with us") {
          CompanionLinkRow(title: "Get a Quote", icon: "doc.text.fill", url: SenCereBrand.quoteURL)
          CompanionLinkRow(title: "Book a Call", icon: "phone.fill", url: SenCereBrand.phoneTel)
          CompanionLinkRow(title: SenCereBrand.email, icon: "envelope.fill", url: URL(string: "mailto:\(SenCereBrand.email)")!)
        }

        Section("Shop & social") {
          CompanionLinkRow(title: "Blakk Hail Shop", icon: "bag.fill", url: SenCereBrand.shopURL)
          CompanionLinkRow(title: "@blakkhail on Instagram", icon: "camera.fill", url: SenCereBrand.instagramURL)
          CompanionLinkRow(title: "sencerecreative.com", icon: "globe", url: SenCereBrand.websiteURL)
        }

        Section {
          NavigationLink {
            SettingsScreen()
          } label: {
            Label("Account & API", systemImage: "gearshape.fill")
          }
        }
      }
      .listStyle(.insetGrouped)
      .scrollContentBackground(.hidden)
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("Connect")
      .sheet(isPresented: $showAuthSheet) {
        CompanionAuthSheet()
          .environmentObject(authManager)
      }
    }
  }
}

private struct CompanionLinkRow: View {
  let title: String
  let icon: String
  let url: URL

  var body: some View {
    Button {
      UIApplication.shared.open(url)
    } label: {
      Label(title, systemImage: icon)
        .foregroundColor(.wise2TextPrimary)
    }
  }
}
