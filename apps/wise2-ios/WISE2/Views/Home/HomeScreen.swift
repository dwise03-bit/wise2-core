import SwiftUI

struct HomeScreen: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var appState: AppState
  @Binding var selectedBusiness: String
  @Binding var selectedTab: CommandTab

  private let businesses = ["ALL BUSINESSES", "WISE Defense", "WISE² HVAC", "WISE² Trading", "Client Brands"]

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 18) {
          header
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
    }
    .safeAreaInset(edge: .bottom) {
      Color.clear.frame(height: 82)
    }
    .toolbar(.hidden, for: .navigationBar)
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
          DetailScreen(title: "Notifications", rows: ["Overdue invoice requires review", "Lead follow-up due at 4:30 PM", "Worker queue recovered"])
        } label: {
          Image(systemName: "bell.badge.fill")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.wise2TextPrimary)
            .frame(width: 44, height: 44)
        }
        .accessibilityLabel("Notifications")

        NavigationLink {
          DetailScreen(title: "Daniel Wise", rows: ["Owner/Super Admin", "demo@wise2.app", "Face ID required for critical actions"])
        } label: {
          Image(systemName: "person.crop.circle.fill")
            .font(.system(size: 22, weight: .semibold))
            .foregroundColor(.wise2TextPrimary)
            .frame(width: 44, height: 44)
        }
        .accessibilityLabel("Daniel profile")
      }

      VStack(alignment: .leading, spacing: 10) {
        Text("Good afternoon, Daniel")
          .font(.title2.weight(.semibold))
          .foregroundColor(.wise2TextPrimary)
        Picker("Business scope", selection: $selectedBusiness) {
          ForEach(businesses, id: \.self) { Text($0).tag($0) }
        }
        .pickerStyle(.menu)
        .tint(.wise2Primary)
        .accessibilityIdentifier("business-switcher")
      }
    }
  }

  private var metrics: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Executive Metrics")
      LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
        MetricTile(label: "Revenue", value: "$42.5K", trend: "+18% vs last week", icon: "chart.line.uptrend.xyaxis")
        MetricTile(label: "Active Clients", value: "18", trend: "+6 this month", icon: "person.3.fill")
        MetricTile(label: "Open Tasks", value: "23", trend: "7 due today", icon: "checklist")
        MetricTile(label: "AI Actions", value: "14", trend: "3 need approval", icon: "sparkles")
      }
      CommandCard {
        HStack {
          VStack(alignment: .leading, spacing: 4) {
            Text("Revenue Over Time")
              .font(.headline)
              .foregroundColor(.wise2TextPrimary)
            Text("Portfolio aggregate")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
          Spacer()
          Text("+18%")
            .font(.headline.weight(.bold))
            .foregroundColor(.wise2Success)
        }
        RevenueSparkline()
          .frame(height: 72)
          .accessibilityLabel("Revenue trend chart increasing")
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
        QuickAction(title: "Follow up leads") { selectedTab = .ai }
        QuickAction(title: "Create invoice") { selectedTab = .ai }
        QuickAction(title: "Review operations") { selectedTab = .ai }
      }
    }
  }

  private var businessesSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Your Businesses")
      ForEach(["WISE Defense", "WISE² HVAC", "WISE² Trading", "Client Brands"], id: \.self) { business in
        NavigationLink {
          DetailScreen(title: business, rows: ["Revenue trend", "Active clients", "Open work", "System status"])
        } label: {
          BusinessRow(name: business, status: business == "WISE² Trading" ? "Paper trading only" : "Operational")
        }
        .buttonStyle(.plain)
      }
    }
  }

  private var attentionSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Needs Attention")
      AttentionRow(title: "Overdue invoice", detail: "Client Brands · requires owner review", severity: .warning)
      AttentionRow(title: "Lead follow-up", detail: "WISE² HVAC · due by 4:30 PM", severity: .info)
      AttentionRow(title: "Worker queue recovered", detail: "Automations · verify final run", severity: .success)
    }
  }

  private var activeWorkSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "Today / Active Work")
      NavigationLink {
        DetailScreen(title: "Active Work", rows: ["Command Center iOS · Daniel · Today · 82%", "Website approval · Daniel · Tomorrow · In review", "Lead list cleanup · WISE² AI · Today · Waiting"])
      } label: {
        WorkSummaryRow(title: "Command Center iOS", owner: "Daniel", due: "Today", status: "In progress", progress: 0.82)
      }
      .buttonStyle(.plain)
      WorkSummaryRow(title: "Website approval", owner: "Daniel", due: "Tomorrow", status: "In review", progress: 0.64)
    }
  }

  private var systemHealthSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      SectionLabel(title: "System Health")
      NavigationLink {
        DetailScreen(title: "System Health", rows: ["API healthy", "PostgreSQL healthy", "Redis healthy", "Workers warning", "GPU/Ollama available", "Websites online", "Automations monitored"])
      } label: {
        CommandCard {
          ForEach(["API", "PostgreSQL", "Redis", "Workers", "GPU/Ollama", "Websites", "Automations"], id: \.self) { name in
            HStack {
              Circle()
                .fill(name == "Workers" ? Color.wise2Warning : Color.wise2Success)
                .frame(width: 9, height: 9)
              Text(name)
                .foregroundColor(.wise2TextPrimary)
              Spacer()
              Text(name == "Workers" ? "Warning" : "Healthy")
                .font(.caption.weight(.semibold))
                .foregroundColor(name == "Workers" ? .wise2Warning : .wise2Success)
            }
          }
        }
      }
      .buttonStyle(.plain)
    }
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
  HomeScreen(selectedBusiness: .constant("ALL BUSINESSES"), selectedTab: .constant(.home))
    .environmentObject(AuthManager())
    .environmentObject(AppState())
}
