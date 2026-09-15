import SwiftUI

struct SenCereSettingsScreen: View {
  @StateObject private var store = SenCereSettingsStore()

  var body: some View {
    List {
      Section("SenCere") {
        SettingsLine(label: "Company", value: SenCereBrand.legalName)
        SettingsLine(label: "Shop", value: SenCereBrand.shopURL.host ?? "blackhail.store")
      }
      Section("Partner platform") {
        SettingsLine(label: "API", value: store.apiBaseURL)
        Text("Partner metrics sync through the WISE² business layer.")
          .font(.caption)
          .foregroundColor(.sencereTextMuted)
      }
      Section {
        Text(SenCereBrand.poweredByFooter)
          .font(.caption)
          .foregroundColor(.sencereTextMuted)
      }
    }
    .listStyle(.insetGrouped)
    .scrollContentBackground(.hidden)
    .sencereScreenBackground()
    .navigationTitle("Settings")
    .task { await store.refresh() }
  }
}

private struct SettingsLine: View {
  let label: String
  let value: String

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(label).font(.caption).foregroundColor(.sencereTextMuted)
      Text(value).foregroundColor(.sencereTextPrimary)
    }
    .listRowBackground(Color.sencereSurface)
  }
}

@MainActor
final class SenCereSettingsStore: ObservableObject {
  @Published private(set) var apiBaseURL = SenCereBrand.apiBaseURL

  func refresh() async {
    apiBaseURL = APIConfiguration.resolvedBaseURLString()
  }
}
