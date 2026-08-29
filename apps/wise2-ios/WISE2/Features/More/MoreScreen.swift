import SwiftUI

struct MoreScreen: View {
  @StateObject private var capabilities = CapabilityStore()

  private let modules: [BusinessOSModule] = [
    .phone, .clients, .cloud, .studio, .money, .academy, .trading, .settings,
  ]

  var body: some View {
    NavigationView {
      List {
        ForEach(modules) { module in
          if module == .trading {
            if capabilities.canAccessTrading {
              NavigationLink(destination: TradingGateScreen()) {
                ModuleRow(module: module)
              }
            }
          } else {
            NavigationLink(destination: destination(for: module)) {
              ModuleRow(module: module)
            }
          }
        }
        if !capabilities.canAccessTrading {
          Text("Trading requires server-issued trading.access capability.")
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
      }
      .listStyle(.insetGrouped)
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("WISE² Business")
      .task { await capabilities.load() }
    }
  }

  @ViewBuilder
  private func destination(for module: BusinessOSModule) -> some View {
    switch module {
    case .phone: CommsScreen()
    case .clients: ClientsScreen()
    case .cloud: CloudScreen()
    case .studio: StudioScreen()
    case .money: FinanceScreen()
    case .academy: BusinessModulePlaceholder(module: module, subtitle: "Training and playbooks")
    case .settings: BusinessModulePlaceholder(module: module, subtitle: "Account and device settings")
    default: BusinessModulePlaceholder(module: module, subtitle: module.title)
    }
  }
}

private struct ModuleRow: View {
  let module: BusinessOSModule

  var body: some View {
    HStack(spacing: 14) {
      Image(systemName: module.systemImage)
        .frame(width: 28)
        .foregroundColor(.wise2Primary)
      Text(module.title).foregroundColor(.wise2TextPrimary)
    }
    .listRowBackground(Color.wise2Surface)
  }
}

struct TradingGateScreen: View {
  var body: some View {
    VStack(spacing: 16) {
      Image(systemName: BusinessOSModule.trading.systemImage)
        .font(.system(size: 44))
        .foregroundColor(.wise2Primary)
      Text("WISE² Trading")
        .font(.title.bold())
        .foregroundColor(.wise2TextPrimary)
      Text("Trading is permissioned separately from Business Money. Connect ÆTHER-TRADER when ready.")
        .multilineTextAlignment(.center)
        .foregroundColor(.wise2TextSecondary)
        .padding(.horizontal)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Trading")
  }
}

struct BusinessModulePlaceholder: View {
  let module: BusinessOSModule
  let subtitle: String

  var body: some View {
    VStack(spacing: 14) {
      Image(systemName: module.systemImage)
        .font(.system(size: 44, weight: .semibold))
        .foregroundColor(.wise2Primary)
      Text(module.title)
        .font(.largeTitle.bold())
        .foregroundColor(.wise2TextPrimary)
      Text(subtitle)
        .multilineTextAlignment(.center)
        .foregroundColor(.wise2TextSecondary)
    }
    .padding()
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.wise2Background.ignoresSafeArea())
  }
}

struct BusinessErrorView: View {
  let message: String
  let retry: () -> Void

  var body: some View {
    VStack(spacing: 12) {
      Text(message)
        .multilineTextAlignment(.center)
        .foregroundColor(.wise2Danger)
      Button("Retry", action: retry)
        .buttonStyle(.borderedProminent)
    }
    .padding()
  }
}
