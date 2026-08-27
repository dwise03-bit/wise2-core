import SwiftUI

struct MoreScreen: View {
  @StateObject private var viewModel = MoreScreenViewModel()
  @EnvironmentObject var authManager: AuthManager

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          Text("MORE")
            .font(.largeTitle)
            .fontWeight(.bold)
            .foregroundColor(.wise2TextPrimary)

          Text("Billing, Analytics, Files, Settings")
            .foregroundColor(.wise2TextSecondary)
            .font(.subheadline)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.wise2Surface)

        // Tab Selector
        HStack(spacing: 0) {
          ForEach([MoreScreenViewModel.MoreTab.billing, .analytics, .files, .settings], id: \.self) { tab in
            Button(action: { viewModel.selectedTab = tab }) {
              Text(tabTitle(tab))
                .font(.caption)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .foregroundColor(
                  viewModel.selectedTab == tab ? .wise2Primary : .wise2TextSecondary
                )
                .background(
                  viewModel.selectedTab == tab
                    ? Color.wise2Primary.opacity(0.1)
                    : Color.clear
                )
            }
          }
        }
        .background(Color.wise2Surface)

        // Content
        if viewModel.isLoading {
          VStack(spacing: 12) {
            ProgressView()
              .tint(.wise2Primary)
            Text("Loading profile...")
              .foregroundColor(.wise2TextSecondary)
          }
          .frame(maxHeight: .infinity)
        } else if let user = viewModel.user {
          ScrollView {
            VStack(spacing: 16) {
              // User Card
              VStack(alignment: .leading, spacing: 12) {
                HStack {
                  VStack(alignment: .leading, spacing: 4) {
                    Text(user.name)
                      .font(.headline)
                      .foregroundColor(.wise2TextPrimary)
                    Text(user.email)
                      .font(.caption)
                      .foregroundColor(.wise2TextSecondary)
                  }
                  Spacer()
                  VStack(alignment: .trailing, spacing: 4) {
                    Text(user.plan)
                      .font(.caption)
                      .fontWeight(.semibold)
                      .foregroundColor(.wise2Primary)
                    Text(user.status)
                      .font(.caption)
                      .foregroundColor(.wise2Success)
                  }
                }

                Divider()
                  .background(Color.wise2Primary.opacity(0.2))

                HStack(spacing: 24) {
                  VStack(alignment: .leading, spacing: 4) {
                    Text("Billing")
                      .font(.caption)
                      .foregroundColor(.wise2TextSecondary)
                    Text(user.billingCycle)
                      .font(.subheadline)
                      .foregroundColor(.wise2TextPrimary)
                      .fontWeight(.semibold)
                  }

                  VStack(alignment: .leading, spacing: 4) {
                    Text("Storage")
                      .font(.caption)
                      .foregroundColor(.wise2TextSecondary)
                    Text("\(user.totalFiles) / \(user.storageLimit)")
                      .font(.subheadline)
                      .foregroundColor(.wise2TextPrimary)
                      .fontWeight(.semibold)
                  }

                  Spacer()
                }
              }
              .padding(12)
              .background(Color.wise2Surface)
              .cornerRadius(8)

              // Tab Content
              if viewModel.selectedTab == .billing {
                BillingContent(user: user)
              } else if viewModel.selectedTab == .analytics {
                AnalyticsContent()
              } else if viewModel.selectedTab == .files {
                FilesContent(user: user)
              } else {
                SettingsContent(viewModel: viewModel)
              }
            }
            .padding(16)
          }
        } else {
          VStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle")
              .font(.system(size: 40))
              .foregroundColor(.wise2Danger)
            Text("Error loading profile")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
          }
          .frame(maxHeight: .infinity)
          .padding(16)
        }
      }
    }
    .preferredColorScheme(.dark)
  }

  private func tabTitle(_ tab: MoreScreenViewModel.MoreTab) -> String {
    switch tab {
    case .billing: return "Billing"
    case .analytics: return "Analytics"
    case .files: return "Files"
    case .settings: return "Settings"
    }
  }
}

// MARK: - Tab Content Views

struct BillingContent: View {
  let user: UserProfile

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("Billing Details")
        .font(.headline)
        .foregroundColor(.wise2TextPrimary)

      VStack(spacing: 8) {
        BillingRow(label: "Plan", value: user.plan)
        BillingRow(label: "Billing Cycle", value: user.billingCycle)
        BillingRow(label: "Next Billing Date", value: user.nextBillingDate)
        BillingRow(label: "Monthly Cost", value: "$99.00")
      }

      Button(action: {}) {
        HStack {
          Text("View Invoice History")
            .font(.subheadline)
            .fontWeight(.semibold)
          Spacer()
          Image(systemName: "chevron.right")
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .padding(.horizontal, 12)
        .foregroundColor(.wise2Primary)
        .background(Color.wise2Primary.opacity(0.1))
        .cornerRadius(8)
      }

      Button(action: {}) {
        HStack {
          Text("Upgrade Plan")
            .font(.subheadline)
            .fontWeight(.semibold)
          Spacer()
          Image(systemName: "arrow.up.right")
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .padding(.horizontal, 12)
        .foregroundColor(.wise2Success)
        .background(Color.wise2Success.opacity(0.1))
        .cornerRadius(8)
      }
    }
  }
}

struct BillingRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label)
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value)
        .font(.caption)
        .fontWeight(.semibold)
        .foregroundColor(.wise2TextPrimary)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(Color.wise2Surface)
    .cornerRadius(6)
  }
}

struct AnalyticsContent: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("Usage Analytics")
        .font(.headline)
        .foregroundColor(.wise2TextPrimary)

      VStack(spacing: 8) {
        AnalyticsMetric(label: "API Calls", value: "1.2M", period: "this month")
        AnalyticsMetric(label: "Active Users", value: "428", period: "today")
        AnalyticsMetric(label: "Error Rate", value: "0.02%", period: "average")
        AnalyticsMetric(label: "Avg Latency", value: "45ms", period: "average")
      }

      Button(action: {}) {
        Text("View Detailed Reports")
          .font(.subheadline)
          .fontWeight(.semibold)
          .frame(maxWidth: .infinity)
          .padding(.vertical, 12)
          .foregroundColor(.white)
          .background(Color.wise2Primary)
          .cornerRadius(8)
      }
    }
  }
}

struct AnalyticsMetric: View {
  let label: String
  let value: String
  let period: String

  var body: some View {
    HStack {
      VStack(alignment: .leading, spacing: 2) {
        Text(label)
          .font(.caption)
          .foregroundColor(.wise2TextSecondary)
        Text(value)
          .font(.headline)
          .foregroundColor(.wise2TextPrimary)
      }
      Spacer()
      Text(period)
        .font(.caption)
        .foregroundColor(.wise2TextMuted)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 10)
    .background(Color.wise2Surface)
    .cornerRadius(6)
  }
}

struct FilesContent: View {
  let user: UserProfile

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("Storage")
        .font(.headline)
        .foregroundColor(.wise2TextPrimary)

      VStack(spacing: 8) {
        HStack {
          Text("Used Storage")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
          Spacer()
          Text(user.totalFiles)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(.wise2TextPrimary)
        }
        GeometryReader { geometry in
          ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.wise2Primary.opacity(0.1))

            RoundedRectangle(cornerRadius: 4)
              .fill(Color.wise2Primary)
              .frame(width: geometry.size.width * 0.48)
          }
        }
        .frame(height: 8)

        Text("\(user.totalFiles) of \(user.storageLimit)")
          .font(.caption)
          .foregroundColor(.wise2TextMuted)
      }
      .padding(12)
      .background(Color.wise2Surface)
      .cornerRadius(8)

      Button(action: {}) {
        Text("Upgrade Storage")
          .font(.subheadline)
          .fontWeight(.semibold)
          .frame(maxWidth: .infinity)
          .padding(.vertical, 12)
          .foregroundColor(.white)
          .background(Color.wise2Primary)
          .cornerRadius(8)
      }
    }
  }
}

struct SettingsContent: View {
  @ObservedObject var viewModel: MoreScreenViewModel
  @EnvironmentObject var authManager: AuthManager
  @State private var showLogoutAlert = false

  init(viewModel: MoreScreenViewModel) {
    self._viewModel = ObservedObject(initialValue: viewModel)
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("Settings")
        .font(.headline)
        .foregroundColor(.wise2TextPrimary)

      VStack(spacing: 8) {
        SettingRow(label: "Dark Mode", value: "On")
        SettingRow(label: "Notifications", value: "Enabled")
        SettingRow(label: "Two-Factor Auth", value: "Active")
        SettingRow(label: "API Key", value: "••••••••")
      }

      Button(action: {}) {
        HStack {
          Image(systemName: "key.horizontal")
            .font(.system(size: 14))
          Text("Regenerate API Key")
          Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .padding(.horizontal, 12)
        .foregroundColor(.wise2Warning)
        .background(Color.wise2Warning.opacity(0.1))
        .cornerRadius(8)
      }

      Button(action: { showLogoutAlert = true }) {
        HStack {
          Image(systemName: "arrowrturn.left")
            .font(.system(size: 14))
          Text("Sign Out")
          Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .padding(.horizontal, 12)
        .foregroundColor(.wise2Danger)
        .background(Color.wise2Danger.opacity(0.1))
        .cornerRadius(8)
      }
      .alert("Sign Out?", isPresented: $showLogoutAlert) {
        Button("Cancel", role: .cancel) {}
        Button("Sign Out", role: .destructive) {
          Task {
            await authManager.logout()
          }
        }
      } message: {
        Text("You will need to sign in again to access your account.")
      }
    }
  }
}

struct SettingRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label)
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value)
        .font(.caption)
        .fontWeight(.semibold)
        .foregroundColor(.wise2TextPrimary)
      Image(systemName: "chevron.right")
        .font(.caption)
        .foregroundColor(.wise2TextMuted)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(Color.wise2Surface)
    .cornerRadius(6)
  }
}

#Preview {
  MoreScreen()
    .environmentObject(AuthManager())
}
