import SwiftUI

struct HomeScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @Binding var selectedBusiness: String
  // @Binding var selectedTab: CommandTab

  private let businesses = BusinessScope.options

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 18) {
          header
          if let error = appState.errorMessage, appState.dashboardMetrics == nil {
            liveErrorBanner(error)
          }
          metrics
          aiCommand
          businessesSection
          attentionSection
          activeWorkSection
          systemHealthSection
        }
        .padding(.horizontal, 18)
        .padding(.top, 12)
        .padding(.bottom, 120)
      }
      .refreshable {
        await appState.loadDashboard()
      }
    }
    .safeAreaInset(edge: .bottom) {
      Color.clear.frame(height: 82)
    }
    .toolbar(.hidden, for: .navigationBar)
  }

  private var operatorName: String {
    let raw = authManager.currentUser?.name?.trimmingCharacters(in: .whitespacesAndNewlines)
    if let raw, !raw.isEmpty {
      return raw.split(separator: " ").first.map(String.init) ?? raw
    }
    return "Operator"
  }

  private var greeting: String {
    let hour = Calendar.current.component(.hour, from: Date())
    let period: String
    switch hour {
    case 5..<12: period = "Good morning"
    case 12..<17: period = "Good afternoon"
    case 17..<22: period = "Good evening"
    default: period = "Working late"
    }
    return "\(period), \(operatorName)"
  }

  private var notificationRows: [String] {
    if let alerts = appState.dashboardMetrics?.alerts, !alerts.isEmpty {
      return alerts.map { "\($0.severity.uppercased()) · \($0.message)" }
    }
    return [
      authManager.isOperatorPreview
        ? "Operator preview · fixture brief active"
        : "No open alerts from Hermes brief",
    ]
  }

  private var profileRows: [String] {
    let user = authManager.currentUser
    return [
      user?.role ?? "FOUNDER",
      user?.email ?? "—",
      authManager.isOperatorPreview ? "Operator preview session" : "Live session",
      "Face ID required for critical actions",
    ]
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 3) {
          Text("WISE²")
            .font(.system(size: 28, weight: .bold, design: .rounded))
            .foregroundColor(.wise2TextPrimary)
          Text("COMMAND CENTER")
            .font(.caption.weight(.bold))
            .foregroundColor(.wise2Primary)
        }
        Spacer()
        NavigationLink {
          DetailScreen(title: "Notifications", rows: notificationRows)
        } label: {
          Image(systemName: "bell.badge.fill")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.wise2TextPrimary)
            .frame(width: 44, height: 44)
        }
        .accessibilityLabel("Notifications")

        NavigationLink {
          DetailScreen(
            title: authManager.currentUser?.name ?? "Operator",
            rows: profileRows
          )
        } label: {
          Image(systemName: "person.crop.circle.fill")
            .font(.system(size: 22, weight: .semibold))
            .foregroundColor(.wise2TextPrimary)
            .frame(width: 44, height: 44)
        }
        .accessibilityLabel("Operator profile")
      }

      VStack(alignment: .leading, spacing: 10) {
        Text(greeting)
          .font(.title2.weight(.semibold))
          .foregroundColor(.wise2TextPrimary)
        Picker("Business scope", selection: $selectedBusiness) {
          ForEach(businesses, id: \.self) { Text($0).tag($0) }
        }
        .pickerStyle(.menu)
        .tint(.wise2Primary)
        .accessibilityIdentifier("business-switcher")
        Text(BusinessScope.scopeCaption)
          .font(.caption2)
          .foregroundColor(.wise2TextMuted)
      }
    }
  }

  private func liveErrorBanner(_ message: String) -> some View {
    HStack(alignment: .top, spacing: 10) {
      Image(systemName: "exclamationmark.triangle.fill")
        .foregroundColor(.wise2Warning)
      VStack(alignment: .leading, spacing: 4) {
        Text("Live dashboard unavailable")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.wise2TextPrimary)
        Text(message)
          .font(.caption)
          .foregroundColor(.wise2TextSecondary)
      }
      Spacer()
      if appState.isLoading {
        ProgressView()
      }
    }
    .padding(14)
    .background(Color.wise2Warning.opacity(0.12))
    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.wise2Warning.opacity(0.35), lineWidth: 1))
    .clipShape(RoundedRectangle(cornerRadius: 12))
  }

  private var metrics: some View {
    let live = appState.dashboardMetrics
    let revenue = live.map { formatCurrency($0.revenue) } ?? "—"
    let clients = live.map { "\($0.activeClients)" } ?? "—"
    let tasks = live.map { "\($0.outstandingTasks)" } ?? "—"
    let projects = live.map { "\($0.activeProjects)" } ?? "—"

    return VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Executive Metrics")
      if appState.isLoading && live == nil {
        ProgressView("Loading live metrics…")
          .tint(.wise2Primary)
          .foregroundColor(.wise2TextSecondary)
      }
      LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
        MetricTile(label: "Revenue", value: revenue, trend: live == nil ? "Awaiting Hermes brief" : "Monthly recurring", icon: "chart.line.uptrend.xyaxis")
        MetricTile(label: "Active Clients", value: clients, trend: live == nil ? "Live API" : "From customers", icon: "person.3.fill")
        MetricTile(label: "Open Tasks", value: tasks, trend: live == nil ? "Live API" : "Hermes approvals", icon: "checklist")
        MetricTile(label: "Active Projects", value: projects, trend: live == nil ? "Live API" : "From daily brief", icon: "briefcase.fill")
      }
      CommandCard {
        HStack {
          VStack(alignment: .leading, spacing: 4) {
            Text("Portfolio Pulse")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text(live?.systemHealth ?? "No live status yet")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
          Spacer()
          Text(live?.systemHealth ?? "—")
            .font(.headline.weight(.bold))
            .foregroundColor(.wise2Success)
        }
        RevenueSparkline()
          .frame(height: 72)
          .accessibilityLabel("Revenue trend chart")
      }
    }
  }

  private var aiCommand: some View {
    CommandCard {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text("WISE² AI")
            .font(.title3.weight(.bold))
            .foregroundColor(.wise2TextPrimary)
          Text("What should I handle next?")
            .font(.subheadline)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Image(systemName: "sparkles")
          .foregroundColor(.wise2Primary)
      }

      HStack(spacing: 8) {
        QuickAction(title: "Follow up leads") { }
        QuickAction(title: "Create invoice") { }
        QuickAction(title: "Review operations") { }
      }
    }
  }

  private var businessesSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Operating Scopes")
      ForEach(BusinessScope.options.filter { $0 != "ALL BUSINESSES" }, id: \.self) { scope in
        NavigationLink {
          DetailScreen(
            title: scope,
            rows: [
              "Hermes mode: \(BusinessScope.hermesMode(for: scope))",
              "Uses live customers, prospects, Hermes actions, and health APIs",
              BusinessScope.scopeCaption,
            ]
          )
        } label: {
          BusinessRow(name: scope, status: "Mode · \(BusinessScope.hermesMode(for: scope))")
        }
        .buttonStyle(.plain)
      }
    }
  }

  private var activeWorkSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Today / Active Work")
      if let work = appState.dashboardMetrics?.activeWork, !work.isEmpty {
        ForEach(work) { item in
          NavigationLink {
            DetailScreen(
              title: item.title,
              rows: ["Status: \(item.status)", "Owner: \(item.owner)", "Updated: \(item.due)"]
            )
          } label: {
            WorkSummaryRow(
              title: item.title,
              owner: item.owner,
              due: item.due,
              status: item.status,
              progress: item.progress
            )
          }
          .buttonStyle(.plain)
        }
      } else {
        CommandCard {
          Text(appState.isLoading ? "Loading live work…" : "No live projects in today's Hermes brief yet.")
            .font(.subheadline)
            .foregroundColor(.wise2TextSecondary)
        }
      }
    }
  }

  private var attentionSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Needs Attention")
      if let alerts = appState.dashboardMetrics?.alerts, !alerts.isEmpty {
        ForEach(alerts) { alert in
          AttentionRow(
            title: alert.message,
            detail: "Live · \(alert.severity)",
            severity: alert.severity.lowercased() == "warning" ? .warning : (alert.severity.lowercased() == "success" ? .success : .info)
          )
        }
      } else if appState.dashboardMetrics != nil {
        AttentionRow(title: "No open alerts", detail: "Hermes daily brief is clear", severity: .success)
      } else {
        AttentionRow(title: "Waiting for live feed", detail: "Pull to refresh after sign-in", severity: .info)
      }
    }
  }

  private var systemHealthSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "System Health")
      NavigationLink {
        DetailScreen(
          title: "System Health",
          rows: [
            appState.dashboardMetrics.map { "Status · \($0.systemHealth)" } ?? "Status · unavailable",
            "Open Systems tab for live service inventory",
          ]
        )
      } label: {
        HStack {
          Image(systemName: "server.rack")
            .foregroundColor(.wise2Primary)
          VStack(alignment: .leading, spacing: 2) {
            Text(appState.dashboardMetrics?.systemHealth ?? "Unavailable")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text("From Hermes daily brief")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
          Spacer()
          Image(systemName: "chevron.right")
            .foregroundColor(.wise2TextMuted)
        }
        .padding(14)
        .background(Color.wise2Card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
      }
      .buttonStyle(.plain)
    }
  }

  private func formatCurrency(_ value: Double) -> String {
    if value >= 1000 {
      return String(format: "$%.1fK", value / 1000)
    }
    return String(format: "$%.0f", value)
  }
}

struct MetricTile: View {
  let label: String
  let value: String
  let trend: String
  let icon: String

  var body: some View {
    CommandCard {
      Image(systemName: icon)
        .foregroundColor(.wise2Primary)
      Text(value)
        .font(.title2.weight(.bold))
        .foregroundColor(.wise2TextPrimary)
        .minimumScaleFactor(0.75)
      Text(label)
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)
      Text(trend)
        .font(.caption2.weight(.semibold))
        .foregroundColor(.wise2Success)
    }
  }
}

struct QuickAction: View {
  let title: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack {
        Text(title)
          .font(.caption.weight(.semibold))
          .lineLimit(1)
          .minimumScaleFactor(0.8)
        Image(systemName: "arrow.up.right")
          .font(.caption2.weight(.bold))
      }
      .frame(maxWidth: .infinity)
      .padding(.vertical, 11)
      .padding(.horizontal, 10)
      .foregroundColor(.wise2TextPrimary)
      .background(Color.wise2Primary.opacity(0.16))
      .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
    }
    .accessibilityIdentifier("quick-action-\(title)")
  }
}

struct BusinessRow: View {
  let name: String
  let status: String

  var body: some View {
    CommandCard {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(name)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text(status)
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Image(systemName: "chevron.right")
          .foregroundColor(.wise2TextMuted)
      }
    }
  }
}

enum AttentionSeverity {
  case success
  case warning
  case info

  var color: Color {
    switch self {
    case .success: return .wise2Success
    case .warning: return .wise2Warning
    case .info: return .wise2Primary
    }
  }
}

struct AttentionRow: View {
  let title: String
  let detail: String
  let severity: AttentionSeverity

  var body: some View {
    NavigationLink {
      DetailScreen(title: title, rows: [detail, "Audit trail available", "Owner approval required before mutation"])
    } label: {
      CommandCard {
        HStack(alignment: .top, spacing: 10) {
          Circle()
            .fill(severity.color)
            .frame(width: 10, height: 10)
            .padding(.top, 5)
          VStack(alignment: .leading, spacing: 4) {
            Text(title)
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text(detail)
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
          }
          Spacer()
          Image(systemName: "chevron.right")
            .foregroundColor(.wise2TextMuted)
        }
      }
    }
    .buttonStyle(.plain)
  }
}

struct WorkSummaryRow: View {
  let title: String
  let owner: String
  let due: String
  let status: String
  let progress: Double

  var body: some View {
    CommandCard {
      HStack {
        VStack(alignment: .leading, spacing: 5) {
          Text(title)
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text("\(owner) · \(due) · \(status)")
            .font(.caption)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        Text("\(Int(progress * 100))%")
          .font(.caption.weight(.bold))
          .foregroundColor(.wise2Primary)
      }
      ProgressView(value: progress)
        .tint(.wise2Primary)
        .accessibilityLabel("\(title) progress")
    }
  }
}

struct RevenueSparkline: View {
  private let points: [CGFloat] = [0.55, 0.48, 0.58, 0.52, 0.66, 0.62, 0.74, 0.82]

  var body: some View {
    GeometryReader { proxy in
      Path { path in
        for index in points.indices {
          let x = proxy.size.width * CGFloat(index) / CGFloat(points.count - 1)
          let y = proxy.size.height * (1 - points[index])
          if index == 0 {
            path.move(to: CGPoint(x: x, y: y))
          } else {
            path.addLine(to: CGPoint(x: x, y: y))
          }
        }
      }
      .stroke(Color.wise2Primary, style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
    }
  }
}

struct DetailScreen: View {
  let title: String
  let rows: [String]

  var body: some View {
    CommandSurface(title: title, subtitle: "WISE² Command Center", selectedBusiness: "Scoped access") {
      ForEach(rows, id: \.self) { row in
        CommandCard {
          Text(row)
            .foregroundColor(.wise2TextPrimary)
        }
      }
    }
  }
}

#Preview {
  HomeScreen(selectedBusiness: .constant("ALL BUSINESSES"))
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
