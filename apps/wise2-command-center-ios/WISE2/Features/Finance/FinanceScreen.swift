import SwiftUI

struct FinanceScreen: View {
  @StateObject private var store = FinanceStore()

  var body: some View {
    Group {
      if store.isLoading && store.summary == nil {
        ProgressView("Loading finance summary…")
      } else if let summary = store.summary {
        List {
          Section("Revenue") {
            FinanceMetricRow(label: "Today", value: String(format: "$%.2f", summary.revenueToday))
            FinanceMetricRow(label: "Month", value: String(format: "$%.2f", summary.revenueMonth))
            FinanceMetricRow(label: "Unpaid invoices", value: "\(summary.unpaidInvoiceCount)")
          }
          if let message = summary.message {
            Text(message).font(.caption).foregroundColor(.wise2TextMuted)
          }
        }
        .listStyle(.insetGrouped)
      } else if let error = store.errorMessage {
        BusinessErrorView(message: error) { Task { await store.load() } }
      }
    }
    .background(Color.wise2Background.ignoresSafeArea())
    .navigationTitle("Money")
    .refreshable { await store.load() }
    .task { await store.load() }
  }
}

private struct FinanceMetricRow: View {
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
