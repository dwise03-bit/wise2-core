import SwiftUI

struct WealthExperience: View {
  @State private var selectedTab = WealthTab.dashboard
  @State private var paperOrderPlaced = false

  var body: some View {
    ZStack(alignment: .bottom) {
      LinearGradient(colors: [.wise2Background, .wise2Surface], startPoint: .top, endPoint: .bottom)
        .ignoresSafeArea()

      Group {
        switch selectedTab {
        case .dashboard:
          WealthDashboardView(paperOrderPlaced: $paperOrderPlaced)
        case .imp:
          TradingIMPView()
        case .strategies:
          StrategyBoardView()
        case .scanner:
          MarketScannerView()
        case .autopilot:
          AutopilotView()
        case .lab:
          StrategyLabView(paperOrderPlaced: $paperOrderPlaced)
        }
      }

      WealthTabRail(selectedTab: $selectedTab)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background.ignoresSafeArea())
    .preferredColorScheme(.dark)
  }
}

private enum WealthTab: CaseIterable {
  case dashboard
  case imp
  case strategies
  case scanner
  case autopilot
  case lab

  var title: String {
    switch self {
    case .dashboard: return "Dashboard"
    case .imp: return "IMP"
    case .strategies: return "Strategies"
    case .scanner: return "Scanner"
    case .autopilot: return "Autopilot"
    case .lab: return "Lab"
    }
  }

  var icon: String {
    switch self {
    case .dashboard: return "chart.line.uptrend.xyaxis"
    case .imp: return "sparkles"
    case .strategies: return "square.stack.3d.up.fill"
    case .scanner: return "scope"
    case .autopilot: return "shield.lefthalf.filled"
    case .lab: return "flask.fill"
    }
  }
}

private struct WealthDashboardView: View {
  @Binding var paperOrderPlaced: Bool

  var body: some View {
    WealthScroll(title: "WISE² Wealth", subtitle: "Paper trading command dashboard") {
      StatusRail()
      TradingIMPCard()

      VStack(alignment: .leading, spacing: 12) {
        SectionTitle("Market Regime")
        HStack(spacing: 10) {
          SignalTile(label: "Regime", value: "Risk-On", color: .wise2Accent)
          SignalTile(label: "Guard", value: "Active", color: .wise2Primary)
          SignalTile(label: "Live", value: "Locked", color: .wise2Warning)
        }
      }

      VStack(alignment: .leading, spacing: 12) {
        SectionTitle("Paper Positions")
        PositionRow(symbol: "AAPL", thesis: "Momentum pullback", pnl: "+$184.20", risk: "0.7R")
        PositionRow(symbol: "NVDA", thesis: "Breakout retest", pnl: "+$92.45", risk: "0.4R")
        PositionRow(symbol: "SPY", thesis: "Regime hedge", pnl: "-$31.10", risk: "0.2R")
      }

      VStack(alignment: .leading, spacing: 12) {
        SectionTitle("Paper Trading Workflow")
        WorkflowStep(number: "1", title: "Scan setup", detail: "High-volume continuation found in Scanner.")
        WorkflowStep(number: "2", title: "Risk check", detail: "WISE Guard caps risk at 1% simulated equity.")
        WorkflowStep(number: "3", title: "Paper order", detail: paperOrderPlaced ? "Submitted to paper broker ledger." : "Ready for simulated order.")

        Button {
          paperOrderPlaced = true
        } label: {
          Label(paperOrderPlaced ? "Paper Order Submitted" : "Place Paper Order", systemImage: paperOrderPlaced ? "checkmark.circle.fill" : "paperplane.fill")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(WealthPrimaryButtonStyle())
      }
    }
  }
}

private struct TradingIMPView: View {
  var body: some View {
    WealthScroll(title: "Trading IMP", subtitle: "Robotic bull AI trading assistant") {
      TradingIMPCard()
      InsightCard(title: "Scanner Readout", body: "Three paper setups qualify. Review AAPL first: clean trend, defined invalidation, acceptable simulated risk.")
      InsightCard(title: "Risk Coaching", body: "No live brokerage execution is enabled. Paper trading remains the only available execution mode.")
      InsightCard(title: "Journal Prompt", body: "Record thesis, invalidation, size, and emotional state before the simulated order.")
    }
  }
}

private struct StrategyBoardView: View {
  var body: some View {
    WealthScroll(title: "Strategies", subtitle: "Validated research playbooks") {
      StrategyCard(name: "Opening Range Continuation", score: "82", mode: "Paper enabled", detail: "Best in risk-on regimes with volume confirmation.")
      StrategyCard(name: "Mean Reversion Snapback", score: "74", mode: "Backtest only", detail: "Requires wider guardrails during high-volatility sessions.")
      StrategyCard(name: "Sector Rotation Drift", score: "69", mode: "Paper enabled", detail: "Uses SPY baseline and relative strength ranking.")
    }
  }
}

private struct MarketScannerView: View {
  var body: some View {
    WealthScroll(title: "Scanner", subtitle: "AI market setup detection") {
      ScannerRow(symbol: "AAPL", setup: "Trend pullback", confidence: "High", action: "Review")
      ScannerRow(symbol: "MSFT", setup: "Inside day break", confidence: "Medium", action: "Watch")
      ScannerRow(symbol: "NVDA", setup: "Retest", confidence: "High", action: "Paper")
      ScannerRow(symbol: "SPY", setup: "Regime marker", confidence: "Medium", action: "Guard")
    }
  }
}

private struct AutopilotView: View {
  var body: some View {
    WealthScroll(title: "Autopilot", subtitle: "Automation locked to simulation") {
      LockCard(title: "Live Trading Locked", detail: "Real-money brokerage execution is disabled until credentials, approvals, and risk verification are configured separately.")
      ToggleRow(title: "Paper scan automation", value: true)
      ToggleRow(title: "Risk alerts", value: true)
      ToggleRow(title: "Brokerage execution", value: false, locked: true)
    }
  }
}

private struct StrategyLabView: View {
  @Binding var paperOrderPlaced: Bool

  var body: some View {
    WealthScroll(title: "Lab", subtitle: "Backtesting, paper fills, and learning loop") {
      LabMetric(label: "Backtest Runs", value: "128")
      LabMetric(label: "Paper Win Rate", value: "61%")
      LabMetric(label: "Avg Risk", value: "0.6R")
      InsightCard(title: "Latest Paper Fill", body: paperOrderPlaced ? "AAPL simulated order logged with WISE Guard approval." : "No new paper order submitted this session.")
      InsightCard(title: "Next Experiment", body: "Compare continuation strategy against sector rotation during the next risk-on window.")
    }
  }
}

private struct WealthScroll<Content: View>: View {
  let title: String
  let subtitle: String
  @ViewBuilder let content: Content

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 18) {
        VStack(alignment: .leading, spacing: 6) {
          Text(title)
            .font(.system(size: 28, weight: .bold))
            .foregroundColor(.wise2TextPrimary)
          Text(subtitle)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.wise2TextMuted)
        }
        .padding(.top, 6)

        content
      }
      .padding(.horizontal, 16)
      .padding(.bottom, 112)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}

private struct WealthTabRail: View {
  @Binding var selectedTab: WealthTab

  var body: some View {
    HStack(spacing: 4) {
      ForEach(WealthTab.allCases, id: \.self) { tab in
        Button {
          selectedTab = tab
        } label: {
          VStack(spacing: 4) {
            Image(systemName: tab.icon)
              .font(.system(size: 16, weight: .bold))
            Text(tab.title)
              .font(.system(size: 9, weight: .bold))
              .lineLimit(1)
              .minimumScaleFactor(0.65)
          }
          .foregroundColor(selectedTab == tab ? .wise2Accent : .wise2TextSecondary)
          .frame(maxWidth: .infinity)
          .frame(height: 58)
          .background(selectedTab == tab ? Color.wise2Accent.opacity(0.16) : Color.clear)
          .cornerRadius(8)
        }
        .buttonStyle(.plain)
      }
    }
    .padding(8)
    .background(.ultraThinMaterial)
    .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.wise2BorderStrong, lineWidth: 1))
    .cornerRadius(14)
    .padding(.horizontal, 10)
    .padding(.bottom, 10)
  }
}

private struct StatusRail: View {
  var body: some View {
    HStack(spacing: 8) {
      Pill("Paper", color: .wise2Accent)
      Pill("WISE Guard", color: .wise2Primary)
      Pill("Live Locked", color: .wise2Warning)
    }
  }
}

private struct TradingIMPCard: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .top, spacing: 12) {
        ZStack {
          Circle().fill(Color.wise2Accent.opacity(0.14))
          Image(systemName: "shield.checkered")
            .font(.system(size: 28, weight: .bold))
            .foregroundColor(.wise2Accent)
        }
        .frame(width: 58, height: 58)

        VStack(alignment: .leading, spacing: 5) {
          Text("Trading IMP Bull")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.wise2TextPrimary)
          Text("W² armored assistant for scanning, signal explanation, risk coaching, paper trading, and journaling.")
            .font(.system(size: 12))
            .foregroundColor(.wise2TextSecondary)
            .fixedSize(horizontal: false, vertical: true)
        }
      }
      Pill("No brokerage credentials present", color: .wise2Warning)
    }
    .padding(14)
    .background(Color.wise2Card)
    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.wise2Accent.opacity(0.35), lineWidth: 1))
    .cornerRadius(8)
  }
}

private struct SectionTitle: View {
  let text: String
  init(_ text: String) { self.text = text }
  var body: some View {
    Text(text)
      .font(.system(size: 13, weight: .semibold))
      .foregroundColor(.wise2TextSecondary)
      .textCase(.uppercase)
  }
}

private struct SignalTile: View {
  let label: String
  let value: String
  let color: Color

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(label).font(.system(size: 11)).foregroundColor(.wise2TextMuted)
      Text(value).font(.system(size: 15, weight: .bold)).foregroundColor(color)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(12)
    .background(Color.wise2SurfaceSecondary)
    .cornerRadius(8)
  }
}

private struct PositionRow: View {
  let symbol: String
  let thesis: String
  let pnl: String
  let risk: String

  var body: some View {
    HStack {
      VStack(alignment: .leading, spacing: 4) {
        Text(symbol).font(.system(size: 16, weight: .bold)).foregroundColor(.wise2TextPrimary)
        Text(thesis).font(.system(size: 12)).foregroundColor(.wise2TextMuted)
      }
      Spacer()
      VStack(alignment: .trailing, spacing: 4) {
        Text(pnl).font(.system(size: 14, weight: .semibold)).foregroundColor(pnl.hasPrefix("-") ? .wise2Danger : .wise2Accent)
        Text(risk).font(.system(size: 11)).foregroundColor(.wise2TextMuted)
      }
    }
    .padding(12)
    .background(Color.wise2SurfaceSecondary)
    .cornerRadius(8)
  }
}

private struct WorkflowStep: View {
  let number: String
  let title: String
  let detail: String

  var body: some View {
    HStack(alignment: .top, spacing: 10) {
      Text(number)
        .font(.system(size: 12, weight: .bold))
        .foregroundColor(.wise2Background)
        .frame(width: 24, height: 24)
        .background(Color.wise2Accent)
        .clipShape(Circle())
      VStack(alignment: .leading, spacing: 3) {
        Text(title).font(.system(size: 14, weight: .semibold)).foregroundColor(.wise2TextPrimary)
        Text(detail).font(.system(size: 12)).foregroundColor(.wise2TextMuted)
      }
    }
  }
}

private struct InsightCard: View {
  let title: String
  let message: String

  init(title: String, body: String) {
    self.title = title
    self.message = body
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title).font(.system(size: 16, weight: .bold)).foregroundColor(.wise2TextPrimary)
      Text(message).font(.system(size: 13)).foregroundColor(.wise2TextSecondary).fixedSize(horizontal: false, vertical: true)
    }
    .padding(14)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(Color.wise2Card)
    .cornerRadius(8)
  }
}

private struct StrategyCard: View {
  let name: String
  let score: String
  let mode: String
  let detail: String

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        Text(name).font(.system(size: 16, weight: .bold)).foregroundColor(.wise2TextPrimary)
        Spacer()
        Text(score).font(.system(size: 18, weight: .bold)).foregroundColor(.wise2Accent)
      }
      Text(detail).font(.system(size: 12)).foregroundColor(.wise2TextSecondary)
      Pill(mode, color: mode.contains("Paper") ? .wise2Accent : .wise2Primary)
    }
    .padding(14)
    .background(Color.wise2Card)
    .cornerRadius(8)
  }
}

private struct ScannerRow: View {
  let symbol: String
  let setup: String
  let confidence: String
  let action: String

  var body: some View {
    HStack {
      Text(symbol).font(.system(size: 17, weight: .bold)).foregroundColor(.wise2TextPrimary).frame(width: 56, alignment: .leading)
      VStack(alignment: .leading, spacing: 3) {
        Text(setup).font(.system(size: 13, weight: .semibold)).foregroundColor(.wise2TextSecondary)
        Text("\(confidence) confidence").font(.system(size: 11)).foregroundColor(.wise2TextMuted)
      }
      Spacer()
      Pill(action, color: action == "Paper" ? .wise2Accent : .wise2Primary)
    }
    .padding(12)
    .background(Color.wise2SurfaceSecondary)
    .cornerRadius(8)
  }
}

private struct LockCard: View {
  let title: String
  let detail: String

  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      Image(systemName: "lock.shield.fill")
        .font(.system(size: 24, weight: .bold))
        .foregroundColor(.wise2Warning)
      VStack(alignment: .leading, spacing: 6) {
        Text(title).font(.system(size: 17, weight: .bold)).foregroundColor(.wise2TextPrimary)
        Text(detail).font(.system(size: 13)).foregroundColor(.wise2TextSecondary)
      }
    }
    .padding(14)
    .background(Color.wise2Warning.opacity(0.10))
    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.wise2Warning.opacity(0.35), lineWidth: 1))
    .cornerRadius(8)
  }
}

private struct ToggleRow: View {
  let title: String
  let value: Bool
  var locked = false

  var body: some View {
    HStack {
      Text(title).font(.system(size: 15, weight: .semibold)).foregroundColor(.wise2TextPrimary)
      Spacer()
      Image(systemName: locked ? "lock.fill" : (value ? "checkmark.circle.fill" : "xmark.circle.fill"))
        .foregroundColor(locked ? .wise2Warning : (value ? .wise2Accent : .wise2TextMuted))
    }
    .padding(14)
    .background(Color.wise2Card)
    .cornerRadius(8)
  }
}

private struct LabMetric: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label).font(.system(size: 14, weight: .semibold)).foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value).font(.system(size: 18, weight: .bold)).foregroundColor(.wise2Accent)
    }
    .padding(14)
    .background(Color.wise2Card)
    .cornerRadius(8)
  }
}

private struct Pill: View {
  let text: String
  let color: Color

  init(_ text: String, color: Color) {
    self.text = text
    self.color = color
  }

  var body: some View {
    Text(text)
      .font(.system(size: 11, weight: .bold))
      .foregroundColor(color)
      .padding(.horizontal, 9)
      .padding(.vertical, 5)
      .background(color.opacity(0.12))
      .clipShape(Capsule())
  }
}

private struct WealthPrimaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.system(size: 14, weight: .bold))
      .foregroundColor(.wise2Background)
      .padding(.vertical, 13)
      .background(Color.wise2Accent.opacity(configuration.isPressed ? 0.72 : 1.0))
      .cornerRadius(8)
  }
}

#Preview {
  WealthExperience()
}
