import SwiftUI

struct SystemsScreen: View {
  @StateObject private var viewModel = SystemsScreenViewModel()
  @State private var showRefresh = false

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          HStack {
            VStack(alignment: .leading, spacing: 4) {
              Text("SYSTEMS")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.wise2TextPrimary)

              Text("Infrastructure Command Center")
                .foregroundColor(.wise2TextSecondary)
                .font(.subheadline)
            }
            Spacer()
            Button(action: {
              showRefresh = true
              viewModel.refreshData()
              DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                showRefresh = false
              }
            }) {
              Image(systemName: "arrow.clockwise")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.wise2Primary)
                .rotationEffect(.degrees(showRefresh ? 360 : 0))
                .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: showRefresh)
            }
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.wise2Surface)

        // Content
        if viewModel.isLoading {
          VStack(spacing: 12) {
            ProgressView()
              .tint(.wise2Primary)
            Text("Loading system status...")
              .foregroundColor(.wise2TextSecondary)
          }
          .frame(maxHeight: .infinity)
        } else if let error = viewModel.errorMessage {
          VStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle")
              .font(.system(size: 40))
              .foregroundColor(.wise2Danger)
            Text("Error")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text(error)
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
              .multilineTextAlignment(.center)
          }
          .frame(maxHeight: .infinity)
          .padding(16)
        } else {
          ScrollView {
            VStack(spacing: 16) {
              // System Metrics Grid
              if let metrics = viewModel.metrics {
                VStack(spacing: 12) {
                  HStack(spacing: 12) {
                    MetricBox(label: "CPU", value: "\(metrics.cpuUsage)%", color: .wise2Warning)
                    MetricBox(label: "Memory", value: "\(metrics.memoryUsage)%", color: .wise2Danger)
                    MetricBox(label: "Disk", value: "\(metrics.diskUsage)%", color: .wise2Primary)
                  }
                  HStack(spacing: 12) {
                    MetricBox(label: "Latency", value: "\(metrics.networkLatency)ms", color: .wise2Success)
                    MetricBox(label: "Uptime", value: metrics.uptime, color: .wise2Primary)
                    MetricBox(label: "Status", value: "Operational", color: .wise2Success)
                  }
                }
                .padding(12)
                .background(Color.wise2Surface)
                .cornerRadius(8)
              }

              // Services Status
              VStack(alignment: .leading, spacing: 8) {
                Text("Services Status")
                  .font(.headline)
                  .foregroundColor(.wise2TextPrimary)
                  .padding(.horizontal, 12)

                ForEach(viewModel.services) { service in
                  ServiceStatusCard(service: service)
                }
              }
            }
            .padding(16)
          }
        }
      }
    }
    .preferredColorScheme(.dark)
  }
}

struct MetricBox: View {
  let label: String
  let value: String
  let color: Color

  var body: some View {
    VStack(spacing: 6) {
      Text(label)
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)
      Text(value)
        .font(.headline)
        .foregroundColor(color)
        .fontWeight(.semibold)
    }
    .frame(maxWidth: .infinity)
    .padding(12)
    .background(Color.wise2Surface)
    .cornerRadius(8)
  }
}

struct ServiceStatusCard: View {
  let service: SystemService

  var statusColor: Color {
    switch service.status {
    case "Healthy": return .wise2Success
    case "Warning": return .wise2Warning
    case "Critical": return .wise2Danger
    default: return .wise2TextSecondary
    }
  }

  var statusIcon: String {
    switch service.status {
    case "Healthy": return "checkmark.circle.fill"
    case "Warning": return "exclamationmark.circle.fill"
    case "Critical": return "xmark.circle.fill"
    default: return "question.circle.fill"
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        HStack(spacing: 8) {
          Image(systemName: statusIcon)
            .font(.system(size: 14))
            .foregroundColor(statusColor)

          VStack(alignment: .leading, spacing: 2) {
            Text(service.name)
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text(service.status)
              .font(.caption)
              .foregroundColor(statusColor)
          }
        }

        Spacer()

        VStack(alignment: .trailing, spacing: 4) {
          HStack(spacing: 4) {
            Image(systemName: "clock")
              .font(.caption)
            Text(service.latency)
              .font(.caption)
          }
          .foregroundColor(.wise2TextSecondary)

          HStack(spacing: 4) {
            Image(systemName: "exclamationmark.triangle")
              .font(.caption)
            Text(service.errorRate)
              .font(.caption)
          }
          .foregroundColor(.wise2Danger)
        }
      }

      HStack(spacing: 16) {
        HStack(spacing: 4) {
          Image(systemName: "arrow.up.arrow.down")
            .font(.caption)
            .foregroundColor(.wise2Primary)
          Text(service.requests)
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }

        Spacer()

        Text("View Logs")
          .font(.caption)
          .fontWeight(.semibold)
          .foregroundColor(.wise2Primary)
      }
    }
    .padding(12)
    .background(Color.wise2Surface)
    .cornerRadius(8)
  }
}

#Preview {
  SystemsScreen()
}
