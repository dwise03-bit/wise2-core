import SwiftUI

struct HomeScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @State private var isRefreshing = false

  var body: some View {
    ZStack {
      Color.wise2Background
        .ignoresSafeArea()

      ScrollView {
        VStack(spacing: 20) {
          // Header
          HStack {
            VStack(alignment: .leading, spacing: 4) {
              Text("WISE²")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.wise2TextPrimary)

              if let user = authManager.currentUser {
                Text(user.email)
                  .font(.system(size: 12))
                  .foregroundColor(.wise2TextMuted)
              }
            }

            Spacer()

            // Notifications + Menu
            HStack(spacing: 12) {
              Button(action: {}) {
                Image(systemName: "bell.fill")
                  .font(.system(size: 18))
                  .foregroundColor(.wise2TextPrimary)
              }

              Menu {
                Button("Settings") {}
                Button("Logout") {
                  authManager.logout()
                }
              } label: {
                Image(systemName: "person.circle.fill")
                  .font(.system(size: 18))
                  .foregroundColor(.wise2TextPrimary)
              }
            }
          }
          .padding(16)

          // Ask WISE² Command Bar
          Button(action: {}) {
            HStack(spacing: 12) {
              Image(systemName: "sparkles")
                .font(.system(size: 14))
              Text("Ask WISE²...")
                .font(.system(size: 14))
              Spacer()
              Image(systemName: "chevron.right")
                .font(.system(size: 12))
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.wise2Surface)
            .border(Color.wise2BorderMedium, width: 1)
            .foregroundColor(.wise2TextSecondary)
          }
          .padding(.horizontal, 16)

          if appState.isLoading {
            // Loading State
            VStack(spacing: 20) {
              SkeletonView()
              SkeletonView()
              SkeletonView()
            }
            .padding(16)
          } else if let metrics = appState.dashboardMetrics {
            // Dashboard Content

            // Business Pulse
            VStack(spacing: 12) {
              Text("BUSINESS PULSE")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.wise2TextMuted)
                .frame(maxWidth: .infinity, alignment: .leading)

              HStack(spacing: 12) {
                MetricCard(
                  label: "Revenue",
                  value: String(format: "$%.0f", metrics.revenue),
                  icon: "dollarsign.circle.fill"
                )

                MetricCard(
                  label: "Clients",
                  value: String(metrics.activeClients),
                  icon: "person.3.fill"
                )
              }

              HStack(spacing: 12) {
                MetricCard(
                  label: "Projects",
                  value: String(metrics.activeProjects),
                  icon: "briefcase.fill"
                )

                MetricCard(
                  label: "Tasks",
                  value: String(metrics.outstandingTasks),
                  icon: "checkmark.circle.fill"
                )
              }
            }
            .padding(16)

            // Alerts
            if !metrics.alerts.isEmpty {
              VStack(spacing: 12) {
                Text("ALERTS")
                  .font(.system(size: 12, weight: .semibold))
                  .foregroundColor(.wise2TextMuted)
                  .frame(maxWidth: .infinity, alignment: .leading)

                ForEach(metrics.alerts) { alert in
                  AlertCard(alert: alert)
                }
              }
              .padding(16)
            }

            // System Health
            VStack(spacing: 12) {
              Text("SYSTEM HEALTH")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.wise2TextMuted)
                .frame(maxWidth: .infinity, alignment: .leading)

              HStack(spacing: 12) {
                HStack(spacing: 8) {
                  Circle()
                    .fill(Color.wise2Success)
                    .frame(width: 8, height: 8)

                  Text("All Systems")
                    .font(.system(size: 14))
                    .foregroundColor(.wise2TextPrimary)

                  Spacer()

                  Text(metrics.systemHealth)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.wise2Success)
                }
                .padding(12)
                .background(Color.wise2Surface)
                .border(Color.wise2BorderMedium, width: 1)
              }
            }
            .padding(16)
          } else if let error = appState.errorMessage {
            // Error State
            VStack(spacing: 12) {
              Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 32))
                .foregroundColor(.wise2Danger)

              Text("Failed to load dashboard")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.wise2TextPrimary)

              Text(error)
                .font(.system(size: 12))
                .foregroundColor(.wise2TextMuted)
                .multilineTextAlignment(.center)

              Button(action: {
                Task {
                  await appState.loadDashboard()
                }
              }) {
                Text("Try Again")
                  .padding(10)
                  .background(Color.wise2Primary)
                  .foregroundColor(.white)
                  .cornerRadius(4)
              }
            }
            .padding(32)
          }

          Spacer(minLength: 20)
        }
        .padding(.vertical)
      }
      .refreshable {
        await appState.loadDashboard()
      }
    }
    .preferredColorScheme(.dark)
  }
}

// MARK: - Components

struct MetricCard: View {
  let label: String
  let value: String
  let icon: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 8) {
        Image(systemName: icon)
          .font(.system(size: 14))
          .foregroundColor(.wise2Primary)

        Text(label)
          .font(.system(size: 12))
          .foregroundColor(.wise2TextMuted)

        Spacer()
      }

      Text(value)
        .font(.system(size: 20, weight: .bold))
        .foregroundColor(.wise2TextPrimary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(12)
    .background(Color.wise2Surface)
    .border(Color.wise2BorderMedium, width: 1)
  }
}

struct AlertCard: View {
  let alert: DashboardMetrics.Alert

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: "exclamationmark.circle.fill")
        .font(.system(size: 16))
        .foregroundColor(alert.severity == "critical" ? .wise2Danger : .wise2Warning)

      VStack(alignment: .leading, spacing: 2) {
        Text(alert.severity.uppercased())
          .font(.system(size: 10, weight: .bold))
          .foregroundColor(alert.severity == "critical" ? .wise2Danger : .wise2Warning)

        Text(alert.message)
          .font(.system(size: 13))
          .foregroundColor(.wise2TextPrimary)
      }

      Spacer()

      Image(systemName: "chevron.right")
        .font(.system(size: 12))
        .foregroundColor(.wise2TextMuted)
    }
    .padding(12)
    .background(Color.wise2Surface)
    .border(Color.wise2BorderMedium, width: 1)
  }
}

struct SkeletonView: View {
  var body: some View {
    HStack(spacing: 12) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.wise2Surface)
        .frame(width: 40, height: 40)

      VStack(alignment: .leading, spacing: 6) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.wise2Surface)
          .frame(height: 12)

        RoundedRectangle(cornerRadius: 4)
          .fill(Color.wise2Surface)
          .frame(height: 18)
      }

      Spacer()
    }
    .padding(12)
    .background(Color.wise2Surface)
    .border(Color.wise2BorderMedium, width: 1)
  }
}

#Preview {
  HomeScreen()
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
