import SwiftUI

struct StudioScreen: View {
  @StateObject private var store = StudioStore()

  var body: some View {
    Group {
      if store.isLoading && store.summary == nil {
        ProgressView("Loading studio metrics…")
      } else if let summary = store.summary {
        List {
          Section("Attribution") {
            MetricRow(label: "Campaigns", value: "\(summary.campaigns)")
            MetricRow(label: "Attributed leads", value: "\(summary.attributedLeads)")
            MetricRow(label: "Attributed revenue", value: String(format: "$%.0f", summary.attributedRevenue))
          }
          if !summary.providerAvailable {
            Text("Studio provider partially unavailable; zeros are authoritative.")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
        }
        .listStyle(.insetGrouped)
      } else if let error = store.errorMessage {
        BusinessErrorView(message: error) { Task { await store.load() } }
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Studio + Growth")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}

private struct MetricRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label).foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value).foregroundColor(.wise2TextPrimary)
    }
    .listRowBackground(Color.wise2Surface)
  }
}
