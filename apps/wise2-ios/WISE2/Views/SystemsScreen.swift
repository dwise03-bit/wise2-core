import SwiftUI

struct SystemsScreen: View {
  @StateObject private var viewModel = SystemsScreenViewModel()
  let selectedBusiness: String

  var body: some View {
    CommandSurface(title: "Systems", subtitle: "Infrastructure visibility and safe controls", selectedBusiness: selectedBusiness) {
      HStack(spacing: 12) {
        MetricBox(label: "Uptime", value: viewModel.metrics?.uptime ?? "—", color: .wise2Success)
        MetricBox(
          label: "Services",
          value: "\(viewModel.services.count)",
          color: .wise2Primary
        )
        MetricBox(
          label: "Incidents",
          value: "\(viewModel.metrics?.incidents ?? 0)",
          color: (viewModel.metrics?.incidents ?? 0) > 0 ? .wise2Warning : .wise2Success
        )
      }

      if let error = viewModel.errorMessage {
        CommandCard {
          Text(error)
            .font(.caption)
            .foregroundColor(.wise2Warning)
        }
      }

      CommandCard {
        Text("Verified safe actions only")
          .font(.headline)
          .foregroundColor(.wise2TextPrimary)
        Text("Deployments, restarts, billing, permissions, and destructive operations require WISE² AI Level 3 approval and server authorization.")
          .font(.caption)
          .foregroundColor(.wise2TextSecondary)
      }

      SectionLabel(title: "Services")
      ForEach(viewModel.services) { service in
        NavigationLink {
          DetailScreen(title: service.name, rows: ["Status: \(service.status)", "Latency: \(service.latency)", "Error rate: \(service.errorRate)", "Traffic: \(service.requests)", "Logs: read-only mobile view", "Critical controls: AI approval required"])
        } label: {
          ServiceStatusCard(service: service)
        }
        .buttonStyle(.plain)
      }

      SectionLabel(title: "Operations")
      ForEach(viewModel.operationRows, id: \.self) { row in
        NavigationLink {
          DetailScreen(title: row, rows: ["Read-only overview", "No arbitrary terminal access", "Privileged actions require explicit approval"])
        } label: {
          CommandCard {
            HStack {
              Text(row)
                .foregroundColor(.wise2TextPrimary)
              Spacer()
              Image(systemName: "chevron.right")
                .foregroundColor(.wise2TextMuted)
            }
          }
        }
        .buttonStyle(.plain)
      }
    }
    .refreshable {
      await viewModel.refreshData()
    }
    .preferredColorScheme(.dark)
  }
}

struct MetricBox: View {
  let label: String
  let value: String
  let color: Color

  var body: some View {
    CommandCard {
      Text(label)
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)
      Text(value)
        .font(.headline.weight(.bold))
        .foregroundColor(color)
        .minimumScaleFactor(0.7)
    }
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

  var body: some View {
    CommandCard {
      HStack(alignment: .top, spacing: 12) {
        Image(systemName: service.symbol)
          .foregroundColor(statusColor)
          .frame(width: 26)
        VStack(alignment: .leading, spacing: 4) {
          Text(service.name)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text("\(service.status) · \(service.latency) · \(service.requests)")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Text(service.errorRate)
          .font(.caption.weight(.semibold))
          .foregroundColor(service.errorRate == "0.0%" ? .wise2Success : .wise2Warning)
      }
    }
  }
}

#Preview {
  SystemsScreen(selectedBusiness: "ALL BUSINESSES")
}
