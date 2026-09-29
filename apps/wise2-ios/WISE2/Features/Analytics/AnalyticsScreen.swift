import SwiftUI

struct AnalyticsScreen: View {
  @StateObject private var store = AnalyticsStore()

  var body: some View {
    Group {
      if store.isLoading && store.dashboard == nil {
        ProgressView("Loading analytics…")
      } else if let metrics = store.dashboard {
        List {
          Section("Platform") {
            AnalyticsMetricRow(label: "Total users", value: "\(metrics.totalUsers)")
            AnalyticsMetricRow(label: "Active users", value: "\(metrics.activeUsers)")
            AnalyticsMetricRow(label: "Projects", value: "\(metrics.totalProjects)")
            AnalyticsMetricRow(label: "Exports", value: "\(metrics.totalExports)")
          }
          Section("Revenue") {
            AnalyticsMetricRow(label: "MRR", value: String(format: "$%.0f", metrics.mrr))
            AnalyticsMetricRow(label: "Churn", value: String(format: "%.1f%%", metrics.churnRate * 100))
          }
          Section {
            Text("TODO: Wire revenue-os/dashboard/kpis for tenant-scoped executive analytics.")
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
    .navigationTitle("Analytics")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}

private struct AnalyticsMetricRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label).foregroundColor(.wise2TextSecondary)
      Spacer()
      Text(value).foregroundColor(.wise2Gold).fontWeight(.semibold)
    }
    .listRowBackground(Color.wise2Surface)
  }
}
